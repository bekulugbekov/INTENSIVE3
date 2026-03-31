import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus } from 'lucide-react';
import { Course, useData } from '../../context/DataContext';
import { toast } from 'sonner';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: Course;
}

export const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, courseToEdit }) => {
  const { addCourse, updateCourse, instructors } = useData();
  const [formData, setFormData] = useState({
    title: courseToEdit?.title || '',
    description: courseToEdit?.description || courseToEdit?.curriculum || '',
    level: courseToEdit?.level || 'A1',
    duration: courseToEdit?.duration || '',
    price: courseToEdit?.price || '',
    imageUrl: courseToEdit?.imageUrl || '',
    instructorId: courseToEdit?.instructorId || '',
    features: courseToEdit?.features?.join(', ') || '',
    schedule: Array.isArray(courseToEdit?.schedule) 
      ? courseToEdit.schedule 
      : (typeof courseToEdit?.schedule === 'string' && courseToEdit.schedule ? [courseToEdit.schedule] : []),
    curriculum: courseToEdit?.curriculum || '',
    outcomes: courseToEdit?.outcomes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: courseToEdit?.title || '',
        description: courseToEdit?.description || courseToEdit?.curriculum || '',
        level: courseToEdit?.level || 'A1',
        duration: courseToEdit?.duration || '',
        price: courseToEdit?.price || '',
        imageUrl: courseToEdit?.imageUrl || '',
        instructorId: courseToEdit?.instructorId || '',
        features: courseToEdit?.features?.join(', ') || '',
        schedule: Array.isArray(courseToEdit?.schedule) 
          ? courseToEdit.schedule 
          : (typeof courseToEdit?.schedule === 'string' && courseToEdit.schedule ? [courseToEdit.schedule] : []),
        curriculum: courseToEdit?.curriculum || '',
        outcomes: courseToEdit?.outcomes || '',
      });
    }
  }, [isOpen, courseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const courseData = {
        ...formData,
        students: courseToEdit?.students || 0,
        features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
        schedule: formData.schedule.map(s => s.trim()).filter(Boolean),
      };
      
      if (courseToEdit) {
        await updateCourse({ ...courseData, id: courseToEdit.id });
        toast.success("Kurs muvaffaqiyatli yangilandi!");
      } else {
        await addCourse(courseData);
        toast.success("Yangi kurs muvaffaqiyatli qo'shildi!");
      }
      
      onClose();
      setFormData({ title: '', description: '', level: 'A1', duration: '', price: '', imageUrl: '', instructorId: '', features: '', schedule: [], curriculum: '', outcomes: '' });
    } catch (error: any) {
      toast.error("Kursni saqlashda xatolik yuz berdi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = false;

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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{courseToEdit ? 'Edit Course' : 'Add New Course'}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. Intensive German A1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Tavsif)</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-20"
                  placeholder="Kurs haqida qisqacha ma'lumot..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL (Rasm manzili)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <input
                    required
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. 3 months"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                  <input
                    required
                    type="text"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g. 800,000 UZS/month"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
                  {instructors.length > 0 ? (
                    <select
                      value={formData.instructorId}
                      onChange={e => setFormData({...formData, instructorId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="" disabled>Select Instructor</option>
                      {instructors.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-red-500 text-sm font-medium">Avval o'qituvchi qo'shing</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Features (comma separated)</label>
                <textarea
                  value={formData.features}
                  onChange={e => setFormData({...formData, features: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-20"
                  placeholder="Grammar, Speaking, Listening..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Schedule (Dars vaqtlari)</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, schedule: [...formData.schedule, ''] })}
                    className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.schedule.map((time, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={time}
                        onChange={e => {
                          const newSchedule = [...formData.schedule];
                          newSchedule[idx] = e.target.value;
                          setFormData({ ...formData, schedule: newSchedule });
                        }}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g. B2: 10:00–12:00 (ses, pay, sha)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newSchedule = [...formData.schedule];
                          newSchedule.splice(idx, 1);
                          setFormData({ ...formData, schedule: newSchedule });
                        }}
                        className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shrink-0"
                      >
                        <Minus size={20} />
                      </button>
                    </div>
                  ))}
                  {formData.schedule.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Dars vaqtlari qo'shilmagan. Qo'shish uchun + tugmasini bosing.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curriculum</label>
                  <textarea
                    value={formData.curriculum}
                    onChange={e => setFormData({...formData, curriculum: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-20"
                    placeholder="e.g. Alphabet, basic grammar..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outcomes</label>
                  <textarea
                    value={formData.outcomes}
                    onChange={e => setFormData({...formData, outcomes: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-20"
                    placeholder="e.g. Fluent communication at A1 level."
                  />
                </div>
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
                  disabled={isFormDisabled || isSubmitting}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Saqlanmoqda...' : (courseToEdit ? 'Save Changes' : 'Add Course')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
