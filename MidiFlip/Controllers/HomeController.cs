using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using MidiFlip.Services;

namespace MidiFlip.Controllers {
    public class HomeController : Controller {

        private readonly IMidiService _midiService;

        public HomeController(IMidiService midiService) {
            _midiService = midiService;
        }

        public ActionResult Index() {
            return View();
        }

        [HttpPost]
        public ActionResult Flip() {
            if (Request.Files.Count != 1)
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            if (Request.Files[0]?.ContentType != "audio/midi" && Request.Files[0]?.ContentType != "audio/mid")
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);

            Stream flippedMidi = _midiService.Flip(Request.Files[0].InputStream);

            return File(flippedMidi, "audio/midi", "flipped");
        }
    }
}