import { useState } from "react";

export default function Login({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      onRegister(username, password);
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div className="login-container" style={{ textAlign: "center", padding: "50px" }}>
      <h1>{isRegister ? "Register for Auction App" : "Login to Auction App"}</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: "300px", margin: "0 auto" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "10px", marginBottom: isRegister ? "10px" : "20px" }}
        />
        {isRegister && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
          />
        )}
        <button type="submit" style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
          {isRegister ? "Register" : "Login"}
        </button>
        <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #667eea", color: "#667eea" }}>
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>
      </form>
    </div>
  );
}
