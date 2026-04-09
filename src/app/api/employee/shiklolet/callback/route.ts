import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Called by the local Python agent after it has:
 * 1. Exported a PDF from Shiklolet
 * 2. Uploaded it to our storage (or sent the file bytes here)
 *
 * Body: { taskId, status, fileUrl?, errorMsg?, uploadData? }
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-agent-secret");
  if (secret !== process.env.SHIKLOLET_AGENT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { taskId, status, fileUrl, errorMsg } = body;

  if (!taskId || !status) {
    return NextResponse.json({ error: "Missing taskId or status" }, { status: 400 });
  }

  const task = await prisma.shikloletTask.findUnique({ where: { id: taskId } });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  if (status === "done" && fileUrl) {
    // Save the exported file as a PayrollFile for the client to download
    await prisma.payrollFile.create({
      data: {
        companyId: task.companyId,
        year: task.year,
        month: task.month,
        employeeId: task.employeeId ?? null,
        employeeName: task.employeeName ?? null,
        fileUrl,
        fileName: `שיקלולט_${task.year}_${task.month}${task.employeeName ? `_${task.employeeName}` : "_כל_העובדים"}.pdf`,
        uploadedById: "system", // system upload
      },
    });

    await prisma.shikloletTask.update({
      where: { id: taskId },
      data: { status: "done", resultFileUrl: fileUrl },
    });
  } else {
    await prisma.shikloletTask.update({
      where: { id: taskId },
      data: { status: status === "failed" ? "failed" : "processing", errorMsg },
    });
  }

  return NextResponse.json({ ok: true });
}
