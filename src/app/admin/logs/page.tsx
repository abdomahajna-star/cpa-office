"use client";
import { useEffect, useState } from "react";
import { MONTHS_HE } from "@/types";

interface LogEntry {
  id: string;
  downloadedAt: string;
  fileType: string;
  user: { name: string; email: string; role: string };
  payrollFile?: { fileName: string; year: number; month: number; company: { name: string } };
  bookkeepingFile?: { fileName: string; year: number; month: number; company: { name: string } };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { load(page); }, [page]);

  async function load(p: number) {
    setLoading(true);
    const r = await fetch(`/api/admin/logs?page=${p}`);
    const d = await r.json();
    setLogs(d.logs ?? []);
    setTotalPages(d.pages ?? 1);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-8">לוג הורדות</h1>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["תאריך ושעה", "משתמש", "חברה", "סוג קובץ", "שם קובץ", "תקופה"].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 text-right">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">טוען...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-400">אין נתונים</td></tr>
            ) : logs.map((log) => {
              const file = log.payrollFile || log.bookkeepingFile;
              return (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors text-sm">
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap" dir="ltr">
                    {new Date(log.downloadedAt).toLocaleString("he-IL")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{log.user.name}</p>
                    <p className="text-xs text-slate-400" dir="ltr">{log.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{file?.company?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${log.fileType === "payroll" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {log.fileType === "payroll" ? "תלוש שכר" : "הנה&quot;ח"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{file?.fileName || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {file?.month ? MONTHS_HE[file.month - 1] : ""} {file?.year}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">
            הקודם
          </button>
          <span className="text-sm text-slate-500">עמוד {page} מתוך {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">
            הבא
          </button>
        </div>
      )}
    </div>
  );
}
