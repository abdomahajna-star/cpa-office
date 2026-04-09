"use client";
import { useEffect, useState } from "react";
import { MONTHS_HE } from "@/types";

interface BookFile {
  id: string;
  year: number;
  month?: number;
  category?: string;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  uploadedAt: string;
}

export default function BookkeepingPage() {
  const currentYear = new Date().getFullYear();
  const [files, setFiles] = useState<BookFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [category, setCategory] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const categories = [...new Set(files.map((f) => f.category).filter(Boolean))] as string[];

  useEffect(() => { loadFiles(); }, [year]);

  async function loadFiles() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookkeeping?year=${year}`);
      const data = await res.json();
      setFiles(data.files ?? []);
    } finally { setLoading(false); }
  }

  const filtered = files.filter((f) => !category || f.category === category);

  async function handleDownload(file: BookFile) {
    await fetch("/api/bookkeeping/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: file.id }),
    });
    window.open(file.fileUrl, "_blank");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">קבצי הנהלת חשבונות</h1>
      <p className="text-slate-500 mb-8">דוחות, מאזנים, ודיווחים חשבונאיים</p>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">שנה</label>
            <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label">קטגוריה</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">כל הקטגוריות</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-slate-500 font-medium">לא נמצאו קבצים לפי הסינון שנבחר</p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-2">
            {filtered.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{file.fileName}</p>
                    <p className="text-xs text-slate-400">
                      {file.category && `${file.category} · `}
                      {file.month ? `${MONTHS_HE[file.month - 1]} ` : ""}{file.year}
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
                  <button onClick={() => handleDownload(file)} className="btn-primary text-xs px-4 py-1.5">
                    הורדה ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-[#1E3A5F] truncate">{previewName}</h3>
              <div className="flex items-center gap-2">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="btn-primary text-xs px-3 py-1.5">הורדה ↓</a>
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
