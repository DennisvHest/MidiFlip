using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using HtmlAgilityPack;
using MidiFlip.ObjectMappers;

namespace MidiFlip.Services {

    public interface IApiClient {
        Task<Stream> GetFile(string path);
        IEnumerable<T> GetMultiple<T>(string path, IObjectMapper<T> mapper);
    }

    public class ApiClient {

        private readonly HtmlWeb _web;

        public ApiClient(HtmlWeb web) {
            _web = web;
        }

        public async Task<Stream> GetFile(string path, string contentType) {
            WebRequestHandler webRequestHandler = new WebRequestHandler { AllowAutoRedirect = false };

            using (HttpClient httpClient = new HttpClient(webRequestHandler, true)) {
                HttpResponseMessage response = await httpClient.GetAsync(Constants.ApiBaseUrl + path);

                return await response.Content.ReadAsStreamAsync();
            }
        }

        public IEnumerable<T> GetMultiple<T>(string path, IObjectMapper<T> mapper) {
            HtmlDocument html = _web.Load(Constants.ApiBaseUrl + path);
            return mapper.MapMultiple(html);
        }
    }
}