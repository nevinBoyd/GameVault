import { useState } from "react";
import { useUser } from "../UserContext";

export default function RegisterForm() {
  const { setUser } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setUser(data);
        }
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleRegister}>
        <input
          placeholder="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </>
  );
}
