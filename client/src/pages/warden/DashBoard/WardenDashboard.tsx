import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, UserCheck, AlertCircle } from 'lucide-react';

const WardenDashboard: React.FC = () => {
  const stats = [
    { label: 'Pending Complaints', value: '8', icon: ClipboardList, color: 'text-orange-500' },
    { label: 'Today\'s Attendance', value: '95%', icon: UserCheck, color: 'text-green-500' },
    { label: 'Alerts', value: '3', icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Warden Dashboard</h1>
        <p className="text-muted-foreground">Manage daily operations efficiently.</p>
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

export default WardenDashboard;