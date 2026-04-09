import { put, del, head } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob and return its public URL.
 * Files are stored under a path structure:
 *   {type}/{companyId}/{year}/{month}/{filename}
 */
export async function uploadFile(
  file: File | Buffer,
  pathname: string
): Promise<string> {
  const blob = await put(pathname, file, {
    access: "public", // files are URL-protected by signed tokens in practice
    addRandomSuffix: false,
  });
  return blob.url;
}

/**
 * Delete a file from Vercel Blob storage by its URL.
 */
export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

/**
 * Check if a file exists in Vercel Blob.
 */
export async function fileExists(url: string): Promise<boolean> {
  try {
    await head(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Build a storage path for a payroll file.
 */
export function payrollPath(
  companyId: string,
  year: number,
  month: number,
  label: string, // employee ID or "all"
  filename: string
): string {
  return `payroll/${companyId}/${year}/${String(month).padStart(2, "0")}/${label}_${filename}`;
}

/**
 * Build a storage path for a bookkeeping file.
 */
export function bookkeepingPath(
  companyId: string,
  year: number,
  month: number | null,
  filename: string
): string {
  const m = month ? String(month).padStart(2, "0") : "general";
  return `bookkeeping/${companyId}/${year}/${m}/${filename}`;
}
