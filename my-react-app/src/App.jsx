import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Register from "./users/Register";
import Login from "./users/Login";
import Validate from "./users/Validate";

import apiClient, { setCsrfToken } from "./api/apiClient";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import ProblemSubmission from "./pages/ProblemSubmission";
import ProblemCreation from "./pages/ProblemCreation";
import ProblemList from "./pages/ProblemList";

function App() {
  const [csrfReady, setCsrfReady] = useState(false);

  useEffect(() => {
    const initializeCsrf = async () => {
      try {
        const response = await apiClient.get("/auth/csrf/");

        setCsrfToken(response.data.csrfToken);
        setCsrfReady(true);
      } catch (error) {
        console.error("Failed to initialize CSRF:", error);
      }
    };

    initializeCsrf();
  }, []);

  if (!csrfReady) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* No requirement */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/validate" element={<Validate />} />

      {/* Must be logged in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/problems/:slug" element={<ProblemSubmission />} />
        <Route path="/problems" element={<ProblemList />} />

        {/* Must be staff or superuser */}
        <Route element={<AdminRoute />}>
          <Route path="/problems/create" element={<ProblemCreation />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
