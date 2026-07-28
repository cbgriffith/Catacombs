using System.Net;

namespace Catacombs.Services.Tmdb
{
    public sealed class TmdbResponse
    {
        public TmdbResponse(
            HttpStatusCode statusCode,
            string content,
            string contentType)
        {
            StatusCode = statusCode;
            Content = content;
            ContentType = contentType;
        }

        public HttpStatusCode StatusCode { get; }
        public string Content { get; }
        public string ContentType { get; }
    }
}
