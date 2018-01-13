using System.IO;
using System.Net;
using System.Threading.Tasks;
using System.Web.Mvc;
using MidiFlip.Services;

namespace MidiFlip.Controllers {

    public class MidiController : Controller {

        private readonly IMidiService _midiService;

        public MidiController(IMidiService midiService) {
            _midiService = midiService;
        }

        [HttpPost]
        public ActionResult Flip(int octaveChange) {
            if (Request.Files.Count != 1)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            if (Request.Files[0]?.ContentType != "audio/midi" && Request.Files[0]?.ContentType != "audio/mid")
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            Stream flippedMidi = _midiService.Flip(Request.Files[0].InputStream, octaveChange);

            return File(flippedMidi, "audio/midi");
        }

        public PartialViewResult Search(string query) {
            return PartialView("_SearchResults", _midiService.Search(query));
        }

        public async Task<ActionResult> Get(int id) {
            Stream midi = await _midiService.Get(id);

            return File(midi, "audio/midi");
        }
    }
}