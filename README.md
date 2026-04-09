# 🧾 פורטל לקוחות – משרד רואה חשבון

פלטפורמת Next.js 15 לניהול מסמכים, תלושי שכר וקבצי הנהלת חשבונות בין המשרד ללקוחותיו.

---

## ✨ תכונות עיקריות

- **דף בית ציבורי** — פרטי משרד, צוות, טופס יצירת קשר
- **שלושה תפקידים**: מנהל / עובד / לקוח
- **פורטל לקוח** — צפייה והורדה של תלושי שכר וקבצי הנהלת חשבונות
- **סינון חכם** — שנה / חודש / עובד
- **תצוגת PDF מובנית** — ישירות בדפדפן לפני הורדה
- **סוכן שיקלולט** — ייצוא אוטומטי מתוכנת שיקלולט על מחשב המשרד
- **העלאת קבצים בכמות** — גרירה ושחרור של מספר PDFs בו-זמנית
- **תיבת הודעות** — תקשורת בין לקוחות לצוות המשרד
- **לוג הורדות מלא** — כל מה שהורד, מתי, ועל ידי מי
- **עברית RTL מלאה**

---

## 🚀 התקנה ועלייה לאוויר

### דרישות מוקדמות
- Node.js 20+
- חשבון Neon (PostgreSQL) — [neon.tech](https://neon.tech)
- חשבון Vercel — [vercel.com](https://vercel.com)
- Vercel Blob Storage (מופעל בדשבורד של Vercel)

---

### שלב 1: התקנת התלויות

```bash
cd cpa-office
npm install
```

---

### שלב 2: הגדרת משתני הסביבה

```bash
cp .env.example .env.local
```

ערוך את `.env.local`:

```env
DATABASE_URL=postgresql://...   # מ-Neon
JWT_SECRET=...                  # מחרוזת אקראית ארוכה
BLOB_READ_WRITE_TOKEN=...        # מ-Vercel Blob
SHIKLOLET_AGENT_SECRET=...      # סוד לסוכן שיקלולט (בחר בעצמך)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### שלב 3: יצירת מסד הנתונים

```bash
npx prisma db push
```

---

### שלב 4: יצירת משתמש מנהל ראשון

הרץ את הסקריפט הבא פעם אחת:

```bash
npx ts-node scripts/seed-admin.ts
```

או ישירות מה-Prisma Studio:

```bash
npx prisma studio
```

הוסף שורה ל-`User` עם:
- `role: ADMIN`
- `passwordHash`: הרץ `node -e "const b = require('bcryptjs'); console.log(b.hashSync('yourPassword', 12))"`

---

### שלב 5: הרצה מקומית

```bash
npm run dev
```

פתח: [http://localhost:3000](http://localhost:3000)

---

### שלב 6: פריסה ל-Vercel

```bash
# התחבר ל-Vercel
npx vercel login

# פרוס
npx vercel --prod
```

הוסף את כל משתני הסביבה גם ב-Vercel Dashboard → Settings → Environment Variables.

---

## 🤖 הגדרת סוכן שיקלולט (על מחשב המשרד)

הסוכן רץ על **המחשב שבו מותקנת שיקלולט** ומייצא תלושים באוטומט.

```bash
cd automation

# התקן תלויות Python
pip install -r requirements.txt

# הגדר קובץ סביבה
copy .env.agent.example .env.agent
# ערוך את .env.agent עם הערכים הנכונים

# הכן תמונות ייחוס (קרא את setup_images_guide.md)

# הרץ את הסוכן
python shiklolet_agent.py
```

**חשוב**: ה-`AGENT_SECRET` חייב להיות זהה ל-`SHIKLOLET_AGENT_SECRET` שהגדרת ב-.env של האתר.

הסוכן פועל ברקע ומתעדכן כל 30 שניות. ניתן להריץ אותו כ-Windows Service להפעלה אוטומטית עם החלון.

---

## 📁 מבנה הפרויקט

```
cpa-office/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # דף בית ציבורי
│   │   ├── login/                    # עמוד כניסה
│   │   ├── portal/                   # פאנל לקוח
│   │   │   ├── payroll/              # תלושי שכר
│   │   │   ├── bookkeeping/          # הנהלת חשבונות
│   │   │   └── messages/             # הודעות
│   │   ├── employee/                 # פאנל עובד
│   │   │   ├── upload/               # העלאת קבצים
│   │   │   └── shiklolet/            # ממשק שיקלולט
│   │   ├── admin/                    # פאנל מנהל
│   │   │   ├── users/                # ניהול משתמשים
│   │   │   ├── companies/            # ניהול חברות
│   │   │   ├── messages/             # מענה להודעות
│   │   │   ├── logs/                 # לוג הורדות
│   │   │   └── homepage/             # עריכת דף הבית
│   │   └── api/                      # כל נקודות הקצה
│   ├── lib/
│   │   ├── db.ts                     # Prisma client
│   │   ├── auth.ts                   # JWT sessions
│   │   └── storage.ts                # Vercel Blob
│   ├── components/
│   │   └── layout/Sidebar.tsx        # ניווט צדדי
│   └── types/index.ts                # TypeScript types
├── prisma/schema.prisma              # מודל מסד הנתונים
├── automation/
│   ├── shiklolet_agent.py            # סוכן האוטומציה
│   ├── requirements.txt
│   └── setup_images_guide.md         # מדריך הכנת תמונות
└── README.md
```

---

## 🔐 אבטחה

- סיסמאות מוצפנות עם bcrypt (12 rounds)
- JWT מוצפן עם HS256, תוקף 8 שעות
- לקוחות רואים **רק** את הקבצים של החברה שלהם (אכיפה בשרת)
- סוכן שיקלולט מאומת עם סוד ייחודי בכל בקשה
- קישורי קבצים דרך Vercel Blob (לא חשופים לציבור)

---

## 📞 תמיכה

לשאלות טכניות — פנה למפתח שהקים את המערכת.
