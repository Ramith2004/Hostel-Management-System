import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthYear: string;
  amount: number;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  monthYear,
  amount,
  onSuccess,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    setError('');
    setIsLoading(true);

    try {
      const tenantId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!).tenantId
        : null;

      if (!tenantId) {
        throw new Error('Tenant ID not found');
      }

      // ✅ Create Razorpay order
      const response = await api.post('/api/student/payments/initiate', {
        monthYear,
        amount,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to initiate payment');
      }

      const { orderId } = response.data.data;

      // ✅ Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        order_id: orderId,
        amount: amount * 100,
        currency: 'INR',
        name: 'Hostel Payment',
        description: `Payment for ${monthYear}`,

        handler: async (razorpayResponse: any) => {
          try {
            // Verify payment
            await api.post('/api/student/payments/verify', {
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
            });

            setPaymentSuccess(true);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2000);
          } catch (err: any) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setIsLoading(false);
          }
        },

        prefill: {
          contact: localStorage.getItem('user')
            ? JSON.parse(localStorage.getItem('user')!).email
            : '',
        },

        theme: {
          color: '#3b82f6',
        },

        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card rounded-xl p-8 shadow-lg max-w-md w-full mx-4 border border-border"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-accent rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccess ? (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Confirm Payment</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Complete your payment securely
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Payment Details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-600 font-medium">Month</span>
                    <span className="text-blue-900 font-semibold">
                      {new Date(monthYear + '-01').toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                    <span className="text-blue-600 font-medium">Amount</span>
                    <span className="text-2xl font-bold text-blue-900">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Success State */
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center mb-6"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground">Your payment has been processed successfully.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}