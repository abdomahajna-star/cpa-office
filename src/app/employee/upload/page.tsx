"use client";
import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { MONTHS_HE } from "@/types";

interface Company { id: string; name: string; }
interface QueuedFile { file: File; employeeId: string; employeeName: string; isAllEmployees: boolean; }

export default function UploadPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [fileType, setFileType] = useState<"payroll" | "bookkeeping">("payroll");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [category, setCategory] = useState("");
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ name: string; ok: boolean }[]>([]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetch("/api/admin/companies").then((r) => r.json()).then((d) => setCompanies(d.companies ?? []));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: QueuedFile[] = acceptedFiles.map((file) => ({
      file,
      employeeId: "",
      employeeName: "",
      isAllEmployees: fileType === "payroll" ? false : true,
    }));
    setQueue((q) => [...q, ...newItems]);
  }, [fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  function updateQueueItem(i: number, patch: Partial<QueuedFile>) {
    setQueue((q) => q.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  }

  function removeQueueItem(i: number) {
    setQueue((q) => q.filter((_, idx) => idx !== i));
  }

  async function handleUpload() {
    if (!companyId) { alert("בחר לקוח"); return; }
    if (queue.length === 0) { alert("הוסף קבצים"); return; }
    setUploading(true);
    setResults([]);
    const res: { name: string; ok: boolean }[] = [];

    for (const item of queue) {
      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("companyId", companyId);
      fd.append("fileType", fileType);
      fd.append("year", String(year));
      fd.append("month", String(month));
      if (fileType === "payroll") {
        fd.append("isAllEmployees", String(item.isAllEmployees));
        fd.append("employeeId", item.employeeId);
        fd.append("employeeName", item.employeeName);
      } else {
        fd.append("category", category);
      }

      try {
        const r = await fetch("/api/employee/upload", { method: "POST", body: fd });
        res.push({ name: item.file.name, ok: r.ok });
      } catch {
        res.push({ name: item.file.name, ok: false });
      }
    }

    setResults(res);
    if (res.every((r) => r.ok)) setQueue([]);
    setUploading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">העלאת קבצים</h1>
      <p className="text-slate-500 mb-8">בחר לקוח, סוג קובץ, ולאחר מכן גרור קבצי PDF</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left column: settings */}
        <div className="card space-y-4">
          <h2 className="font-bold text-[#1E3A5F]">הגדרות העלאה</h2>

          <div>
            <label className="label">לקוח</label>
            <select className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
              <option value="">-- בחר לקוח --</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">סוג קובץ</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFileType("payroll")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${fileType === "payroll" ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" : "border-slate-200 text-slate-600 hover:border-[#1E3A5F]"}`}
              >
                💰 תלושי שכר
              </button>
              <button
                type="button"
                onClick={() => setFileType("bookkeeping")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${fileType === "bookkeeping" ? "border-[#1E3A5F] bg-[#1E3A5F] text-white" : "border-slate-200 text-slate-600 hover:border-[#1E3A5F]"}`}
              >
                📁 הנהלת חשבונות
              </button>
            </div>
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

          {fileType === "bookkeeping" && (
            <div>
              <label className="label">קטגוריה (אופציונלי)</label>
              <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder='דוח מע"מ, מאזן...' />
            </div>
          )}
        </div>

        {/* Right column: dropzone */}
        <div className="card flex flex-col">
          <h2 className="font-bold text-[#1E3A5F] mb-4">גרור קבצים</h2>
          <div
            {...getRootProps()}
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer transition-colors min-h-[160px] ${isDragActive ? "border-[#1E3A5F] bg-[#1E3A5F]/5" : "border-slate-200 hover:border-[#1E3A5F]/50"}`}
          >
            <input {...getInputProps()} />
            <div className="text-4xl mb-3">📄</div>
            <p className="text-sm text-slate-500 text-center">
              {isDragActive ? "שחרר את הקבצים כאן" : "גרור ושחרר קבצי PDF כאן, או לחץ לבחירה"}
            </p>
            <p className="text-xs text-slate-400 mt-1">ניתן להעלות מספר קבצים בו זמנית</p>
          </div>
        </div>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-[#1E3A5F] mb-4">קבצים בתור ({queue.length})</h2>
          <div className="space-y-3">
            {queue.map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>📄</span>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-xs">{item.file.name}</p>
                    <span className="text-xs text-slate-400">{(item.file.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <button onClick={() => removeQueueItem(i)} className="text-red-400 hover:text-red-600 text-sm">הסר</button>
                </div>

                {fileType === "payroll" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.isAllEmployees}
                        onChange={(e) => updateQueueItem(i, { isAllEmployees: e.target.checked })}
                        className="rounded"
                      />
                      סיכום כל העובדים
                    </label>
                    {!item.isAllEmployees && (
                      <>
                        <input
                          className="input text-sm"
                          placeholder="מספר עובד / ת.ז."
                          value={item.employeeId}
                          onChange={(e) => updateQueueItem(i, { employeeId: e.target.value })}
                        />
                        <input
                          className="input text-sm"
                          placeholder="שם העובד"
                          value={item.employeeName}
                          onChange={(e) => updateQueueItem(i, { employeeName: e.target.value })}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button onClick={handleUpload} disabled={uploading || !companyId} className="btn-primary">
              {uploading ? "מעלה..." : `העלה ${queue.length} קבצים ↑`}
            </button>
            <button onClick={() => setQueue([])} className="btn-secondary text-sm">נקה הכל</button>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-[#1E3A5F] mb-3">תוצאות העלאה</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${r.ok ? "bg-green-50" : "bg-red-50"}`}>
                <span>{r.ok ? "✅" : "❌"}</span>
                <span className="text-sm">{r.name}</span>
                <span className={`text-xs font-medium ${r.ok ? "text-green-600" : "text-red-600"}`}>
                  {r.ok ? "הועלה בהצלחה" : "שגיאה בהעלאה"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
