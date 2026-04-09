import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
  const limit = 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.downloadLog.findMany({
      skip,
      take: limit,
      orderBy: { downloadedAt: "desc" },
      include: {
        user: { select: { name: true, email: true, role: true } },
        payrollFile: { select: { fileName: true, year: true, month: true, company: { select: { name: true } } } },
        bookkeepingFile: { select: { fileName: true, year: true, month: true, company: { select: { name: true } } } },
      },
    }),
    prisma.downloadLog.count(),
  ]);

  return NextResponse.json({ logs, total, pages: Math.ceil(total / limit) });
}
