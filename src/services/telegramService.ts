export const sendTelegramMessage = async (
  name: string, 
  phone: string, 
  course: string, 
  teacher: string, 
  schedule: string,
  email?: string,
  contactMethod?: string,
  messageText?: string
) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
  
  if (!token || !chatId) {
    return false;
  }
  
  let message = "";
  const contactInfo = `\n📧 Email: ${email || '-'}\n💬 Aloqa usuli: ${contactMethod || '-'}`;
  const messageInfo = messageText ? `\n📝 Xabar: ${messageText}` : '';

  if (course === 'Konsultatsiya') {
    message = `👤 Yangi xabar: ${name}\n📞 Telefon: ${phone}${messageInfo}`;
  } else {
    message = `🎓 Yangi ariza: ${name}\n📞 Telefon: ${phone}${contactInfo}\n📚 Kurs: ${course}\n👨‍🏫 O'qituvchi: ${teacher}\n⏰ Vaqt: ${schedule}`;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
    
    if (!response.ok) {
      return false;
    }
    
    return true;
  } catch (error: any) {
    return false;
  }
};
