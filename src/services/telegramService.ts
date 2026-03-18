export const sendTelegramMessage = async (
  name: string, 
  phone: string, 
  course: string, 
  teacher: string, 
  schedule: string,
  email?: string,
  contactMethod?: string
) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  
  console.log('Telegram sozlamalari:', { tokenExists: !!token, chatIdExists: !!chatId });
  
  if (!token || !chatId) {
    console.error('Telegram token yoki Chat ID topilmadi. Iltimos, Secrets panelida sozlang.');
    return false;
  }
  
  let message = "";
  const contactInfo = `\n📧 Email: ${email || '-'}\n💬 Aloqa usuli: ${contactMethod || '-'}`;

  if (course === 'Konsultatsiya') {
    message = `👤 Yangi mijoz: ${name}\n📞 Telefon: ${phone}${contactInfo}`;
  } else {
    message = `🎓 Yangi o'quvchi: ${name}\n📞 Telefon: ${phone}${contactInfo}\n📚 Kurs: ${course}\n👨‍🏫 O'qituvchi: ${teacher}\n⏰ Vaqt: ${schedule}`;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API xatosi:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Telegram xizmati xatosi:', error);
    return false;
  }
};
