using System;
using System.Collections.Generic;
using System.Linq;
using HtmlAgilityPack;
using MidiFlip.Models;

namespace MidiFlip.ObjectMappers {

    public class MidiMapper : IObjectMapper<Midi> {

        public IEnumerable<Midi> MapMultiple(HtmlDocument data) {
            //Found MIDIs
            HtmlNodeCollection midiContainers = data.DocumentNode.SelectNodes("//div[@class='search-song-container']");

            if (midiContainers != null) {
                //Parse html to Midi objects
                return midiContainers.Select(s => {
                    HtmlNode titleNode = s.SelectSingleNode("./div[@class='search-song-title']/a");
                    HtmlNode imageNode = s.SelectSingleNode("./div[@class='search-song-image']/a/img");

                    return new Midi {
                        Id = int.Parse(titleNode.Attributes.First(a => a.Name == "href").Value.Split('-')[1]),
                        Title = titleNode.InnerText,
                        Artist = s.SelectSingleNode("./div[@class='search-song-cat']/a").InnerText,
                        ImagePath = imageNode?.Attributes.First(a => a.Name == "src").Value
                    };
                });
            }

            //Didn't find any MIDIs, return an empty list
            return new List<Midi>();
        }
    }
}