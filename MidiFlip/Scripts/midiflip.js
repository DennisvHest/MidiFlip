var inputFile;
var reader = new FileReader();

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

$("#midi-dropzone").dropzone({
    url: "/home/flip",
    clickable: "#browse",
    autoProcessQueue: false,
    //            previewTemplate: "",
    //            dictDefaultMessage: "",
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
    if ($(".ripple").is(":hidden") && !(event.fromElement != null && /h1|h6|p/g.test(event.fromElement.localName))) {
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

$("#flip-button").click(function () {
    $(this).html('<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>');

    //Send the flip request
    var flipRequest = new XMLHttpRequest();
    flipRequest.open("POST", "/home/flip", true);
    flipRequest.responseType = "arraybuffer";

    var formData = new FormData();
    formData.append(inputFile.name, inputFile);

    flipRequest.onload = function () {
        loadMidi(flipRequest.response);
    };

    flipRequest.send(formData);
});

function onFileAdded(file) {
    inputFile = file;
}

function loadMidi(buffer) {
    var blob = new Blob([buffer]);

    reader.onload = function (e) {
        //Parse the flipped midi file
        var flippedMidi = MidiConvert.parse(e.target.result);

        //Create a Tone part for each rack in the flipped midi
        for (var track = 0; track < flippedMidi.tracks.length; track++) {
            var midiPart = new Tone.Part(function (time, note) {
                piano.triggerAttackRelease(note.name, note.duration, time, note.velocity);
            }, flippedMidi.tracks[track].notes).start();
        }

        $("#flip-button").html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
        $("#upload").slideUp("fast");

        //Start playing
        Tone.Transport.start();
    }

    reader.readAsBinaryString(blob);
}