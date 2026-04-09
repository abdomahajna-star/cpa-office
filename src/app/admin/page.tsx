import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [totalCompanies, totalClients, totalPayroll, totalBookkeeping, recentDownloads, pendingMessages] = await Promise.all([
    prisma.company.count({ where: { status: "active" } }),
    prisma.user.count({ where: { role: "CLIENT", isActive: true } }),
    prisma.payrollFile.count(),
    prisma.bookkeepingFile.count(),
    prisma.downloadLog.count(),
    prisma.message.count({ where: { replyBody: null } }),
  ]);

  const recentLogs = await prisma.downloadLog.findMany({
    take: 8,
    orderBy: { downloadedAt: "desc" },
    include: {
      user: { select: { name: true } },
      payrollFile: { select: { fileName: true, company: { select: { name: true } } } },
      bookkeepingFile: { select: { fileName: true, company: { select: { name: true } } } },
    },
  });

  const stats = [
    { label: "לקוחות פעילים", value: totalCompanies, icon: "🏢", href: "/admin/companies", color: "bg-blue-50 text-blue-700" },
    { label: "משתמשי לקוח", value: totalClients, icon: "👤", href: "/admin/users", color: "bg-purple-50 text-purple-700" },
    { label: "תלושי שכר", value: totalPayroll, icon: "💰", href: "#", color: "bg-green-50 text-green-700" },
    { label: "קבצי הנהלת חשבונות", value: totalBookkeeping, icon: "📁", href: "#", color: "bg-amber-50 text-amber-700" },
    { label: "הורדות סה\"כ", value: recentDownloads, icon: "📥", href: "/admin/logs", color: "bg-slate-50 text-slate-700" },
    { label: "הודעות ללא מענה", value: pendingMessages, icon: "📨", href: "/admin/messages", color: pendingMessages > 0 ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1E3A5F] mb-8">לוח ניהול</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E3A5F]">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: "הוסף לקוח", icon: "➕", href: "/admin/companies?new=1" },
          { label: "הוסף משתמש", icon: "👤", href: "/admin/users?new=1" },
          { label: "צפה בהודעות", icon: "📨", href: "/admin/messages" },
          { label: "לוג הורדות", icon: "📋", href: "/admin/logs" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="card text-center hover:shadow-md transition-shadow hover:bg-[#1E3A5F] hover:text-white group">
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-sm font-semibold text-[#1E3A5F] group-hover:text-white">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent download log */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1E3A5F]">הורדות אחרונות</h2>
          <Link href="/admin/logs" className="text-sm text-[#1E3A5F] hover:underline">כל הלוג ←</Link>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">אין הורדות עדיין</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log) => {
              const file = log.payrollFile || log.bookkeepingFile;
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{log.user.name}</p>
                    <p className="text-xs text-slate-400">
                      {file?.company?.name} · {file?.fileName}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">{new Date(log.downloadedAt).toLocaleString("he-IL")}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
