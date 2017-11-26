using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using MidiSharp;
using MidiSharp.Events;
using MidiSharp.Events.Voice.Note;

namespace MidiFlip.Services {
    public interface IMidiService {
        Stream Flip(HttpPostedFileBase midiFile);
    }

    public class MidiService : IMidiService {

        public Stream Flip(HttpPostedFileBase midiFile) {
            //Load midi file
            MidiSequence midi = MidiSequence.Open(midiFile.InputStream);

            foreach (MidiTrack track in midi.Tracks) {
                //The anchor note to flip everything else around
                IEnumerable<OnNoteVoiceMidiEvent> onNoteEvents = track.OfType<OnNoteVoiceMidiEvent>();
                int anchorNote = onNoteEvents.First().Note;

                foreach (OnNoteVoiceMidiEvent onNoteEvent in onNoteEvents) {
                    onNoteEvent.Note = (byte) (anchorNote + anchorNote - onNoteEvent.Note);
                }
            }

            //Create flipped MIDI-file
            Stream flippedMidiStream = new MemoryStream();
            midi.Save(flippedMidiStream);
            flippedMidiStream.Position = 0;

            return flippedMidiStream;
        }
    }
}