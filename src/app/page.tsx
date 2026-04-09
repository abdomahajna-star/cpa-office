import Link from "next/link";
import { prisma } from "@/lib/db";
import ContactForm from "./contact-form";

async function getHomepageData() {
  try {
    const content = await prisma.homepageContent.findUnique({ where: { id: "singleton" } });
    const team = await prisma.user.findMany({
      where: { role: "EMPLOYEE", isActive: true },
      select: { id: true, name: true, title: true, phone: true, photoUrl: true },
    });
    return { content, team };
  } catch {
    return { content: null, team: [] };
  }
}

export default async function HomePage() {
  const { content, team } = await getHomepageData();
  const info = content?.officeInfo as Record<string, string> | null;

  const officeName = info?.name || "משרד רואה חשבון";
  const officeDesc = info?.description || "אנו מספקים שירותי ראיית חשבון, הנהלת חשבונות ושכר בצורה מקצועית ואמינה ללקוחות עסקיים ופרטיים.";
  const officePhone = info?.phone || "";
  const officeEmail = info?.email || "";
  const officeAddress = info?.address || "";

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="bg-[#1E3A5F] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D4AF37] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-lg">{officeName}</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" className="text-slate-300 hover:text-white transition-colors text-sm">אודות</a>
            <a href="#team" className="text-slate-300 hover:text-white transition-colors text-sm">הצוות</a>
            <a href="#contact" className="text-slate-300 hover:text-white transition-colors text-sm">צור קשר</a>
            <Link href="/login" className="bg-[#D4AF37] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#C9A227] transition-colors text-sm">
              כניסה ללקוחות
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-bl from-[#1E3A5F] via-[#162D4A] to-[#0F1F33] text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm text-slate-300 mb-6">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></span>
            שירות מקצועי ואמין
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {officeName}
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            {officeDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="btn-gold px-8 py-3 text-base rounded-xl">
              כניסה לפורטל לקוחות ←
            </Link>
            <a href="#contact" className="btn-secondary px-8 py-3 text-base rounded-xl bg-transparent text-white border-white hover:bg-white/10">
              צור קשר
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICES ───────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1E3A5F] text-center mb-3">השירותים שלנו</h2>
          <p className="text-slate-500 text-center mb-12">פתרונות פיננסיים מקיפים לעסק שלך</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "💰", title: "הנהלת חשבונות", desc: "ניהול ספרים שוטף, דיווחים חודשיים ושנתיים, מע\"מ ומס הכנסה." },
              { icon: "👥", title: "שכר ומשאבי אנוש", desc: "עיבוד שכר חודשי, תלושי שכר דיגיטליים, דיווח לרשויות." },
              { icon: "📊", title: "ייעוץ פיננסי ומס", desc: "תכנון מס, הכנת דוחות שנתיים, ייצוג מול רשות המיסים." },
            ].map((s) => (
              <div key={s.title} className="card hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ───────────────────────────────────────────────────────────── */}
      <section id="team" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1E3A5F] text-center mb-3">הצוות שלנו</h2>
          <p className="text-slate-500 text-center mb-12">אנשי מקצוע מנוסים לשירותך</p>
          {team.length === 0 ? (
            <p className="text-center text-slate-400">אנשי הצוות יוצגו כאן לאחר הגדרתם במערכת.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.id} className="card text-center hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#D4AF37] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 overflow-hidden">
                    {member.photoUrl ? (
                      <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <h3 className="font-bold text-[#1E3A5F]">{member.name}</h3>
                  {member.title && <p className="text-sm text-slate-500 mt-1">{member.title}</p>}
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="text-xs text-[#D4AF37] mt-2 block hover:underline" dir="ltr">
                      {member.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 px-6 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1E3A5F] text-center mb-3">צור קשר</h2>
          <p className="text-slate-500 text-center mb-10">נשמח לענות על כל שאלה</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              {officePhone && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-lg flex items-center justify-center">📞</div>
                  <a href={`tel:${officePhone}`} className="text-[#1E3A5F] font-medium hover:underline" dir="ltr">{officePhone}</a>
                </div>
              )}
              {officeEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-lg flex items-center justify-center">✉️</div>
                  <a href={`mailto:${officeEmail}`} className="text-[#1E3A5F] font-medium hover:underline" dir="ltr">{officeEmail}</a>
                </div>
              )}
              {officeAddress && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1E3A5F]/10 rounded-lg flex items-center justify-center">📍</div>
                  <span className="text-slate-600">{officeAddress}</span>
                </div>
              )}
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1E3A5F] text-white py-8 text-center text-sm">
        <p className="text-slate-400">© {new Date().getFullYear()} {officeName}. כל הזכויות שמורות.</p>
      </footer>
    </div>
  );
}

