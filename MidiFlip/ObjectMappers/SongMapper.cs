using System;
using System.Collections.Generic;
using System.Linq;
using HtmlAgilityPack;
using MidiFlip.Models;

namespace MidiFlip.ObjectMappers {

    public class SongMapper : IObjectMapper<Midi> {

        public Midi Map(HtmlDocument data) {
            throw new NotImplementedException();
        }

        public IEnumerable<Midi> MapMultiple(HtmlDocument data) {
            return data.DocumentNode.SelectNodes("//div[@class='search-song-container']")
                .Select(s => {
                    HtmlNode titleNode = s.SelectSingleNode("./div[@class='search-song-title']/a");

                    return new Midi {
                        Id = int.Parse(titleNode.Attributes.First(a => a.Name == "href").Value.Split('-')[1]),
                        Title = titleNode.InnerText,
                        Artist = s.SelectSingleNode("./div[@class='search-song-cat']/a").InnerText
                    };
                });
        }
    }
}