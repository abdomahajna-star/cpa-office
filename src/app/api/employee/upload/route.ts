import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFile, payrollPath, bookkeepingPath } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const companyId = formData.get("companyId") as string;
  const fileType = formData.get("fileType") as "payroll" | "bookkeeping";
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  if (!file || !companyId || !fileType || !year || !month) {
    return NextResponse.json({ error: "חסרים שדות" }, { status: 400 });
  }

  // Verify company exists
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return NextResponse.json({ error: "חברה לא נמצאה" }, { status: 404 });

  let fileUrl: string;

  if (fileType === "payroll") {
    const isAllEmployees = formData.get("isAllEmployees") === "true";
    const employeeId = isAllEmployees ? null : (formData.get("employeeId") as string || null);
    const employeeName = isAllEmployees ? null : (formData.get("employeeName") as string || null);

    const label = isAllEmployees ? "all" : (employeeId || "emp");
    const path = payrollPath(companyId, year, month, label, file.name);
    fileUrl = await uploadFile(file, path);

    await prisma.payrollFile.create({
      data: {
        companyId,
        year,
        month,
        employeeId,
        employeeName,
        fileUrl,
        fileName: file.name,
        fileSizeBytes: file.size,
        uploadedById: session.userId,
      },
    });
  } else {
    const category = (formData.get("category") as string) || null;
    const path = bookkeepingPath(companyId, year, month, file.name);
    fileUrl = await uploadFile(file, path);

    await prisma.bookkeepingFile.create({
      data: {
        companyId,
        year,
        month,
        category,
        fileUrl,
        fileName: file.name,
        fileSizeBytes: file.size,
        uploadedById: session.userId,
      },
    });
  }

  return NextResponse.json({ ok: true, fileUrl });
}
