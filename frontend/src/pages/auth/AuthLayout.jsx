// Shared visual shell for the auth pages (Login is Job Assist's landing page).
// The journey rail mirrors the real application status pipeline used in
// "My Applications" (see StatusBadge) — it's not decorative, it's the product.
const STAGES = [
  { label: "Applied", note: "Resume attached automatically, no repeat uploads." },
  { label: "Under Review", note: "Recruiters read your profile and cover letter." },
  { label: "Shortlisted", note: "You've made the first cut." },
  { label: "Interview", note: "Time to prepare — and to show up ready." },
  { label: "Hired", note: "Offer accepted. On to the next chapter." },
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <div className="auth-hero-inner">
          <div className="auth-brand">
            <span className="auth-brand-mark">JA</span>
            <span className="auth-brand-name">Job Assist</span>
          </div>

          <span className="eyebrow">AI Hiring Platform</span>
          <h1 className="auth-headline">Every application,<br />a step closer.</h1>
          <p className="auth-subhead">
            Job Assist matches your resume to each role, tracks every application,
            and shows recruiters exactly who to interview next.
          </p>

          <ol className="journey-rail" aria-label="Application pipeline">
            {STAGES.map((s, i) => (
              <li key={s.label} className="journey-step" style={{ "--i": i }}>
                <span className="journey-dot" />
                <div>
                  <span className="journey-label">{s.label}</span>
                  <span className="journey-note">{s.note}</span>
                </div>
              </li>
            ))}
          </ol>

          <p className="auth-footnote">
            Hiring instead? Recruiters get a dashboard for postings, applicants,
            and one-click resume downloads.
          </p>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-panel-inner">{children}</div>
      </main>
    </div>
  );
}
