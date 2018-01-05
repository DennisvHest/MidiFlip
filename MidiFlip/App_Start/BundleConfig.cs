using System.Web;
using System.Web.Optimization;
using MidiFlip.App_Start;

namespace MidiFlip {
    public class BundleConfig {
        public static void RegisterBundles(BundleCollection bundles) {
            Bundle baseJsBundle = new ScriptBundle("~/bundles/basejs").Include(
                "~/Scripts/jquery.min.js",
                "~/Scripts/jquery.unobtrusive-ajax.min.js",
                "~/Scripts/bootstrap.min.js");

            baseJsBundle.Orderer = new NonOrderingBundleOrderer();
            bundles.Add(baseJsBundle);

            Bundle customJsBundle = new ScriptBundle("~/bundles/customjs").Include(
                "~/Scripts/constants.js",
                "~/Scripts/player.js",
                "~/Scripts/midiflip.js",
                "~/Scripts/ui.js");

            customJsBundle.Orderer = new NonOrderingBundleOrderer();
            bundles.Add(customJsBundle);

            bundles.Add(new StyleBundle("~/Content/basecss").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/font-awesome/css/font-awesome.min.css",
                      "~/Content/base.min.css"));
        }
    }
}
