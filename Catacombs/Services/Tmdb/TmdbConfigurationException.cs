using System;

namespace Catacombs.Services.Tmdb
{
    public sealed class TmdbConfigurationException : Exception
    {
        public TmdbConfigurationException(string message)
            : base(message)
        {
        }
    }
}
