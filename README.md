<div align="center">
<img width="1200" height="475" alt="INTENSIVE Center Banner" src=">

# 🏛️ INTENSIVE – Nemis Tili O‘quv Markazi Platformasi
### Full-Stack Management System & Lead Generation Platform

[Live Demo](https://intensive-nemis-tili.uz/) | [Admin Panel](#) | [Report Bug](https://github.com/bekulugbekov/repo/issues)
</div>

---

## 📝 Loyiha haqida
**INTENSIVE** — nemis tili o‘quv markazi uchun ishlab chiqilgan professional veb-platforma. Loyiha o‘quv markazi faoliyatini raqamlashtirish, yangi mijozlarni (leads) jalb qilish va o‘quv jarayonlarini boshqarishga xizmat qiladi. Tizim o‘z ichiga foydalanuvchilar uchun portal va ma’murlar uchun keng qamrovli **Admin Dashboard**ni oladi.

## 🚀 Asosiy Imkoniyatlar

### 🌐 Foydalanuvchilar uchun:
- **Kurslar Katalogi:** Mavjud nemis tili kurslari haqida batafsil ma'lumot (davomiyligi, narxi, darajasi).
- **O‘qituvchilar Profili:** Markaz mutaxassislari va ularning tajribasi bilan tanishish.
- **Lead Generation:** Kursga yozilish yoki ma'lumot olish uchun qulay aloqa shakllari.
- **Tezkor Xabarnoma:** Saytdan yuborilgan har bir ariza **Telegram Bot** orqali maxsus guruhga real-vaqt rejimida yuboriladi.

### 🔐 Admin Panel (Dashboard):
- **Auth System:** Supabase Authentication orqali himoyalangan kirish tizimi (faqat vakolatli xodimlar uchun).
- **CRM & Message Management:** Kelib tushgan arizalarni boshqarish (Statuslar: *Pending, Contacted, Rejected, Enrolled*).
- **Content Management (CMS):** Saytdagi kurslar, o'qituvchilar tarkibi va umumiy ma'lumotlarni dinamik o'zgartirish.
- **Analytics:** Markaz faoliyati bo'yicha asosiy ko'rsatkichlar monitoringi.

## 🛠 Texnologiyalar
* **Frontend:** React.js, Vite
* **Backend:** Node.js, Express.js
* **Database & Auth:** Supabase (PostgreSQL)
* **Notifications:** Telegram Bot API
* **Styling:** Tailwind CSS

## 📂 Loyiha Strukturasi (Full-stack)
/
├── src/
│   ├── components/      # Reusable UI komponentlari (shadcn, formalar, modallar)
│   ├── context/         # Global holat va ma'lumotlar boshqaruvi (DataContext, AuthContext)
│   ├── hooks/           # Maxsus React hooklari (useTeacherPortraits va boshqalar)
│   ├── lib/             # Uchinchi tomon xizmatlari va kutubxonalar (Supabase mijoz sozlamalari)
│   ├── locales/         # Til fayllari (i18n: en.json, uz.json, ru.json)
│   ├── services/        # Tashqi API xizmatlari (Telegram bot xabarnomalari)
│   ├── App.tsx          # Asosiy ilova komponenti
│   ├── main.tsx         # Ilova kirish nuqtasi
│   └── index.css        # Global uslublar (Tailwind CSS)
├── index.html           # HTML kirish fayli
├── package.json         # Loyiha bog'liqliklari va skriptlar
├── tailwind.config.js   # Tailwind konfiguratsiyasi
└── tsconfig.json        # TypeScript sozlamalari
