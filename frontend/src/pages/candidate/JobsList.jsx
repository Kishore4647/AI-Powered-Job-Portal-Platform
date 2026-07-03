import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "REMOTE"];
const EXP_LEVELS = ["FRESHER", "JUNIOR", "MID", "SENIOR"];

export default function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", location: "", job_type: "", experience_level: "" });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await client.get("/jobs/", { params });
      setJobs(data.results);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); /* eslint-disable-next-line */ }, [page]);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const totalPages = Math.ceil(count / 10) || 1;

  return (
    <div className="container">
      <div className="page-header"><h1>Browse Jobs</h1></div>

      <form className="filters-bar" onSubmit={applyFilters}>
        <input className="form-control" placeholder="Search title/skills" value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input className="form-control" placeholder="Location" value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <select className="form-control" value={filters.job_type}
          onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}>
          <option value="">Any Job Type</option>
          {JOB_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
        </select>
        <select className="form-control" value={filters.experience_level}
          onChange={(e) => setFilters({ ...filters, experience_level: e.target.value })}>
          <option value="">Any Experience</option>
          {EXP_LEVELS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary" type="submit">Filter</button>
      </form>

      {loading ? (
        <div className="loading">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">No jobs found matching your filters.</div>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="card job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
            <h3>{job.title}</h3>
            <div style={{ color: "var(--text-muted)" }}>{job.company_name}</div>
            <div className="job-meta">
              <span>📍 {job.location}{job.is_remote && " (Remote)"}</span>
              <span>💼 {job.job_type.replace("_", " ")}</span>
              <span>🎯 {job.experience_level}</span>
              {job.salary_min && <span>💰 ₹{job.salary_min.toLocaleString()} - ₹{job.salary_max?.toLocaleString()}</span>}
            </div>
            <span className="tag-gray tag">{job.applicant_count} applicants</span>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span style={{ alignSelf: "center", fontSize: "0.85rem" }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
