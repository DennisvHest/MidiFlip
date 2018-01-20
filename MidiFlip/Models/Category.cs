using MidiFlip.Enums;

namespace MidiFlip.Models {
    public class Category : SearchItem {

        public CategoryType Type { get; set; }

        public Category(string categoryType) {
            switch (categoryType) {
                case "/artist":
                    Type = CategoryType.Artist;
                    break;
                case "/movietheme":
                    Type = CategoryType.MovieTheme;
                    break;
                case "/videogame":
                    Type = CategoryType.VideoGame;
                    break;
                case "/tvtheme":
                    Type = CategoryType.TvTheme;
                    break;
                case "/seasonal":
                    Type = CategoryType.Seasonal;
                    break;
                case "/nationalanthem":
                    Type = CategoryType.NationalAnthem;
                    break;
                default:
                    Type = CategoryType.Artist;
                    break;
            }
        }
    }
}