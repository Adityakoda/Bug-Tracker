import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "../styles/auth.css";

export default function Signup() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!username || !email || !password) {
      alert("All fields required");
      return;
    }

    try {
      await axios.post("http://localhost:5000/signup", {
        username,
        email,
        password
      });

      const res = await axios.post("http://localhost:5000/login", {
        email,
        password
      });

      setUser(res.data);

      navigate("/welcome");

    } catch (err) {
      alert(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Signup failed"
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
        <h2>Sign Up</h2>

        <div className="input-group">
          <label>Username</label>
          <input onChange={(e) => setUsername(e.target.value)} />
        </div>

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

        <button className="primary-btn" onClick={handleSignup}>
          Sign Up
        </button>

        {/* <button className="google-btn">
          Continue with Google
        </button> */}

        <p className="switch">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>

    </div>
  </div>
);

}
