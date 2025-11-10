import Movie from './components/Movie'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'

function App() {
  const handleAddFavorite = (movie) => {
    // TODO: Implement favorites functionality
    alert(`Added ${movie.title} to favorites!`);
  };

  return (
    <BrowserRouter>
      <nav className="nav">
        <ul className="nav-list">
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li>
            <Link to="/movie" className="nav-link">Movies</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={
          <div className="container" style={{ textAlign: 'center' }}>
            <h1>Welcome to Movie App</h1>
            <Link to="/movie" className="button favorite-button">
              Browse Movies
            </Link>
          </div>
        } />
        <Route path="/movie" element={<Movie onAddFavorite={handleAddFavorite} />} />
        <Route path="/movie/:id" element={<Movie onAddFavorite={handleAddFavorite} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
