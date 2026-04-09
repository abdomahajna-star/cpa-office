import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ONE-TIME SEED — DELETE AFTER USE
export async function POST(req: NextRequest) {
  const { secret, name, email, password } = await req.json();
  if (secret !== "cpa-seed-2026-once") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "user already exists" }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "ADMIN" },
  });
  return NextResponse.json({ ok: true, id: user.id, email: user.email });
}
