var inputFile;
var reader = new FileReader();

var MAX_MIDI_NOTE = 127;
var MIN_MIDI_NOTE = 0;
var OCTAVE = 12;

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

var flipButton = $("#flip-button");
var browseButton = $("#browse");
var flipAnotherButton = $("#flip-another");
var stopButton = $("#stop-button");
var message = $("#message");
var upload = $("#upload");
var octaveDropdown = $("#octave-change");
var options = $("#options");

function applyBrowseText() {
    if ($(window).height() < 480) {
        browseButton.html('<i class="fa fa-upload" aria-hidden="true"></i> Browse...');
    }
    else {
        browseButton.html('<i class="fa fa-upload" aria-hidden="true"></i> Or browse...');
    }
}

applyBrowseText();

$(window).resize(function () {
    if (currentState === STATE.IDLE) {
        applyBrowseText();
    }
});

$("#midi-dropzone").dropzone({
    url: "/home/flip",
    clickable: "#browse",
    autoProcessQueue: false,
    previewsContainer: false,
    maxFiles: 1,
    maxFilesize: 5,
    acceptedFiles: "audio/midi,.mid,.midi",
    init: function () {
        this.on("dragenter", displayDragFeedback);
        this.on("dragover", moveDragFeedback);
        this.on("dragleave", removeDragFeedback);
        this.on("drop", removeDragFeedback);
        this.on("addedfile", onFileAdded);
    }
});

var midiDropzone = Dropzone.forElement("#midi-dropzone");

function displayDragFeedback(event) {
    if ($(".ripple").is(":hidden") && !(event.fromElement !== null && /h1|h6|p/g.test(event.fromElement.localName))) {
        $(".ripple").fadeIn("fast");
    }
}

function moveDragFeedback(event) {
    var x = event.pageX;
    var y = event.pageY;
    var feedbackElement = $(".ripple");
    feedbackElement.css("left", x);
    feedbackElement.css("top", y);
}

function removeDragFeedback() {
    if ($(".ripple").is(":visible")) {
        $(".ripple").fadeOut("fast");
    }
}

flipButton.click(function () {
    switch (currentState) {
        case STATE.IDLE:
            browseButton.prop("disabled", true);
            browseButton.addClass("disabled");
            $(this).html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>');
            sendFlipRequest();
            break;
        case STATE.LOADED:
        case STATE.PAUSED:
        case STATE.STOPPED:
            Tone.Transport.start(Tone.now(), pausedOffset + "i");
            currentState = STATE.PLAYING;
            $(this).html('<i class="fa fa-pause fa-3x" aria-hidden="true"></i>');
            break;
        case STATE.PLAYING:
            pausedOffset = Tone.Transport.ticks;
            Tone.Transport.stop();
            currentState = STATE.PAUSED;
            $(this).html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
            break;
    }
});

flipAnotherButton.click(function () {
    //Stop playing and eset everything
    pausedOffset = 0;
    sequenceEnd = 0;
    currentState = STATE.IDLE;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    midiDropzone.enable();
    flipButton.prop("disabled", true);
    flipButton.html("FLIP");
    browseButton.prop("disabled", false);
    browseButton.removeClass("disabled");
    applyBrowseText();
    message.slideUp("fast");
    upload.slideDown("fast");
    $(this).hide();
    stopButton.hide();
});

stopButton.click(function () {
    currentState = STATE.STOPPED;
    pausedOffset = 0;
    flipButton.html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
    Tone.Transport.stop();
});

function onFileAdded(file) {
    if (file.type === "audio/mid" || file.type === "audio/midi") {
        checkOptions(file);
        inputFile = file;
        browseButton.html(file.name);
    } else {
        showMessage("error", "Only .mid and .midi files are allowed!");
    }
}

