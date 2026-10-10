#if UNITY_EDITOR
using System;
using System.IO;
using System.Reflection;
using System.Collections.Generic;
using UnityEngine;
using Doppel6.Probe;
// Actual inbox, playback, renderer and lateral keeper rig; controlled view facts.
public static class OffsidePresentation119Tests {
    [Serializable] class Report {public string sourceId;public int passed;public string[] checks,images;}
    public static string[] Run(string repo,bool capture=false,string outputFolder=null){
        var checks=new List<string>();var images=new List<string>();
        void Require(bool ok,string name){if(!ok)throw new Exception("Offside119: "+name);checks.Add(name);}
        var bridge=UnityEngine.Object.FindFirstObjectByType<ProbeBridge>()??throw new Exception("No ProbeBridge");
        const BindingFlags flags=BindingFlags.Instance|BindingFlags.NonPublic;
        T Field<T>(string name)=>(T)typeof(ProbeBridge).GetField(name,flags).GetValue(bridge);
        foreach(string missing in new[]{"{}","{\"offside\":null}"}){var parsed=WorldPhasePresence.ParseFrame(missing);Require(!parsed.offsideKnown&&parsed.offside==null,"missing or null wire offside stays hidden");}
        var zero=WorldPhasePresence.ParseFrame("{\"offside\":{\"lineX\":0}}");Require(zero.offsideKnown&&zero.offside.lineX==0,"explicit midfield offside is known");
        var raw=File.ReadAllText(Path.Combine(repo,"outputs/platform/world-unity/contract-fixture.json"));
        var folder=Path.Combine(repo,outputFolder??"outputs/3d-quality/iteration-119","offside");Directory.CreateDirectory(folder);
        bool logging=Debug.unityLogger.logEnabled;
        void Send(WorldCommand c){var json=JsonUtility.ToJson(c);if(c.frame!=null&&c.frame.offside==null||c.config!=null&&c.config.initial.offside==null)json=json.Replace("\"offside\":{\"lineX\":0.0}","\"offside\":null").Replace("\"offside\":{\"lineX\":0}","\"offside\":null");bridge.WorldCommand(json);}
        void Shot(string name){
            if(!capture)return;var camera=Camera.main;var rt=RenderTexture.GetTemporary(960,540,24);var old=RenderTexture.active;var aspect=camera.aspect;
            try{camera.aspect=960f/540;camera.targetTexture=rt;camera.Render();camera.targetTexture=null;RenderTexture.active=rt;var t=new Texture2D(960,540,TextureFormat.RGB24,false);t.ReadPixels(new Rect(0,0,960,540),0,0);t.Apply();File.WriteAllBytes(Path.Combine(folder,name+".png"),t.EncodeToPNG());images.Add(name+".png");UnityEngine.Object.DestroyImmediate(t);}finally{camera.targetTexture=null;camera.aspect=aspect;RenderTexture.active=old;RenderTexture.ReleaseTemporary(rt);}
        }
        foreach(double width in new[]{44.0,52.8}){
            var config=JsonUtility.FromJson<WorldConfig>(raw);config.session="offside119-"+width;config.initial.session=config.session;config.initial.phase="paused";config.initial.sequence=1;config.initial.clock=10;config.geometry.width=width;config.geometry.length=width==44?68:81.6;
            config.initial.offside=null;Send(new WorldCommand{kind="load",config=config});
            var line=Field<Transform>("worldOffsideLine");Require(line!=null&&!line.gameObject.activeSelf,"omitted offside starts hidden / "+width);
            var inbox=Field<WorldViewState>("worldView");Require(inbox.Config.session==config.session,"actual configuration loaded / "+width);
            var f=config.initial;int sequence=1;
            foreach(int sign in new[]{-1,1}){
                f.sequence=++sequence;f.clock+=.05;f.turned=sign<0;f.offside=new WorldOffside{lineX=sign*12.4};Send(new WorldCommand{kind="frame",frame=f});
                Require(line.gameObject.activeSelf&&Math.Abs(line.position.x-sign*12.4)<1e-5&&Math.Abs(line.position.y-.04)<1e-5,"actual line follows supplied turned longitudinal point / "+width+" / "+sign);
                Require(Math.Abs(line.GetComponent<Renderer>().bounds.size.z-width)<1e-5&&Math.Abs(line.position.z)<1e-6,"actual line spans both sidelines / "+width+" / "+sign);
                var before=line.position;typeof(ProbeBridge).GetMethod("RenderWorld",flags).Invoke(bridge,null);Require(before==line.position,"paused offside picture freezes / "+width+" / "+sign);
                Shot("line-"+width+"-"+sign);
            }
            foreach(double invalid in new[]{double.NaN,double.PositiveInfinity,config.geometry.length}){
                f.offside=new WorldOffside{lineX=invalid};f.offsideKnown=true;bool rejected=false;try{inbox.Validate(f);}catch(ArgumentException){rejected=true;}Require(rejected,"malformed offside picture rejected / "+width+" / "+invalid);
            }
            f.offside=null;f.sequence=++sequence;Send(new WorldCommand{kind="frame",frame=f});Require(!line.gameObject.activeSelf,"explicit clear hides line / "+width);Shot("clear-"+width);
            var a=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(f));var b=JsonUtility.FromJson<WorldFrame>(JsonUtility.ToJson(f));a.offside=new WorldOffside{lineX=-12};b.offside=new WorldOffside{lineX=18};
            Require(WorldViewPlayback.Blend(a,b,.2).offside.lineX==18,"offside remains a discrete received fact / "+width);
            b.offside=null;Require(WorldViewPlayback.Blend(a,b,.2).offside==null,"display buffer propagates clear / "+width);
            var goalie=Array.Find(config.players,p=>p.keeper);int index=Array.FindIndex(f.players,p=>p.id==goalie.id);var p=f.players[index];p.action="run";p.facing=new double[]{0,0,1};p.position=new double[]{-20,0,0};p.moving=true;f.ball=new double[]{0,.1764,0};f.owner="";
            foreach(int sign in new[]{-1,1}){
                f.clock=2;f.sequence=++sequence;p.position[0]=-20;Send(new WorldCommand{kind="frame",frame=f});
                for(int tick=0;tick<8;tick++){f.clock+=.05;f.sequence=++sequence;p.position[0]+=sign*.1;Send(new WorldCommand{kind="frame",frame=f});}
                var pose=(FootballAnimation.Pose)typeof(ProbeBridge).GetMethod("WorldFootballPose",flags).Invoke(bridge,new object[]{p,Field<WorldFrame>("displayed"),index});
                // The side step is procedural on the ready stance; it adds no pelvis or leg swivel on top.
                Require(pose.clip==bridge.keeperClip&&pose.strideYaw==0&&Mathf.Abs(pose.pelvisYaw)<1&&Mathf.Abs(pose.legYaw)<1&&pose.sideWeight>.5f&&Math.Sign(pose.sidePhase)==sign,"keeper side step avoids duplicate swivel / "+width+" / "+sign);
                var actor=Field<List<Transform>>("actors")[index];var bone=Array.Find(actor.GetComponentsInChildren<Transform>(),t=>t.name=="mixamorig:RightFoot");var foot=bone.position;var root=actor.position;var rot=actor.rotation;
                // The rendered foot is the authored lateral pose plus at most the
                // planted-foot lock of the received sequence (frame memory by design).
                var anim=Field<List<FootballAnimation>>("football")[index];float lockOffset=anim.FootLockOffset;anim.Sample(pose,f.clock,true);var pure=bone.position;
                Require(Vector3.Distance(foot,pure)<=lockOffset+.02f,"actual rendered foot matches authored lateral pose up to the planted-foot lock / "+width+" / "+sign);
                anim.Sample(pose,f.clock);Require(Vector3.Distance(pure,bone.position)<.0001f,"pause freezes lateral joints / "+width+" / "+sign);
                var wrong=pose;wrong.pelvisYaw=sign*45;wrong.legYaw=sign*30;anim.Sample(wrong,f.clock,true);Require(Vector3.Distance(pure,bone.position)>.025f,"actual rig detects an extra swivel / "+width+" / "+sign);anim.Sample(pose,f.clock,true);
                Require(root==actor.position&&Quaternion.Angle(rot,actor.rotation)<.001f,"presentation retains native root and facing / "+width+" / "+sign);
            }
            var oldLine=line;config.initial.sequence=1;Send(new WorldCommand{kind="load",config=config});Require(!oldLine||!oldLine.gameObject.activeInHierarchy,"reload retires old line hierarchy / "+width);
        }
        File.WriteAllText(Path.Combine(folder,capture?"render-evidence.json":"tests.json"),JsonUtility.ToJson(new Report{sourceId=ProbeBuildIdentity.SourceId,passed=checks.Count,checks=checks.ToArray(),images=images.ToArray()},true));return checks.ToArray();
    }
}
#endif
