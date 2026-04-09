import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { replyBody } = await req.json();

  if (!replyBody?.trim()) {
    return NextResponse.json({ error: "תשובה לא יכולה להיות ריקה" }, { status: 400 });
  }

  const message = await prisma.message.update({
    where: { id },
    data: {
      replyBody,
      repliedAt: new Date(),
      repliedById: session.userId,
    },
  });

  return NextResponse.json({ message });
}
