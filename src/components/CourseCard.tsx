import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, User, BookOpen, Target, X, Info, ArrowRight, GraduationCap, Languages, Award, Zap, Heart, Crown, MessageCircle, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeacherPortraits } from '../hooks/useTeacherPortraits';
import { useData } from '../context/DataContext';
import { toast } from 'sonner';

interface CourseCardProps {
  course: any;
  index?: number;
  onInstructorClick: (instructor: any) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course,
  index = 0, 
  onInstructorClick
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { instructors } = useData();
  if (!course) return null;
  const instructor = course.instructor || instructors.find(i => i.id === course.instructorId);
  const teacher = instructor?.name || 'Unknown Instructor';
  
  // Use instructor photo if available, otherwise fallback to generated portrait
  const { portraits } = useTeacherPortraits();
  const instructorPhoto = instructor?.photo || instructor?.image || portraits[teacher];
  
  // Default avatar fallback if no photo/image/portrait is found
  const defaultAvatar = '/assets/default-avatar.png';
  const finalInstructorPhoto = instructorPhoto || defaultAvatar;

  // Calculate a consistent progress value based on teacher and level
  const getProgress = () => {
    const seed = (teacher + course.level).length;
    return 30 + (seed * 7) % 65; // Random-ish but consistent 30-95%
  };
  const progress = getProgress();

