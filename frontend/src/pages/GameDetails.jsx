import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function GameDetails() {
  const { id } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [reviewError, setReviewError] = useState(null);

  const [content, setContent] = useState("");
  const [score, setScore] = useState(5);

  const [editing, setEditing] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editScore, setEditScore] = useState(5);

  // Load Game
  useEffect(() => {
    setLoading(true);

    fetch(`http://localhost:5000/games/${id}`, {
      credentials: "include",
    })
      .then(res => {
        if (res.status === 404) throw new Error("Game not found");
        if (!res.ok) throw new Error("Failed to fetch game");
        return res.json();
      })
      .then(data => {
        setGame(data);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Load Favorites Status
  useEffect(() => {
    fetch("http://localhost:5000/users/me/favorites", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(list => {
        const exists = list.some(g => g.id === Number(id));
        setIsFavorite(exists);
      })
      .finally(() => setFavLoading(false));
  }, [id]);

  function addFavorite() {
    fetch(`http://localhost:5000/games/${id}/favorite`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.json())
      .then(() => setIsFavorite(true))
      .catch(() => alert("Failed to favorite"));
  }

  function removeFavorite() {
    fetch(`http://localhost:5000/games/${id}/favorite`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => res.json())
      .then(() => setIsFavorite(false))
      .catch(() => alert("Failed to remove favorite"));
  }

  // Load Reviews
  function loadReviews() {
    setReviewsLoading(true);

    fetch(`http://localhost:5000/games/${id}/reviews`, {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load reviews");
        return res.json();
      })
      .then(data => {
        setReviews(data);
        setReviewError(null);
      })
      .catch(err => setReviewError(err.message))
      .finally(() => setReviewsLoading(false));
  }

  useEffect(() => {
    loadReviews();
  }, [id]);

  // Add Review
  function submitReview(e) {
    e.preventDefault();

    fetch(`http://localhost:5000/games/${id}/reviews`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, score: Number(score) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }

        setContent("");
        setScore(5);
        loadReviews();
      })
      .catch(() => alert("Failed to submit review"));
  }

  // Edit Review
  function startEdit(review) {
    setEditing(review.id);
    setEditContent(review.content);
    setEditScore(review.score);
  }

  function saveEdit(reviewId) {
    fetch(`http://localhost:5000/games/${id}/reviews/${reviewId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: editContent,
        score: Number(editScore),
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }

        setEditing(null);
        loadReviews();
      })
      .catch(() => alert("Failed to update review"));
  }

  // Delete Review
  function deleteReview(reviewId) {
    fetch(`http://localhost:5000/games/${id}/reviews/${reviewId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => res.json())
      .then(() => loadReviews())
      .catch(() => alert("Failed to delete review"));
  }

  // RENDER
  if (loading) return <h2>Loading game...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div>
      <Link to="/">⬅ Back to Games</Link>

      <h2>{game.title}</h2>

      {!favLoading && (
        <>
          {isFavorite ? (
            <button onClick={removeFavorite}>Remove Favorite</button>
          ) : (
            <button onClick={addFavorite}>Add to Favorites</button>
          )}
        </>
      )}

      {game.image_url && (
        <img
          src={game.image_url}
          alt={game.title}
          style={{ width: "400px", borderRadius: "8px", marginBottom: "1rem" }}
        />
      )}

      {game.rating && <h3>⭐ Rating: {game.rating}</h3>}

      {game.released && <p><strong>Released:</strong> {game.released}</p>}

      {game.genres?.length > 0 && (
        <p><strong>Genres:</strong> {game.genres.join(", ")}</p>
      )}

      {game.platforms?.length > 0 && (
        <p><strong>Platforms:</strong> {game.platforms.join(", ")}</p>
      )}

      {game.description && (
        <p style={{ marginTop: "1rem", maxWidth: "700px" }}>
          {game.description}
        </p>
      )}

      <hr />

      <h3>Reviews</h3>

      {reviewsLoading && <p>Loading reviews...</p>}
      {reviewError && <p style={{ color: "red" }}>{reviewError}</p>}

      {reviews.length === 0 && <p>No reviews yet.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {reviews.map(r => (
          <li key={r.id} style={{ marginBottom: "1.5rem" }}>
            <strong>{r.user}</strong> — Score: {r.score}

            {editing === r.id ? (
              <>
                <div>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                  />
                </div>

                <div>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editScore}
                    onChange={e => setEditScore(e.target.value)}
                  />
                </div>

                <button onClick={() => saveEdit(r.id)}>Save</button>
                <button onClick={() => setEditing(null)}>Cancel</button>
              </>
            ) : (
              <>
                <p>{r.content}</p>
                <button onClick={() => startEdit(r)}>Edit</button>
                <button onClick={() => deleteReview(r.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Add Review</h3>

      <form onSubmit={submitReview}>
        <textarea
          required
          value={content}
          onChange={e => setContent(e.target.value)}
        />

        <br />

        <input
          type="number"
          min="1"
          max="10"
          required
          value={score}
          onChange={e => setScore(e.target.value)}
        />

        <br />

        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}
