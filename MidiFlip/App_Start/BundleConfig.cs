using System.Web;
using System.Web.Optimization;

namespace MidiFlip {
    public class BundleConfig {
        public static void RegisterBundles(BundleCollection bundles) {
            bundles.Add(new ScriptBundle("~/bundles/basejs").Include(
                "~/Scripts/jquery.min.js",
                "~/Scripts/bootstrap.min.js"));

            bundles.Add(new StyleBundle("~/Content/basecss").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/font-awesome/css/font-awesome.min.css",
                      "~/Content/base.min.css"));
        }
    }
}
