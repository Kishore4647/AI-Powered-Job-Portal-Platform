export default function StatusBadge({ status }) {
  const labels = {
    APPLIED: "Applied",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interview",
    REJECTED: "Rejected",
    HIRED: "Hired",
  };
  return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
