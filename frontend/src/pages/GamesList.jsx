import { useEffect, useState } from "react";
import "../styles/games.css";
import { API_BASE } from "../api";

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [genres, setGenres] = useState([]);

  const [selectedGenre, setSelectedGenre] = useState("");
  const [error, setError] = useState(null);

  const [expandedGame, setExpandedGame] = useState(null);

  //Review Writer
  const [showReviewOverlay, setShowReviewOverlay] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState("");

  //See Reviews
  const [showReviewsOverlay, setShowReviewsOverlay] = useState(false);
  const [reviews, setReviews] = useState([]);

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
  function submitReview(e) {
    e.preventDefault();
    console.log("Review Submitted:", reviewText, rating);

    // Later → backend here
    closeReviewOverlay();
  }

  // OPEN "SEE REVIEWS"
  function openReviews(gameId) {
    setShowReviewOverlay(false);
    setShowReviewsOverlay(true);

    // Placeholder reviews (API later)
    setReviews([
      {
        user: "Player 1",
        rating: 5,
        text: "One of the best RPGs ever made."
      },
      {
        user: "Another Player",
        rating: 4,
        text: "Amazing story, world-building, and atmosphere."
      }
    ]);
  }

  // CLOSE "SEE REVIEWS"
  function closeReviewsOverlay() {
    setShowReviewsOverlay(false);
  }

  return (
    <div className="games-layout">

      {/* LEFT SIDE — GENRES */}
      <aside className="genre-panel">
        <div className="genre-panel-inner">

          {/* ALL */}
          <div
            className={`genre-item ${!selectedGenre ? "active" : ""}`}
            onClick={() => setSelectedGenre("")}
          >
            <span>All</span>
            <span className="count">{allGames.length}</span>
          </div>

          {/* GENRES */}
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

      {/* RIGHT — GAME GRID */}
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

      {/* EXPANDED FULL VIEW */}
      {expandedGame && (
        <div
          className="expanded-overlay"
          onClick={() => setExpandedGame(null)}
        >
          <div
            className="expanded-card"
            onClick={e => e.stopPropagation()}
          >

            <button
              className="close-expanded"
              onClick={() => setExpandedGame(null)}
            >
              ✕
            </button>

            <img src={expandedGame.image_url} className="expanded-image" />

            <div className="expanded-content">

              <h2 className="expanded-title">{expandedGame.title}</h2>

              <p className="expanded-rating">
                ⭐ {expandedGame.rating || "No rating"}
              </p>

              {/* BUTTONS */}
              <div className="expanded-actions">

                <button
                  className="expanded-btn fav-btn"
                  onClick={() => addFavorite(expandedGame.id)}
                >
                  ❤️ Add Favorites
                </button>

                <button
                  className="expanded-btn review-btn"
                  onClick={() => setShowReviewOverlay(true)}
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

              {/* DESCRIPTION */}
              <div className="expanded-description">
                {expandedGame.description || "No description available."}
              </div>

              {/* WRITE REVIEW OVERLAY */}
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

                      <button
                        className="submit-review-btn"
                        onClick={submitReview}
                      >
                        Submit
                      </button>

                      <button
                        className="cancel-review-btn"
                        onClick={closeReviewOverlay}
                      >
                        Cancel
                      </button>

                    </div>

                  </div>
                </div>
              )}

              {/* SEE REVIEWS OVERLAY */}
              {showReviewsOverlay && (
                <div className="review-overlay" onClick={e => e.stopPropagation()}>
                  <div className="review-overlay-card">

                    <h3>Player Reviews</h3>

                    {reviews.length === 0 && (
                      <p style={{ opacity: .8 }}>No reviews yet.</p>
                    )}

                    <div className="reviews-list">
                      {reviews.map((r, i) => (
                        <div key={i} className="single-review">
                          <strong>{r.user}</strong>
                          <div>⭐ {r.rating}</div>
                          <p>{r.text}</p>
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
