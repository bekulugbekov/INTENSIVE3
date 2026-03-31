import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { useData, Schedule } from '../../context/DataContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: Schedule;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose, schedule }) => {
  const { t } = useTranslation();
  const { courses, instructors, addSchedule, updateSchedule } = useData();
  const [formData, setFormData] = useState({
    courseId: schedule?.courseId || '',
    days: schedule?.days || [] as string[],
    time: schedule?.time || '',
    room: schedule?.room || '',
    teacherId: schedule?.teacherId || '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        courseId: schedule?.courseId || '',
        days: schedule?.days || [] as string[],
        time: schedule?.time || '',
        room: schedule?.room || '',
        teacherId: schedule?.teacherId || '',
      });
    }
  }, [isOpen, schedule]);

  const daysOfWeek = [
    { label: 'Dush', value: 'Mon' },
    { label: 'Ses', value: 'Tue' },
    { label: 'Chor', value: 'Wed' },
    { label: 'Pay', value: 'Thu' },
    { label: 'Jum', value: 'Fri' },
    { label: 'Sha', value: 'Sat' },
    { label: 'Yak', value: 'Sun' },
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || formData.days.length === 0 || !formData.time || !formData.room || !formData.teacherId) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (schedule) {
        await updateSchedule({ ...formData, id: schedule.id });
        toast.success("Dars jadvali muvaffaqiyatli yangilandi!");
      } else {
        await addSchedule(formData);
        toast.success("Dars jadvali muvaffaqiyatli saqlandi!");
      }
      
      setFormData({ courseId: '', days: [], time: '', room: '', teacherId: '' });
      onClose();
    } catch (error: any) {
      toast.error("Xatolik yuz berdi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#242830] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{schedule ? 'Update Schedule' : 'Add New Schedule'}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <CalendarIcon size={16} className="text-emerald-500" />
                  Kurs nomi
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={e => setFormData({...formData, courseId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                >
                  <option value="" disabled>Kursni tanlang</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2.5 flex items-center gap-2">
                  <CalendarIcon size={16} className="text-emerald-500" />
                  Hafta kunlari
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <label 
                      key={day.value} 
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        formData.days.includes(day.value)
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                          : 'bg-gray-50 dark:bg-[#1A1D23] border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-white/10'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day.value)}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            days: prev.days.includes(day.value) ? prev.days.filter(d => d !== day.value) : [...prev.days, day.value]
                          }));
                        }}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold uppercase tracking-wider">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <Clock size={16} className="text-emerald-500" />
                    Vaqti
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="Masalan: 08:00–10:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-500" />
                    Xona
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.room}
                    onChange={e => setFormData({...formData, room: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    placeholder="Masalan: 101-xona"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <User size={16} className="text-emerald-500" />
                  O'qituvchi
                </label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={e => setFormData({...formData, teacherId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                >
                  <option value="" disabled>O'qituvchini tanlang</option>
                  {instructors.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saqlanmoqda...' : (schedule ? 'Update Schedule' : 'Save Schedule')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
