import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../api";

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/games`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch games");
        return res.json();
      })
      .then(data => {
        setGames(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h2>Loading games...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div>
      <h2>Games List</h2>

      {games.length === 0 && <p>No games found.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {games.map(game => (
          <li key={game.id} style={{ marginBottom: "1rem" }}>
            <Link to={`/games/${game.id}`}>
              <strong>{game.title}</strong>
            </Link>

            {game.rating && (
              <span style={{ marginLeft: "0.5rem" }}>
                ⭐ {game.rating}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

