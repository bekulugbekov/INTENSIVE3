import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Phone, MapPin, Send, Instagram, Youtube, Clock, Globe, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('Sozlamalar yangilandi!');
    } catch (error) {
      toast.error('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full p-3.5 bg-gray-50 dark:bg-[#1A1D23] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all";
  const labelClasses = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 ml-1";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tizim Sozlamalari</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Saytning umumiy ma'lumotlari va ijtimoiy tarmoqlarini boshqarish</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Saqlash
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chap ustun: Umumiy ma'lumotlar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-[#242830] p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="text-emerald-500" size={20} />
              Umumiy ma'lumotlar
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Sayt nomi</label>
                <input 
                  type="text" 
                  value={formData.siteName || ''} 
                  onChange={e => setFormData({...formData, siteName: e.target.value})} 
                  className={inputClasses}
                  placeholder="Masalan: IT Academy"
                />
              </div>

              <div>
                <label className={labelClasses}>Telefon raqami</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    className={`${inputClasses} pl-12`}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Manzil</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.address || ''} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    className={`${inputClasses} pl-12`}
                    placeholder="Toshkent sh., Chilonzor tumani..."
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Ish vaqti</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.workingHours || ''} 
                    onChange={e => setFormData({...formData, workingHours: e.target.value})} 
                    className={`${inputClasses} pl-12`}
                    placeholder="09:00 - 18:00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#242830] p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <ImageIcon className="text-emerald-500" size={20} />
              Logo boshqaruvi
            </h3>
            <div>
              <label className={labelClasses}>Logo URL</label>
              <input 
                type="text" 
                value={formData.logoUrl || ''} 
                onChange={e => setFormData({...formData, logoUrl: e.target.value})} 
                className={inputClasses}
                placeholder="https://example.com/logo.png"
              />
              {formData.logoUrl && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-[#1A1D23] rounded-2xl flex items-center justify-center border border-dashed border-gray-200 dark:border-white/10">
                  <img src={formData.logoUrl} alt="Logo Preview" className="h-12 w-auto object-contain" />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* O'ng ustun: Social media va qo'shimcha sozlamalar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-[#242830] p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Send className="text-emerald-500" size={20} />
              Ijtimoiy tarmoqlar
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Telegram link</label>
                <div className="relative">
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.telegramLink || ''} 
                    onChange={e => setFormData({...formData, telegramLink: e.target.value})} 
                    className={`${inputClasses} pl-12`}
                    placeholder="https://t.me/username"
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Instagram link</label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.instagramLink || ''} 
                    onChange={e => setFormData({...formData, instagramLink: e.target.value})} 
                    className={`${inputClasses} pl-12`}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>YouTube link</label>
                <div className="relative">
                  <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={formData.youtubeLink || ''} 
                    onChange={e => setFormData({...formData, youtubeLink: e.target.value})} 
                    className={`${inputClasses} pl-12`}
                    placeholder="https://youtube.com/@channel"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#242830] p-8 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MapPin className="text-emerald-500" size={20} />
              Google Maps (Embed)
            </h3>
            <div>
              <label className={labelClasses}>Embed Link (src)</label>
              <textarea 
                rows={4}
                value={formData.googleMapsEmbed || ''} 
                onChange={e => setFormData({...formData, googleMapsEmbed: e.target.value})} 
                className={inputClasses}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-500 mt-2 ml-1">Google Maps'dan 'Share' {'->'} 'Embed a map' bo'limidagi src manzilini kiriting.</p>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
};
