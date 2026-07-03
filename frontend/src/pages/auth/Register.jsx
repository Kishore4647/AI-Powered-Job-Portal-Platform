import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "", username: "", password: "", password2: "", role: "CANDIDATE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      const user = await login(form.email, form.password);
      navigate(user.role === "CANDIDATE" ? "/profile" : "/recruiter/company");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Create your account</h1>
      <p className="subtitle">Join as a candidate or recruiter</p>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>I am a...</label>
          <div style={{ display: "flex", gap: 10 }}>
            {["CANDIDATE", "RECRUITER"].map((r) => (
              <button
                type="button" key={r}
                className={`btn ${form.role === r ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setForm({ ...form, role: r })}
              >
                {r === "CANDIDATE" ? "Candidate" : "Recruiter"}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Username</label>
          <input required className="form-control" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required className="form-control" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label>Password</label>
            <input type="password" required className="form-control" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required className="form-control" value={form.password2}
              onChange={(e) => setForm({ ...form, password2: e.target.value })} />
          </div>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: "0.9rem" }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
