import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// The local agent pings this endpoint every 30s to say it's alive
// GET — check if agent sent a heartbeat in the last 60 seconds
export async function GET() {
  const recent = await prisma.shikloletTask.findFirst({
    where: {
      status: { in: ["pending", "processing", "done"] },
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }, // tasks from last 24h
    },
  });

  // Check for a special "heartbeat" task created by the agent
  const heartbeat = await prisma.shikloletTask.findFirst({
    where: {
      status: "done",
      employeeId: "__heartbeat__",
      updatedAt: { gte: new Date(Date.now() - 1000 * 90) }, // within 90 seconds
    },
  });

  return NextResponse.json({ online: !!heartbeat });
}

// POST — agent calls this to report its heartbeat
export async function POST(req: Request) {
  const secret = req.headers.get("x-agent-secret");
  if (secret !== process.env.SHIKLOLET_AGENT_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Upsert heartbeat record
  await prisma.shikloletTask.upsert({
    where: { id: "heartbeat" },
    update: { status: "done", updatedAt: new Date() },
    create: {
      id: "heartbeat",
      companyId: "system",
      year: 0,
      month: 0,
      employeeId: "__heartbeat__",
      status: "done",
    },
  });

  // Return any pending tasks for the agent to process
  const pendingTasks = await prisma.shikloletTask.findMany({
    where: { status: "pending", employeeId: { not: "__heartbeat__" } },
    take: 5,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ tasks: pendingTasks });
}
