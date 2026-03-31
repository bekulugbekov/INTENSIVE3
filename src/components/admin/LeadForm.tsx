import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { toast } from 'sonner';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    studentName?: string;
    phone?: string;
  };
}

export const LeadForm: React.FC<LeadFormProps> = ({ isOpen, onClose, initialData }) => {
  const { addLead, courses, instructors, schedules } = useData();
  const [formData, setFormData] = useState({
    studentName: initialData?.studentName || '',
    phone: initialData?.phone || '',
    course: '',
    teacher: '',
    time: '',
    contactMethod: 'telegram',
  });

  // Update form data when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        studentName: initialData?.studentName || '',
        phone: initialData?.phone || '',
      }));
    }
  }, [isOpen, initialData]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLead(formData);
      setFormData({ studentName: '', phone: '', course: '', teacher: '', time: '', contactMethod: 'telegram' });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      toast.error("Xatolik yuz berdi: " + (error instanceof Error ? error.message : String(error)));
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
            className="relative w-full max-w-lg bg-white dark:bg-[#242830] rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Register Student</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] overscroll-contain">
              {showSuccess && (
                <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-center font-bold">
                  Student registered successfully!
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.studentName}
                  onChange={e => setFormData({...formData, studentName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Method</label>
                  <select
                    value={formData.contactMethod}
                    onChange={e => setFormData({...formData, contactMethod: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                <select
                  required
                  value={formData.course}
                  onChange={e => setFormData({...formData, course: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="" disabled>Select a course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teacher</label>
                  <select
                    required
                    value={formData.teacher}
                    onChange={e => setFormData({...formData, teacher: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>Select a teacher</option>
                    {instructors.map(i => (
                      <option key={i.id} value={i.name}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <select
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="" disabled>Select a time</option>
                    {schedules.map(s => (
                      <option key={s.id} value={`${s.days.join(', ')} ${s.time}`}>{s.days.join(', ')} {s.time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
