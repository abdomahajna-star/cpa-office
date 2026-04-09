export type Role = "ADMIN" | "EMPLOYEE" | "CLIENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
  photoUrl?: string;
  phone?: string;
  isActive: boolean;
  companyId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface PayrollFile {
  id: string;
  companyId: string;
  year: number;
  month: number;
  employeeId?: string;
  employeeName?: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  uploadedBy: { name: string };
  uploadedAt: string;
}

export interface BookkeepingFile {
  id: string;
  companyId: string;
  year: number;
  month?: number;
  category?: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  uploadedBy: { name: string };
  uploadedAt: string;
}

export interface Message {
  id: string;
  companyId: string;
  senderRole: Role;
  subject: string;
  body: string;
  replyBody?: string;
  repliedAt?: string;
  createdAt: string;
  sender: { name: string };
  company: { name: string };
}

export interface DownloadLog {
  id: string;
  downloadedAt: string;
  fileType: string;
  user: { name: string; email: string; role: Role };
  payrollFile?: { fileName: string; company: { name: string } };
  bookkeepingFile?: { fileName: string; company: { name: string } };
}

export const MONTHS_HE = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];
