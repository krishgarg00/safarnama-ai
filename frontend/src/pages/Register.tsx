import { useState } from "react";
import type { FormEvent } from "react";
import { registerUser } from "../api/auth";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const result = await registerUser({
        name,
        email,
        password,
      });

      setMessage(result.message);

      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    }
  };

  return (
    <div>
      <h1>Create your Safarnama AI account</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

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

        <button type="submit">
          Register
        </button>
      </form>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>  
  );
}

export default Register;