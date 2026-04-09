import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function EmployeeDashboard() {
  const companies = await prisma.company.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { payrollFiles: true, bookkeepingFiles: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">לקוחות</h1>
          <p className="text-slate-500 mt-1">בחר לקוח להעלאה או צפייה בקבצים</p>
        </div>
        <Link href="/employee/upload" className="btn-primary">
          + העלאת קבצים
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
          <p className="text-5xl mb-4">🏢</p>
          <p>אין לקוחות פעילים במערכת. בקש מהמנהל להוסיף לקוחות.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/employee/clients/${company.id}`}
              className="card hover:shadow-md transition-all hover:border-[#1E3A5F] border-2 border-transparent group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2D5A8E] flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {company.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#1E3A5F] group-hover:text-[#D4AF37] transition-colors truncate">
                    {company.name}
                  </h3>
                  {company.contactName && (
                    <p className="text-sm text-slate-500 mt-0.5">{company.contactName}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-400">
                      📄 {company._count.payrollFiles} תלושים
                    </span>
                    <span className="text-xs text-slate-400">
                      📁 {company._count.bookkeepingFiles} קבצים
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
