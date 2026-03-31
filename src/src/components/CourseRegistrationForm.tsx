import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export const CourseRegistrationForm = ({ onSendMessage, courses = [], onClose }: any) => {
  const { t } = useTranslation();
  const { addLead } = useData();
  const [formData, setFormData] = useState({ 
    studentName: '', 
    phone: '', 
    email: '', 
    contactMethod: '', 
    course: '', 
    teacher: '', 
    time: '' 
  });
  const [errors, setErrors] = useState({ phone: '', email: '' });
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const { data, error } = await supabase.from('instructors').select('*');
        if (error) throw error;
        setInstructors(data || []);
      } catch (err) {
        // Error is handled silently or via other means
      }
    };
    fetchInstructors();
  }, []);

  // Memoized unique course levels
  const uniqueLevels = useMemo(() => {
    return [...new Set(courses.map((c: any) => c.level))].filter(Boolean);
  }, [courses]);

  // Memoized teachers for the selected level
  const availableTeachers = useMemo(() => {
    if (!formData.course) return [];
    
    // Find courses that match the selected level
    const matchingCourses = courses.filter((c: any) => c.level === formData.course);
    
    // Get unique instructor IDs from matching courses
    const instructorIds = [...new Set(matchingCourses.map((c: any) => c.instructorId || c.instructor_id).filter(Boolean))];
    
    // Map IDs to instructor names using the fetched instructors data
    const teachers = instructorIds.map(id => {
      const instructor = instructors.find((i: any) => i.id === id);
      return instructor ? instructor.name : null;
    }).filter(Boolean);
    
    // If no teachers found for the specific course level, fallback to all instructors
    // This ensures we don't show "no_teachers_available" if there are instructors in the DB
    if (teachers.length === 0 && instructors.length > 0) {
      return instructors.map((i: any) => i.name).filter(Boolean);
    }
    
    return teachers;
  }, [courses, formData.course, instructors]);

  // Memoized schedules for the selected level and teacher
  const availableSchedules = useMemo(() => {
    if (!formData.course || !formData.teacher) return [];
    
    // Find the instructor ID for the selected teacher name
    const selectedInstructor = instructors.find((i: any) => i.name === formData.teacher);
    
    let courseMatch = null;
    if (selectedInstructor) {
      courseMatch = courses.find(
        (c: any) => c.level === formData.course && (c.instructorId === selectedInstructor.id || c.instructor_id === selectedInstructor.id)
      );
    }
    
    // Fallback to any course with the selected level if no specific teacher match
    if (!courseMatch) {
      courseMatch = courses.find((c: any) => c.level === formData.course);
    }
    
    // Handle both array and string schedules
    const schedule = courseMatch?.schedule;
    if (Array.isArray(schedule)) {
      return schedule;
    } else if (typeof schedule === 'string' && schedule) {
      return [schedule];
    }
    return [];
  }, [courses, formData.course, formData.teacher, instructors]);

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { phone: '', email: '' };
    let hasError = false;

    if (!validatePhone(formData.phone)) {
      newErrors.phone = t('invalid_phone');
      hasError = true;
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = t('invalid_email');
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({ phone: '', email: '' });
    setIsLoading(true);
    const success = await onSendMessage(formData);
    if (success) {
      try {
        await addLead(formData);
        setFormData({ 
          studentName: '', 
          phone: '', 
          email: '', 
          contactMethod: '', 
          course: '', 
          teacher: '', 
          time: '' 
        });
        setIsSent(true);
        toast.success('Muvaffaqiyatli yuborildi');
      } catch (error) {
        toast.error(t('form_error'));
      }
    } else {
      toast.error(t('form_error'));
    }
    setIsLoading(false);
  };

  if (isSent) {
    return (
      <div className="bg-white dark:bg-[#242830] p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[500px] transition-colors duration-300 rounded-3xl">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
          <CheckCircle2 className="w-24 h-24 text-emerald-500 relative z-10" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-[#EAEAEA] mb-4">{t('form_sent_title')}</h2>
        <p className="text-slate-600 dark:text-[#A0AEC0] text-lg mb-10 max-w-md mx-auto">{t('form_sent_desc')}</p>
        
        <div className="w-full max-w-md bg-slate-50 dark:bg-[#1A1D23]/50 rounded-2xl p-8 text-left border border-slate-100 dark:border-white/5 mb-10">
          <h3 className="font-bold text-slate-800 dark:text-[#EAEAEA] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            {t('form_sent_next_steps')}
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-slate-600 dark:text-[#A0AEC0]">
              <span className="flex-shrink-0 w-6 h-6 bg-white dark:bg-[#242830] rounded-full flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-white/10">1</span>
              {t('form_sent_step1')}
            </li>
            <li className="flex gap-3 text-sm text-slate-600 dark:text-[#A0AEC0]">
              <span className="flex-shrink-0 w-6 h-6 bg-white dark:bg-[#242830] rounded-full flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-white/10">2</span>
              {t('form_sent_step2')}
            </li>
            <li className="flex gap-3 text-sm text-slate-600 dark:text-[#A0AEC0]">
              <span className="flex-shrink-0 w-6 h-6 bg-white dark:bg-[#242830] rounded-full flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-white/10">3</span>
              {t('form_sent_step3')}
            </li>
          </ul>
        </div>

        <button 
          onClick={() => {
            setIsSent(false);
            if (onClose) onClose();
          }}
          className="bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] rounded-2xl px-12 py-4 font-bold shadow-lg shadow-emerald-500/20 transition-all duration-300"
        >
          {t('close')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#242830] p-8 md:p-12 transition-colors duration-300 rounded-3xl">
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 dark:text-[#EAEAEA] mb-8">{t('enroll')}</h2>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <input 
              type="text" 
              placeholder={t('form_name')}
              className="w-full p-4 bg-slate-50 dark:bg-[#1A1D23] border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-[#EAEAEA] rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
              required
            />
          </div>
          <div className="space-y-1">
            <input 
              type="tel" 
              placeholder={t('form_phone')}
              className={`w-full p-4 bg-slate-50 dark:bg-[#1A1D23] border ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-emerald-500/10'} text-slate-800 dark:text-[#EAEAEA] rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300`}
              value={formData.phone}
              onChange={(e) => {
                setFormData({...formData, phone: e.target.value});
                if (errors.phone) setErrors({...errors, phone: ''});
              }}
              required
            />
            {errors.phone && <p className="text-red-500 text-xs ml-2">{errors.phone}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <input 
              type="email" 
              placeholder={t('form_email')}
              className={`w-full p-4 bg-slate-50 dark:bg-[#1A1D23] border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-neutral-700 focus:border-emerald-500 focus:ring-emerald-500/10'} text-slate-800 dark:text-[#EAEAEA] rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300`}
              value={formData.email}
              onChange={(e) => {
                setFormData({...formData, email: e.target.value});
                if (errors.email) setErrors({...errors, email: ''});
              }}
              required
            />
            {errors.email && <p className="text-red-500 text-xs ml-2">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <div className="relative">
              <select 
                className="w-full p-4 pr-12 bg-slate-50 dark:bg-[#1A1D23] border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-[#EAEAEA] rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none transition-all duration-300"
                value={formData.contactMethod}
                onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
                required
              >
                <option value="" disabled>{t('form_contact_method')}</option>
                <option value="Telegram">{t('form_contact_telegram')}</option>
                <option value="Phone">{t('form_contact_phone')}</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>
        
        {/* Course Level Selection */}
        <div className="space-y-1">
          <div className="relative">
            <select 
              className="w-full p-4 pr-12 bg-slate-50 dark:bg-[#1A1D23] border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-[#EAEAEA] rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none transition-all duration-300"
              value={formData.course}
              onChange={(e) => setFormData({...formData, course: e.target.value, teacher: '', schedule: ''})}
              required
            >
              <option value="" disabled>{t('form_course')}</option>
              {uniqueLevels.map((level: string) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Teacher Selection - Dynamically loaded based on Course */}
        {formData.course && (
          <div className="space-y-1">
            <div className="relative">
              <select 
                className="w-full p-4 pr-12 bg-slate-50 dark:bg-[#1A1D23] border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-[#EAEAEA] rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none transition-all duration-300"
                value={formData.teacher}
                onChange={(e) => setFormData({...formData, teacher: e.target.value, schedule: ''})}
                required
              >
                <option value="" disabled>{t('form_teacher')}</option>
                {availableTeachers.map((teacher: string) => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
                {availableTeachers.length === 0 && (
                  <option disabled>{t('no_teachers_available')}</option>
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        )}

        {/* Schedule Selection - Dynamically loaded based on Teacher */}
        {formData.teacher && (
          <div className="space-y-1">
            <div className="relative">
              <select 
                className="w-full p-4 pr-12 bg-slate-50 dark:bg-[#1A1D23] border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-[#EAEAEA] rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none transition-all duration-300"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              >
                <option value="" disabled>{t('form_schedule')}</option>
                {availableSchedules.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
                {availableSchedules.length === 0 && (
                  <option disabled>{t('no_schedules_available')}</option>
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
          </div>
        )}

        <button 
          className={`w-full bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] rounded-2xl py-4 text-lg font-semibold flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-500/20 transition-all duration-300 ${isLoading ? 'opacity-80 scale-95' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            t('form_submit')
          )}
        </button>
      </div>
    </form>
  );
};
