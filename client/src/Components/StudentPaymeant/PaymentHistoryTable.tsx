import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Receipt } from 'lucide-react';

interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  monthYear: string;
  transactionId: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
}

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
  isLoading: boolean;
}

export default function PaymentHistoryTable({
  payments,
  isLoading,
}: PaymentHistoryTableProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Successful
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      default:
        return <span className="text-muted-foreground">{status}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full rounded-3xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
            <p className="text-sm text-muted-foreground">
              {payments.length} transaction{payments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p>Loading records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No payments yet</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Your payment history will appear here once you make your first payment.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Month</th>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment, index) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(payment.paymentDate).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {new Date(payment.monthYear + '-01').toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs font-mono border border-border">
                      {payment.transactionId ? payment.transactionId.slice(0, 14) + '...' : 'N/A'}
                    </code>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    ₹{Number(payment.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {getStatusBadge(payment.status)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}