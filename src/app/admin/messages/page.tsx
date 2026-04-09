"use client";
import { useEffect, useState } from "react";

interface Message { id: string; subject: string; body: string; replyBody?: string; createdAt: string; sender: { name: string }; company: { name: string }; }

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("pending");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/messages");
    const d = await r.json();
    setMessages(d.messages ?? []);
    setLoading(false);
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    await fetch(`/api/admin/messages/${selected.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ replyBody: reply }),
    });
    setReply("");
    setSelected(null);
    load();
    setSending(false);
  }

  const filtered = messages.filter((m) => {
    if (filter === "pending") return !m.replyBody;
    if (filter === "replied") return !!m.replyBody;
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-8">הודעות לקוחות</h1>

      <div className="flex gap-2 mb-6">
        {[["pending", "ממתין למענה"], ["replied", "נענו"], ["all", "הכל"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v as "all" | "pending" | "replied")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === v ? "bg-[#1E3A5F] text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-10 text-slate-400">אין הודעות</div>
          ) : filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => { setSelected(msg); setReply(""); }}
              className={`card cursor-pointer hover:shadow-md transition-all ${selected?.id === msg.id ? "border-2 border-[#1E3A5F]" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#1E3A5F] text-sm">{msg.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{msg.sender.name} · {msg.company.name}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{msg.body}</p>
                </div>
                <span className={`badge shrink-0 ${msg.replyBody ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {msg.replyBody ? "נענתה" : "ממתין"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{new Date(msg.createdAt).toLocaleDateString("he-IL")}</p>
            </div>
          ))}
        </div>

        {/* Reply panel */}
        {selected ? (
          <div className="card sticky top-6 self-start">
            <h3 className="font-bold text-[#1E3A5F] mb-1">{selected.subject}</h3>
            <p className="text-xs text-slate-400 mb-4">{selected.sender.name} · {selected.company.name}</p>
            <div className="bg-slate-50 rounded-xl p-3 mb-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.body}</p>
            </div>
            {selected.replyBody ? (
              <div className="bg-green-50 border-r-4 border-green-500 rounded-xl p-3">
                <p className="text-xs text-green-600 mb-1 font-medium">תשובתך:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.replyBody}</p>
              </div>
            ) : (
              <>
                <label className="label">תשובה</label>
                <textarea
                  className="input resize-none"
                  rows={5}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="כתוב תשובה..."
                />
                <div className="flex gap-3 mt-3">
                  <button onClick={sendReply} disabled={!reply.trim() || sending} className="btn-primary flex-1">
                    {sending ? "שולח..." : "שלח תשובה"}
                  </button>
                  <button onClick={() => setSelected(null)} className="btn-secondary">סגור</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="card flex items-center justify-center min-h-[200px] text-slate-300">
            <p>בחר הודעה לצפייה ומענה</p>
          </div>
        )}
      </div>
    </div>
  );
}
