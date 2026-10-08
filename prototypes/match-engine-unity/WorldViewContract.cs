using System;
using System.Collections.Generic;
using UnityEngine;

namespace Doppel6.Probe {
[Serializable] public class WorldKit {public string main,trim,accent,style;}
[Serializable] public class WorldPlayer {public string id,name,skin,hair;public int team,number;public bool keeper;public WorldKit kit;}
[Serializable] public class WorldTeam {public string id,name;public bool home;}
[Serializable] public class WorldCamera {public double[] position,target;public double fov;}
[Serializable] public class WorldPose {public string id,action,actionId;public double[] position,facing,contactPoint;public double progress,duration,recovery;public double freshness=-1;public int number;public bool moving;}
[Serializable] public class WorldNet {public int sign;public double z,height,age,bulge;}
// Optional celebration fields describe an already booked native goal scene;
// older pictures omit them and remain valid (celebrating=false).
[Serializable] public class WorldFrame {public string schema,session,phase,owner,celebrationScorer;public int sequence,celebrationTeam;public double clock,elapsed,ballOpacity,celebrationTime;public bool turned,replay,netActive,celebrating;public int[] score;public double[] ball;public WorldCamera camera;public WorldPose[] players;public WorldNet net;}
[Serializable] public class WorldConfig {public string schema,session,fixtureId;public Geometry geometry;public WorldTeam[] teams;public WorldPlayer[] players;public WorldFrame initial;}
[Serializable] public class WorldCommand {public string kind;public WorldConfig config;public WorldFrame frame;}

// This is a view inbox, never a simulation or career/save owner.
public sealed class WorldViewState {
    public const string Schema="d6-world-view-1";
    public WorldConfig Config {get;private set;}
    public WorldFrame Frame {get;private set;}
    public readonly Dictionary<string,WorldPlayer> Players=new Dictionary<string,WorldPlayer>();
    static bool Finite(double n){return !double.IsNaN(n)&&!double.IsInfinity(n);}
    static bool Text(string s){return !string.IsNullOrEmpty(s)&&s.Length<=160;}
    static bool Vector(double[] v){return v!=null&&v.Length==3&&Array.TrueForAll(v,n=>Finite(n)&&Math.Abs(n)<=250);}
    static bool Color(string c){return c!=null&&System.Text.RegularExpressions.Regex.IsMatch(c,"^#[0-9a-fA-F]{6}$");}
    public WorldViewState(WorldConfig config){
        if(config==null||config.schema!=Schema||!Text(config.session)||!Text(config.fixtureId)||config.teams?.Length!=2||config.players==null||config.players.Length<2||config.players.Length>60)throw new ArgumentException("Invalid match view configuration");
        var g=config.geometry;
        if(g==null||!Finite(g.length)||g.length<20||g.length>120||!Finite(g.width)||g.width<15||g.width>90||!Finite(g.goalWidth)||g.goalWidth<2||g.goalWidth>g.width/2||!Finite(g.goalHeight)||g.goalHeight<1||g.goalHeight>5||!Finite(g.penaltyDepth)||g.penaltyDepth<=0||g.penaltyDepth>=g.length/2||!Finite(g.penaltyWidth)||g.penaltyWidth<=g.goalWidth||g.penaltyWidth>=g.width||g.fieldPlayers<1||g.fieldPlayers>11)throw new ArgumentException("Invalid match view geometry");
        if(!Text(config.teams[0]?.id)||!Text(config.teams[1]?.id)||config.teams[0].id==config.teams[1].id||!Text(config.teams[0].name)||!Text(config.teams[1].name)||config.teams[0].home==config.teams[1].home)throw new ArgumentException("Invalid match view teams");
        foreach(var p in config.players){if(p==null||!Text(p.id)||!Text(p.name)||p.team<0||p.team>1||p.number<0||p.number>99||p.kit==null||!Color(p.kit.main)||!Color(p.kit.trim)||!Color(p.kit.accent)||Players.ContainsKey(p.id))throw new ArgumentException("Invalid match view player");Players.Add(p.id,p);}
        Config=config;Validate(config.initial);Frame=config.initial;
    }
    public bool Accept(WorldFrame candidate){Validate(candidate);if(candidate.sequence<=Frame.sequence)return false;Frame=candidate;return true;}
    public void Validate(WorldFrame f){
        if(f==null||f.schema!=Schema||f.session!=Config.session||f.sequence<1||!Finite(f.clock)||f.clock<0||!Finite(f.elapsed)||f.elapsed<0||!new HashSet<string>{"live","paused","finished","replay","prematch","preparation"}.Contains(f.phase)||!Vector(f.ball)||f.ball[1]<0||!Finite(f.ballOpacity)||f.ballOpacity<0||f.ballOpacity>1||f.score?.Length!=2||Array.Exists(f.score,n=>n<0||n>1000)||f.camera==null||!Vector(f.camera.position)||!Vector(f.camera.target)||!Finite(f.camera.fov)||f.camera.fov<5||f.camera.fov>100||f.players==null||f.players.Length<1||f.players.Length>24)throw new ArgumentException("Invalid match picture");
        var ids=new HashSet<string>();foreach(var p in f.players){if(p==null||!Players.TryGetValue(p.id??"",out var identity)||!ids.Add(p.id)||!Vector(p.position)||!Vector(p.facing)||(p.contactPoint?.Length??0)>0&&!Vector(p.contactPoint)||p.actionId!=null&&p.actionId.Length>160||!Finite(p.recovery)||p.recovery<0||p.recovery>1||!Finite(p.freshness)||p.freshness!= -1&&(p.freshness<0||p.freshness>1)||!Finite(p.progress)||Math.Abs(p.progress)>100||!Finite(p.duration)||p.duration<=0||p.duration>30||p.number!=identity.number)throw new ArgumentException("Invalid match picture player");}
        if(!string.IsNullOrEmpty(f.owner)&&!ids.Contains(f.owner))throw new ArgumentException("Invalid match picture owner");
        if(f.celebrating&&(f.celebrationTeam<0||f.celebrationTeam>1||!Finite(f.celebrationTime)||f.celebrationTime<0||f.celebrationTime>60||f.celebrationScorer!=null&&f.celebrationScorer.Length>160))throw new ArgumentException("Invalid match celebration picture");
        if(f.netActive&&(f.net==null||Math.Abs(f.net.sign)!=1||!Finite(f.net.z)||Math.Abs(f.net.z)>Config.geometry.goalWidth/2||!Finite(f.net.height)||f.net.height<0||f.net.height>5||!Finite(f.net.age)||f.net.age<0||!Finite(f.net.bulge)||f.net.bulge<0||f.net.bulge>1.5))throw new ArgumentException("Invalid match net picture");
    }
}
}
