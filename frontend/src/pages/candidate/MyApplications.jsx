import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import StatusBadge from "../../components/StatusBadge";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/applications/my-applications/").then(({ data }) => {
      setApplications(data.results);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container">
      <div className="page-header"><h1>My Applications</h1></div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          You haven't applied to any jobs yet. <Link to="/jobs">Browse jobs</Link> to get started.
        </div>
      ) : (
        <div className="card">
          {applications.map((app) => (
            <div key={app.id} className="list-item-row">
              <div>
                <strong><Link to={`/jobs/${app.job}`}>{app.job_title}</Link></strong><br />
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {app.company_name} · {app.location} · Applied {new Date(app.applied_at).toLocaleDateString()}
                </span>
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
