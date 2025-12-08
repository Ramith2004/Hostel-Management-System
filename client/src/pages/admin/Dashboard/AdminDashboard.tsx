import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BedDouble, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import api, { API_ROUTES } from '../../../lib/api';

interface DashboardMetrics {
  metrics: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
    totalStudents: number;
    activeComplaints: number;
    resolvedComplaints: number;
    pendingPayments: number;
    totalFeeCollected: number;
    totalStudentsThisMonth: number;
  };
  roomStatus: {
    available: number;
    full: number;
    maintenance: number;
    reserved: number;
  };
  complaints: {
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
    rejected: number;
  };
  fees: {
    totalDue: number;
    totalCollected: number;
    totalDefaulters: number;
    collectionRate: number;
  };
  lastUpdated: string;
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Fetching dashboard metrics...');
      
      const response = await api.get(API_ROUTES.ADMIN_DASHBOARD_METRICS);
      
      console.log('✅ Dashboard metrics fetched:', response.data);
      
      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      console.error('❌ Error fetching dashboard metrics:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Format currency
  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value}`;
  };

  // ✅ Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md"
        >
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-semibold text-red-700 dark:text-red-300">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardMetrics}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">No dashboard data available</p>
      </div>
    );
  }

  // ✅ Stats array with real data
  const stats = [
    {
      label: 'Total Students',
      value: dashboardData.metrics.totalStudents,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Available Rooms',
      value: dashboardData.metrics.availableRooms,
      icon: BedDouble,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Monthly Revenue',
      value: dashboardData.fees.totalCollected,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      format: (v: number) => formatCurrency(v),
    },
    {
      label: 'Occupancy Rate',
      value: dashboardData.metrics.occupancyRate,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      format: (v: number) => formatPercentage(v),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        <p className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
        </p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
              className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-all hover:border-primary/50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {stat.format(stat.value)}
              </h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Complaints Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card p-6 rounded-xl border border-border"
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">Complaints Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{dashboardData.complaints.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{dashboardData.complaints.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{dashboardData.complaints.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{dashboardData.complaints.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{dashboardData.complaints.closed}</p>
            <p className="text-xs text-muted-foreground">Closed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{dashboardData.complaints.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </motion.div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchDashboardMetrics}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;