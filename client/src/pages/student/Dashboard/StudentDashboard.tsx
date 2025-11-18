import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, MessageSquare } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const stats = [
    { label: 'Upcoming Events', value: '2', icon: Calendar, color: 'text-blue-500' },
    { label: 'Pending Payments', value: '₹5,000', icon: DollarSign, color: 'text-yellow-500' },
    { label: 'My Complaints', value: '1', icon: MessageSquare, color: 'text-purple-500' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground">Your hostel activities at a glance.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-accent/10 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;