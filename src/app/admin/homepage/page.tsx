"use client";
import { useEffect, useState } from "react";

export default function HomepageEditorPage() {
  const [info, setInfo] = useState({ name: "", description: "", phone: "", email: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage").then((r) => r.json()).then((d) => {
      if (d.content) setInfo(d.content.officeInfo ?? info);
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officeInfo: info }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">עריכת דף הבית</h1>
      <p className="text-slate-500 mb-8">הפרטים שיופיעו בדף הבית הציבורי של המשרד</p>

      <div className="card max-w-2xl">
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-5">
            ✓ הנתונים נשמרו בהצלחה
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="label">שם המשרד</label>
            <input className="input" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder='משרד רו"ח ישראלי ושות' />
          </div>
          <div>
            <label className="label">תיאור / אודות</label>
            <textarea rows={4} className="input resize-none" value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} placeholder="תיאור קצר של המשרד..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">טלפון</label>
              <input className="input" dir="ltr" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} placeholder="03-0000000" />
            </div>
            <div>
              <label className="label">אימייל</label>
              <input type="email" className="input" dir="ltr" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} placeholder="office@example.com" />
            </div>
          </div>
          <div>
            <label className="label">כתובת</label>
            <input className="input" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} placeholder="רחוב הרצל 1, תל אביב" />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "שומר..." : "שמור שינויים"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-slate-500 mb-2 font-medium">💡 הצוות יוצג אוטומטית</p>
          <p className="text-xs text-slate-400">
            חברי הצוות (עובדים) יופיעו בדף הבית אוטומטית לפי הפרטים שהוזנו בניהול המשתמשים. לעדכון פרטי עובד — עבור לדף <strong>משתמשים</strong> ועדכן את השם, התואר, הטלפון ותמונת הפרופיל.
          </p>
        </div>
      </div>
    </div>
  );
}
