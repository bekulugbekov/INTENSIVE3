import React from 'react';
import { Clock, MapPin, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

interface ScheduleCardProps {
  schedule: any;
  index: number;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, index }) => {
  const { courses } = useData();
  const course = courses.find(c => c.id === schedule.courseId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-[#242830] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-all"
    >
      <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white flex items-center gap-2">
        <BookOpen className="text-emerald-500" />
        {course?.title || schedule.courseId}
      </h3>
      <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-emerald-500" />
          <span>{Array.isArray(schedule.days) ? schedule.days.join(', ') : schedule.days} - {schedule.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-emerald-500" />
          <span>Xona: {schedule.room}</span>
        </div>
      </div>
    </motion.div>
  );
};
