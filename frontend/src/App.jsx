import { useUser } from "./UserContext";
import { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { Routes, Route, Link } from "react-router-dom";
import GamesList from "./pages/GamesList";
import GameDetails from "./pages/GameDetails";
import Favorites from "./pages/Favorites";
import { API_BASE } from "./api";
import "./index.css";
import "./App.css";

export default function App() {
  const { user, setUser, loading } = useUser();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (loading) return <h2 className="text-center text-light mt-5">Loading...</h2>;

  function handleLogout() {
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then(() => setUser(null));
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="py-3 border-bottom border-secondary">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h1 className="app-title mb-0">GameVault</h1>
            {user && (
              <p className="app-subtitle mb-0">
                {user.username}, unlocked the vault.
              </p>
            )}
          </div>

          {user && (
            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="app-main py-4">
        <div className="container">
          {user ? (
            <>
            
              {/* Authenticated Nav */}
              <nav className="nav mb-4">
                <Link to="/" className="nav-link px-0 me-3">
                  Games
                </Link>
                <Link to="/favorites" className="nav-link px-0 me-3">
                  Favorites
                </Link>
              </nav>

              {/* Routes */}
              <Routes>
                <Route path="/" element={<GamesList />} />
                <Route path="/games/:id" element={<GameDetails />} />
                <Route path="/favorites" element={<Favorites />} />
              </Routes>
            </>
          ) : (
            <>

              {/* LANDING LOGIN / SIGNUP BUTTONS */}
              {!showLogin && !showSignup && (
                <div className="auth-landing-container">
                  <div className="auth-buttons">
                    <button onClick={() => setShowLogin(true)}>Login</button>
                    <button onClick={() => setShowSignup(true)}>Sign Up</button>
                  </div>
                </div>
              )}

              {/* Login */}
              {showLogin && (
                <div className="auth-card">
                  <button
                    className="close-btn"
                    onClick={() => setShowLogin(false)}
                  >
                    X
                  </button>
                  <LoginForm />
                </div>
              )}

              {/* Signup */}
              {showSignup && (
                <div className="auth-card">
                  <button
                    className="close-btn"
                    onClick={() => setShowSignup(false)}
                  >
                    X
                  </button>
                  <RegisterForm />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer py-3 border-top border-secondary">
        <div className="container text-center small text-muted">
          Game data provided by RAWG.io
        </div>
      </footer>
    </div>
  );
}
