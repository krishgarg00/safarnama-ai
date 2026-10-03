import type { FormEvent } from "react";
import { useState } from "react";
import { loginUser } from "../api/auth";

export interface LoggedInUser {
  _id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "HOST" | "DRIVER" | "ADMIN";
}

interface LoginProps {
  onLoginSuccess?: (user: LoggedInUser, token: string) => void;
  onSwitchToRegister?: () => void;
}

function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({
        email,
        password,
      });

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      setMessage("Login successful");

      if (onLoginSuccess) {
        onLoginSuccess(result.user, result.token);
      }

      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🧭</div>
        <h2>Sign In to Safarnama AI</h2>
        <p>Access your stays, rides, and personalized travel itineraries</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: "100%", padding: "12px", marginTop: "10px" }}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "14px", padding: "10px", background: "#ecfdf5", color: "#059669", borderRadius: "8px", fontSize: "14px", textAlign: "center" }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "14px", padding: "10px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "14px", textAlign: "center" }}>
          {error}
        </div>
      )}

      {onSwitchToRegister && (
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--muted)" }}>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{ background: "none", color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}
          >
            Create an Account
          </button>
        </div>
      )}

      <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--muted)", textAlign: "center" }}>
        Demo: <code>customer@example.com</code> or <code>driver@example.com</code> / <code>password123</code>
      </div>
    </div>
  );
}

export default Login;
