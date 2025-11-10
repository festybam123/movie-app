import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

const API_KEY = '4316bb93d91bc6c0a48f44f46599f195';
const BASE_URL = 'https://api.themoviedb.org/3';

function Movie({ onAddFavorite }) {
  const { id } = useParams();
  const [movies, setMovies] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const performSearch = (query) => {
    setLoading(true);
    axios.get(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`)
      .then(response => {
        setMovies(response.data.results);
        setMovie(null);
        setError(null);
        if (response.data.results.length === 0) {
          setError('No movies found. Try different keywords.');
        }
      })
      .catch(err => {
        setError('Failed to search movies. Please try again.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  // Debounce search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && isSearching) {
        performSearch(searchQuery);
      }
    }, 500); // Wait 500ms after user stops typing to make the API call

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setLoading(true);
    if (id) {
      // Fetch single movie details
      axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`)
        .then(response => {
          setMovie(response.data);
          setMovies([]);
          setError(null);
        })
        .catch(err => {
          setError('Movie details not found.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else if (!isSearching) {
      // Fetch popular movies list when not searching
      axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`)
        .then(response => {
          setMovies(response.data.results);
          setMovie(null);
          setError(null);
        })
        .catch(err => {
          setError('Failed to fetch movies.');
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isSearching]);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  if (movie) {
    // Single movie detail view
    return (
      <div className="movie-detail-container">
        <Link to="/movie" className="back-link">← Back to Movies</Link>
        <h1>{movie.title}</h1>
        <div className="movie-detail">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="detail-poster"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
          />
          <div className="movie-details">
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Rating:</strong> {movie.vote_average}/10</p>
            <p><strong>Overview:</strong> {movie.overview || 'No overview available.'}</p>
            <div className="action-buttons">
              <button 
                onClick={() => onAddFavorite(movie)}
                className="button favorite-button"
              >
                Add to Favorites ❤️
              </button>
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(`${movie.title} ${movie.release_date?.split('-')[0]} movie`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button google-button"
              >
                🔍 Search on Google
              </a>
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.release_date?.split('-')[0]} official trailer`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button youtube-button"
              >
                ▶️ Watch Trailer
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Movies list view
  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-container">
          <input
            type="search"
            placeholder="Search for any movie (e.g., 'Avengers', 'Star Wars', 'Batman')..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          <button
            type="submit"
            className="search-button"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
        {searchQuery && (
          <div className="search-helper-text">
            Press Enter to search or wait for results to appear automatically
          </div>
        )}
      </form>
      <h1>{searchQuery ? 'Search Results' : 'Popular Movies'}</h1>
      {movies.length === 0 && searchQuery && !loading && (
        <p className="error-message">No movies found for "{searchQuery}"</p>
      )}
      <div className="movie-grid">
        {movies.map(movie => (
          <Link 
            to={`/movie/${movie.id}`} 
            key={movie.id}
            className="movie-card"
          >
            <div>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; }}
              />
              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-year">{movie.release_date?.split('-')[0]}</p>
                <p className="movie-rating">⭐ {movie.vote_average}/10</p>
                <div className="action-buttons">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${movie.title} ${movie.release_date?.split('-')[0]} movie`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button small-button google-button"
                  >
                    🔍 Google
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.release_date?.split('-')[0]} official trailer`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button small-button youtube-button"
                  >
                    ▶️ Trailer
                  </a>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Movie