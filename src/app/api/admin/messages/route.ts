import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { name: true } },
      company: { select: { name: true } },
    },
  });

  return NextResponse.json({ messages });
}
