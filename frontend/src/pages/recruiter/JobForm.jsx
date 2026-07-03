import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";

const empty = {
  title: "", description: "", responsibilities: "", requirements: "", skills_required: "",
  location: "", is_remote: false, job_type: "FULL_TIME", experience_level: "FRESHER",
  salary_min: "", salary_max: "", status: "OPEN", application_deadline: "",
};

export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      client.get(`/jobs/${id}/`).then(({ data }) => {
        setForm({
          title: data.title, description: data.description, responsibilities: data.responsibilities || "",
          requirements: data.requirements || "", skills_required: data.skills_required || "",
          location: data.location, is_remote: data.is_remote, job_type: data.job_type,
          experience_level: data.experience_level, salary_min: data.salary_min || "",
          salary_max: data.salary_max || "", status: data.status,
          application_deadline: data.application_deadline || "",
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, salary_min: form.salary_min || null, salary_max: form.salary_max || null, application_deadline: form.application_deadline || null };
    try {
      if (isEdit) {
        await client.patch(`/jobs/${id}/`, payload);
      } else {
        await client.post("/jobs/", payload);
      }
      navigate("/recruiter/jobs");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? JSON.stringify(data) : "Failed to save job.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="page-header"><h1>{isEdit ? "Edit Job" : "Post a New Job"}</h1></div>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group"><label>Job Title</label>
          <input required className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label>Description</label>
          <textarea required className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-group"><label>Responsibilities</label>
          <textarea className="form-control" value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} /></div>
        <div className="form-group"><label>Requirements</label>
          <textarea className="form-control" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
        <div className="form-group"><label>Skills Required (comma-separated)</label>
          <input className="form-control" placeholder="Python, Django, DRF" value={form.skills_required} onChange={(e) => setForm({ ...form, skills_required: e.target.value })} /></div>

        <div className="grid-2">
          <div className="form-group"><label>Location</label>
            <input required className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="form-group"><label>
            <input type="checkbox" checked={form.is_remote} onChange={(e) => setForm({ ...form, is_remote: e.target.checked })} /> Remote job
          </label></div>
        </div>

        <div className="grid-2">
          <div className="form-group"><label>Job Type</label>
            <select className="form-control" value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}>
              {["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "REMOTE"].map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Experience Level</label>
            <select className="form-control" value={form.experience_level} onChange={(e) => setForm({ ...form, experience_level: e.target.value })}>
              {["FRESHER", "JUNIOR", "MID", "SENIOR"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group"><label>Salary Min (₹/year)</label>
            <input type="number" className="form-control" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} /></div>
          <div className="form-group"><label>Salary Max (₹/year)</label>
            <input type="number" className="form-control" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} /></div>
        </div>

        <div className="grid-2">
          <div className="form-group"><label>Application Deadline</label>
            <input type="date" className="form-control" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} /></div>
          <div className="form-group"><label>Status</label>
            <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" disabled={saving} type="submit">{saving ? "Saving..." : isEdit ? "Update Job" : "Post Job"}</button>
      </form>
    </div>
  );
}
