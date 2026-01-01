import { useUser } from "./UserContext";
import { useState } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { Routes, Route, Link } from "react-router-dom";
import GamesList from "./pages/GamesList";
import GameDetails from "./pages/GameDetails";
import Favorites from "./pages/Favorites";
import "./index.css";

export default function App() {
  const { user, setUser, loading } = useUser();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  if (loading) return <h2>Loading...</h2>;

  function handleLogout() {
    fetch("http://localhost:5000/auth/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => setUser(null));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>GameVault</h1>

      {user ? (
        <>
          <h2>{user.username}, unlocked the vault!</h2>

          {/* Simple Nav For Now */}
          <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <Link to="/">Games</Link>
            <Link to="/favorites">Favorites</Link>
            <button onClick={handleLogout}>Logout</button>
          </nav>

          {/* Authenticated Routes */}
          <Routes>
            <Route path="/" element={<GamesList />} />
            <Route path="/games/:id" element={<GameDetails />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </>
      ) : (
        <>
          {!showLogin && !showSignup && (
            <>
              <button onClick={() => setShowLogin(true)}>LOGIN</button>
              <button onClick={() => setShowSignup(true)}>SIGN UP</button>
            </>
          )}

          {showLogin && (
            <div className="auth-card">
              <button className="close-btn" onClick={() => setShowLogin(false)}>X</button>
              <LoginForm />
            </div>
          )}

          {showSignup && (
            <div className="auth-card">
              <button className="close-btn" onClick={() => setShowSignup(false)}>X</button>
              <RegisterForm />
            </div>
          )}
        </>
      )}
    </div>
  );
}
