import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // import the CSS file

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">
            <div className="login-card">
        <div className="login-header">
          <img
            src="https://www.efinance.com.eg/wp-content/uploads/2022/06/e-finance-logo-2.jpg"
            alt="e-finance Logo"
            className="login-logo"
          />
          <h1 className="login-title">Welcome to e-invest</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
    </div>
  );
}
