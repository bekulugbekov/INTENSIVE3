import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Upload, Trash2 } from 'lucide-react';
import { useData, Instructor } from '../../context/DataContext';
import { toast } from 'sonner';

interface AddInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructorToEdit?: Instructor | null;
}

export const AddInstructorModal: React.FC<AddInstructorModalProps> = ({ isOpen, onClose, instructorToEdit }) => {
  const { addInstructor, updateInstructor } = useData();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: '',
    qualifications: '',
    specialty: '',
    testimonial: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (instructorToEdit) {
      setFormData({
        name: instructorToEdit.name || '',
        bio: instructorToEdit.bio || '',
        photo: instructorToEdit.photo || '',
        qualifications: instructorToEdit.qualifications?.join('\n') || '',
        specialty: instructorToEdit.specialty || '',
        testimonial: instructorToEdit.testimonial || '',
      });
    } else {
      setFormData({ name: '', bio: '', photo: '', qualifications: '', specialty: '', testimonial: '' });
    }
  }, [instructorToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setIsSubmitting(true);
    try {
      const instructorData = {
        name: formData.name,
        bio: formData.bio,
        photo: formData.photo,
        qualifications: formData.qualifications.split('\n').map(q => q.trim()).filter(Boolean),
        testimonial: formData.testimonial,
        specialty: formData.specialty,
      };

      if (instructorToEdit) {
        await updateInstructor({ ...instructorData, id: instructorToEdit.id });
        toast.success("O'qituvchi muvaffaqiyatli yangilandi!");
      } else {
        await addInstructor(instructorData);
        toast.success("O'qituvchi muvaffaqiyatli qo'shildi!");
      }
      
      setFormData({ name: '', bio: '', photo: '', qualifications: '', specialty: '', testimonial: '' });
      onClose();
    } catch (error: any) {
      // Error is already toasted in DataContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, photo: e.target.value });
  };

  const removeImage = () => {
    setFormData({ ...formData, photo: '' });
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {instructorToEdit ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
              {/* Image Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full border-2 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-[#1A1D23]">
                  {formData.photo ? (
                    <img 
                      src={formData.photo} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                    />
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                {formData.photo && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={handleUrlChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Paste image URL here"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Or Upload File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-20"
                  placeholder="Short biography..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Malaka va sertifikatlar (har bir qatorda bittadan)</label>
                <textarea
                  value={formData.qualifications}
                  onChange={e => setFormData({...formData, qualifications: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-24"
                  placeholder="e.g. Goethe-Zertifikat C1&#10;O'zDJTU bitiruvchisi&#10;DAAD stipendiyasi sohibi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialty / Role</label>
                <input
                  type="text"
                  value={formData.specialty}
                  onChange={e => setFormData({...formData, specialty: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. Certified Instructor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Testimonial (Talabalar fikri)</label>
                <textarea
                  value={formData.testimonial}
                  onChange={e => setFormData({...formData, testimonial: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1A1D23] text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-20"
                  placeholder="e.g. Xonzoda opa darslari haqiqiy nemis muhitini beradi."
                />
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
                  {isSubmitting ? 'Saqlanmoqda...' : (instructorToEdit ? 'Saqlash' : "Qo'shish")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
