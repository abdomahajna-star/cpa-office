import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const content = await prisma.homepageContent.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { officeInfo, teamMembers } = await req.json();

  const content = await prisma.homepageContent.upsert({
    where: { id: "singleton" },
    update: {
      ...(officeInfo && { officeInfo }),
      ...(teamMembers && { teamMembers }),
    },
    create: {
      id: "singleton",
      officeInfo: officeInfo ?? {},
      teamMembers: teamMembers ?? [],
    },
  });

  return NextResponse.json({ content });
}
