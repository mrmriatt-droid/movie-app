function MovieDetails({
  selectedMovie,
  userRatings,
  rateMovie,
  detailsLoading,
  detailsError,
  setSelectedMovie,
  movieDetails,
  director,
  trailer,
  cast,
  similarLoading,
  similarMovies,
  getMovieDetails,
  getMovieCast,
  getMovieVideos,
  getSimilarMovies,
  castLoading,
}) {
  return (
    <div className="movie-details" onClick={(e) => e.stopPropagation()}>
      <h2>{selectedMovie.title}</h2>
      <img
        src={
          selectedMovie.poster_path
            ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
            : "/no-poster.png"
        }
        alt={selectedMovie.title}
      />

      <p>{selectedMovie.overview}</p>
      <p>Release Date: {selectedMovie.release_date}</p>
      <p>⭐ {selectedMovie.vote_average.toFixed(1)}</p>
      <div>
        <p>Rate this movie:</p>
        <select
          value={userRatings[selectedMovie.id] || ""}
          onChange={(e) => rateMovie(selectedMovie, Number(e.target.value))}
        >
          <option value="">Choose rating</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <option key={num} value={num}>
              {num} / 10
            </option>
          ))}
        </select>
      </div>
      <button onClick={() => setSelectedMovie(null)}>Close</button>

      {detailsLoading ? (
        <p>Loading movie details...</p>
      ) : detailsError ? (
        <p>{detailsError}</p>
      ) : movieDetails ? (
        <>
          <p>runtime: {movieDetails.runtime} minutes</p>
          <p>Director: {director || "Not available"}</p>
          <p>
            Budget:{" "}
            {movieDetails.budget
              ? movieDetails.budget.toLocaleString()
              : "Not available"}
          </p>
          <p>
            Revenue:{" "}
            {movieDetails.revenue
              ? movieDetails.revenue.toLocaleString()
              : "Not available"}
          </p>
          <p>
            vote_count:{" "}
            {movieDetails.vote_count
              ? movieDetails.vote_count.toLocaleString()
              : "Not available"}
          </p>
          <p>
            Genres: {movieDetails.genres.map((genre) => genre.name).join(", ")}
          </p>
          <div className="production-companies">
            <h3>Production Companies</h3>
            {movieDetails.production_companies.map((company) => (
              <div key={company.id}>
                <img
                  src={
                    company.logo_path
                      ? `https://image.tmdb.org/t/p/w500${company.logo_path}`
                      : "/no-logo.png"
                  }
                  alt={company.name}
                />
                <p>{company.name}</p>
              </div>
            ))}
          </div>
          {trailer ? (
            <div>
              <h3>Official Trailer</h3>
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="Movie Trailer"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <p>No trailer available</p>
          )}
        </>
      ) : null}

      {castLoading ? (
        <p>Loading cast...</p>
      ) : cast.length > 0 ? (
        <div className="cast-list">
          <h3>Cast :</h3>
          <div className="cast-container">
            {cast.slice(0, 10).map((actor) => (
              <div key={actor.id} className="cast-card">
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
                      : "/no-image.png"
                  }
                  alt={actor.name}
                />

                <p className="actor-name">{actor.name}</p>
                <p className="actor-character">Character: {actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No cast information available.</p>
      )}
      {similarLoading ? (
        <p>Loading similar movies...</p>
      ) : similarMovies.length > 0 ? (
        <div className="similar-movies">
          <h3>Similar Movies</h3>

          <div className="similar-movies-container">
            {similarMovies.slice(0, 10).map((movie) => (
              <div
                key={movie.id}
                className="similar-movie-card"
                onClick={() => {
                  setSelectedMovie(movie);
                  getMovieDetails(movie.id);
                  getMovieCast(movie.id);
                  getMovieVideos(movie.id);
                  getSimilarMovies(movie.id);
                }}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : `/no-poster.png`
                  }
                  alt={movie.title}
                />
                <p>{movie.title}</p>
                <p>⭐ {movie.vote_average.toFixed(1)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No similar movies found.</p>
      )}
    </div>
  );
}
export default MovieDetails;
