using System.Collections.Generic;
using HtmlAgilityPack;

namespace MidiFlip.ObjectMappers {
    public interface IObjectMapper<out T> {
        IEnumerable<T> MapMultiple(HtmlDocument data);
    }
}