function checkOptions(file) {
    reader.onload = function (e) {
        //Parse the midi file
        var midi = null;

        try {
            midi = MidiConvert.parse(e.target.result);

            var anchorNote = Enumerable.from(midi.tracks)
                .selectMany(function (t) { return t.notes; })
                .minBy(function (n) { return n.time; }).midi;

            var highestNote = Enumerable.from(midi.tracks)
                .selectMany(function (t) { return t.notes; })
                .max(function (n) { return n.midi; });

            var lowestNote = Enumerable.from(midi.tracks)
                .selectMany(function (t) { return t.notes; })
                .min(function (n) { return n.midi; });

            var requiredOctaveChange = 0;
            var possibleHigherOctaveChange = 0;
            var possibleLowerOctaveChange = 0;

            var outOfRange;

            var flippingFromMiddle = false;

            //Check the required octave change as to not go outside of the midi note range
            if (anchorNote - lowestNote > highestNote - anchorNote) {
                outOfRange = anchorNote + (anchorNote - lowestNote);

                if (outOfRange > MAX_MIDI_NOTE) {
                    while (outOfRange + requiredOctaveChange > MAX_MIDI_NOTE)
                        requiredOctaveChange -= OCTAVE;

                    if (lowestNote + requiredOctaveChange < MIN_MIDI_NOTE) {
                        requiredOctaveChange = 0;
                        flippingFromMiddle = true;
                    }
                }
            } else {
                outOfRange = anchorNote - (highestNote - anchorNote);

                if (outOfRange < MIN_MIDI_NOTE) {
                    while (outOfRange + requiredOctaveChange < MIN_MIDI_NOTE)
                        requiredOctaveChange += OCTAVE;

                    if (highestNote + requiredOctaveChange > MAX_MIDI_NOTE) {
                        requiredOctaveChange = 0;
                        flippingFromMiddle = true;
                    }
                }
            }

            if (!flippingFromMiddle) {
                message.slideUp("fast");

                //Calculate the possible octave change (higher and lower) without going out of the midi note range
                while (anchorNote + anchorNote - highestNote + requiredOctaveChange + possibleLowerOctaveChange - OCTAVE >=
                    MIN_MIDI_NOTE)
                    possibleLowerOctaveChange -= OCTAVE;

                while (anchorNote + anchorNote - lowestNote + requiredOctaveChange + possibleHigherOctaveChange + OCTAVE <=
                    MAX_MIDI_NOTE)
                    possibleHigherOctaveChange += OCTAVE;
            } else {
                showMessage("warning",
                    "This MIDI cannot be flipped around the first note, so it will be flipped from the middle.");
            }

            //Fill dropdown with octave change options
            octaveDropdown.empty();

            var text;

            for (var octaveChange = possibleHigherOctaveChange / OCTAVE;
                octaveChange >= possibleLowerOctaveChange / OCTAVE;
                octaveChange--) {
                text = octaveChange > 0 ? "+" + octaveChange : octaveChange;

                if (octaveChange === 0) {
                    octaveDropdown.append('<option value="' + octaveChange + '" selected>' + text + '</option>');
                } else {
                    octaveDropdown.append('<option value="' + octaveChange + '">' + text + '</option>');
                }
            }

            options.slideDown("fast");
            flipButton.prop("disabled", false);
        } catch (err) {
            flipButton.prop("disabled", true);
            if (err === "Bad .mid file - header not found") {
                showMessage("error", "This MIDI-file could not be read!");
            } else {
                showMessage("error", "Something whent wrong while reading this MIDI-file!");
            }
            options.slideUp("fast");
        }
    };

    reader.readAsBinaryString(file);
}

function sendFlipRequest() {
    midiDropzone.disable();

    //Send the flip request
    var flipRequest = new XMLHttpRequest();
    flipRequest.open("POST", "/home/flip", true);
    flipRequest.responseType = "arraybuffer";

    var formData = new FormData();
    formData.append(inputFile.name, inputFile);
    formData.append("octaveChange", octaveDropdown.val());

    flipRequest.onload = function () {
        loadMidi(flipRequest.response);
    };

    flipRequest.send(formData);
}

function loadMidi(buffer) {
    var blob = new Blob([buffer]);

    reader.onload = function (e) {
        //Parse the flipped midi file
        var flippedMidi = MidiConvert.parse(e.target.result);

        Tone.Transport.bpm.value = flippedMidi.header.bpm;

        //Create a Tone part for each rack in the flipped midi
        for (var trackNr = 0; trackNr < flippedMidi.tracks.length; trackNr++) {
            var track = flippedMidi.tracks[trackNr];

            var midiPart = new Tone.Part(function (time, note) {
                piano.triggerAttackRelease(note.name, note.duration, time, note.velocity);
            },
                track.notes);

            //Get the total time in seconds of the flipped midi sequence
            if (track.notes.length !== 0) {
                var trackEnd = track.notes[track.notes.length - 1].time + track.notes[track.notes.length - 1].duration;

                if (trackEnd > sequenceEnd)
                    sequenceEnd = trackEnd;
            }

            midiPart.start(0);
        }

        currentState = STATE.LOADED;

        flipButton.html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
        flipAnotherButton.show();
        stopButton.show();
        message.slideUp("fast");
        options.slideUp("fast");
        upload.slideUp("fast");
    };

    reader.readAsBinaryString(blob);
}

Tone.Transport.on("start", updateStopTime);

Tone.Transport.on("stop", function() {
    if (currentState !== STATE.STOPPED && currentState !== STATE.PAUSED && currentState !== STATE.IDLE) {
        pausedOffset = 0;
        currentState = STATE.STOPPED;
        flipButton.html('<i class="fa fa-repeat fa-3x" aria-hidden="true"></i>');
    }
});

function updateStopTime() {
    Tone.Transport.stop(Tone.now() + " + " + sequenceEnd + " - " + pausedOffset + "i");
}

$('body').keyup(function (e) {
    if (e.keyCode === 32) {
        //"Click" the flip-button when spacebar is pressed
        flipButton.click();
    }
});

function showMessage(level, msg) {
    message.attr("class", level);
    message.html('<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' + msg);
    message.slideDown("fast");
}