import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { Button } from './Button';

export const ContactForm = ({ onSendMessage }: any) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({ phone: '' });
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(formData.phone)) {
      setErrors({ phone: t('invalid_phone') });
      return;
    }

    setErrors({ phone: '' });
    setIsLoading(true);
    const success = await onSendMessage(formData);
    setIsLoading(false);
    if (success) {
      setFormData({ name: '', phone: '' });
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    } else {
      alert(t('form_error'));
    }
  };

  if (isSent) {
    return (
      <div className="bg-white dark:bg-[#242830] p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h2 className="text-3xl font-serif font-bold text-black dark:text-[#EAEAEA] mb-4">{t('contact_sent_title')}</h2>
        <p className="text-gray-600 dark:text-[#A0AEC0] text-lg">{t('form_sent_desc')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-6 md:p-10 w-full">
      <div className="mb-6 text-center lg:text-left">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-black dark:text-[#EAEAEA] mb-2 leading-tight">{t('consultation')}</h2>
        <p className="text-gray-500 dark:text-[#A0AEC0] text-sm leading-relaxed max-w-md mx-auto lg:mx-0 hyphens-auto">
          {t('contact_form_desc', 'Savollaringiz bormi? Ma\'lumotlaringizni qoldiring va biz siz bilan tez orada bog\'lanamiz.')}
        </p>
      </div>
      
      <div className="flex flex-col gap-y-5">
        <div className="relative group">
          <input 
            type="text" 
            placeholder={t('contact_name')}
            className="w-full p-4 bg-gray-50 dark:bg-[#1A1D23] border border-gray-200 dark:border-neutral-700 text-black dark:text-[#EAEAEA] rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-300 shadow-sm placeholder:text-gray-400 text-sm md:text-base"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-1">
          <div className="relative group">
            <input 
              type="tel" 
              placeholder={t('form_phone')}
              className={`w-full p-4 bg-gray-50 dark:bg-[#1A1D23] border ${errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-neutral-700'} text-black dark:text-[#EAEAEA] rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-300 shadow-sm placeholder:text-gray-400 text-sm md:text-base`}
              value={formData.phone}
              onChange={(e) => {
                setFormData({...formData, phone: e.target.value});
                if (errors.phone) setErrors({ phone: '' });
              }}
              required
            />
          </div>
          {errors.phone && <p className="text-red-500 text-[10px] ml-3 font-medium">{errors.phone}</p>}
        </div>

        <div className="flex flex-col gap-y-3">
          <Button 
            className="w-full bg-green-600 text-white hover:bg-green-700 transition-all duration-300 rounded-xl py-4 text-sm md:text-base font-bold flex items-center justify-center gap-3 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="truncate">{t('form_submit')}</span>
          </Button>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
            {t('form_privacy_note', 'Tugmani bosish orqali siz shaxsiy ma\'lumotlarni qayta ishlashga rozilik bildirasiz.')}
          </p>
        </div>
      </div>
    </form>
  );
};
