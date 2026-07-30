using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Catacombs.Contracts.Movies
{
    public sealed class SetMovieStatusRequest : IValidatableObject
    {
        [Required]
        [StringLength(255)]
        public string Title { get; set; }

        [StringLength(255)]
        [JsonPropertyName("poster_path")]
        public string PosterPath { get; set; }

        public string Overview { get; set; }

        [Range(0, double.MaxValue)]
        public double Popularity { get; set; }

        [Range(0, 10)]
        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; set; }

        [Required]
        [JsonPropertyName("release_date")]
        public DateTime? ReleaseDate { get; set; }

        [Range(1, int.MaxValue)]
        public int MovieId { get; set; }

        public bool Watched { get; set; }

        [Range(-1, 1)]
        public int Rating { get; set; }

        public IEnumerable<ValidationResult> Validate(
            ValidationContext validationContext)
        {
            if (Rating != 0 && !Watched)
            {
                yield return new ValidationResult(
                    "A rated movie must also be marked as watched.",
                    new[] { nameof(Watched), nameof(Rating) });
            }
        }

        public Catacombs.Models.Movies ToMovie()
        {
            return new Catacombs.Models.Movies
            {
                title = Title.Trim(),
                rating = Rating,
                watched = Watched,
                poster_path = PosterPath,
                overview = Overview,
                popularity = Popularity,
                vote_average = VoteAverage,
                release_date = ReleaseDate.Value,
                movieId = MovieId
            };
        }
    }
}
