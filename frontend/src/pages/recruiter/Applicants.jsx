import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

const STATUS_OPTIONS = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"];

export default function Applicants() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    setLoading(true);
    const { data } = await client.get(`/applications/job/${jobId}/applicants/`);
    setApplicants(data.results);
    setLoading(false);
  };

  useEffect(() => { fetchApplicants(); }, [jobId]);

  const updateStatus = async (appId, status) => {
    await client.patch(`/applications/${appId}/status/`, { status });
    fetchApplicants();
  };

  const downloadResume = async (appId, candidateName) => {
    const response = await client.get(`/applications/${appId}/resume/`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${candidateName || "resume"}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Applicants</h1>
        <Link to="/recruiter/jobs" className="btn btn-secondary btn-sm">← Back to Jobs</Link>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : applicants.length === 0 ? (
        <div className="empty-state">No applicants yet for this job.</div>
      ) : (
        <table className="table card">
          <thead>
            <tr><th>Candidate</th><th>Email</th><th>Applied</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {applicants.map((app) => (
              <tr key={app.id}>
                <td>{app.candidate_name || "—"}</td>
                <td>{app.candidate_email}</td>
                <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                <td><StatusBadge status={app.status} /></td>
                <td style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <select className="form-control" style={{ maxWidth: 160 }} value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>
                  <button className="btn btn-secondary btn-sm" onClick={() => downloadResume(app.id, app.candidate_name)}>Resume</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
