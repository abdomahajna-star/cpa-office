import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// One-time migration endpoint — DELETE after use
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (secret !== "cpa-migrate-2026") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Run prisma db push equivalent via raw SQL
    // The tables are created via Prisma's migration engine on Vercel build
    // This just verifies connectivity and returns table list
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connection OK",
      tables 
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
