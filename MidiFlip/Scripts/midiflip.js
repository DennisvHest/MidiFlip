var inputFile;
var reader = new FileReader();

function checkOptions(file) {
    reader.onload = function (e) {
        //Parse the midi file
        var midi = null;

        try {
            midi = MidiConvert.parse(e.target.result);

            Enumerable.from(midi.tracks).forEach(function(t) {
                t.notes.forEach(function(n) {
                    n.channel = t.channelNumber;
                });
            });

            var anchorNote = Enumerable.from(Enumerable.from(midi.tracks)
                .where(function(t) { return !t.isPercussion; })
                .selectMany(function(t) { return t.notes; })
                .orderBy(function(n) { return n.time; }).groupBy(function(n) { return n.time; })
                .first().getSource()).min(function(n) { return n.midi; });

            var highestNote = Enumerable.from(midi.tracks)
                .where(function (t) { return !t.isPercussion; })
                .selectMany(function (t) { return t.notes; })
                .max(function (n) { return n.midi; });

            var lowestNote = Enumerable.from(midi.tracks)
                .where(function (t) { return !t.isPercussion; })
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

            options.slideDown("fast", function() { options.css("display", "inline-block"); });
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
    flipRequest.open("POST", "/midi/flip", true);
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

            if (track.isPercussion) continue; //Ignore percussion tracks

            var midiPart = new Tone.Part(function (time, note) {
                instrument.triggerAttackRelease(note.name, note.duration, time, note.velocity);
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

        downloadButton[0].href = window.URL.createObjectURL(blob, { type: inputFile.type });
        downloadButton[0].download = inputFile.name;

        flipButton.html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
        flipAnotherButton.show();
        stopButton.show();
        downloadButton.css("display", "inline-block");
        message.slideUp("fast");
        options.slideUp("fast");
        upload.slideUp("fast");
    };

    reader.readAsBinaryString(blob);
}