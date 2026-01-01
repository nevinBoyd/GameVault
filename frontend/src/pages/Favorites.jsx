import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function fetchFavorites() {
    setLoading(true);

    fetch("http://localhost:5000/users/me/favorites", {
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
    fetch(`http://localhost:5000/games/${gameId}/favorite`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to remove favorite");
        return res.json();
      })
      .then(() => {
        // Refresh list after removal
        setFavorites(prev => prev.filter(g => g.id !== gameId));
      })
      .catch(err => alert(err.message));
  }

  if (loading) return <h2>Loading favorites...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div>
      <h2>Your Favorites</h2>

      {favorites.length === 0 && (
        <p>You have no favorite games yet.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {favorites.map(game => (
          <li key={game.id} style={{ marginBottom: "1rem" }}>
            <Link to={`/games/${game.id}`}>
              <strong>{game.title}</strong>
            </Link>

            {game.rating && (
              <span style={{ marginLeft: "0.5rem" }}>
                ⭐ {game.rating}
              </span>
            )}

            <button
              style={{ marginLeft: "1rem" }}
              onClick={() => removeFavorite(game.id)}
            >
              Remove Favorite
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
