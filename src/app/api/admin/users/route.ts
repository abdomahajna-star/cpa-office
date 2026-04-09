import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/users
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { company: { select: { name: true } } },
    select: {
      id: true, name: true, email: true, role: true,
      title: true, phone: true, isActive: true,
      companyId: true, createdAt: true,
      company: { select: { name: true } },
    },
  });

  return NextResponse.json({ users });
}

// POST /api/admin/users
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password, role, companyId, title, phone } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "אימייל כבר קיים במערכת" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name, email, passwordHash,
      role: role as "ADMIN" | "EMPLOYEE" | "CLIENT",
      companyId: role === "CLIENT" ? companyId : null,
      title: role === "EMPLOYEE" ? title : null,
      phone: role === "EMPLOYEE" ? phone : null,
    },
  });

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