  const getTeacherStyle = (name: string) => {
    // Simplified style mapping based on name
    const colors = [
      { gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20', icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { gradient: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20', icon: Languages, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { gradient: 'from-orange-400 to-rose-500', shadow: 'shadow-orange-500/20', icon: Award, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { gradient: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-500/20', icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
      { gradient: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-500/20', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      { gradient: 'from-amber-400 to-yellow-500', shadow: 'shadow-amber-500/20', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { gradient: 'from-cyan-400 to-sky-500', shadow: 'shadow-cyan-500/20', icon: MessageCircle, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    ];
    
    // Hash name to get consistent style
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const teacherStyle = getTeacherStyle(teacher);
  const TeacherIcon = teacherStyle.icon;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `${course.title || course.level} with ${teacher}`,
      text: `Check out this course: ${course.title || course.level} taught by ${teacher}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast.success(t('link_copied') || 'Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or share failed - no action needed
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
        whileHover={{ y: -12, scale: 1.01 }}
        className={`group relative bg-white/40 dark:bg-[#242830]/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 ease-out flex flex-col h-full ${course.imageUrl ? 'md:flex-row' : ''}`}
      >
        {course.imageUrl && (
          <div className="w-full md:w-[45%] relative overflow-hidden aspect-video md:aspect-auto shrink-0">
            <img 
              src={course.imageUrl} 
              alt={`${course.level} Nemis tili kursi - Intensive markazi`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute top-4 left-4">
              <div className={`px-4 py-1.5 bg-gradient-to-r ${teacherStyle.gradient} text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
                Featured
              </div>
            </div>
          </div>
        )}

        <div className="p-8 md:p-10 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-8 shrink-0">
            <div className={`px-5 py-2 bg-gradient-to-r ${teacherStyle.gradient} ${teacherStyle.shadow} text-white text-xs font-black tracking-widest rounded-full shadow-lg uppercase`}>
              {course.level}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleShare}
                className={`p-3 ${teacherStyle.bg} rounded-2xl ${teacherStyle.color} hover:opacity-80 transition-opacity duration-300`}
                title="Share Course"
              >
                <Share2 size={20} />
              </button>
              <div className={`p-3 ${teacherStyle.bg} rounded-2xl ${teacherStyle.color} transition-colors duration-300`}>
                <TeacherIcon size={20} />
              </div>
            </div>
          </div>

          <div className="flex-[1_0_auto]">
            <div 
              className="flex items-center gap-4 mb-6 cursor-pointer group/instructor"
              onClick={() => instructor && onInstructorClick(instructor)}
            >
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-white/50 dark:border-white/10 group-hover/instructor:border-current transition-colors duration-300 ${teacherStyle.color}`}>
                  {finalInstructorPhoto ? (
                    <img src={finalInstructorPhoto} alt={teacher} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-[#1A1D23] flex items-center justify-center ${teacherStyle.bg.replace('/10', '')} ${teacherStyle.color.replace('text-', 'bg-')}`}>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA] group-hover/instructor:text-current transition-colors ${teacherStyle.color}`}>
                  {teacher}
                </h3>
                <p className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  {instructor?.specialty || instructor?.role || t('instructor_title')}
                </p>
              </div>
            </div>

            {/* Curriculum Section */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Curriculum / Description</h4>
              <p className="text-neutral-600 dark:text-[#A0AEC0] text-sm line-clamp-3">
                {course.description || course.curriculum}
              </p>
            </div>

            {/* Progress Bar Section */}
            <div className="mb-8 p-5 bg-neutral-50/50 dark:bg-white/5 rounded-3xl border border-neutral-100 dark:border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
                  {t('course_progress')}
                </span>
                <span className={`text-xs font-black ${teacherStyle.color}`}>
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 + index * 0.1, ease: "circOut" }}
                  className={`h-full bg-gradient-to-r ${teacherStyle.gradient}`}
                />
              </div>
            </div>

            <div className="grid gap-4 mb-8 grid-cols-1">
              {(() => {
                const scheduleArray = Array.isArray(course.schedule) 
                  ? course.schedule 
                  : (typeof course.schedule === 'string' && course.schedule ? [course.schedule] : []);
                
                return scheduleArray.map((time: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-neutral-600 dark:text-[#A0AEC0] group/time">
                    <div className={`w-8 h-8 rounded-full bg-neutral-100/50 dark:bg-white/5 flex items-center justify-center group-hover/time:${teacherStyle.bg} transition-colors duration-300 shrink-0`}>
                      <Clock size={14} className={`text-neutral-400 group-hover/time:${teacherStyle.color}`} />
                    </div>
                    <span className="text-sm font-medium">{time}</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="relative w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] overflow-hidden group/btn transition-all duration-300 mt-auto shrink-0"
          >
            <div className="absolute inset-0 border-2 border-neutral-900 dark:border-[#EAEAEA] rounded-2xl group-hover/btn:border-current transition-colors duration-300" />
            <div className={`absolute inset-0 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-r ${teacherStyle.gradient}`} />
            <span className={`relative z-10 text-neutral-900 dark:text-[#EAEAEA] group-hover/btn:text-white flex items-center justify-center gap-3 ${teacherStyle.color} group-hover/btn:text-white`}>
              {t('course_more')}
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 h-[100dvh] overscroll-contain">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#242830]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-neutral-100 dark:bg-[#1A1D23] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-[#EAEAEA] rounded-full transition-colors z-[110] shadow-sm"
              >
                <X size={20} />
              </button>

              <div className="p-6 pt-16 md:p-12 md:pt-12 overflow-y-auto overscroll-contain flex-1">
                <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 pr-12 sm:pr-0">
                  <div className="flex-1">
                    <span className={`inline-block px-4 py-1.5 bg-gradient-to-r ${teacherStyle.gradient} text-white text-sm font-bold rounded-full mb-4 shadow-lg`}>
                      {course.level}
                    </span>
                    <h3 className={`text-3xl md:text-4xl font-serif font-bold leading-tight ${teacherStyle.color}`}>
                      {teacher}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleShare}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-[#1A1D23] text-neutral-900 dark:text-[#EAEAEA] text-sm font-bold rounded-xl hover:bg-neutral-900 hover:text-white dark:hover:bg-[#EAEAEA] dark:hover:text-[#1A1D23] transition-all shadow-sm w-full sm:w-fit"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                    {instructor && (
                      <button 
                        onClick={() => {
                          setIsModalOpen(false);
                          onInstructorClick(instructor);
                        }}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-[#1A1D23] text-neutral-900 dark:text-[#EAEAEA] text-sm font-bold rounded-xl hover:bg-neutral-900 hover:text-white dark:hover:bg-[#EAEAEA] dark:hover:text-[#1A1D23] transition-all shadow-sm w-full sm:w-fit"
                      >
                        <User size={16} />
                        {t('view_profile')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar in Modal */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {t('course_progress')}
                    </span>
                    <span className={`text-sm font-bold ${teacherStyle.color}`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-neutral-100 dark:bg-[#1A1D23] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                      className={`h-full bg-gradient-to-r ${teacherStyle.gradient} rounded-full`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className={`font-bold flex items-center gap-2 mb-3 text-lg ${teacherStyle.color}`}>
                        <BookOpen className="w-5 h-5" />
                        {t('course_curriculum')}
                      </h4>
                      <p className="text-neutral-600 dark:text-[#A0AEC0] leading-relaxed">
                        {course.description || course.curriculum}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`font-bold flex items-center gap-2 mb-3 text-lg ${teacherStyle.color}`}>
                        <Target className="w-5 h-5" />
                        {t('course_outcomes')}
                      </h4>
                      <p className="text-neutral-600 dark:text-[#A0AEC0] leading-relaxed">
                        {course.description || course.outcomes}
                      </p>
                    </div>
                  </div>

                  <div className={`bg-neutral-50 dark:bg-[#1A1D23]/50 p-6 rounded-3xl border border-gray-100 dark:border-white/10`}>
                    <h4 className={`font-bold flex items-center gap-2 mb-4 ${teacherStyle.color}`}>
                      <Clock className="w-5 h-5" />
                      {t('form_schedule')}
                    </h4>
                    <div className="space-y-3">
                      {(() => {
                        const scheduleArray = Array.isArray(course.schedule) 
                          ? course.schedule 
                          : (typeof course.schedule === 'string' && course.schedule ? [course.schedule] : []);
                        
                        return scheduleArray.map((time: string, idx: number) => (
                          <div key={idx} className={`text-sm text-neutral-600 dark:text-[#A0AEC0] bg-white dark:bg-[#242830] p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:border-current transition-colors duration-300 ${teacherStyle.color.replace('text-', 'hover:border-')}`}>
                            {time}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/10 flex justify-end">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className={`px-8 py-3 bg-gradient-to-r ${teacherStyle.gradient} text-white font-bold rounded-full hover:shadow-lg transition-all`}
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
