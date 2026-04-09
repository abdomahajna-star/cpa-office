"use client";

export default function ContactForm() {
  return (
    <form
      action="/api/contact"
      method="POST"
      className="space-y-4"
    >
      <div>
        <label className="label">שם מלא</label>
        <input name="name" required className="input" placeholder="ישראל ישראלי" />
      </div>
      <div>
        <label className="label">שם החברה</label>
        <input name="company" className="input" placeholder='חברה בע"מ' />
      </div>
      <div>
        <label className="label">טלפון</label>
        <input name="phone" className="input" placeholder="050-0000000" dir="ltr" />
      </div>
      <div>
        <label className="label">הודעה</label>
        <textarea name="message" rows={3} className="input resize-none" placeholder="כתוב הודעה כאן..." />
      </div>
      <button type="submit" className="btn-primary w-full text-center">שלח פנייה</button>
    </form>
  );
}
