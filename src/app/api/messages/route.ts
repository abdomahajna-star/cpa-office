import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/messages — client sees their own messages
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { companyId: session.companyId! },
    orderBy: { createdAt: "desc" },
    include: { sender: { select: { name: true } }, company: { select: { name: true } } },
  });

  return NextResponse.json({ messages });
}

// POST /api/messages — client sends a message
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body } = await req.json();
  if (!subject || !body) {
    return NextResponse.json({ error: "נדרשים נושא והודעה" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      companyId: session.companyId!,
      senderId: session.userId,
      senderRole: "CLIENT",
      subject,
      body,
    },
  });

  return NextResponse.json({ message });
}
