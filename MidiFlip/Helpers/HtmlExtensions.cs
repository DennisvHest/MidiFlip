using System.Web.Mvc;
using MidiFlip.Enums;

namespace MidiFlip.Helpers {

    public static class HtmlExtensions {

        public static string GetCategoryFaClass(this HtmlHelper helper, CategoryType type) {
            switch (type) {
                case CategoryType.Artist:
                    return "user";
                case CategoryType.MovieTheme:
                    return "film";
                case CategoryType.NationalAnthem:
                    return "globe";
                case CategoryType.Seasonal:
                    return "leaf";
                case CategoryType.TvTheme:
                    return "television";
                case CategoryType.VideoGame:
                    return "gamepad";
                default:
                    return "tag";
            }
        }
    }
}