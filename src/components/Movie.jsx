import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'


const API_KEY = import.meta.env.VITE_TMDB_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

function Movie({ onAddFavorite }) {
  const { id } = useParams();
  const [movies, setMovies] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function with useCallback
  const performSearch = React.useCallback(async (query) => {
    if (!query.trim()) {
      setIsSearching(false);
      return;
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
      );
      
      if (!response.data.results.length) {
        setError('No movies found. Try different keywords.');
        setMovies([]);
      } else {
        setMovies(response.data.results);
        setError(null);
      }
    } catch (err) {
      setError('Failed to search movies. Please try again.');
      console.error(err);
      setMovies([]);
    }
  }, []);

  // Debounce hook
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(!!value.trim());
    
    // Reset error when input changes
    if (error) setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      performSearch(searchQuery.trim()).finally(() => setLoading(false));
    }
  };

  // Use debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // State for search-in-progress
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearchQuery && isSearching) {
      setIsSearchLoading(true);
      performSearch(debouncedSearchQuery).finally(() => setIsSearchLoading(false));
    }
  }, [debouncedSearchQuery, isSearching, performSearch]);

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

  // Only show loading for initial page load or movie detail fetch
  if (loading && !isSearching) return <p className="loading">Loading...</p>;
  if (error && !movies.length) return <p className="error-message">{error}</p>;

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
            disabled={isSearchLoading}
          >
            {isSearchLoading ? '⌛' : '🔍'}
          </button>
        </div>
        {searchQuery && (
          <div className="search-helper-text">
            {isSearchLoading ? 'Searching...' : 'Press Enter to search or wait for results to appear automatically'}
          </div>
        )}
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{searchQuery ? 'Search Results' : 'Popular Movies'}</h1>
        {isSearchLoading && (
          <span className="search-status">Updating results...</span>
        )}
      </div>
      {movies.length === 0 && searchQuery && !isSearchLoading && (
        <p className="error-message">No movies found for "{searchQuery}"</p>
      )}
      <div className="movie-grid">
        {movies.map(movie => (
          <div key={movie.id} className="movie-card">
            <div className="movie-content">
              <Link to={`/movie/${movie.id}`}>
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
                </div>
              </Link>
              <div className="action-buttons">
                <button
                  onClick={() => window.open(
                    `https://www.google.com/search?q=${encodeURIComponent(`${movie.title} ${movie.release_date?.split('-')[0]} movie`)}`,
                    '_blank',
                    'noopener,noreferrer'
                  )}
                  className="button small-button google-button"
                >
                  🔍 Google
                </button>
                <button
                  onClick={() => window.open(
                    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} ${movie.release_date?.split('-')[0]} official trailer`)}`,
                    '_blank',
                    'noopener,noreferrer'
                  )}
                  className="button small-button youtube-button"
                >
                  ▶️ Trailer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Movie