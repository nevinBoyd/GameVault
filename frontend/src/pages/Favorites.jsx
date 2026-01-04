import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../api";
import "../styles/games.css";
import "../styles/favorites.css";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function fetchFavorites() {
    setLoading(true);

    fetch(`${API_BASE}/users/me/favorites`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load favorites");
        return res.json();
      })
      .then(data => {
        setFavorites(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  function removeFavorite(gameId) {
    fetch(`${API_BASE}/games/${gameId}/favorite`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to remove favorite");
        return res.json();
      })
      .then(() => {
        setFavorites(prev => prev.filter(g => g.id !== gameId));
      })
      .catch(err => alert(err.message));
  }

  if (loading) return <h2>Loading favorites...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className="games-scroll-area">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Your Favorites</h2>

        {favorites.length > 0 && (
          <span className="text-muted">
            {favorites.length} saved
          </span>
        )}
      </div>

      {favorites.length === 0 && (
        <p className="text-muted">
          You have no favorite games yet.
        </p>
      )}

      <div className="games-grid">
        {favorites.map(game => (
          <div key={game.id} className="game-card">

            <Link
              to={`/games/${game.id}`}
              state={{ fromFavorites: true }}
            >
              <div
                className="game-card-img"
                style={{ backgroundImage: `url(${game.image_url})` }}
              >
                <div className="overlay">
                  <strong className="title">{game.title}</strong>

                  {game.rating && (
                    <span className="rating">
                      ⭐ {game.rating}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* remove button */}
            <button
              className="favorite-remove-btn"
              onClick={() => removeFavorite(game.id)}
            >
              Remove
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}
