import { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);

    try {
      await apiClient.post("/auth/login/", formData);
      await checkAuth();
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to login. Please try again",
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
