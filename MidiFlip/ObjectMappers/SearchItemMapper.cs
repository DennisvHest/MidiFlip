using System;
using System.Collections.Generic;
using System.Linq;
using HtmlAgilityPack;
using MidiFlip.Models;

namespace MidiFlip.ObjectMappers {

    public class SearchItemMapper : IObjectMapper<SearchItem> {

        public IEnumerable<SearchItem> MapMultiple(HtmlDocument data) {
            List<SearchItem> results = new List<SearchItem>();

            //Found categories
            HtmlNodeCollection categoryContainers = data.DocumentNode.SelectNodes("//div[@class='search-cat-container']");

            if (categoryContainers != null) {
                results.AddRange(categoryContainers.Select(s => {
                    HtmlNode nameNode = s.SelectSingleNode("./div/div/a");
                    string[] href = nameNode.Attributes.First(a => a.Name == "href").Value.Split('-');

                    return new Category(href[0]) {
                        Id = int.Parse(href[1]),
                        Name = nameNode.InnerText
                    };
                }));
            }

            //Found MIDIs
            HtmlNodeCollection midiContainers = data.DocumentNode.SelectNodes("//div[@class='search-song-container']");

            if (midiContainers != null) {
                //Parse html to Midi objects
                results.AddRange(midiContainers.Select(s => {
                    HtmlNode nameNode = s.SelectSingleNode("./div[@class='search-song-title']/a");
                    HtmlNode imageNode = s.SelectSingleNode("./div[@class='search-song-image']/a/img");

                    return new Midi {
                        Id = int.Parse(nameNode.Attributes.First(a => a.Name == "href").Value.Split('-')[1]),
                        Name = nameNode.InnerText,
                        Artist = s.SelectSingleNode("./div[@class='search-song-cat']/a").InnerText,
                        ImagePath = imageNode?.Attributes.First(a => a.Name == "src").Value
                    };
                }));
            }

            return results;
        }
    }
}