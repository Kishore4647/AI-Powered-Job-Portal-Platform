import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../../api/client";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState("");

  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  const [coverLetter, setCoverLetter] = useState(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState("");

  useEffect(() => {
    client.get(`/jobs/${id}/`).then(({ data }) => setJob(data));
    client.get("/applications/my-applications/").then(({ data }) => {
      if (data.results.some((a) => a.job === id)) setApplied(true);
    });
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setApplyError("");
    try {
      await client.post("/applications/apply/", { job: id });
      setApplied(true);
    } catch (err) {
      setApplyError(err.response?.data?.[0] || err.response?.data?.detail || "Could not apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const checkJobMatch = async () => {
    setMatchLoading(true); setMatchError(""); setMatchResult(null);
    try {
      const { data } = await client.post("/ai/job-match/", { job_id: id });
      setMatchResult(data);
    } catch (err) {
      setMatchError(err.response?.data?.detail || "AI check failed. Please try again later.");
    } finally {
      setMatchLoading(false);
    }
  };

  const generateCoverLetter = async () => {
    setCoverLoading(true); setCoverError(""); setCoverLetter(null);
    try {
      const { data } = await client.post("/ai/cover-letter/", { job_id: id });
      setCoverLetter(data.cover_letter);
    } catch (err) {
      setCoverError(err.response?.data?.detail || "Could not generate cover letter.");
    } finally {
      setCoverLoading(false);
    }
  };

  if (!job) return <div className="loading">Loading job...</div>;

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginTop: 20 }}>← Back</button>

      <div className="card" style={{ marginTop: 16 }}>
        <h1 style={{ marginTop: 0 }}>{job.title}</h1>
        <div style={{ color: "var(--text-muted)", marginBottom: 10 }}>{job.company_name}</div>
        <div className="job-meta">
          <span>📍 {job.location}{job.is_remote && " (Remote)"}</span>
          <span>💼 {job.job_type.replace("_", " ")}</span>
          <span>🎯 {job.experience_level}</span>
          {job.salary_min && <span>💰 ₹{job.salary_min.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}</span>}
        </div>

        <div style={{ margin: "16px 0" }}>
          {applied ? (
            <button className="btn btn-secondary" disabled>✓ Already Applied</button>
          ) : (
            <button className="btn btn-primary" onClick={handleApply} disabled={applying}>
              {applying ? "Applying..." : "Apply Now (One Click)"}
            </button>
          )}
          {applyError && <p className="error-text">{applyError}</p>}
        </div>

        <h3>Description</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
        {job.responsibilities && <><h3>Responsibilities</h3><p style={{ whiteSpace: "pre-wrap" }}>{job.responsibilities}</p></>}
        {job.requirements && <><h3>Requirements</h3><p style={{ whiteSpace: "pre-wrap" }}>{job.requirements}</p></>}
        {job.skills_required && (
          <div style={{ margin: "10px 0" }}>
            {job.skills_required.split(",").map((s) => <span key={s} className="tag" style={{ marginRight: 6 }}>{s.trim()}</span>)}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>✨ AI Fit Check</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Compare your resume against this specific job description using Gemini AI.
        </p>
        <button className="btn btn-primary" onClick={checkJobMatch} disabled={matchLoading}>
          {matchLoading ? "Analyzing..." : "Check My Resume Against This Job"}
        </button>
        {matchError && <p className="error-text">{matchError}</p>}
        {matchResult && (
          <div className="ai-box">
            <div className="ai-score">{matchResult.match_score}% Match</div>
            <p>{matchResult.summary}</p>
            <strong>Strengths</strong>
            <ul className="ai-list">{matchResult.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <strong>Gaps</strong>
            <ul className="ai-list">{matchResult.weaknesses?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <strong>Missing Skills</strong>
            <ul className="ai-list">{matchResult.missing_skills?.map((s, i) => <li key={i}>{s}</li>)}</ul>
            <strong>Suggestions</strong>
            <ul className="ai-list">{matchResult.suggestions?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16, marginBottom: 30 }}>
        <h3 style={{ marginTop: 0 }}>✨ AI Cover Letter Generator</h3>
        <button className="btn btn-secondary" onClick={generateCoverLetter} disabled={coverLoading}>
          {coverLoading ? "Writing..." : "Generate Tailored Cover Letter"}
        </button>
        {coverError && <p className="error-text">{coverError}</p>}
        {coverLetter && (
          <div className="ai-box">
            <p style={{ whiteSpace: "pre-wrap" }}>{coverLetter}</p>
          </div>
        )}
      </div>
    </div>
  );
}
