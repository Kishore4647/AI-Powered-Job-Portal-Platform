import { useEffect, useState } from "react";
import client from "../../api/client";

export default function Company() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get("/recruiters/company/").then(({ data }) => {
      setForm({
        company_name: data.company_name || "", website: data.website || "",
        industry: data.industry || "", company_size: data.company_size || "",
        location: data.location || "", about: data.about || "",
        contact_person: data.contact_person || "", contact_email: data.contact_email || "",
        contact_phone: data.contact_phone || "",
      });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await client.patch("/recruiters/company/", form);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="page-header"><h1>Company Profile</h1></div>
      <form className="card" onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group"><label>Company Name</label>
            <input required className="form-control" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} /></div>
          <div className="form-group"><label>Website</label>
            <input className="form-control" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label>Industry</label>
            <input className="form-control" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
          <div className="form-group"><label>Company Size</label>
            <input className="form-control" placeholder="e.g. 11-50" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} /></div>
        </div>
        <div className="form-group"><label>Location</label>
          <input className="form-control" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <div className="form-group"><label>About</label>
          <textarea className="form-control" value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></div>
        <div className="grid-2">
          <div className="form-group"><label>Contact Person</label>
            <input className="form-control" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} /></div>
          <div className="form-group"><label>Contact Email</label>
            <input className="form-control" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
        </div>
        <div className="form-group"><label>Contact Phone</label>
          <input className="form-control" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
        <button className="btn btn-primary" disabled={saving} type="submit">{saving ? "Saving..." : "Save"}</button>
        {saved && <span style={{ marginLeft: 10, color: "var(--success)" }}>Saved ✓</span>}
      </form>
    </div>
  );
}
