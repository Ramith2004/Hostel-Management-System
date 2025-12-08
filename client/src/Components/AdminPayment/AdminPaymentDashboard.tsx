import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import PaymentListTab from './PaymentListTab';
import api from '../../lib/api';

interface PaymentStats {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

export default function AdminPaymentDashboard() {
  const [stats, setStats] = useState<PaymentStats>({
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await api.get('/api/admin/payments/history');
      
      if (response.data.success) {
        const payments = response.data.data || [];
        
        const paidPayments = payments.filter((p: any) => p.status === 'PAID');
        const pendingPayments = payments.filter((p: any) => p.status === 'PENDING');
        const failedPayments = payments.filter((p: any) => p.status === 'FAILED');
        
        const totalCollected = paidPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
        const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
        
        setStats({
          totalCollected,
          totalPending,
          totalOverdue: 0,
          successfulPayments: paidPayments.length,
          pendingPayments: pendingPayments.length,
          failedPayments: failedPayments.length,
        });
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Receipt className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
              <p className="text-muted-foreground text-sm mt-1">View and manage student payments</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {/* Total Collected */}
          <div className="p-5 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm font-medium">Total Collected</p>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-10 flex items-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ₹{stats.totalCollected.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.successfulPayments} successful payments
                </p>
              </>
            )}
          </div>

          {/* Total Pending */}
          <div className="p-5 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm font-medium">Total Pending</p>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-10 flex items-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  ₹{stats.totalPending.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingPayments} pending payments
                </p>
              </>
            )}
          </div>

          {/* Success Rate */}
          <div className="p-5 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-sm font-medium">Success Rate</p>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            {isLoadingStats ? (
              <div className="h-10 flex items-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-primary">
                  {stats.successfulPayments + stats.pendingPayments + stats.failedPayments > 0
                    ? Math.round((stats.successfulPayments / (stats.successfulPayments + stats.pendingPayments + stats.failedPayments)) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.failedPayments} failed payments
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Payment List */}
        <PaymentListTab onStatsUpdate={fetchStats} />
      </motion.div>
    </div>
  );
}