import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

interface PaymentHeaderProps {
  availableMonths: Array<{
    id: string;
    monthYear: string;
    dueAmount: number;
    status?: 'PENDING' | 'OVERDUE' | 'PAID';
  }>;
  onPaymentSelect: (monthYear: string, amount: number) => void;
  isLoading: boolean;
}

export default function PaymentHeader({
  availableMonths,
  onPaymentSelect,
  isLoading,
}: PaymentHeaderProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  // Filter out already paid months
  const unpaidMonths = useMemo(() => {
    return availableMonths.filter(month => month.status !== 'PAID');
  }, [availableMonths]);

  const handleMonthChange = (monthYear: string) => {
    setSelectedMonth(monthYear);
    const month = unpaidMonths.find((m) => m.monthYear === monthYear);
    if (month) {
      setSelectedAmount(Number(month.dueAmount));
    }
  };

  const handlePayNow = () => {
    if (selectedMonth && selectedAmount > 0) {
      onPaymentSelect(selectedMonth, selectedAmount);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8"
    >
      {/* Card Container with subtle glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-sm shadow-xl">
        
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left Side: Title & Info */}
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="p-3 bg-primary/10 rounded-xl text-primary"
                >
                  <CreditCard className="w-6 h-6" strokeWidth={2} />
                </motion.div>
                <div>
                  <span className="text-xs font-semibold tracking-wider text-primary/80 uppercase block mb-0.5">
                    Student Payments
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Make a Payment
                  </h1>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Select a month to clear your hostel dues securely through Razorpay.
              </p>

              <div className="flex items-center gap-3 text-xs">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 font-medium border border-green-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} /> Secure
                </motion.span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20"
                >
                  <Lock className="w-3.5 h-3.5" strokeWidth={2} /> Encrypted
                </motion.span>
              </div>
            </div>

            {/* Right Side: Payment Controls */}
            <div className="flex-shrink-0 w-full lg:w-auto lg:min-w-[450px]">
              <div className="bg-muted/30 p-1.5 rounded-xl border border-border/50">
                <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
                    
                    {/* Month Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Select Month
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none z-10" strokeWidth={2} />
                        <select 
                          value={selectedMonth}
                          onChange={(e) => handleMonthChange(e.target.value)}
                          disabled={isLoading || unpaidMonths.length === 0}
                          className="w-full pl-10 pr-4 py-3 bg-background border border-input hover:border-primary/50 rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {unpaidMonths.length === 0 ? 'No pending dues' : 'Choose month...'}
                          </option>
                          {unpaidMonths.map((month) => (
                            <option key={month.id} value={month.monthYear}>
                              {new Date(month.monthYear + '-01').toLocaleDateString('en-IN', {
                                month: 'long', 
                                year: 'numeric'
                              })}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
                            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Amount Display */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Amount
                      </label>
                      <div className="h-[48px] px-4 flex items-center justify-center bg-muted/50 border border-border rounded-lg min-w-[120px]">
                        <span className={`font-mono font-bold text-xl ${selectedAmount > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {selectedAmount > 0 ? `₹${selectedAmount.toLocaleString('en-IN')}` : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Pay Button */}
                    <motion.button
                      whileHover={{ scale: selectedMonth ? 1.02 : 1 }}
                      whileTap={{ scale: selectedMonth ? 0.98 : 1 }}
                      onClick={handlePayNow}
                      disabled={!selectedMonth || isLoading || unpaidMonths.length === 0}
                      className="h-[48px] px-6 bg-primary text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay Now</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}