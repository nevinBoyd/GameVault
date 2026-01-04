import { useEffect, useState } from "react";
import "../styles/games.css";
import "../styles/layout.css";
import "../styles/genres.css";
import "../styles/favorites.css";
import "../styles/reviews.css";
import { API_BASE } from "../api";

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [genres, setGenres] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [error, setError] = useState(null);

  const [expandedGame, setExpandedGame] = useState(null);

  // REVIEW WRITER
  const [showReviewOverlay, setShowReviewOverlay] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("");

  // SEE REVIEWS
  const [showReviewsOverlay, setShowReviewsOverlay] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");

  // LOAD GENRES
  useEffect(() => {
    fetch(`${API_BASE}/games/categories`)
      .then(res => res.json())
      .then(setGenres)
      .catch(() => {});
  }, []);

  // LOAD GAMES
  useEffect(() => {
    fetch(`${API_BASE}/games`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setAllGames(data);
        setGames(data);
        setError(null);
      })
      .catch(err => setError(err.message));
  }, []);

  // FILTER GENRE
  useEffect(() => {
    if (!selectedGenre) {
      setGames(allGames);
      return;
    }

    const filtered = allGames.filter(g =>
      g.genres?.includes(selectedGenre)
    );

    setGames(filtered);
  }, [selectedGenre, allGames]);

  // FAVORITES
  function addFavorite(gameId) {
    fetch(`${API_BASE}/games/${gameId}/favorite`, {
      method: "POST",
      credentials: "include"
    }).catch(() => {});
  }

  // CLOSE REVIEW OVERLAY
  function closeReviewOverlay() {
    setShowReviewOverlay(false);
    setReviewText("");
    setRating("");
  }

  // SUBMIT REVIEW
async function submitReview(e) {
  e.preventDefault();

  if (!expandedGame) return;

  try {
    const res = await fetch(
      `${API_BASE}/games/${expandedGame.id}/reviews`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: reviewText,
          score: Number(rating)
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    // DUPLICATE REVIEW
    if (!res.ok) {
      if (res.status === 400 || res.status === 409) {
        closeReviewOverlay();
        setReviewFeedback(
          data.message || "You already reviewed this game — view it below."
        );
        openReviews(expandedGame.id);
        return;
      }

      setReviewFeedback("Something went wrong posting your review.");
      return;
    }

    // SUCCESS
    closeReviewOverlay();
    setReviewFeedback("Review posted successfully!");
    openReviews(expandedGame.id);

  } catch {
    setReviewFeedback("Network error — try again.");
  }
}

  // OPEN "SEE REVIEWS"
async function openReviews(gameId) {
  setShowReviewOverlay(false);
  setShowReviewsOverlay(true);

  setReviewsError("");
  setReviewFeedback("");   // reset banner unless submitReview sets it

  try {
    const res = await fetch(
      `${API_BASE}/games/${gameId}/reviews`,
      { credentials: "include" }
    );

    if (!res.ok) {
      setReviewsError("Failed to load reviews");
      setReviews([]);
      return;
    }

    const data = await res.json();
    setReviews(data);

  } catch {
    setReviewsError("Failed to load reviews");
    setReviews([]);
  }
}

  // CLOSE "SEE REVIEWS"
  function closeReviewsOverlay() {
  setShowReviewsOverlay(false);
  setReviewFeedback("");
}

  return (
    <div className="games-layout">

      {/* LEFT SIDE — GENRES */}
      <aside className="genre-panel">
        <div className="genre-panel-inner">

          <div
            className={`genre-item ${!selectedGenre ? "active" : ""}`}
            onClick={() => setSelectedGenre("")}
          >
            <span>All</span>
            <span className="count">{allGames.length}</span>
          </div>

          {genres.map(g => (
            <div
              key={g}
              className={`genre-item ${selectedGenre === g ? "active" : ""}`}
              onClick={() => setSelectedGenre(g)}
            >
              <span>{g}</span>
              <span className="count">
                {allGames.filter(x => x.genres?.includes(g)).length}
              </span>
            </div>
          ))}

        </div>
      </aside>

      {/* RIGHT SIDE — GAME GRID */}
      <section className="games-scroll-area">
        {error && <h2 style={{ color: "red" }}>{error}</h2>}

        <div className="games-grid">
          {games.map(game => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => {
                setExpandedGame(game);
                setShowReviewOverlay(false);
                setShowReviewsOverlay(false);
              }}
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
            </div>
          ))}
        </div>
      </section>

      {/* EXPANDED VIEW */}
      {expandedGame && (
        <div className="expanded-overlay" onClick={() => setExpandedGame(null)}>
          <div className="expanded-card" onClick={e => e.stopPropagation()}>

            <button className="close-expanded" onClick={() => setExpandedGame(null)}>
              ✕
            </button>

            <img src={expandedGame.image_url} className="expanded-image" />

            <div className="expanded-content">

              <h2 className="expanded-title">{expandedGame.title}</h2>

              <p className="expanded-rating">
                ⭐ {expandedGame.rating || "No rating"}
              </p>

              <div className="expanded-actions">

                <button
                  className="expanded-btn fav-btn"
                  onClick={() => addFavorite(expandedGame.id)}
                >
                  ❤️ Add Favorites
                </button>

                <button
                  className="expanded-btn review-btn"
                  onClick={() => {
                    setReviewText("");
                    setRating("");
                    setShowReviewsOverlay(false);
                    setShowReviewOverlay(true);
                  }}
                >
                  📝 Review
                </button>

                <button
                  className="expanded-btn review-btn"
                  onClick={() => openReviews(expandedGame.id)}
                >
                  👁️ See Reviews
                </button>

              </div>

              <div className="expanded-description">
                {expandedGame.description || "No description available."}
              </div>

              {/* WRITE REVIEW */}
              {showReviewOverlay && (
                <div className="review-overlay" onClick={e => e.stopPropagation()}>
                  <div className="review-overlay-card">

                    <h3>Write Review</h3>

                    <textarea
                      placeholder="Share your thoughts..."
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                    />

                    <div className="review-row">

                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Rating"
                        value={rating}
                        onChange={e => setRating(e.target.value)}
                      />

                      <button className="submit-review-btn" onClick={submitReview}>
                        Submit
                      </button>

                      <button className="cancel-review-btn" onClick={closeReviewOverlay}>
                        Cancel
                      </button>

                    </div>

                  </div>
                </div>
              )}

              {/* SEE REVIEWS */}
              {showReviewsOverlay && (
                <div className="review-overlay" onClick={e => e.stopPropagation()}>
                  <div className="review-overlay-card">

                    <h3>Player Reviews</h3>

                    {reviewsError && (
                      <p style={{ color: "red" }}>{reviewsError}</p>
                    )}

                    {reviews.length === 0 && !reviewsError && (
                      <p style={{ opacity: .8 }}>No reviews yet.</p>
                    )}

                    {reviewFeedback && (
                      <div className="review-feedback-banner">
                        {reviewFeedback}
                      </div>
                    )}
                   
                    <div className="reviews-list">
                      {reviews.map(r => (
                        <div key={r.id} className="single-review">
                          <strong>{r.user}</strong>
                          <div>⭐ {r.score}</div>
                          <p>{r.content}</p>
                          <small style={{ opacity: .7 }}>
                            {new Date(r.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>

                    <button
                      className="cancel-review-btn"
                      onClick={closeReviewsOverlay}
                    >
                      Close
                    </button>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
