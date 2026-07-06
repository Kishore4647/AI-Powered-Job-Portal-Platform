import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout";

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
    <AuthLayout>
      <span className="auth-mobile-brand">Job Assist</span>
      <h2 className="auth-form-title">Create your account</h2>
      <p className="auth-form-subtitle">Join as a candidate or recruiter.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>I am a...</label>
          <div className="role-toggle">
            {["CANDIDATE", "RECRUITER"].map((r) => (
              <button
                type="button" key={r}
                className={`btn ${form.role === r ? "btn-primary" : "btn-secondary"}`}
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

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
