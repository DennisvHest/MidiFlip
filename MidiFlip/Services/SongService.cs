using System.Collections.Generic;
using MidiFlip.Models;
using MidiFlip.ObjectMappers;

namespace MidiFlip.Services {

    public interface ISongService {
        IEnumerable<Midi> Search(string query);
    }

    public class SongService {

        private readonly ApiClient _apiClient;

        public SongService(ApiClient apiClient) {
            _apiClient = apiClient;
        }

        public IEnumerable<Midi> Search(string query) {
            return _apiClient.GetMultiple("search?q=" + query, new SongMapper());
        }
    }
}