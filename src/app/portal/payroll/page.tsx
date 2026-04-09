"use client";
import { useEffect, useState } from "react";
import { MONTHS_HE } from "@/types";

interface PayrollFile {
  id: string;
  year: number;
  month: number;
  employeeId?: string;
  employeeName?: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  uploadedAt: string;
}

export default function PayrollPage() {
  const currentYear = new Date().getFullYear();
  const [files, setFiles] = useState<PayrollFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Unique employees from loaded files
  const employees: { id: string; name: string }[] = [];
  const seenIds = new Set<string>();
  files.forEach((f) => {
    if (f.employeeId && !seenIds.has(f.employeeId)) {
      seenIds.add(f.employeeId);
      employees.push({ id: f.employeeId, name: f.employeeName || f.employeeId });
    }
  });

  useEffect(() => {
    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  async function loadFiles() {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll?year=${selectedYear}`);
      const data = await res.json();
      setFiles(data.files ?? []);
    } finally {
      setLoading(false);
    }
  }

  const filtered = files.filter((f) => {
    if (selectedMonth && f.month !== selectedMonth) return false;
    if (selectedEmployee === "all") return !f.employeeId; // summary files
    if (selectedEmployee === "any") return true;          // all files
    return f.employeeId === selectedEmployee;
  });

  // Group by month
  const byMonth: Record<number, PayrollFile[]> = {};
  filtered.forEach((f) => {
    if (!byMonth[f.month]) byMonth[f.month] = [];
    byMonth[f.month].push(f);
  });
  const sortedMonths = Object.keys(byMonth).map(Number).sort((a, b) => b - a);

  async function handleDownload(file: PayrollFile) {
    // Log download then open
    await fetch("/api/payroll/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: file.id }),
    });
    window.open(file.fileUrl, "_blank");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">תלושי שכר</h1>
      <p className="text-slate-500 mb-8">סנן לפי שנה, חודש ועובד להורדת תלושים</p>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Year */}
          <div>
            <label className="label">שנה</label>
            <select
              className="input"
              value={selectedYear}
              onChange={(e) => { setSelectedYear(Number(e.target.value)); setSelectedMonth(null); }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="label">חודש</label>
            <select
              className="input"
              value={selectedMonth ?? ""}
              onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">כל החודשים</option>
              {MONTHS_HE.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          {/* Employee */}
          <div>
            <label className="label">עובד</label>
            <select
              className="input"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="all">סיכום כל העובדים</option>
              <option value="any">הכל (עובדים + סיכומים)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedMonths.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-slate-500 font-medium">לא נמצאו קבצים לפי הסינון שנבחר</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedMonths.map((month) => (
            <div key={month} className="card">
              <h3 className="font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#1E3A5F]/10 flex items-center justify-center text-sm font-bold text-[#1E3A5F]">
                  {month}
                </span>
                {MONTHS_HE[month - 1]} {selectedYear}
              </h3>
              <div className="space-y-2">
                {byMonth[month].map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {file.employeeId ? (file.employeeName || file.employeeId) : "סיכום כל העובדים"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {file.fileName}
                          {file.fileSizeBytes && ` · ${(file.fileSizeBytes / 1024).toFixed(0)} KB`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPreviewUrl(file.fileUrl); setPreviewName(file.fileName); }}
                        className="text-xs text-[#1E3A5F] hover:underline px-3 py-1.5 rounded-lg hover:bg-white transition-colors font-medium"
                      >
                        תצוגה מקדימה
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="btn-primary text-xs px-4 py-1.5"
                      >
                        הורדה ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-[#1E3A5F] truncate">{previewName}</h3>
              <div className="flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="btn-primary text-xs px-3 py-1.5">
                  הורדה ↓
                </a>
                <button onClick={() => setPreviewUrl(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-b-2xl">
              <iframe src={previewUrl} className="w-full h-full min-h-[70vh]" title={previewName} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
