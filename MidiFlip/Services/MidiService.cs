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
        Stream Flip(Stream midiFile);
    }

    public class MidiService : IMidiService {

        public Stream Flip(Stream midiFile) {
            //Load midi file
            MidiSequence midi = MidiSequence.Open(midiFile);

            //The anchor note to flip everything else around
            float anchorNote = midi.Tracks
                .Where(t => t.Events.OfType<NoteVoiceMidiEvent>().Any())
                .Select(t => t.Events.OfType<NoteVoiceMidiEvent>().First())
                .OrderBy(n => n.DeltaTime).FirstOrDefault().Note;

            int octaveChange = 0; //Global octave change required for this sequence

            bool flipFromMiddle = false; //If octave changes aren't possible, sequence needs to be flipped around the middle

            //Determine if the octave needs to be changed
            foreach (MidiTrack track in midi.Tracks) {
                IEnumerable<NoteVoiceMidiEvent> noteEvents = track.OfType<NoteVoiceMidiEvent>();

                if (!noteEvents.Any()) continue; //No notes to check

                //Check if flipping won't make the notes go out of range (0-127) TODO: Test all cases
                int highestTrackNote = noteEvents.Max(e => e.Note);
                int lowestTrackNote = noteEvents.Min(e => e.Note);

                int trackOctaveChange = 0; //Octave change required for this track

                if (anchorNote - lowestTrackNote > highestTrackNote - anchorNote) {
                    //Flipping might make notes go past 127, if so, try to decrease octave
                    float outOfRange = anchorNote + (anchorNote - lowestTrackNote);

                    if (outOfRange > Constants.MaxMidiNote) {
                        while (outOfRange + trackOctaveChange > Constants.MaxMidiNote)
                            trackOctaveChange -= Constants.Octave;

                        if (lowestTrackNote + trackOctaveChange < Constants.MinMidiNote) {
                            //Out of range on the other side now, flip everything around the middle note instead and don't change octave
                            flipFromMiddle = true;
                        } else {
                            //Check if the global octave change needs to be lowered
                            if (octaveChange > trackOctaveChange)
                                octaveChange = trackOctaveChange;
                        }
                    }
                } else {
                    //Flipping might make notes go below 0, if so, try to increase octave
                    float outOfRange = anchorNote - (highestTrackNote - anchorNote);

                    if (outOfRange < Constants.MinMidiNote) {
                        while (outOfRange + trackOctaveChange < Constants.MinMidiNote)
                            trackOctaveChange += Constants.Octave;

                        if (highestTrackNote + trackOctaveChange > Constants.MaxMidiNote) {
                            //Out of range on the other side now, flip everything around the middle note instead and don't change octave
                            flipFromMiddle = true;
                        } else {
                            //Check if the global octave change needs to be raised
                            if (octaveChange < trackOctaveChange)
                                octaveChange = trackOctaveChange;
                        }
                    }
                }
            }

            if (flipFromMiddle) {
                //Changing octaves is not possible, flip everything around the middle
                int highestNote = midi.Tracks.SelectMany(t => t.Events.OfType<NoteVoiceMidiEvent>()).Max(e => e.Note);
                int lowestNote = midi.Tracks.SelectMany(t => t.Events.OfType<NoteVoiceMidiEvent>()).Min(e => e.Note);

                anchorNote = (float) (highestNote - lowestNote) / 2;
            }

            //Flip all notes
            foreach (MidiTrack track in midi.Tracks) {
                IEnumerable<NoteVoiceMidiEvent> noteEvents = track.OfType<NoteVoiceMidiEvent>();

                if (!noteEvents.Any()) continue; //Nothing to flip

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