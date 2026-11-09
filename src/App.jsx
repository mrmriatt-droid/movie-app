import { useEffect, useState } from "react";
import "./App.css";
import MovieCard from "./MovieCard";
import MovieDetails from "./MovieDetails";

function App() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  //قراءة التخزين
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favorites");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const [movieDetails, setMovieDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [cast, setCast] = useState([]);
  const [director, setDirector] = useState("");
  const [trailer, setTrailer] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [castLoading, setCastLoading] = useState(false);
  //قراءة التخزين تقييم المستخدم للافلام
  const [userRatings, setUserRatings] = useState(() => {
    const savedRatings = localStorage.getItem("userRatings");
    return savedRatings ? JSON.parse(savedRatings) : {};
  });

  //قراءة التخزين الافلام المقيمة
  const [ratedMoviesData, setRatedMoviesData] = useState(() => {
    const savedMovies = localStorage.getItem("ratedMoviesData");
    return savedMovies ? JSON.parse(savedMovies) : [];
  });

  const [showRatedMovies, setShowRatedMovies] = useState(false);
  //يخزن التصنيف اللي اختارته المستخدم.
  const [genre, setGenre] = useState("");
  //يخزن قائمة التصنيفات كلها اللي تجي من TMDB.
  const [genres, setGenres] = useState([]);
  //يخزن عدد صفحات الأفلام المتاحة من TMDB.
  const [totalPages, setTotalPages] = useState(1);
  // تخزين تقييمات المستخدم
  useEffect(() => {
    localStorage.setItem("userRatings", JSON.stringify(userRatings));
  }, [userRatings]);
  //تخزين الافلام المقيمة
  useEffect(() => {
    localStorage.setItem("ratedMoviesData", JSON.stringify(ratedMoviesData));
  }, [ratedMoviesData]);
  //تخزين المفضلة
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);
  //احمل قائمة التصنيفات الافلام من TMDB
  useEffect(() => {
    async function getGenres() {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch genres");
        }
        const data = await response.json();
        setGenres(data.genres);
      } catch (err) {
        console.log(err.message);
      }
    }
    getGenres();
  }, []);

  //الترتيب حسب التقييم
  const sortedMovies = [...movies].sort((a, b) => {
    if (sortBy === "rating") {
      return b.vote_average - a.vote_average;
    }
    return 0;
  });
  // احمل قائمة الافلام من TMDB
  async function getMovies() {
    try {
      setLoading(true);
      setError("");

      let endpoint = "movie/popular";
      let extraQuery = "";

      if (debouncedSearch.trim()) {
        endpoint = "search/movie";
        extraQuery = `&query=${encodeURIComponent(debouncedSearch)}`;
      } else if (genre) {
        endpoint = "discover/movie";
        extraQuery = `&with_genres=${genre}`;
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&page=${page}${extraQuery}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // تشغيل الدالة عند فتح الصفحة
  useEffect(() => {
    getMovies();
  }, [page, genre, debouncedSearch]);
  //التوقيت في البحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);
  //دالة الافلام المفضلة
  function toggleFavorite(movie) {
    setFavorites((prev) =>
      prev.some((fav) => fav.id === movie.id)
        ? prev.filter((fav) => fav.id !== movie.id)
        : [...prev, movie],
    );
  }
  // دالة تحفظ تقييمات الفلم للمستخدم
  function rateMovie(movie, rating) {
    setUserRatings((prev) => ({
      ...prev,
      [movie.id]: rating,
    }));

    setRatedMoviesData((prev) => {
      const exists = prev.some((item) => item.id === movie.id);

      if (exists) {
        return prev.map((item) =>
          item.id === movie.id ? { ...movie, userRating: rating } : item,
        );
      }
      return [...prev, { ...movie, userRating: rating }];
    });
  }
  // احمل تفاصيل الفلم من TMDB
  async function getMovieDetails(movieId) {
    try {
      setDetailsError("");
      setDetailsLoading(true);
      setMovieDetails(null);

      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }
      const data = await response.json();
      setMovieDetails(data);
    } catch (err) {
      setDetailsError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  }
  async function getSimilarMovies(movieId) {
    try {
      setSimilarMovies([]);
      setSimilarLoading(true);
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch similar movies");
      }

      const data = await response.json();
      const englishMovies = data.results.filter(
        (movie) => movie.original_language === "en",
      );

      setSimilarMovies(englishMovies);
    } catch (err) {
      console.log(err.message);
    } finally {
      setSimilarLoading(false);
    }
  }
  async function getMovieVideos(movieId) {
    try {
      setTrailer(null);
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch movie videos");
      }
      const data = await response.json();

      const trailerVideo = data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube",
      );
      setTrailer(trailerVideo || null);
    } catch (err) {
      console.log(err.message);
      setTrailer(null);
    }
  }
  async function getMovieCast(movieId) {
    try {
      setCastLoading(true);
      setCast([]);
      setDirector("");
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie cast");
      }
      const data = await response.json();
      setCast(data.cast);
      const directorInfo = data.crew.find(
        (person) => person.job === "Director",
      );

      setDirector(directorInfo ? directorInfo.name : "Unknown");
    } catch (err) {
      console.log(err.message);
    } finally {
      setCastLoading(false);
    }
  }
  const displayedMovies = showRatedMovies
    ? ratedMoviesData
    : showFavorites
      ? favorites
      : sortedMovies;
  return (
    <div className="app">
      <h1>Movie App 🎬</h1>
      <p>Discover your next favorite movie</p>
      <input
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <div className="fevbut">
        <button
          onClick={() => {
            setShowFavorites(false);
            setShowRatedMovies(false);
          }}
        >
          All Movies
        </button>
        <button
          onClick={() => {
            setShowFavorites(true);
            setShowRatedMovies(false);
          }}
        >
          Favorites ❤️
        </button>
        <button
          onClick={() => {
            setShowFavorites(false);
            setShowRatedMovies(true);
          }}
        >
          {" "}
          My Ratings ⭐
        </button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="default">Default</option>
          <option value="rating">Highest Rating</option>
        </select>
        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Genres</option>
          {genres.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <>
          <p>{error}</p>
          <button onClick={getMovies}>Try Again</button>
        </>
      ) : loading ? (
        <p>Loading movies...</p>
      ) : (
        <>
          <div className="movie-list">
            {displayedMovies.length === 0 ? (
              <p>No movies found!</p>
            ) : (
              displayedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  userRatings={userRatings}
                  toggleFavorite={toggleFavorite}
                  favorites={favorites}
                  onSelect={() => {
                    setSelectedMovie(movie);
                    getMovieDetails(movie.id);
                    getMovieCast(movie.id);
                    getMovieVideos(movie.id);
                    getSimilarMovies(movie.id);
                  }}
                />
              ))
            )}
          </div>
          <div className="pagination">
            <button
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {selectedMovie && (
        <div className="overlay" onClick={() => setSelectedMovie(null)}>
          <MovieDetails
            selectedMovie={selectedMovie}
            userRatings={userRatings}
            rateMovie={rateMovie}
            detailsLoading={detailsLoading}
            detailsError={detailsError}
            setSelectedMovie={setSelectedMovie}
            movieDetails={movieDetails}
            director={director}
            trailer={trailer}
            cast={cast}
            similarLoading={similarLoading}
            similarMovies={similarMovies}
            getMovieDetails={getMovieDetails}
            getMovieCast={getMovieCast}
            getMovieVideos={getMovieVideos}
            getSimilarMovies={getSimilarMovies}
            castLoading={castLoading}
          />
        </div>
      )}
    </div>
  );
}
export default App;
