UPDATE movies
   SET watched = true
 WHERE rating <> 0
   AND watched = false;

WITH merged_movies AS
(
    SELECT user_id,
           movie_id,
           MIN(id) AS keep_id,
           BOOL_OR(watched OR rating <> 0) AS watched,
           (
               ARRAY_AGG(
                   rating
                   ORDER BY (rating <> 0) DESC, id DESC
               )
           )[1] AS rating
      FROM movies
     GROUP BY user_id, movie_id
),
updated_movies AS
(
    UPDATE movies AS movie
       SET watched = merged.watched,
           rating = merged.rating
      FROM merged_movies AS merged
     WHERE movie.id = merged.keep_id
    RETURNING movie.id
)
DELETE FROM movies AS duplicate
USING merged_movies AS merged
WHERE duplicate.user_id = merged.user_id
  AND duplicate.movie_id = merged.movie_id
  AND duplicate.id <> merged.keep_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_movies_user_movie_id
    ON movies (user_id, movie_id);

ALTER TABLE movies
    DROP CONSTRAINT IF EXISTS ck_movies_rating_requires_watched;

ALTER TABLE movies
    ADD CONSTRAINT ck_movies_rating_requires_watched
    CHECK (rating = 0 OR watched = true);
