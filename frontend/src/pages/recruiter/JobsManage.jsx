import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../../api/client";

export default function JobsManage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await client.get("/jobs/", { params: { mine: "true" } });
    setJobs(data.results);
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const closeJob = async (id) => {
    await client.patch(`/jobs/${id}/`, { status: "CLOSED" });
    fetchJobs();
  };
  const reopenJob = async (id) => {
    await client.patch(`/jobs/${id}/`, { status: "OPEN" });
    fetchJobs();
  };
  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job posting permanently?")) return;
    await client.delete(`/jobs/${id}/`);
    fetchJobs();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Job Postings</h1>
        <button className="btn btn-primary" onClick={() => navigate("/recruiter/jobs/new")}>+ Post New Job</button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">You haven't posted any jobs yet.</div>
      ) : (
        <table className="table card">
          <thead>
            <tr><th>Title</th><th>Location</th><th>Status</th><th>Applicants</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.location}</td>
                <td><span className="tag">{job.status}</span></td>
                <td>
                  <Link to={`/recruiter/jobs/${job.id}/applicants`}>{job.applicant_count} view →</Link>
                </td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}>Edit</button>
                  {job.status === "OPEN" ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => closeJob(job.id)}>Close</button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => reopenJob(job.id)}>Reopen</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => deleteJob(job.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
