import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());

  const files = await prisma.bookkeepingFile.findMany({
    where: { companyId: session.companyId!, year },
    orderBy: [{ month: "desc" }, { uploadedAt: "desc" }],
    include: { uploadedBy: { select: { name: true } } },
  });

  return NextResponse.json({ files });
}
