import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET — returns all companies (used by employees too for upload)
export async function GET() {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    where: { status: "active" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, contactName: true, phone: true, email: true, status: true, createdAt: true },
  });

  return NextResponse.json({ companies });
}

// POST — create a new company (admin only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, contactName, phone, email } = await req.json();
  if (!name) return NextResponse.json({ error: "שם חברה חובה" }, { status: 400 });

  const company = await prisma.company.create({ data: { name, contactName, phone, email } });
  return NextResponse.json({ company });
}
