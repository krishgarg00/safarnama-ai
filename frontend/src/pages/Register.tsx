import { useState } from "react";
import type { FormEvent } from "react";
import { registerUser } from "../api/auth";
import logoImg from "../assets/logo.png";

interface RegisterProps {
  onSwitchToLogin?: () => void;
  onRegisteredSuccess?: () => void;
}

function Register({ onSwitchToLogin, onRegisteredSuccess }: RegisterProps) {
  const [name, setName] = useState("");
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
      const result = await registerUser({
        name,
        email,
        password,
      });

      setMessage(result.message || "Registration successful! You can now log in.");

      setName("");
      setEmail("");
      setPassword("");

      if (onRegisteredSuccess) {
        setTimeout(onRegisteredSuccess, 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img
          src={logoImg}
          alt="Travel Nexus"
          style={{ width: "64px", height: "64px", borderRadius: "50%", marginBottom: "10px", objectFit: "cover" }}
        />
        <h2>Create Your Travel Nexus Account</h2>
        <p style={{ fontWeight: 600, color: "var(--primary)", marginTop: "2px" }}>
          Travel. Connect. Explore.
        </p>
        <p style={{ fontSize: "13px", marginTop: "4px" }}>
          Join the unified travel platform: Plan. Ride. Stay.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Krish Garg"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="krish@example.com"
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
            placeholder="At least 6 characters"
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
          {loading ? "Creating Account..." : "Create Account"}
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

      {onSwitchToLogin && (
        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--muted)" }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{ background: "none", color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}
          >
            Sign In Instead
          </button>
        </div>
      )}
    </div>
  );
}

export default Register;