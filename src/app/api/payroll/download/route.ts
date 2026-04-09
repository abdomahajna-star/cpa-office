import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await req.json();
  const file = await prisma.payrollFile.findUnique({ where: { id: fileId } });

  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Clients can only download their own company's files
  if (session.role === "CLIENT" && file.companyId !== session.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Log the download
  await prisma.downloadLog.create({
    data: {
      userId: session.userId,
      fileType: "payroll",
      payrollFileId: fileId,
    },
  });

  return NextResponse.json({ ok: true, url: file.fileUrl });
}
