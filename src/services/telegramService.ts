export const sendTelegramMessage = async (
  name: string, 
  phone: string, 
  course: string, 
  teacher?: string, 
  schedule?: string,
  email?: string,
  contactMethod?: string
) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    console.error('Telegram sozlamalari topilmadi.');
    return false;
  }

  // 1. Asosiy xabarni shakllantirish (HTML formatida)
  let message = course === 'Konsultatsiya' 
    ? `<b>👤 Yangi mijoz (Konsultatsiya):</b>\n` 
    : `<b>🎓 Yangi o'quvchi (Kursga yozilish):</b>\n`;

  message += `\n👤 <b>Ismi:</b> ${name}`;
  message += `\n📞 <b>Telefon:</b> ${phone}`;

  // 2. Faqat ma'lumot bor qatorlarni qo'shish (Dinamik tekshiruv)
  if (email && email !== '-') {
    message += `\n📧 <b>Email:</b> ${email}`;
  }
  
  if (contactMethod && contactMethod !== '-') {
    message += `\n💬 <b>Aloqa usuli:</b> ${contactMethod}`;
  }

  if (course !== 'Konsultatsiya') {
    if (course) message += `\n📚 <b>Kurs:</b> ${course}`;
    if (teacher && teacher !== '-') message += `\n👨‍🏫 <b>O'qituvchi:</b> ${teacher}`;
    if (schedule && schedule !== '-') message += `\n⏰ <b>Vaqt:</b> ${schedule}`;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: message,
        parse_mode: 'HTML' // Qalin yozuvlar ishlashi uchun shart
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Telegram xizmati xatosi:', error);
    return false;
  }
};
