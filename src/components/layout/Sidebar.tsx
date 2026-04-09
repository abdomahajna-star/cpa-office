"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: NavItem[];
  userName: string;
  userRole: string;
}

export default function Sidebar({ items, userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const roleLabel: Record<string, string> = {
    ADMIN: "מנהל מערכת",
    EMPLOYEE: "עובד משרד",
    CLIENT: "לקוח",
  };

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-[#1E3A5F] text-white flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D4AF37] rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">משרד רואה חשבון</p>
            <p className="text-xs text-slate-400">{roleLabel[userRole] ?? userRole}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center text-sm font-bold">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-white/15 text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          יציאה
        </button>
      </div>
    </aside>
  );
}
