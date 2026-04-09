"use client";
import { useEffect, useState } from "react";

interface User { id: string; name: string; email: string; role: string; title?: string; phone?: string; isActive: boolean; company?: { name: string }; createdAt: string; }
interface Company { id: string; name: string; }

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CLIENT", companyId: "", title: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    load();
    fetch("/api/admin/companies").then((r) => r.json()).then((d) => setCompanies(d.companies ?? []));
  }, []);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/users");
    const d = await r.json();
    setUsers(d.users ?? []);
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setShowForm(false); setForm({ name: "", email: "", password: "", role: "CLIENT", companyId: "", title: "", phone: "" }); load(); }
    else { const d = await r.json(); alert(d.error || "שגיאה"); }
    setSaving(false);
  }

  async function toggleActive(user: User) {
    await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !user.isActive }) });
    load();
  }

  const roleLabel: Record<string, string> = { ADMIN: "מנהל", EMPLOYEE: "עובד", CLIENT: "לקוח" };
  const filtered = users.filter((u) => filter === "ALL" || u.role === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">משתמשים</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ הוסף משתמש</button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["ALL", "ADMIN", "EMPLOYEE", "CLIENT"].map((r) => (
          <button key={r} onClick={() => setFilter(r)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === r ? "bg-[#1E3A5F] text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
            {r === "ALL" ? "הכל" : roleLabel[r]}
          </button>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["שם", "אימייל", "תפקיד", "חברה", "סטטוס", "פעולות"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">טוען...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">אין משתמשים</td></tr>
            ) : filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-bold">{user.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      {user.title && <p className="text-xs text-slate-400">{user.title}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600" dir="ltr">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : user.role === "EMPLOYEE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                    {roleLabel[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{user.company?.name || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.isActive ? "פעיל" : "מושהה"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(user)} className="text-xs text-[#1E3A5F] hover:underline">
                    {user.isActive ? "השהה" : "הפעל"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create user modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-[#1E3A5F] text-lg mb-5">הוסף משתמש חדש</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">שם מלא *</label>
                  <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">תפקיד *</label>
                  <select required className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, companyId: "" })}>
                    <option value="CLIENT">לקוח</option>
                    <option value="EMPLOYEE">עובד</option>
                    <option value="ADMIN">מנהל</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">אימייל *</label>
                <input required type="email" className="input" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">סיסמה *</label>
                <input required type="password" className="input" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              {form.role === "CLIENT" && (
                <div>
                  <label className="label">חברת לקוח *</label>
                  <select required className="input" value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}>
                    <option value="">-- בחר חברה --</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {form.role === "EMPLOYEE" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">תואר / תפקיד</label>
                    <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="רו&quot;ח בכיר" />
                  </div>
                  <div>
                    <label className="label">טלפון</label>
                    <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? "שומר..." : "הוסף משתמש"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">ביטול</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
