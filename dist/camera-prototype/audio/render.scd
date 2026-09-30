// Doppel 6 camera prototype. Original synthesized sounds, no samples.
// Run with sclang -D render.scd. NRT files are written beside this source.
(
var folder = thisProcess.nowExecutingPath.dirname;
var jobs, remaining;
var kick = SynthDef(\d6Kick, { |out=0, power=1|
    var env = EnvGen.ar(Env.perc(0.001, 0.17), doneAction:2);
    var thud = SinOsc.ar(XLine.kr(180 * power, 48, 0.14)) * env;
    var leather = BPF.ar(WhiteNoise.ar, 1100 * power, 0.7) * EnvGen.ar(Env.perc(0.001,0.04));
    Out.ar(out, ((thud * 0.48) + (leather * 0.23)).tanh.dup * 0.65);
});
var whistle = SynthDef(\d6Whistle, { |out=0|
    var env = EnvGen.kr(Env.linen(0.025,0.32,0.09), doneAction:2);
    var vibrato = SinOsc.kr(26,0,32);
    var tone = SinOsc.ar(2450 + vibrato) + (SinOsc.ar(3230 + vibrato) * 0.23);
    Out.ar(out, (tone * env * 0.13).dup);
});
var crowd = SynthDef(\d6Crowd, { |out=0, duration=10, excited=0|
    var bed = BPF.ar(PinkNoise.ar([0.8,0.8]), [530,710], 1.1);
    var voices = Mix.fill(16, { |i|
        var pitch = 135 + (i * 17);
        var voice = Formant.ar(pitch + SinOsc.kr(0.17+(i*0.035),i,7), 720+(i*60), 140);
        Pan2.ar(voice * LFNoise1.kr(2.3+(i*0.1)).range(0.005,0.019), (i/7.5)-1);
    });
    var shape = EnvGen.kr(Env.linen(0.15,duration-0.5,0.35),doneAction:2);
    var swell = 1 + (excited * EnvGen.kr(Env([0,1,0.6,0],[0.5,duration-1.5,1])) * 3.0);
    var sound = (bed * 0.13 + voices) * shape * swell;
    Out.ar(out, Limiter.ar(sound,0.65));
});
var net = SynthDef(\d6Net, { |out=0|
    var env = EnvGen.kr(Env.perc(0.005,0.5),doneAction:2);
    var sound = BPF.ar(PinkNoise.ar,900,1) * env * 0.25;
    Out.ar(out,sound.dup);
});
jobs = [
    ["pass", kick, 0.35, [\power,0.85]],
    ["shot", kick, 0.4, [\power,1.4]],
    ["whistle", whistle, 0.65, []],
    ["crowd", crowd, 10.0, [\duration,10,\excited,0]],
    ["cheer", crowd, 4.5, [\duration,4.5,\excited,1]],
    ["net", net, 0.7, []]
];
remaining = jobs.size;
jobs.do { |job|
    var options = ServerOptions.new.numOutputBusChannels_(2).numInputBusChannels_(0);
    var score = Score([
        [0.0, [\d_recv,job[1].asBytes]],
        [0.001, [\s_new,job[1].name,1000,0,0] ++ job[3]],
        [job[2], [0]]
    ]);
    score.recordNRT(
        outputFilePath: folder +/+ (job[0] ++ ".wav"),
        sampleRate:22050, headerFormat:"WAV", sampleFormat:"int16", options:options,
        duration:job[2],
        action:{
            ("D6 rendered " ++ job[0]).postln;
            remaining = remaining - 1;
            if(remaining == 0) { "D6 SOUND PACK COMPLETE".postln; 0.exit; };
        }
    );
};
)
