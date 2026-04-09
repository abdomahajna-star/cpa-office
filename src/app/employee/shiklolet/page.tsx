"use client";
import { useEffect, useState } from "react";
import { MONTHS_HE } from "@/types";

interface Company { id: string; name: string; }
interface Task { id: string; companyId: string; year: number; month: number; employeeName?: string; status: string; createdAt: string; company: { name: string }; }

export default function ShikloletPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [isAllEmployees, setIsAllEmployees] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [agentOnline, setAgentOnline] = useState<boolean | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetch("/api/admin/companies").then((r) => r.json()).then((d) => setCompanies(d.companies ?? []));
    checkAgent();
    loadTasks();
  }, []);

  async function checkAgent() {
    try {
      const r = await fetch("/api/employee/shiklolet/status");
      const d = await r.json();
      setAgentOnline(d.online);
    } catch {
      setAgentOnline(false);
    }
  }

  async function loadTasks() {
    setLoading(true);
    try {
      const r = await fetch("/api/employee/shiklolet/tasks");
      const d = await r.json();
      setTasks(d.tasks ?? []);
    } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) { alert("בחר לקוח"); return; }
    setSubmitting(true);
    try {
      const r = await fetch("/api/employee/shiklolet/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, year, month, employeeId: isAllEmployees ? null : employeeId, employeeName: isAllEmployees ? null : employeeName }),
      });
      if (r.ok) {
        setEmployeeId("");
        setEmployeeName("");
        loadTasks();
      }
    } finally { setSubmitting(false); }
  }

  const statusLabel: Record<string, { label: string; color: string }> = {
    pending:    { label: "ממתין",      color: "bg-amber-100 text-amber-700" },
    processing: { label: "מעבד...",    color: "bg-blue-100 text-blue-700" },
    done:       { label: "הושלם ✓",   color: "bg-green-100 text-green-700" },
    failed:     { label: "נכשל ✗",    color: "bg-red-100 text-red-700" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">שיקלולט – ייצוא אוטומטי</h1>
      <p className="text-slate-500 mb-6">שלח בקשה לסוכן המקומי לייצא תלוש מתוך תוכנת שיקלולט</p>

      {/* Agent status */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${agentOnline === true ? "bg-green-100 text-green-700" : agentOnline === false ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}>
        <span className={`w-2 h-2 rounded-full ${agentOnline === true ? "bg-green-500 animate-pulse" : agentOnline === false ? "bg-red-500" : "bg-slate-400"}`} />
        {agentOnline === true ? "סוכן שיקלולט מחובר ✓" : agentOnline === false ? "סוכן לא זמין – וודא שהוא רץ על המחשב במשרד" : "בודק סטטוס..."}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Form */}
        <div className="card">
          <h2 className="font-bold text-[#1E3A5F] mb-4">בקשה חדשה לייצוא</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">לקוח</label>
              <select className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">-- בחר לקוח --</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">שנה</label>
                <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="label">חודש</label>
                <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {MONTHS_HE.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isAllEmployees} onChange={(e) => setIsAllEmployees(e.target.checked)} className="rounded" />
              <span>ייצא סיכום לכל העובדים</span>
            </label>

            {!isAllEmployees && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">מספר עובד / ת.ז.</label>
                  <input className="input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="123456789" />
                </div>
                <div>
                  <label className="label">שם העובד</label>
                  <input className="input" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="ישראל ישראלי" />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting || !agentOnline}>
              {submitting ? "שולח בקשה..." : "שלח לייצוא מ-שיקלולט ↓"}
            </button>
            {!agentOnline && <p className="text-xs text-red-500 text-center">הסוכן אינו מחובר. הפעל את הסוכן על המחשב במשרד.</p>}
          </form>
        </div>

        {/* How it works */}
        <div className="card bg-[#1E3A5F]/5 border-[#1E3A5F]/20">
          <h2 className="font-bold text-[#1E3A5F] mb-4">כיצד זה עובד?</h2>
          <ol className="space-y-3 text-sm text-slate-600">
            {[
              "בחר לקוח, שנה, חודש ועובד",
              "לחץ על 'שלח לייצוא' – הבקשה נשלחת לסוכן המקומי",
              "הסוכן פותח את תוכנת שיקלולט באוטומט",
              "הסוכן מנווט לתלוש הנדרש ומייצא PDF",
              "הקובץ מועלה אוטומטית למערכת",
              "הלקוח יכול לצפות ולהוריד את הקובץ",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-400 mt-4">* הסוכן (shiklolet_agent.py) חייב לרוץ על המחשב בו מותקנת תוכנת שיקלולט</p>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1E3A5F]">בקשות אחרונות</h2>
          <button onClick={loadTasks} className="text-sm text-[#1E3A5F] hover:underline">רענן</button>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" /></div>
        ) : tasks.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">אין בקשות עדיין</p>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 20).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                <div>
                  <p className="font-medium text-slate-800">
                    {task.company?.name} · {MONTHS_HE[task.month - 1]} {task.year}
                    {task.employeeName ? ` · ${task.employeeName}` : " · כל העובדים"}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(task.createdAt).toLocaleString("he-IL")}</p>
                </div>
                <span className={`badge ${statusLabel[task.status]?.color ?? "bg-slate-100 text-slate-600"}`}>
                  {statusLabel[task.status]?.label ?? task.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
