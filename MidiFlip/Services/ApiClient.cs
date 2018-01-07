using System.Collections.Generic;
using HtmlAgilityPack;
using MidiFlip.ObjectMappers;

namespace MidiFlip.Services {

    public interface IApiClient {
        T GetMultiple<T>(string path, IObjectMapper<T> mapper);
    }

    public class ApiClient {

        private readonly HtmlWeb _web;

        public ApiClient(HtmlWeb web) {
            _web = web;
        }

        public IEnumerable<T> GetMultiple<T>(string path, IObjectMapper<T> mapper) {
            HtmlDocument html = _web.Load(Constants.ApiBaseUrl + path);
            return mapper.MapMultiple(html);
        }
    }
}