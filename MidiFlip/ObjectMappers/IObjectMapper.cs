using System.Collections.Generic;
using HtmlAgilityPack;

namespace MidiFlip.ObjectMappers {
    public interface IObjectMapper<out T> {
        T Map(HtmlDocument data);
        IEnumerable<T> MapMultiple(HtmlDocument data);
    }
}
