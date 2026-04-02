import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/auth.css";

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("All fields required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        { email, password }
      );

      setUser(res.data);

      navigate("/welcome");

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Login failed"
      );
    }
  };

  return (
  <div className="auth-page">
    
    <div className="auth-layout">

      <div className="brand-section">
        <h1 className="brand-title">Gradious</h1>
        <p className="brand-subtitle">Bug Tracker</p>
        <p className="brand-tagline">
          Track. Manage. Resolve.
        </p>
      </div>

      <div className="auth-card">
        <h2>Login</h2>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="primary-btn" onClick={handleLogin}>
          Login
        </button>

        {/* <button className="google-btn">
          Continue with Google
        </button> */}

        <p className="switch">
          New user? <Link to="/signup">Sign up</Link>
        </p>
      </div>

    </div>
  </div>
);

}
