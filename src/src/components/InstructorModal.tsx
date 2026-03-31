import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Quote, User } from 'lucide-react';
import { useTeacherPortraits } from '../hooks/useTeacherPortraits';

export const InstructorModal = ({ instructor, isOpen, onClose }: any) => {
  const { t } = useTranslation();
  const { portraits } = useTeacherPortraits();

  if (!instructor) return null;

  const instructorPhoto = portraits[instructor.name] || instructor.photo;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 h-[100dvh] overscroll-contain"
        >
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-3xl bg-white dark:bg-[#242830]/90 backdrop-blur-2xl rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 flex flex-col max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-neutral-100/80 dark:bg-[#1A1D23]/80 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-[#EAEAEA] rounded-full transition-colors z-[110] backdrop-blur-md shadow-sm"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row overflow-y-auto overscroll-contain flex-1">
              <div className="md:w-2/5 relative shrink-0">
                <img 
                  src={instructorPhoto} 
                  alt={instructor.name} 
                  className="w-full h-full object-cover aspect-[4/5] md:aspect-auto"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                <div className="absolute bottom-6 left-6 text-white md:hidden">
                  <h3 className="text-2xl font-serif font-bold">{instructor.name}</h3>
                </div>
              </div>
              
              <div className="md:w-3/5 p-8 md:p-10">
                <div className="hidden md:block mb-6">
                  <h3 className="text-3xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA]">{instructor.name}</h3>
                </div>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-2">
                      <User size={16} />
                      {t('instructor_bio')}
                    </h4>
                    <p className="text-neutral-600 dark:text-[#A0AEC0] leading-relaxed">
                      {instructor.bio}
                    </p>
                  </section>

                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-2">
                      <Award size={16} />
                      {t('instructor_qualifications')}
                    </h4>
                    <ul className="space-y-2">
                      {instructor.qualifications.map((q: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-neutral-700 dark:text-[#EAEAEA]">
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-[#EAEAEA]" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {instructor.testimonial && (
                    <section className="bg-neutral-50 dark:bg-[#1A1D23]/50 p-6 rounded-2xl border border-gray-100 dark:border-white/10 italic">
                      <Quote className="w-8 h-8 text-neutral-200 dark:text-neutral-700 mb-2" />
                      <p className="text-neutral-600 dark:text-[#A0AEC0] relative z-10 leading-relaxed">
                        "{instructor.testimonial}"
                      </p>
                      <div className="mt-4 text-sm font-bold text-neutral-900 dark:text-[#EAEAEA] not-italic">
                        — {t('instructor_testimonial')}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
