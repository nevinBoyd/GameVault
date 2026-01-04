import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { API_BASE } from "../api";
import "../styles/gameDetails.css";

export default function GameDetails() {
  const { id } = useParams();

  const location = useLocation();
  const fromFavorites = location.state?.fromFavorites === true;

  // Game
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Favorites
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(true);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState(null);
  const [myReview, setMyReview] = useState(null);

  // Overlays
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [content, setContent] = useState("");
  const [score, setScore] = useState(5);

  const [editingReview, setEditingReview] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editScore, setEditScore] = useState(5);

  /* LOAD GAME */
  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE}/games/${id}`, { credentials: "include" })
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

  /* FAVORITES */
  useEffect(() => {
    fetch(`${API_BASE}/users/me/favorites`, { credentials: "include" })
      .then(res => res.json())
      .then(list => setIsFavorite(list.some(g => g.id === Number(id))))
      .finally(() => setFavLoading(false));
  }, [id]);

  function addFavorite() {
    fetch(`${API_BASE}/games/${id}/favorite`, {
      method: "POST",
      credentials: "include",
    })
      .then(res => res.json())
      .then(() => setIsFavorite(true))
      .catch(() => alert("Failed to favorite"));
  }

  function removeFavorite() {
    fetch(`${API_BASE}/games/${id}/favorite`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => res.json())
      .then(() => setIsFavorite(false))
      .catch(() => alert("Failed to remove favorite"));
  }

  /* REVIEWS */
  function loadReviews() {
    fetch(`${API_BASE}/games/${id}/reviews`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load reviews");
        return res.json();
      })
      .then(data => {
        setReviews(data);
        setReviewError(null);

        const mine = data.find(r => r.is_owner);
        setMyReview(mine || null);
      })
      .catch(err => setReviewError(err.message));
  }

  useEffect(() => {
    loadReviews();
  }, [id]);

  /* SUBMIT REVIEW */
  function submitReview(e) {
    e.preventDefault();
    setReviewError(null)

    fetch(`${API_BASE}/games/${id}/reviews`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, score: Number(score) }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setReviewError(data.error);
          return;
        }

        setContent("");
        setScore(5);
        setShowAddOverlay(false);
        loadReviews();
      })
      .catch(() => alert("Error: Must Include Score 1-5 and Written Review."));
  }

  /* DELETE REVIEW FROM ADD / REMOVE */
  function removeMyReview() {
    if (!myReview) return;

    fetch(`${API_BASE}/games/${id}/reviews/${myReview.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => res.json())
      .then(() => {
        setShowAddOverlay(false);
        loadReviews();
      })
      .catch(() => alert("Failed to delete review"));
  }

  /* EDIT REVIEW */
  function openEditOverlay(review) {
    setEditingReview(review);
    setEditContent(review.content);
    setEditScore(review.score);
  }

  function saveEdit() {
    fetch(`${API_BASE}/games/${id}/reviews/${editingReview.id}`, {
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

        setEditingReview(null);
        loadReviews();
      })
      .catch(() => alert("Failed to update review"));
  }

  function deleteReview(reviewId) {
    fetch(`${API_BASE}/games/${id}/reviews/${reviewId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(res => res.json())
      .then(() => {
        setEditingReview(null);
        loadReviews();
      })
      .catch(() => alert("Failed to delete review"));
  }

  /* UI */
  if (loading) return <h2>Loading game...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className={`game-details-wrapper ${
      fromFavorites
        ? "favorite-details-page"
        : "games-details-page"
    }`}>

      {/* TOP BAR */}
      <div className="game-details-title-row">

        <div className="nav-links">
          <Link className="back-link" to="/">
            Back to Games
          </Link>

          <span className="divider"> / </span>

          <Link className="back-link" to="/favorites">
            Back to Favorites
          </Link>
        </div>

        {!favLoading && (
          <>
            {isFavorite ? (
              <button
                className="details-btn details-btn-danger fav-corner-btn"
                onClick={removeFavorite}
              >
                Remove Favorite
              </button>
            ) : (
              <button
                className="details-btn fav-corner-btn"
                onClick={addFavorite}
              >
                Add to Favorites
              </button>
            )}
          </>
        )}
      </div>

      <h2>{game.title}</h2>

      <div className="game-details-header">
        {game.image_url && (
          <img
            className="detail-main-image"
            src={game.image_url}
            alt={game.title}
          />
        )}
      </div>

      {/* REVIEW BUTTON RIGHT SIDE */}
      <div className="review-action-right">
        <button
          className={`details-btn ${myReview ? "details-btn-danger" : ""} review-float-btn`}
          onClick={() => {
            loadReviews();
            setShowAddOverlay(true);
          }}
        >
          Add / Remove<br />Review
        </button>
      </div>

      {/* META */}
      <div className="game-details-meta">
        {game.rating && <h3 className="rating-line">⭐ Rating: {game.rating}</h3>}
        {game.released && (
          <p className="meta-small">
            <span className="detail-label">Released:</span> {game.released}
          </p>
        )}
        {game.genres?.length > 0 && (
          <p className="meta-small">
            <span className="detail-label">Genres:</span> {game.genres.join(", ")}
          </p>
        )}
        {game.platforms?.length > 0 && (
          <p className="meta-small">
            <span className="detail-label">Platforms:</span> {game.platforms.join(", ")}
          </p>
        )}
      </div>

      {/* DESCRIPTION */}
      {game.description && (
        <div className="game-description-box">
          <p>{game.description}</p>
        </div>
      )}

      <hr className="details-divider" />

      {/* REVIEWS */}
      <div className="game-reviews-box">
        {reviewError && <p style={{ color: "red" }}>{reviewError}</p>}
        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map(r => (
          <div key={r.id} className="review-block">
            <span className="review-user">{r.user}</span> — ⭐ {r.score}
            <br />
            <span className="review-date">
              {new Date(r.created_at).toLocaleDateString()}
            </span>

            <p>{r.content}</p>

            {r.is_owner && (
              <button className="details-btn" onClick={() => openEditOverlay(r)}>
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ADD REVIEW OVERLAY */}
      {showAddOverlay && (
        <div className="review-overlay">
          <div className="review-overlay-card">
            <h3>Write Review</h3>

            {reviewError && (
              <p style={{ color: "salmon", fontWeight: "bold" }}>
                {reviewError}
              </p>
            )}

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <input
              type="number"
              min="1"
              max="5"
              value={score}
              onChange={e => setScore(e.target.value)}
            />

            <div className="review-overlay-controls">
              <button className="details-btn" onClick={submitReview}>
                Submit
              </button>

              <button
                className="details-btn details-btn-danger"
                onClick={() => setShowAddOverlay(false)}
              >
                Cancel
              </button>

              {myReview && (
                <button
                  className="details-btn details-btn-danger"
                  onClick={removeMyReview}
                >
                  Remove Review
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT REVIEW OVERLAY */}
      {editingReview && (
        <div className="review-overlay">
          <div className="review-overlay-card">
            <h3>Edit Review</h3>

            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} />

            <input
              type="number"
              min="1"
              max="5"
              value={editScore}
              onChange={e => setEditScore(e.target.value)}
            />

            <div className="review-overlay-controls">
              <button className="details-btn" onClick={saveEdit}>Save</button>

              <button
                className="details-btn details-btn-danger"
                onClick={() => setEditingReview(null)}
              >
                Cancel
              </button>

              <button
                className="details-btn details-btn-danger"
                onClick={() => deleteReview(editingReview.id)}
              >
                Remove Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
