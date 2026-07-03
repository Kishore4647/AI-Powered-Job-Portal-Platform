import { useEffect, useState } from "react";
import client from "../../api/client";

function EducationForm({ onAdd }) {
  const [form, setForm] = useState({ institution: "", degree: "", field_of_study: "", start_year: "", end_year: "", grade: "" });
  const submit = async (e) => {
    e.preventDefault();
    await onAdd(form);
    setForm({ institution: "", degree: "", field_of_study: "", start_year: "", end_year: "", grade: "" });
  };
  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 16 }}>
      <div className="grid-2">
        <div className="form-group"><label>Institution</label>
          <input required className="form-control" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} /></div>
        <div className="form-group"><label>Degree</label>
          <input required className="form-control" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} /></div>
      </div>
      <div className="grid-2">
        <div className="form-group"><label>Field of Study</label>
          <input className="form-control" value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} /></div>
        <div className="form-group"><label>Grade</label>
          <input className="form-control" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></div>
      </div>
      <div className="grid-2">
        <div className="form-group"><label>Start Year</label>
          <input required type="number" className="form-control" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: e.target.value })} /></div>
        <div className="form-group"><label>End Year</label>
          <input type="number" className="form-control" value={form.end_year} onChange={(e) => setForm({ ...form, end_year: e.target.value })} /></div>
      </div>
      <button className="btn btn-primary btn-sm" type="submit">Add Education</button>
    </form>
  );
}

function ExperienceForm({ onAdd }) {
  const [form, setForm] = useState({ company_name: "", job_title: "", location: "", start_date: "", end_date: "", is_current: false, description: "" });
  const submit = async (e) => {
    e.preventDefault();
    await onAdd({ ...form, end_date: form.is_current ? null : form.end_date });
    setForm({ company_name: "", job_title: "", location: "", start_date: "", end_date: "", is_current: false, description: "" });
  };
  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 16 }}>
      <div className="grid-2">
        <div className="form-group"><label>Company</label>
          <input required className="form-control" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
        <div className="form-group"><label>Job Title</label>
          <input required className="form-control" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} /></div>
      </div>
      <div className="form-group"><label>Location</label>
        <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      <div className="grid-2">
        <div className="form-group"><label>Start Date</label>
          <input required type="date" className="form-control" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
        <div className="form-group"><label>End Date</label>
          <input type="date" disabled={form.is_current} className="form-control" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
      </div>
      <div className="form-group">
        <label><input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} /> I currently work here</label>
      </div>
      <div className="form-group"><label>Description</label>
        <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <button className="btn btn-primary btn-sm" type="submit">Add Experience</button>
    </form>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const loadProfile = async () => {
    const { data } = await client.get("/candidates/profile/");
    setProfile(data);
    setForm({
      full_name: data.full_name || "", headline: data.headline || "", summary: data.summary || "",
      location: data.location || "", linkedin_url: data.linkedin_url || "",
      github_url: data.github_url || "", portfolio_url: data.portfolio_url || "",
    });
  };

  useEffect(() => { loadProfile(); }, []);

  const saveBasicInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await client.patch("/candidates/profile/", form);
      await loadProfile();
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    const fd = new FormData();
    fd.append("resume", resumeFile);
    await client.post("/candidates/profile/resume/", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setResumeFile(null);
    await loadProfile();
  };

  const addEducation = async (payload) => { await client.post("/candidates/education/", payload); await loadProfile(); };
  const addExperience = async (payload) => { await client.post("/candidates/experience/", payload); await loadProfile(); };
  const addSkill = async (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    await client.post("/candidates/skills/", { name: skillInput.trim() });
    setSkillInput("");
    await loadProfile();
  };
  const removeSkill = async (id) => { await client.delete(`/candidates/skills/${id}/`); await loadProfile(); };
  const removeEducation = async (id) => { await client.delete(`/candidates/education/${id}/`); await loadProfile(); };
  const removeExperience = async (id) => { await client.delete(`/candidates/experience/${id}/`); await loadProfile(); };

  const checkMyProfile = async () => {
    setAiLoading(true); setAiError(""); setAiResult(null);
    try {
      const { data } = await client.post("/ai/resume-summary/");
      setAiResult(data);
    } catch (err) {
      setAiError(err.response?.data?.detail || "AI check failed. Please try again later.");
    } finally {
      setAiLoading(false);
    }
  };

  if (!profile || !form) return <div className="loading">Loading profile...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Profile</h1>
        <span className="tag">{profile.profile_completion}% complete</span>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Basic Information</h3>
        <form onSubmit={saveBasicInfo}>
          <div className="grid-2">
            <div className="form-group"><label>Full Name</label>
              <input className="form-control" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="form-group"><label>Headline</label>
              <input className="form-control" placeholder="e.g. Python Developer | Django | React"
                value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Summary</label>
            <textarea className="form-control" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
          <div className="grid-2">
            <div className="form-group"><label>Location</label>
              <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="form-group"><label>LinkedIn URL</label>
              <input className="form-control" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>GitHub URL</label>
              <input className="form-control" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></div>
            <div className="form-group"><label>Portfolio URL</label>
              <input className="form-control" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary" disabled={saving} type="submit">{saving ? "Saving..." : "Save Changes"}</button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Resume</h3>
        {profile.resume ? (
          <p>Current resume: <a href={profile.resume} target="_blank" rel="noreferrer">View uploaded resume</a></p>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No resume uploaded yet. Upload one to apply for jobs and use AI features.</p>
        )}
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 10 }} disabled={!resumeFile} onClick={uploadResume}>Upload</button>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={checkMyProfile} disabled={aiLoading}>
            {aiLoading ? "Analyzing..." : "✨ Check My Profile (AI)"}
          </button>
        </div>
        {aiError && <p className="error-text">{aiError}</p>}
        {aiResult && (
          <div className="ai-box">
            <h4>AI Resume Analysis</h4>
            <p><strong>Summary:</strong> {aiResult.summary}</p>
            <p><strong>Estimated level:</strong> {aiResult.estimated_experience_level}</p>
            <strong>Strengths</strong>
            <ul className="ai-list">{aiResult.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <strong>Areas to improve</strong>
            <ul className="ai-list">{aiResult.weaknesses?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <strong>Suggestions</strong>
            <ul className="ai-list">{aiResult.suggestions?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="section-title">Education</div>
      {profile.education.map((ed) => (
        <div className="card" key={ed.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>{ed.degree}</strong> — {ed.institution}<br />
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{ed.start_year} - {ed.end_year || "Present"}</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => removeEducation(ed.id)}>Remove</button>
        </div>
      ))}
      <EducationForm onAdd={addEducation} />

      <div className="section-title">Experience</div>
      {profile.experience.map((exp) => (
        <div className="card" key={exp.id} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>{exp.job_title}</strong> — {exp.company_name}<br />
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{exp.start_date} - {exp.is_current ? "Present" : exp.end_date}</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => removeExperience(exp.id)}>Remove</button>
        </div>
      ))}
      <ExperienceForm onAdd={addExperience} />

      <div className="section-title">Skills</div>
      <div className="card">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {profile.skills.map((s) => (
            <span key={s.id} className="tag" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {s.name}
              <span style={{ cursor: "pointer" }} onClick={() => removeSkill(s.id)}>×</span>
            </span>
          ))}
        </div>
        <form onSubmit={addSkill} style={{ display: "flex", gap: 8 }}>
          <input className="form-control" placeholder="e.g. Django" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
          <button className="btn btn-primary btn-sm" type="submit">Add</button>
        </form>
      </div>
    </div>
  );
}
