import { useEffect, useState } from 'react';
import api from '../../lib/api';
import PaymentHeader from './PaymentHeader'; // ✅ Changed from PaymentHero
import PaymentHistoryTable from './PaymentHistoryTable';
import PaymentModal from './PaymentModal';

interface Due {
  id: string;
  monthYear: string;
  dueAmount: number;
  dueDate: string;
  status: 'PENDING' | 'OVERDUE' | 'PAID';
}

interface PaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  monthYear: string;
  transactionId: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
}

export default function StudentPaymentDashboard() {
  const [availableMonths, setAvailableMonths] = useState<Due[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const duesResponse = await api.get('/api/student/payments/dues');
      if (duesResponse.data.success) {
        setAvailableMonths(duesResponse.data.data || []);
      }

      const historyResponse = await api.get('/api/student/payments/history');
      if (historyResponse.data.success) {
        setPaymentHistory(historyResponse.data.data || []);
      }
    } catch (err: any) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSelect = (monthYear: string, amount: number) => {
    setSelectedMonth(monthYear);
    setSelectedAmount(amount);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedMonth('');
    setSelectedAmount(0);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8">
      <div className="max-w-8xl mx-auto">
        {/* Header Section */}
        <PaymentHeader
          availableMonths={availableMonths}
          onPaymentSelect={handlePaymentSelect}
          isLoading={isLoading}
        />

        {/* History Table */}
        <PaymentHistoryTable payments={paymentHistory} isLoading={isLoading} />
      </div>

      {selectedMonth && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          monthYear={selectedMonth}
          amount={selectedAmount}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}