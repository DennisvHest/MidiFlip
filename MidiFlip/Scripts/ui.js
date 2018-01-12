//Small screens don't show the dropzone, so change the browse button text
function applyBrowseText() {
    if ($(window).height() < 550) {
        browseButton.html('<i class="fa fa-upload" aria-hidden="true"></i> Browse...');
    }
    else {
        browseButton.html('<i class="fa fa-upload" aria-hidden="true"></i> Or browse...');
    }
}

applyBrowseText();

$(window).resize(function () {
    if (currentState === STATE.IDLE && inputFile === undefined) {
        applyBrowseText();
    }
});

//Triangle Synth is default on mobile, otherwise piano
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    instrument = instruments[1];
    $("#triangle-synth").prop("checked", true);
    $("#mobile-piano-warning").css("display", "inline-block");
} else {
    instrument = instruments[0];
    $("#piano").prop("checked", true);
}

//File dropzone
$("#midi-dropzone").dropzone({
    url: "/midi/flip",
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

//Display feedback ripple when dropping file into the dropzone
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
            instrument.volume.value = 0;
            break;
        case STATE.LOADED:
        case STATE.PAUSED:
        case STATE.STOPPED:
            Tone.Transport.start(Tone.now(), pausedOffset + "i");
            instrument.volume.value = 0;
            currentState = STATE.PLAYING;
            $(this).html('<i class="fa fa-pause fa-3x" aria-hidden="true"></i>');
            break;
        case STATE.PLAYING:
            pausedOffset = Tone.Transport.ticks;
            Tone.Transport.stop();
            instrument.volume.value = -50;
            currentState = STATE.PAUSED;
            $(this).html('<i class="fa fa-play fa-3x" aria-hidden="true"></i>');
            break;
    }
});

flipAnotherButton.click(function () {
    //Stop playing and reset everything
    pausedOffset = 0;
    sequenceEnd = 0;
    currentState = STATE.IDLE;
    inputFile = undefined;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    instrument.volume.value = -50;
    midiDropzone.enable();
    downloadButton.hide();
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
    instrument.volume.value = -50;
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

Tone.Transport.on("start", updateStopTime);

Tone.Transport.on("stop", function () {
    if (currentState !== STATE.STOPPED && currentState !== STATE.PAUSED && currentState !== STATE.IDLE) {
        pausedOffset = 0;
        currentState = STATE.STOPPED;
        flipButton.html('<i class="fa fa-repeat fa-3x" aria-hidden="true"></i>');
    }
});

function updateStopTime() {
    Tone.Transport.stop(Tone.now() + " + " + sequenceEnd + " - " + pausedOffset + "i");
}

$("body").keyup(function (e) {
    if (e.keyCode === 32 && inputFile !== undefined) {
        //"Click" the flip-button when spacebar is pressed
        flipButton.click();
    }
});

$("input[name='instrument']").change(function() {
    instrument = instruments[$(this).data("instrument")];
});

function showMessage(level, msg) {
    message.attr("class", level);
    message.html('<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' + msg);
    message.slideDown("fast");
}