using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using MidiFlip.Exceptions;
using MidiSharp;
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
                IEnumerable<NoteVoiceMidiEvent> noteEvents = track.OfType<NoteVoiceMidiEvent>();

                if (!noteEvents.Any()) continue; //Nothing to flip

                //The anchor note to flip everything else around
                int anchorNote = noteEvents.First().Note;
                int octaveChange = 0;

                //Check if flipping won't make the notes go out of range (0-127) TODO: Test all cases
                int highestNote = noteEvents.Max(e => e.Note);
                int lowestNote = noteEvents.Min(e => e.Note);

                if (lowestNote == Constants.MinMidiNote && highestNote == Constants.MaxMidiNote)
                    throw new MidiFlipException("Flipping is impossible when the lowest note is the minimum MIDI-note and the highest note is the maximum MIDI-note!");

                if (anchorNote - lowestNote > highestNote - lowestNote) {
                    //Flipping might make notes go past 127, if so, try to decrease octave
                    int outOfRange = anchorNote + (anchorNote - lowestNote);

                    if (outOfRange > Constants.MaxMidiNote) {
                        while (outOfRange + octaveChange > Constants.MaxMidiNote)
                            octaveChange -= Constants.Octave;

                        if (lowestNote + octaveChange < Constants.MinMidiNote) {
                            //Out of range on the other side now, flip everything around the middle note instead and don't change octave
                            anchorNote = (highestNote - lowestNote) / 2;
                            octaveChange = 0;
                        }
                    }
                } else {
                    //Flipping might make notes go below 0, if so, try to increase octave
                    int outOfRange = anchorNote - (highestNote - anchorNote);

                    if (outOfRange < Constants.MinMidiNote) {
                        while (outOfRange + octaveChange < Constants.MinMidiNote)
                            octaveChange += Constants.Octave;

                        if (highestNote + octaveChange > Constants.MaxMidiNote) {
                            //Out of range on the other side now, flip everything around the middle note instead and don't change octave
                            anchorNote = (int)Math.Ceiling(((double)highestNote - lowestNote) / 2);
                            octaveChange = 0;
                        }
                    }
                }

                foreach (NoteVoiceMidiEvent onNoteEvent in noteEvents) {
                    onNoteEvent.Note = (byte) (anchorNote + anchorNote - onNoteEvent.Note + octaveChange);
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