"use client";
import { useEffect, useState } from "react";

interface Message {
  id: string;
  subject: string;
  body: string;
  replyBody?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { loadMessages(); }, []);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data.messages ?? []);
    } finally { setLoading(false); }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSuccess(false);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      setSubject("");
      setBody("");
      setSuccess(true);
      loadMessages();
    } finally { setSending(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">הודעות</h1>
      <p className="text-slate-500 mb-8">שלח הודעה למשרד וקבל תשובה</p>

      {/* Send form */}
      <div className="card mb-8">
        <h2 className="font-bold text-[#1E3A5F] mb-4">שליחת הודעה חדשה</h2>
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
            ✓ הודעתך נשלחה בהצלחה! נחזור אליך בהקדם.
          </div>
        )}
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="label">נושא</label>
            <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="למשל: שאלה לגבי תלוש שכר" />
          </div>
          <div>
            <label className="label">הודעה</label>
            <textarea className="input resize-none" rows={4} value={body} onChange={(e) => setBody(e.target.value)} required placeholder="כתוב את הודעתך כאן..." />
          </div>
          <button type="submit" className="btn-primary" disabled={sending}>
            {sending ? "שולח..." : "שלח הודעה"}
          </button>
        </form>
      </div>

      {/* Previous messages */}
      <h2 className="font-bold text-[#1E3A5F] mb-4">הודעות קודמות</h2>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">אין הודעות עדיין</div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="card cursor-pointer hover:shadow-md transition-shadow" onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${msg.replyBody ? "bg-green-400" : "bg-amber-400"}`} />
                  <div>
                    <p className="font-semibold text-[#1E3A5F] text-sm">{msg.subject}</p>
                    <p className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleDateString("he-IL")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${msg.replyBody ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {msg.replyBody ? "נענתה" : "ממתין לתגובה"}
                  </span>
                  <span className="text-slate-400 text-sm">{expanded === msg.id ? "▲" : "▼"}</span>
                </div>
              </div>
              {expanded === msg.id && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">ההודעה שלי:</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.body}</p>
                  </div>
                  {msg.replyBody && (
                    <div className="bg-[#1E3A5F]/5 rounded-xl p-3 border-r-4 border-[#1E3A5F]">
                      <p className="text-xs text-slate-400 mb-1">תשובת המשרד:</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.replyBody}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
