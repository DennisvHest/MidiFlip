using System.Web.Mvc;
using MidiFlip.Services;

namespace MidiFlip.Controllers {
    public class HomeController : Controller {

        public ActionResult Index() {
            return View();
        }
    }
}