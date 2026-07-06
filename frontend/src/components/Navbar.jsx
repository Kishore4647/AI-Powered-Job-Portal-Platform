import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const candidateLinks = [
    { to: "/jobs", label: "Browse Jobs" },
    { to: "/my-applications", label: "My Applications" },
    { to: "/profile", label: "My Profile" },
  ];
  const recruiterLinks = [
    { to: "/recruiter/jobs", label: "My Jobs" },
    { to: "/recruiter/company", label: "Company Profile" },
  ];

  const links = user.role === "CANDIDATE" ? candidateLinks : recruiterLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <span className="brand"><span className="brand-mark">JA</span>Job Assist</span>
        <div className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user.email}</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
