import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../lib/api';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  paymentDate: string;
  monthYear: string;
  transactionId: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
}

// ✅ Add the props interface
interface PaymentListTabProps {
  onStatsUpdate?: () => void;
}

// ✅ Accept the props
export default function PaymentListTab({ onStatsUpdate }: PaymentListTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'PAID' | 'PENDING' | 'FAILED'>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, filterStatus]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/admin/payments/history');
      
      if (response.data.success) {
        setPayments(response.data.data || []);
        onStatsUpdate?.(); // ✅ Call the callback to update stats
      }
    } catch (err: any) {
      console.error('Error fetching payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = payments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Sort by payment date (newest first)
    filtered.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    setFilteredPayments(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['Student Name', 'Email', 'Amount', 'Payment Date', 'Month', 'Transaction ID', 'Status'],
      ...filteredPayments.map(p => [
        p.studentName,
        p.studentEmail,
        p.amount,
        new Date(p.paymentDate).toLocaleDateString('en-IN'),
        p.monthYear,
        p.transactionId || '',
        p.status,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Successful
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      default:
        return <span className="text-muted-foreground">{status}</span>;
    }
  };

  // ✅ FIXED: Calculate summary stats - ONLY count PAID payments
  const paidPayments = filteredPayments.filter(p => p.status === 'PAID');
  const totalAmount = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const successfulPayments = paidPayments.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-card border border-border rounded-xl"
        >
          <p className="text-muted-foreground text-sm font-medium mb-1">Total Payments</p>
          <p className="text-3xl font-bold text-foreground">{filteredPayments.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-card border border-border rounded-xl"
        >
          <p className="text-muted-foreground text-sm font-medium mb-1">Successful Payments</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{successfulPayments}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-card border border-border rounded-xl"
        >
          <p className="text-muted-foreground text-sm font-medium mb-1">Amount Collected</p>
          <p className="text-3xl font-bold text-primary">₹{totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted-foreground mt-1">From successful payments only</p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-5 bg-card border border-border rounded-xl"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name, email, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="PAID">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={filteredPayments.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No payments found</p>
              <p className="text-muted-foreground text-sm mt-2">Payments will appear here once students complete their transactions</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-semibold">Student Details</th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-semibold">Amount</th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-semibold">Payment Date</th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-semibold">Month</th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-semibold">Transaction ID</th>
                  <th className="text-left py-4 px-6 text-muted-foreground text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-foreground">{payment.studentName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{payment.studentEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-foreground text-lg">₹{payment.amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(payment.paymentDate).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-foreground">
                        {new Date(payment.monthYear + '-01').toLocaleDateString('en-IN', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <code className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-mono border border-border">
                        {payment.transactionId ? payment.transactionId.slice(0, 16) + '...' : 'N/A'}
                      </code>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(payment.status)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer with count */}
        {!isLoading && filteredPayments.length > 0 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredPayments.length}</span> of{' '}
              <span className="font-semibold text-foreground">{payments.length}</span> payments
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}