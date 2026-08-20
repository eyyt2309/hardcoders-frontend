import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/NavBar.css";

function NavBar() {
  const { user } = useAuth();

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand">
          <NavLink to="/dashboard">Hardcoders</NavLink>
        </div>

        <div className="navbar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/problems"
            end
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Problems
          </NavLink>

          {(user?.is_staff || user?.is_superuser) && (
            <NavLink
              to="/problems/create"
              end
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Problem Creation
            </NavLink>
          )}

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Profile
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
