import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, Calendar, Settings, 
  TrendingUp, MessageSquare, Bell, Search,
  LogOut, Menu, ChevronRight, DollarSign,
  UserPlus, FileText, Pencil, Trash2, Sun, Moon,
  Clock, MapPin, X
} from 'lucide-react';
import { Logo } from './Logo';
import { useData, Schedule, Message } from '../context/DataContext';
import { CourseModal } from './admin/CourseModal';
import { LeadForm } from './admin/LeadForm';
import { AddInstructorModal } from './admin/AddInstructorModal';
import { ScheduleModal } from './admin/ScheduleModal';
import { SettingsPage } from './SettingsPage';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
    >
      {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
    </button>
  );
};

export const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [initialLeadData, setInitialLeadData] = useState<{studentName?: string, phone?: string} | undefined>(undefined);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [messageFilter, setMessageFilter] = useState<'All' | 'New' | 'Read'>('All');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { leads, courses, schedules, instructors, deleteSchedule, deleteCourse, deleteInstructor, updateInstructor, messages, settings, updateMessageStatus, updateLeadStatus } = useData();
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<any>(null);
  const [deletingInstructorId, setDeletingInstructorId] = useState<string | null>(null);

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const confirmDeleteCourse = async (id: string) => {
    try {
      await deleteCourse(id);
      setDeletingCourseId(null);
      toast.success("Kurs muvaffaqiyatli o'chirildi!");
    } catch (error: any) {
      toast.error("Kursni o'chirishda xatolik yuz berdi: " + error.message);
    }
  };

  // Filter data based on search query
  const filteredLeads = (leads || []).filter(lead => 
    (lead.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.course || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = (courses || []).filter(course =>
    (course.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSchedules = (schedules || []).filter(schedule => {
    const course = (courses || []).find(c => c.id === schedule.courseId);
    return (course?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredMessages = (messageFilter === 'All' 
    ? (messages || []) 
    : (messages || []).filter(m => m.status === messageFilter)
  ).filter(message => 
    (message.sender_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (message.message_text?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const messagesPerPage = 20;
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [messageFilter]);

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isCurrentMonth = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const isLastMonth = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    let lastMonth = currentMonth - 1;
    let year = currentYear;
    if (lastMonth < 0) {
      lastMonth = 11;
      year--;
    }
    return d.getMonth() === lastMonth && d.getFullYear() === year;
  };

  const enrolledLeads = (leads || []).filter(lead => lead.status === 'Enrolled');
  const enrolledStudents = enrolledLeads.length;
  const currentMonthStudents = enrolledLeads.filter(l => isCurrentMonth(l.date)).length;
  const lastMonthStudents = enrolledLeads.filter(l => isLastMonth(l.date)).length;
  const studentTrend = lastMonthStudents === 0 
    ? (currentMonthStudents > 0 ? '+100%' : '0%') 
    : `${currentMonthStudents >= lastMonthStudents ? '+' : ''}${Math.round(((currentMonthStudents - lastMonthStudents) / lastMonthStudents) * 100)}%`;

  const calculateRevenueForLeads = (leadsToCalc: typeof leads) => {
    return leadsToCalc.reduce((total, lead) => {
      const course = (courses || []).find(c => c.title === lead.course);
      if (course && course.price) {
        const numericPrice = parseInt(String(course.price).replace(/[^\d]/g, ''), 10);
        return total + (isNaN(numericPrice) ? 0 : numericPrice);
      }
      return total;
    }, 0);
  };

  const totalRevenue = calculateRevenueForLeads(enrolledLeads);
  const currentMonthRevenue = calculateRevenueForLeads(enrolledLeads.filter(l => isCurrentMonth(l.date)));
  const lastMonthRevenue = calculateRevenueForLeads(enrolledLeads.filter(l => isLastMonth(l.date)));
  const revenueTrend = lastMonthRevenue === 0
    ? (currentMonthRevenue > 0 ? '+100%' : '0%')
    : `${currentMonthRevenue >= lastMonthRevenue ? '+' : ''}${Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)}%`;

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '0 UZS';
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M UZS';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K UZS';
    }
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
  };

  const totalConsultations = (leads || []).length;
  const currentMonthConsultations = (leads || []).filter(l => isCurrentMonth(l.date)).length;
  const lastMonthConsultations = (leads || []).filter(l => isLastMonth(l.date)).length;
  const consultationTrend = lastMonthConsultations === 0
    ? (currentMonthConsultations > 0 ? '+100%' : '0%')
    : `${currentMonthConsultations >= lastMonthConsultations ? '+' : ''}${Math.round(((currentMonthConsultations - lastMonthConsultations) / lastMonthConsultations) * 100)}%`;

  const stats = [
    { label: 'Total Students', value: enrolledStudents.toString(), icon: Users, trend: studentTrend, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { label: 'Active Courses', value: (courses || []).length.toString(), icon: BookOpen, trend: '+0%', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, trend: revenueTrend, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/20' },
    { label: 'Consultations', value: totalConsultations.toString(), icon: MessageSquare, trend: consultationTrend, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/20' },
  ];

  const getCourseStudents = (courseTitle: string) => {
    return (leads || []).filter(l => l.status === 'Enrolled' && l.course === courseTitle).length;
  };

  const recentRegistrations = (leads || []).slice(0, 5);

  const isAlreadyRegistered = (phone: string) => {
    return (leads || []).some(lead => lead.phone === phone);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-[#242830] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                      <stat.icon size={26} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</h3>
                  <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                </motion.div>
              ))}
            </div>

              {/* Recent Activity & Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Registrations */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-white dark:bg-[#242830] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Registrations</h2>
                  <button 
                    onClick={() => setActiveTab('leads')}
                    className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    View All <ChevronRight size={18} />
                  </button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-[#1A1D23]/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
                        <th className="px-6 md:px-8 py-5">Student Name</th>
                        <th className="px-6 md:px-8 py-5">Course</th>
                        <th className="px-6 md:px-8 py-5">Date</th>
                        <th className="px-6 md:px-5 py-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {filteredLeads.slice(0, 5).map((reg) => (
                        <tr key={reg.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 md:px-8 py-5 text-sm font-bold text-gray-900 dark:text-white">{reg.studentName || (reg as any).name}</td>
                          <td className="px-6 md:px-8 py-5 text-sm font-medium text-gray-600 dark:text-gray-300">{reg.course}</td>
                          <td className="px-6 md:px-8 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">{reg.date}</td>
                          <td className="px-6 md:px-8 py-5">
                            <select
                              value={reg.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as any;
                                try {
                                  await updateLeadStatus(reg.id, newStatus);
                                } catch (error) {
                                  toast.error("Statusni yangilashda xatolik yuz berdi");
                                }
                              }}
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none ${
                                reg.status === 'Enrolled' 
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                  : reg.status === 'Pending'
                                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                                  : reg.status === 'Contacted'
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                  : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Enrolled">Enrolled</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-[#242830] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <button 
                    onClick={() => setIsCourseModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group bg-gray-50/50 dark:bg-[#1A1D23]/50 hover:bg-white dark:hover:bg-[#242830]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                        <FileText size={22} />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">Add New Course</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  </button>
                  <button 
                    onClick={() => setIsLeadFormOpen(true)}
                    className="w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group bg-gray-50/50 dark:bg-[#1A1D23]/50 hover:bg-white dark:hover:bg-[#242830]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                        <UserPlus size={22} />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">Register Student</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                </div>
              </motion.div>
            </div>

          </div>
        );
      case 'leads':
        return (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Lead Management</h2>
            <div className="bg-white dark:bg-[#242830] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-[#1A1D23]/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-5">Student Name</th>
                      <th className="px-6 py-5">Phone</th>
                      <th className="px-6 py-5">Course</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">{lead.studentName}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 dark:text-gray-300">{lead.phone}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 dark:text-gray-300">{lead.course}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">{lead.date}</td>
                        <td className="px-6 py-5">
                          <select
                            value={lead.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as any;
                              try {
                                await updateLeadStatus(lead.id, newStatus);
                                toast.success("Status yangilandi!");
                              } catch (error) {
                                toast.error("Statusni yangilashda xatolik yuz berdi");
                              }
                            }}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-0 cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none ${
                              lead.status === 'Enrolled' 
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : lead.status === 'Pending'
                                ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                                : lead.status === 'Contacted'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'courses':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Editor</h2>
              <button 
                onClick={() => setIsCourseModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <FileText size={18} /> Add Course
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-white dark:bg-[#242830] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.title}</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      {deletingCourseId === course.id ? (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">Ishonchingiz komilmi?</span>
                          <button 
                            onClick={() => confirmDeleteCourse(course.id)}
                            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Ha
                          </button>
                          <button 
                            onClick={() => setDeletingCourseId(null)}
                            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Yo'q
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingCourseId(course.id)}
                          className="p-1.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg">{course.level || 'Barcha darajalar'}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p><span className="font-medium text-gray-900 dark:text-gray-200">Instructor:</span> {course.instructor?.name || 'Unknown'}</p>
                    <p><span className="font-medium text-gray-900 dark:text-gray-200">Duration:</span> {course.duration}</p>
                    <p><span className="font-medium text-gray-900 dark:text-gray-200">Price:</span> {course.price}</p>
                    <p><span className="font-medium text-gray-900 dark:text-gray-200">Students:</span> {getCourseStudents(course.title)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(course.features || []).slice(0, 3).map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs rounded-md">{f}</span>
                    ))}
                    {(course.features || []).length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs rounded-md">+{(course.features || []).length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'instructors':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instructors</h2>
              <button 
                onClick={() => {
                  setEditingInstructor(null);
                  setIsInstructorModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <UserPlus size={18} /> Add Instructor
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map(instructor => (
                <div key={instructor.id} className="bg-white dark:bg-[#242830] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1A1D23] border-2 border-emerald-500/20">
                      {instructor.photo ? (
                        <img src={instructor.photo} alt={instructor.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Users size={32} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{instructor.name}</h3>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{instructor.specialty || 'Instructor'}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center">
                      <button 
                        onClick={() => {
                          setEditingInstructor(instructor);
                          setIsInstructorModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil size={16} />
                      </button>
                      {deletingInstructorId === instructor.id ? (
                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 bg-red-50 dark:bg-red-500/10 px-1.5 py-1 rounded-lg">
                          <button 
                            onClick={async () => {
                              try {
                                await deleteInstructor(instructor.id);
                                toast.success("O'qituvchi o'chirildi!");
                                setDeletingInstructorId(null);
                              } catch (error: any) {
                                toast.error("Xatolik: " + error.message);
                              }
                            }}
                            className="text-[10px] px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Ha
                          </button>
                          <button 
                            onClick={() => setDeletingInstructorId(null)}
                            className="text-[10px] px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Yo'q
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingInstructorId(instructor.id)}
                          className="p-1.5 text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-md transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                    {instructor.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(instructor.qualifications || []).map((q, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-[10px] font-medium rounded-md uppercase tracking-wider">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Management</h2>
              <button 
                onClick={handleAddSchedule}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Calendar size={18} /> Add Schedule
              </button>
            </div>
            <div className="bg-white dark:bg-[#242830] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-[#1A1D23]/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-5">Course</th>
                      <th className="px-6 py-5">Teacher</th>
                      <th className="px-6 py-5">Days</th>
                      <th className="px-6 py-5">Time</th>
                      <th className="px-6 py-5">Room</th>
                      <th className="px-6 py-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredSchedules.map((schedule) => {
                      const course = (courses || []).find(c => c.id === schedule.courseId);
                      const teacher = (instructors || []).find(t => t.id === schedule.teacherId);
                      return (
                        <tr key={schedule.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{course?.title || 'Unknown'}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{course?.level || ''}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                {teacher?.name?.charAt(0) || '?'}
                              </div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{teacher?.name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(schedule.days) ? schedule.days : []).map(day => (
                                <span key={day} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                              <Clock size={14} className="text-emerald-500" />
                              {schedule.time}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                              <MapPin size={14} className="text-emerald-500" />
                              {schedule.room}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleEditSchedule(schedule)} 
                                className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil size={18} />
                              </button>
                              
                              {deletingScheduleId === schedule.id ? (
                                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg">
                                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">O'chirilsinmi?</span>
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await deleteSchedule(schedule.id);
                                        toast.success("Dars jadvali o'chirildi!");
                                        setDeletingScheduleId(null);
                                      } catch (error: any) {
                                        toast.error("Xatolik: " + error.message);
                                      }
                                    }}
                                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                  >
                                    Ha
                                  </button>
                                  <button 
                                    onClick={() => setDeletingScheduleId(null)}
                                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    Yo'q
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setDeletingScheduleId(schedule.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Message Management</h2>
            <div className="bg-white dark:bg-[#242830] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex gap-4">
                {['All', 'New', 'Read'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setMessageFilter(status as any)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      messageFilter === status ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-[#1A1D23]/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
                      <th className="px-6 py-5">Name</th>
                      <th className="px-6 py-5">Phone</th>
                      <th className="px-6 py-5">Message</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {paginatedMessages.map((message) => (
                      <tr key={message.id} onClick={() => {
                        setSelectedMessage(message);
                        if (message.status === 'New') {
                          updateMessageStatus(message.id, 'Read');
                        }
                      }} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">
                        <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">{message.sender_name}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 dark:text-gray-300">{message.sender_phone}</td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-xs">{message.message_text}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                            message.status === 'New' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {message.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-gray-500 dark:text-gray-400">{message.created_at ? new Date(message.created_at).toLocaleDateString() : ''}</td>
                        <td className="px-6 py-5">
                          {isAlreadyRegistered(message.sender_phone) ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">
                              <Bell size={12} />
                              Registered
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInitialLeadData({
                                  studentName: message.sender_name,
                                  phone: message.sender_phone
                                });
                                setIsLeadFormOpen(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-xs font-bold whitespace-nowrap"
                              title="Register as Student"
                            >
                              <UserPlus size={16} />
                              <span className="hidden xl:inline">Register</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-white/10 flex justify-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-4 py-2 text-gray-900 dark:text-white font-bold">
                    {currentPage} / {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            {selectedMessage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMessage(null)}>
                <div className="bg-white dark:bg-[#242830] rounded-3xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Message from {selectedMessage.sender_name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedMessage.message_text}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{selectedMessage.sender_phone}</span>
                      {isAlreadyRegistered(selectedMessage.sender_phone) ? (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <Bell size={12} />
                          Already Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setInitialLeadData({
                              studentName: selectedMessage.sender_name,
                              phone: selectedMessage.sender_phone
                            });
                            setIsLeadFormOpen(true);
                            setSelectedMessage(null);
                          }}
                          className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <UserPlus size={14} /> Register as Student
                        </button>
                      )}
                    </div>
                    <button onClick={() => setSelectedMessage(null)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <SettingsPage />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1A1D23] flex font-sans text-neutral-900 dark:text-[#EAEAEA]">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : (window.innerWidth < 768 ? 0 : 80),
          x: isSidebarOpen ? 0 : (window.innerWidth < 768 ? -280 : 0)
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`bg-white/80 dark:bg-[#242830]/80 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col z-30 h-screen shrink-0 fixed md:relative ${!isSidebarOpen && window.innerWidth < 768 ? 'pointer-events-none' : ''}`}
      >
        <div className={`flex items-center h-20 shrink-0 ${isSidebarOpen ? 'px-6 py-2 justify-between' : 'py-2 px-0 justify-center w-full'}`}>
          {isSidebarOpen ? (
            <>
              <Link to="/" className="transition-all duration-300 dark:bg-white/[0.05] dark:backdrop-blur-md dark:px-4 dark:py-2 dark:rounded-2xl dark:border dark:border-white/10 dark:shadow-sm hover:dark:bg-white/[0.08]">
                <Logo className="h-10 w-auto object-contain" />
              </Link>
              <motion.button
                layoutId="sidebarToggle"
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                <X size={22} />
              </motion.button>
            </>
          ) : (
            <Link to="/" className="mx-auto block dark:bg-white/[0.03] dark:backdrop-blur-sm py-2 px-1 rounded-lg dark:border dark:border-white/10 transition-all duration-300">
              <Logo className="h-8 w-auto object-contain" />
            </Link>
          )}
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'leads', icon: Users, label: 'Lead Management' },
            { id: 'courses', icon: BookOpen, label: 'Course Editor' },
            { id: 'instructors', icon: UserPlus, label: 'Instructors' },
            { id: 'schedule', icon: Calendar, label: 'Schedule' },
            { id: 'messages', icon: MessageSquare, label: 'Messages' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium'
              } ${!isSidebarOpen && 'justify-center px-0'}`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <item.icon size={22} className="shrink-0" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isSidebarOpen ? 1 : 0 }}
                transition={{ duration: 0.2, delay: isSidebarOpen ? 0.1 : 0 }}
                className={`whitespace-nowrap flex-1 text-left flex items-center justify-between ${!isSidebarOpen ? 'hidden' : 'block'}`}
              >
                {item.label}
                {item.id === 'messages' && (messages || []).filter(m => m.status === 'New').length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {(messages || []).filter(m => m.status === 'New').length}
                  </span>
                )}
              </motion.span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/10 shrink-0">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 px-4 py-3.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all font-medium ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            title="Logout"
          >
            <LogOut size={22} className="shrink-0" />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isSidebarOpen ? 1 : 0 }}
              transition={{ duration: 0.2, delay: isSidebarOpen ? 0.1 : 0 }}
              className={`whitespace-nowrap ${!isSidebarOpen ? 'hidden' : 'block'}`}
            >
              Logout
            </motion.span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      >
        {/* Header */}
        <header className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-[12px] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-10 h-20 shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <motion.button 
                layoutId="sidebarToggle"
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                <Menu size={22} />
              </motion.button>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize tracking-tight">
              {activeTab.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-[#1A1D23] border border-gray-200 dark:border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 text-gray-900 dark:text-white transition-shadow"
              />
            </div>
            <button 
              onClick={() => setActiveTab('messages')}
              className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full relative transition-colors"
            >
              <Bell size={22} />
              {(messages || []).filter(m => m.status === 'New').length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#242830]"></span>
              )}
            </button>
            <ThemeToggle />
            <div 
              onClick={() => setActiveTab('settings')}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white dark:border-[#242830] shadow-md flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-105 transition-transform"
            >
              A
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      <CourseModal 
        isOpen={isCourseModalOpen} 
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }} 
        courseToEdit={editingCourse || undefined}
      />
      <LeadForm 
        isOpen={isLeadFormOpen} 
        onClose={() => {
          setIsLeadFormOpen(false);
          setInitialLeadData(undefined);
        }} 
        initialData={initialLeadData}
      />
      <AddInstructorModal 
        isOpen={isInstructorModalOpen} 
        onClose={() => {
          setIsInstructorModalOpen(false);
          setEditingInstructor(null);
        }} 
        instructorToEdit={editingInstructor}
      />
      <ScheduleModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }} 
        schedule={editingSchedule || undefined} 
      />
    </div>
  );
};
