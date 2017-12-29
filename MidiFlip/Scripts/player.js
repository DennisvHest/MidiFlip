var STATE = {
    IDLE: "IDLE",
    LOADED: "LOADED",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    STOPPED: "STOPPED"
};

var currentState = STATE.IDLE;

var pausedOffset = 0;
var sequenceEnd = 0;

var triangleSynth = new Tone.PolySynth(8, Tone.Synth).toMaster();
triangleSynth.set({
    "oscillator": {
        "type": "triangle"
    },
    "envelope": {
        "attack": 0.005,
        "decay": 0.1,
        "sustain": 0.2,
        "release": 1
    }
});

var piano = new Tone.Sampler({
    'A0': "A0.[mp3|ogg]",
    'C1': "C1.[mp3|ogg]",
    'D#1': "Ds1.[mp3|ogg]",
    'F#1': "Fs1.[mp3|ogg]",
    'A1': "A1.[mp3|ogg]",
    'C2': "C2.[mp3|ogg]",
    'D#2': "Ds2.[mp3|ogg]",
    'F#2': "Fs2.[mp3|ogg]",
    'A2': "A2.[mp3|ogg]",
    'C3': "C3.[mp3|ogg]",
    'D#3': "Ds3.[mp3|ogg]",
    'F#3': "Fs3.[mp3|ogg]",
    'A3': "A3.[mp3|ogg]",
    'C4': "C4.[mp3|ogg]",
    'D#4': "Ds4.[mp3|ogg]",
    'F#4': "Fs4.[mp3|ogg]",
    'A4': "A4.[mp3|ogg]",
    'C5': "C5.[mp3|ogg]",
    'D#5': "Ds5.[mp3|ogg]",
    'F#5': "Fs5.[mp3|ogg]",
    'A5': "A5.[mp3|ogg]",
    'C6': "C6.[mp3|ogg]",
    'D#6': "Ds6.[mp3|ogg]",
    'F#6': "Fs6.[mp3|ogg]",
    'A6': "A6.[mp3|ogg]",
    'C7': "C7.[mp3|ogg]",
    'D#7': "Ds7.[mp3|ogg]",
    'F#7': "Fs7.[mp3|ogg]",
    'A7': "A7.[mp3|ogg]",
    'C8': "C8.[mp3|ogg]"
}, {
    'release': 1,
    'baseUrl': "/content/audio/"
}).toMaster();

var instruments = [piano, triangleSynth];
var instrument;