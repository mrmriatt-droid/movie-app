function MovieCard({
  movie,
  userRatings,
  toggleFavorite,
  favorites,
  onSelect,
}) {
  return (
    <div className="movie-card" onClick={onSelect}>
      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/no-poster.png"
        }
        alt={movie.title}
      />
      <h2>{movie.title}</h2>
      <p>{movie.release_date?.split("-")[0] || "Unknown"}</p>
      <p>⭐ {movie.vote_average.toFixed(1)  ?? "N/A"}</p>
      {userRatings[movie.id] !== undefined && (
        <p>My Rating: ⭐ {userRatings[movie.id]}</p>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(movie);
        }}
      >
        {favorites.some((fav) => fav.id === movie.id)
          ? "🤍 Remove"
          : "❤️ Favorite"}
      </button>
    </div>
  );
}
export default MovieCard;
