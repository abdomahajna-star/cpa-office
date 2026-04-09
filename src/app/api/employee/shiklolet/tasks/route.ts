import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/employee/shiklolet/tasks — list recent tasks
export async function GET() {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.shikloletTask.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
  });

  // Manually join company names
  const companyIds = [...new Set(tasks.map((t) => t.companyId))];
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true },
  });
  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]));
  const enriched = tasks.map((t) => ({ ...t, company: companyMap[t.companyId] }));

  return NextResponse.json({ tasks: enriched });
}

// POST /api/employee/shiklolet/tasks — create a new export task
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyId, year, month, employeeId, employeeName } = await req.json();
  if (!companyId || !year || !month) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  const task = await prisma.shikloletTask.create({
    data: {
      companyId,
      year,
      month,
      employeeId: employeeId || null,
      employeeName: employeeName || null,
      status: "pending",
    },
  });

  return NextResponse.json({ task });
}
