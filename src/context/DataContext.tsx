import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

export type LeadStatus = 'Pending' | 'Contacted' | 'Enrolled' | 'Rejected';

export interface Lead {
  id: string;
  studentName: string;
  phone: string;
  course: string;
  teacher: string;
  time: string;
  email?: string;
  contactMethod: string;
  date: string;
  status: LeadStatus;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
  level?: string;
  students?: number;
  features?: string[];
  instructorId?: string;
  instructor?: Instructor;
  schedule?: string[];
  curriculum?: string;
  outcomes?: string;
}

export interface Schedule {
  id: string;
  courseId: string;
  days: string[];
  time: string;
  room: string;
  teacherId: string;
}

export interface Instructor {
  id: string;
  name: string;
  photo: string;
  bio: string;
  qualifications: string[];
  testimonial: string;
  specialty?: string;
}

export interface Message {
  id: string;
  sender_name: string;
  sender_phone: string;
  message_text: string;
  status: 'New' | 'Read' | 'Replied';
  created_at: string;
}

export interface Settings {
  id: string;
  siteName: string;
  logoUrl: string;
  phone: string;
  address: string;
  telegramLink: string;
  instagramLink: string;
  youtubeLink: string;
  workingHours: string;
  googleMapsEmbed: string;
}

interface DataContextType {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'date' | 'status'>) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  instructors: Instructor[];
  addInstructor: (instructor: Omit<Instructor, 'id'>) => Promise<void>;
  updateInstructor: (instructor: Instructor) => Promise<void>;
  deleteInstructor: (id: string) => Promise<void>;
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (schedule: Schedule) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'date' | 'status'>) => Promise<void>;
  updateMessageStatus: (id: string, status: Message['status']) => Promise<void>;
  settings: Settings;
  updateSettings: (settings: Settings) => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>({ 
    id: '1', 
    siteName: '', 
    logoUrl: '', 
    phone: '', 
    address: '',
    telegramLink: '',
    instagramLink: '',
    youtubeLink: '',
    workingHours: '',
    googleMapsEmbed: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cached data on initial mount
  useEffect(() => {
    const cachedCourses = localStorage.getItem('cached_courses');
    const cachedInstructors = localStorage.getItem('cached_instructors');
    const cachedSettings = localStorage.getItem('cached_settings');
    const cachedSchedules = localStorage.getItem('cached_schedules');

    if (cachedCourses) setCourses(JSON.parse(cachedCourses));
    if (cachedInstructors) setInstructors(JSON.parse(cachedInstructors));
    if (cachedSettings) setSettings(JSON.parse(cachedSettings));
    if (cachedSchedules) setSchedules(JSON.parse(cachedSchedules));

    // If we have cached critical data, we can set loading to false earlier
    if (cachedCourses && cachedSettings) {
      setLoading(false);
    }
  }, []);

  const fetchData = async (abortController?: AbortController) => {
    // Only show loading if we don't have cached data
    const hasCache = localStorage.getItem('cached_courses') && localStorage.getItem('cached_settings');
    if (!hasCache) {
      setLoading(true);
    }
    
    setError(null);
    const signal = abortController?.signal;
    
    try {
      // 1. Fetch critical data first (needed for LandingPage)
      const [
        coursesRes,
        instructorsRes,
        schedulesRes,
        settingsRes
      ] = await Promise.all([
        supabase.from('courses').select('*').abortSignal(signal as any),
        supabase.from('instructors').select('*').abortSignal(signal as any),
        supabase.from('schedules').select('*').abortSignal(signal as any),
        supabase.from('settings').select('*').abortSignal(signal as any)
      ]);

      if (signal?.aborted) return;

      // Check for critical errors
      const criticalErrors: Record<string, any> = {};
      if (coursesRes.error) criticalErrors.courses = coursesRes.error;
      if (instructorsRes.error) criticalErrors.instructors = instructorsRes.error;
      if (schedulesRes.error) criticalErrors.schedules = schedulesRes.error;
      if (settingsRes.error) criticalErrors.settings = settingsRes.error;

      if (Object.keys(criticalErrors).length > 0) {
        // If we have cache, don't throw error, just log it
        if (hasCache) {
          console.error("Supabase fetch error, using cache:", criticalErrors);
        } else {
          const firstError = Object.values(criticalErrors)[0];
          let message = `Supabase connection error: ${firstError?.message || 'Unknown error'}`;
          
          if (firstError?.message?.toLowerCase().includes('fetch')) {
            message = "Could not connect to Supabase server. Please check your internet connection.";
          } else if (firstError?.code === 'PGRST301' || firstError?.message?.includes('JWT')) {
            message = "Invalid or expired Supabase API key.";
          } else if (firstError?.message?.includes('relation') && firstError?.message?.includes('does not exist')) {
            message = "Database tables missing. Please ensure all tables are created in Supabase.";
          }
          
          throw new Error(message);
        }
      }

      // Process critical data immediately
      let processedInstructors: Instructor[] = [];
      if (instructorsRes.data) {
        processedInstructors = instructorsRes.data.map(i => ({
          ...i,
          photo: i.photo || i.image || '',
          bio: i.bio || i.biography || '',
          qualifications: i.qualifications || i.features || [],
          testimonial: i.testimonial || '',
          specialty: i.specialty || i.role || ''
        }));
        setInstructors(processedInstructors);
        localStorage.setItem('cached_instructors', JSON.stringify(processedInstructors));
      }

      if (coursesRes.data) {
        const mappedCourses = coursesRes.data.map(c => {
          const instructor = processedInstructors.find(i => i.id === (c.instructorId || c.instructor_id));
          return { 
            ...c, 
            features: c.features || [],
            schedule: c.schedules || c.schedule || [],
            instructorId: c.instructorId || c.instructor_id, 
            instructor: instructor 
          };
        });
        setCourses(mappedCourses);
        localStorage.setItem('cached_courses', JSON.stringify(mappedCourses));
      }

      if (schedulesRes.data) {
        const mappedSchedules = schedulesRes.data.map(s => ({
          ...s,
          days: s.days || []
        }));
        setSchedules(mappedSchedules);
        localStorage.setItem('cached_schedules', JSON.stringify(mappedSchedules));
      }

      if (settingsRes.data && settingsRes.data.length > 0) {
        const settingsData = settingsRes.data[0];
        const sanitizedSettings: Settings = {
          id: String(settingsData.id || '1'),
          siteName: settingsData.siteName || '',
          logoUrl: settingsData.logoUrl || '',
          phone: settingsData.phone || '',
          address: settingsData.address || '',
          telegramLink: settingsData.telegramLink || '',
          instagramLink: settingsData.instagramLink || '',
          youtubeLink: settingsData.youtubeLink || '',
          workingHours: settingsData.workingHours || '',
          googleMapsEmbed: settingsData.googleMapsEmbed || ''
        };
        setSettings(sanitizedSettings);
        localStorage.setItem('cached_settings', JSON.stringify(sanitizedSettings));
      }

      // Set loading to false as soon as critical data is ready
      setLoading(false);

      // 2. Fetch non-critical data in the background (needed for AdminDashboard)
      const [leadsRes, messagesRes] = await Promise.all([
        supabase.from('leads').select('*').order('date', { ascending: false }).abortSignal(signal as any),
        supabase.from('messages').select('*').order('created_at', { ascending: false }).abortSignal(signal as any)
      ]);

      if (signal?.aborted) return;

      if (leadsRes.data) setLeads(leadsRes.data);
      if (messagesRes.data) {
        setMessages(messagesRes.data.map((m: any) => ({
          id: m.id,
          sender_name: m.sender_name,
          sender_phone: m.sender_phone,
          message_text: m.message_text,
          status: m.status,
          created_at: m.created_at
        })));
      }

    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('signal is aborted')) {
        return;
      }
      
      let errorMessage = err.message || 'Error loading data';
      
      if (errorMessage.toLowerCase().includes('fetch')) {
        errorMessage = "Could not connect to Supabase server. Please check your internet connection and project status.";
      }
      
      setError(errorMessage);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller);

    const channels = [
      supabase.channel('leads').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, payload => {
        if (payload.eventType === 'INSERT') setLeads(prev => [payload.new as Lead, ...prev]);
        if (payload.eventType === 'UPDATE') setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
        if (payload.eventType === 'DELETE') setLeads(prev => prev.filter(l => l.id !== payload.old.id));
      }).subscribe(),
      supabase.channel('courses').on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, payload => {
        if (payload.eventType === 'INSERT') setCourses(prev => [...prev, payload.new as Course]);
        if (payload.eventType === 'UPDATE') setCourses(prev => prev.map(c => c.id === payload.new.id ? payload.new as Course : c));
        if (payload.eventType === 'DELETE') setCourses(prev => prev.filter(c => c.id !== payload.old.id));
      }).subscribe(),
      supabase.channel('instructors').on('postgres_changes', { event: '*', schema: 'public', table: 'instructors' }, payload => {
        if (payload.eventType === 'INSERT') setInstructors(prev => [...prev, payload.new as Instructor]);
        if (payload.eventType === 'UPDATE') setInstructors(prev => prev.map(i => i.id === payload.new.id ? payload.new as Instructor : i));
        if (payload.eventType === 'DELETE') setInstructors(prev => prev.filter(i => i.id !== payload.old.id));
      }).subscribe(),
      supabase.channel('schedules').on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, payload => {
        if (payload.eventType === 'INSERT') setSchedules(prev => [...prev, payload.new as Schedule]);
        if (payload.eventType === 'UPDATE') setSchedules(prev => prev.map(s => s.id === payload.new.id ? payload.new as Schedule : s));
        if (payload.eventType === 'DELETE') setSchedules(prev => prev.filter(s => s.id !== payload.old.id));
      }).subscribe(),
      supabase.channel('messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
        if (payload.eventType === 'INSERT') {
          const m = payload.new as any;
          setMessages(prev => [{
            id: m.id,
            sender_name: m.sender_name,
            sender_phone: m.sender_phone,
            message_text: m.message_text,
            status: m.status,
            created_at: m.created_at
          }, ...prev]);
        }
        if (payload.eventType === 'UPDATE') {
          const m = payload.new as any;
          setMessages(prev => prev.map(msg => msg.id === m.id ? {
            id: m.id,
            sender_name: m.sender_name,
            sender_phone: m.sender_phone,
            message_text: m.message_text,
            status: m.status,
            created_at: m.created_at
          } : msg));
        }
        if (payload.eventType === 'DELETE') setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      }).subscribe(),
      supabase.channel('settings').on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, payload => {
        if (payload.new) {
          const s = payload.new as any;
          setSettings({
            id: String(s.id),
            siteName: s.siteName || '',
            logoUrl: s.logoUrl || '',
            phone: s.phone || '',
            address: s.address || '',
            telegramLink: s.telegramLink || '',
            instagramLink: s.instagramLink || '',
            youtubeLink: s.youtubeLink || '',
            workingHours: s.workingHours || '',
            googleMapsEmbed: s.googleMapsEmbed || ''
          });
        }
      }).subscribe(),
    ];

    return () => {
      controller.abort();
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'date' | 'status'>) => {
    const payload = {
      "studentName": leadData.studentName,
      "phone": leadData.phone,
      "email": leadData.email,
      "contactMethod": leadData.contactMethod,
      "course": leadData.course,
      "teacher": leadData.teacher,
      "time": leadData.time,
      "status": 'Pending',
      "date": new Date().toLocaleDateString('en-CA')
    };
    
    // Remove undefined fields
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    const { data, error } = await supabase.from('leads').insert([payload]).select().single();
    if (error) {
      throw error;
    }
    
    // Optimistically update the UI if realtime subscription is slow
    if (data) {
      setLeads(prev => {
        if (prev.some(l => l.id === data.id)) return prev;
        return [data, ...prev];
      });
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) {
      await refreshData();
      throw error;
    }
  };

  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      const payload = {
        "title": courseData.title,
        "description": courseData.description || courseData.curriculum || '',
        "price": courseData.price,
        "duration": courseData.duration,
        "imageUrl": courseData.imageUrl || '',
        "level": courseData.level || 'A1',
        "students": courseData.students || 0,
        "features": courseData.features || [],
        "instructor_id": courseData.instructorId || null,
        "curriculum": courseData.curriculum || '',
        "outcomes": courseData.outcomes || ''
      };
      
      const { error } = await supabase.from('courses').insert([payload]);
      
      if (error) {
        throw error;
      }
      
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const updateCourse = async (course: Course) => {
    try {
      const payload = {
        "title": course.title,
        "description": course.description || course.curriculum || '',
        "price": course.price,
        "duration": course.duration,
        "imageUrl": course.imageUrl || '',
        "level": course.level || 'A1',
        "students": course.students || 0,
        "features": course.features || [],
        "instructor_id": course.instructorId || null,
        "curriculum": course.curriculum || '',
        "outcomes": course.outcomes || ''
      };
      
      const { error } = await supabase.from('courses').update(payload).eq('id', course.id);
      
      if (error) {
        throw error;
      }
      
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      // Dastlab kursga tegishli dars jadvallarini o'chiramiz (Foreign key xatoligini oldini olish uchun)
      await supabase.from('schedules').delete().eq('courseId', id);
      
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const addInstructor = async (instructorData: Omit<Instructor, 'id'>) => {
    try {
      const payload: any = {
        name: instructorData.name,
        biography: instructorData.bio,
        image: instructorData.photo,
        features: instructorData.qualifications,
        specialty: instructorData.specialty,
        testimonial: instructorData.testimonial
      };

      const { error } = await supabase.from('instructors').insert(payload);
      if (error) {
        if (error.message.includes('column') || error.code === '42703') {
          const missingColumn = error.message.match(/'([^']+)'/)?.[1] || 
                                error.message.match(/column "([^"]+)"/)?.[1];
          
          if (missingColumn) {
            delete payload[missingColumn];
            
            const { error: retryError } = await supabase.from('instructors').insert(payload);
            
            if (retryError) {
              const secondMissingColumn = retryError.message.match(/'([^']+)'/)?.[1] || 
                                         retryError.message.match(/column "([^"]+)"/)?.[1];
              if (secondMissingColumn) {
                delete payload[secondMissingColumn];
                const { error: finalError } = await supabase.from('instructors').insert(payload);
                if (finalError) throw finalError;
              } else {
                throw retryError;
              }
            }
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const deleteInstructor = async (id: string) => {
    try {
      // First, nullify references in courses table to avoid foreign key constraint violation
      await supabase.from('courses').update({ instructor_id: null }).eq('instructor_id', id);
      await supabase.from('courses').update({ instructorId: null }).eq('instructorId', id);
      
      // Also nullify in schedules table
      await supabase.from('schedules').update({ teacherId: null }).eq('teacherId', id);

      const { error } = await supabase.from('instructors').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (error: any) {
      if (error.message.includes('violates foreign key constraint')) {
        toast.error("Cannot delete instructor: linked courses or schedules exist.");
      }
      throw error;
    }
  };

  const updateInstructor = async (instructor: Instructor) => {
    try {
      const { id, ...instructorData } = instructor;
      const payload: any = {
        name: instructorData.name,
        biography: instructorData.bio,
        image: instructorData.photo,
        features: instructorData.qualifications,
        specialty: instructorData.specialty,
        testimonial: instructorData.testimonial
      };

      const { error } = await supabase.from('instructors').update(payload).eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const addSchedule = async (scheduleData: Omit<Schedule, 'id'>) => {
    try {
      const { error } = await supabase.from('schedules').insert(scheduleData);
      if (error) throw error;
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const updateSchedule = async (schedule: Schedule) => {
    try {
      const { id, ...payload } = schedule;
      const { error } = await supabase.from('schedules').update(payload).eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) throw error;
      await refreshData();
    } catch (error: any) {
      throw error;
    }
  };

  const updateMessageStatus = async (id: string, status: Message['status']) => {
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    
    const { error } = await supabase.from('messages').update({ status }).eq('id', id);
    if (error) {
      await refreshData();
    }
  };

  const addMessage = async (messageData: { sender_name: string; sender_phone: string; message_text: string }) => {
    try {
      const { data, error } = await supabase.from('messages').insert({ 
        sender_name: messageData.sender_name, 
        sender_phone: messageData.sender_phone,
        message_text: messageData.message_text,
        status: 'New'
      }).select().single();
      
      if (error) throw error;
      
      if (data) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [data, ...prev];
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const updateSettings = async (settingsData: Settings) => {
    try {
      const updatePayload = {
        siteName: settingsData.siteName,
        logoUrl: settingsData.logoUrl,
        phone: settingsData.phone,
        address: settingsData.address,
        telegramLink: settingsData.telegramLink,
        instagramLink: settingsData.instagramLink,
        youtubeLink: settingsData.youtubeLink,
        workingHours: settingsData.workingHours,
        googleMapsEmbed: settingsData.googleMapsEmbed
      };

      const { data: existing, error: fetchError } = await supabase.from('settings').select('id').limit(1);
      
      let response;
      
      if (fetchError) {
        response = await supabase.from('settings').insert(updatePayload).select();
      } else if (existing && existing.length > 0) {
        const realId = existing[0].id;
        response = await supabase
          .from('settings')
          .update(updatePayload)
          .eq('id', realId)
          .select();
      } else {
        response = await supabase.from('settings').insert(updatePayload).select();
      }
      
      const { data, error } = response;
      
      if (error) throw error;

      if (data && data.length > 0) {
        const s = data[0] as any;
        setSettings({
          id: String(s.id),
          siteName: s.siteName || '',
          logoUrl: s.logoUrl || '',
          phone: s.phone || '',
          address: s.address || '',
          telegramLink: s.telegramLink || '',
          instagramLink: s.instagramLink || '',
          youtubeLink: s.youtubeLink || '',
          workingHours: s.workingHours || '',
          googleMapsEmbed: s.googleMapsEmbed || ''
        });
      } else {
        setSettings(settingsData);
      }
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{ leads, addLead, updateLeadStatus, courses, addCourse, updateCourse, deleteCourse, instructors, addInstructor, updateInstructor, deleteInstructor, schedules, addSchedule, updateSchedule, deleteSchedule, messages, addMessage, updateMessageStatus, settings, updateSettings, refreshData, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
