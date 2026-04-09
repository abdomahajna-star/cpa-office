import { NextRequest, NextResponse } from "next/server";

// Simple contact form endpoint — logs to console in dev, can be extended with email
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name    = formData.get("name") as string;
  const company = formData.get("company") as string;
  const phone   = formData.get("phone") as string;
  const message = formData.get("message") as string;

  console.log("📨 Contact form submission:", { name, company, phone, message });

  // TODO: send email via Resend/Nodemailer/etc.
  // await sendEmail({ to: process.env.OFFICE_EMAIL, subject: `פנייה חדשה מ-${name}`, body: `...` })

  // Redirect back to homepage with success param
  return NextResponse.redirect(new URL("/?contact=sent", req.url));
}
