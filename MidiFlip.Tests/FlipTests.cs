using System.IO;
using System.Linq;
using System.Web;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MidiFlip.Services;
using MidiSharp;
using MidiSharp.Events.Voice.Note;

namespace MidiFlip.Tests {

    [TestClass]
    public class FlipTests {

        public const string TestFilesPath = "Test_Files/";

        [TestMethod]
        public void Flip_Should_Raise_Octave_When_Flipping_Below_0() {
            //Arrange
            MidiService target = new MidiService();
            Stream midiStream = File.Open($"{TestFilesPath}out_of_range_0.mid", FileMode.Open);
            int firstNote = 0;
            int lastNote = 12;

            //Act
            Stream flippedMidiStream = target.Flip(midiStream);

            //Assert
            MidiSequence flippedMidi = MidiSequence.Open(flippedMidiStream);
            int firstFlippedNote = flippedMidi.Tracks[2].Events.OfType<OnNoteVoiceMidiEvent>().First().Note;
            int lastFlippedNote = flippedMidi.Tracks[2].Events.OfType<OnNoteVoiceMidiEvent>().Last().Note;

            //Midi should be flipped while also having been raised by one octave
            Assert.AreEqual(firstNote, lastFlippedNote);
            Assert.AreEqual(firstFlippedNote, lastNote);
        }

        [TestMethod]
        public void Flip_Should_Lower_Octave_When_Flipping_Above_127() {
            //Arrange
            MidiService target = new MidiService();
            Stream midiStream = File.Open($"{TestFilesPath}out_of_range_127.mid", FileMode.Open);
            int firstNote = 127;
            int lastNote = 115;

            //Act
            Stream flippedMidiStream = target.Flip(midiStream);

            //Assert
            MidiSequence flippedMidi = MidiSequence.Open(flippedMidiStream);
            int firstFlippedNote = flippedMidi.Tracks[2].Events.OfType<OnNoteVoiceMidiEvent>().First().Note;
            int lastFlippedNote = flippedMidi.Tracks[2].Events.OfType<OnNoteVoiceMidiEvent>().Last().Note;

            //Midi should be flipped while also having been raised by one octave
            Assert.AreEqual(firstNote, lastFlippedNote);
            Assert.AreEqual(firstFlippedNote, lastNote);
        }
    }
}
