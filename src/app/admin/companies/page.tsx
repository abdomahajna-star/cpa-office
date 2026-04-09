"use client";
import { useEffect, useState } from "react";

interface Company { id: string; name: string; contactName?: string; phone?: string; email?: string; status: string; createdAt: string; }

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", contactName: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/companies");
    const d = await r.json();
    setCompanies(d.companies ?? []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/admin/companies", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setShowForm(false); setForm({ name: "", contactName: "", phone: "", email: "" }); load(); }
    else { const d = await r.json(); alert(d.error); }
    setSaving(false);
  }

  async function deactivate(id: string) {
    if (!confirm("להשהות לקוח זה?")) return;
    await fetch(`/api/admin/companies/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "inactive" }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">לקוחות וחברות</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ הוסף חברה</button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["שם חברה", "איש קשר", "טלפון", "אימייל", "סטטוס", "פעולות"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">טוען...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">אין חברות</td></tr>
            ) : companies.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-sm">{c.name.charAt(0)}</div>
                    <p className="font-semibold text-sm text-[#1E3A5F]">{c.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{c.contactName || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600" dir="ltr">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-600" dir="ltr">{c.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {c.status === "active" ? "פעיל" : "מושהה"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {c.status === "active" && (
                    <button onClick={() => deactivate(c.id)} className="text-xs text-red-500 hover:underline">השהה</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-[#1E3A5F] text-lg mb-5">הוסף חברה חדשה</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">שם החברה *</label>
                <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">איש קשר</label>
                <input className="input" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">טלפון</label>
                  <input className="input" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">אימייל</label>
                  <input type="email" className="input" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? "שומר..." : "הוסף חברה"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
