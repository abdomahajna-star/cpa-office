export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PortalDashboard() {
  const session = await getSession();
  const company = session?.companyId
    ? await prisma.company.findUnique({ where: { id: session.companyId }, select: { name: true } })
    : null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E3A5F]">×©×××, {session?.name} ð</h1>
        <p className="text-slate-500 mt-1">
          {company ? `××¨×××× ××××× ××¤××¨×× ×©× ${company.name}` : "××¨×××× ××××× ××¤××¨×× ×××§××××ª"}
        </p>
      </div>

      {/* Main topic buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Link
          href="/portal/payroll"
          className="group card hover:shadow-lg transition-all border-2 border-transparent hover:border-[#1E3A5F] cursor-pointer"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#2D5A8E] flex items-center justify-center text-white text-3xl shadow-md group-hover:scale-105 transition-transform">
              ð°
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E3A5F] group-hover:text-[#D4AF37] transition-colors">
                ×ª×××©× ×©××¨
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                ×¦×¤××× ××××¨×× ×©× ×ª×××©× ×©××¨ ××¤× ××××© ××¢×××
              </p>
              <span className="inline-flex items-center text-xs text-[#1E3A5F] font-medium mt-2">
                ×××¥ ××× ××¡× â
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/portal/bookkeeping"
          className="group card hover:shadow-lg transition-all border-2 border-transparent hover:border-[#1E3A5F] cursor-pointer"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8920F] flex items-center justify-center text-white text-3xl shadow-md group-hover:scale-105 transition-transform">
              ð
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E3A5F] group-hover:text-[#D4AF37] transition-colors">
                ×§××¦× ×× ×××ª ××©××× ××ª
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                ×××××ª, ×××× ××, ×××××××× ××©××× ××××
              </p>
              <span className="inline-flex items-center text-xs text-[#1E3A5F] font-medium mt-2">
                ×××¥ ××× ××¡× â
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "××©××××ª ××¤× ×××ª", icon: "ð¨", href: "/portal/messages", cta: "×©×× ××××¢×" },
          { label: "×¦×¨×× ×¢××¨×?", icon: "ð", href: "#", cta: "×¦××¨ ×§×©×¨ ×¢× ×××©×¨×" },
          { label: "×ª×××©× ×©××¨", icon: "ð", href: "/portal/payroll", cta: "×××¨×××× ×ª×××©××" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="card hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-3">{item.icon}</div>
            <p className="text-sm text-slate-500 mb-2">{item.label}</p>
            <span className="text-xs font-semibold text-[#1E3A5F] hover:underline">{item.cta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
