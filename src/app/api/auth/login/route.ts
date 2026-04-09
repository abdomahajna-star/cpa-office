import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "נדרשים אימייל וסיסמה" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "אימייל או סיסמה שגויים" }, { status: 401 });
  }

  await createSession({
    userId: user.id,
    role: user.role as "ADMIN" | "EMPLOYEE" | "CLIENT",
    companyId: user.companyId ?? undefined,
    name: user.name,
  });

  return NextResponse.json({ role: user.role, name: user.name });
}
