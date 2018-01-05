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
        Stream Flip(Stream midiFile, int octaveChangeOption);
    }

    public class MidiService : IMidiService {

        public Stream Flip(Stream midiFile, int octaveChangeOption) {
            //Load midi file
            MidiSequence midi = MidiSequence.Open(midiFile);

            //The anchor note to flip everything else around
            float anchorNote = midi.Tracks
                .Where(t => t.Events.OfType<NoteVoiceMidiEvent>().Any() && t.Events.OfType<NoteVoiceMidiEvent>().Any(n => n.Channel != 9 && n.Channel != 10))
                .Select(t => t.Events.OfType<NoteVoiceMidiEvent>().First())
                .OrderBy(e => e.DeltaTime).GroupBy(e => e.DeltaTime).First() //Find the first note
                .Min(e => e.Note); //Order by note number if there are notes playing at the same time

            int highestNote = midi.Tracks
                .Where(t => t.Events.OfType<NoteVoiceMidiEvent>().Any(n => n.Channel != 9 && n.Channel != 10))
                .SelectMany(t => t.Events.OfType<NoteVoiceMidiEvent>())
                .Max(e => e.Note);
            int lowestNote = midi.Tracks
                .Where(t => t.Events.OfType<NoteVoiceMidiEvent>().Any(n => n.Channel != 9 && n.Channel != 10))
                .SelectMany(t => t.Events.OfType<NoteVoiceMidiEvent>())
                .Min(e => e.Note);

            int octaveChange = 0; //Global octave change required for this sequence

            octaveChangeOption *= Constants.Octave;

            bool flipFromMiddle = false; //If octave changes aren't possible, sequence needs to be flipped around the middle

            //Check if flipping won't make the notes go out of range (0-127) TODO: Test all cases
            if (anchorNote - lowestNote > highestNote - anchorNote) {
                //Flipping might make notes go past 127, if so, try to decrease octave
                float outOfRange = anchorNote + (anchorNote - lowestNote);

                if (outOfRange > Constants.MaxMidiNote) {
                    while (outOfRange + octaveChange > Constants.MaxMidiNote)
                        octaveChange -= Constants.Octave;

                    if (lowestNote + octaveChange < Constants.MinMidiNote) {
                        //Out of range on the other side now, flip everything around the middle note instead and don't change octave
                        flipFromMiddle = true;
                        octaveChange = 0;
                    }
                }
            } else {
                //Flipping might make notes go below 0, if so, try to increase octave
                float outOfRange = anchorNote - (highestNote - anchorNote);

                if (outOfRange < Constants.MinMidiNote) {
                    while (outOfRange + octaveChange < Constants.MinMidiNote)
                        octaveChange += Constants.Octave;

                    if (highestNote + octaveChange > Constants.MaxMidiNote) {
                        //Out of range on the other side now, flip everything around the middle note instead and don't change octave
                        flipFromMiddle = true;
                        octaveChange = 0;
                    }
                }
            }

            if (flipFromMiddle) //Changing octaves is not possible, flip everything around the middle
                anchorNote = (float)(highestNote - lowestNote) / 2;

            //Flip all notes
            foreach (MidiTrack track in midi.Tracks) {
                IEnumerable<NoteVoiceMidiEvent> noteEvents = track.OfType<NoteVoiceMidiEvent>().Where(n => n.Channel != 9 && n.Channel != 10);

                if (!noteEvents.Any()) continue; //Nothing to flip

                foreach (NoteVoiceMidiEvent onNoteEvent in noteEvents) {
                    onNoteEvent.Note = (byte)(anchorNote + anchorNote - onNoteEvent.Note + octaveChange + octaveChangeOption);
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