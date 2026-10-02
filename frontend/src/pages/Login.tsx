import type { FormEvent } from "react";
import { useState } from "react";
import { loginUser } from "../api/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const result = await loginUser({
        email,
        password,
      });

      console.log("Login response:", result);

      localStorage.setItem("token", result.token);

      localStorage.setItem("user", JSON.stringify(result.user));

      setMessage("Login successful");

      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div>
      <h1>Login to Safarnama AI</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;
