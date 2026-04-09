import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await req.json();
  const file = await prisma.bookkeepingFile.findUnique({ where: { id: fileId } });

  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.role === "CLIENT" && file.companyId !== session.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.downloadLog.create({
    data: { userId: session.userId, fileType: "bookkeeping", bookkeepingFileId: fileId },
  });

  return NextResponse.json({ ok: true, url: file.fileUrl });
}
