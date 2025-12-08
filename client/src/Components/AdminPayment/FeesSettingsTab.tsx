import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, DollarSign, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import api from '../../lib/api';

interface FeeSettings {
  monthlyFee: number;
  effectiveFrom: string;
}

export default function FeesSettingsTab() {
  const [settings, setSettings] = useState<FeeSettings>({
    monthlyFee: 0,
    effectiveFrom: new Date().toISOString().split('T')[0],
  });
  const [currentFee, setCurrentFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching fee settings from /api/admin/payments/fee-settings');
      
      // ✅ FIXED: Use correct endpoint for fee settings
      const response = await api.get('/api/admin/payments/fee-settings');
      console.log('📊 API Response:', response.data);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log('💾 Fee data:', data);
        
        // ✅ FIX: Check both monthlyFee and baseFee
        const monthlyFee = data.monthlyFee ?? data.baseFee ?? 0;
        console.log('✅ Extracted monthlyFee:', monthlyFee);
        
        setCurrentFee(Number(monthlyFee));
        setSettings({
          monthlyFee: Number(monthlyFee),
          effectiveFrom: data.effectiveFrom || new Date().toISOString().split('T')[0],
        });
      } else {
        console.warn('⚠️ No fee data in response');
        setCurrentFee(0);
        setSettings({
          monthlyFee: 0,
          effectiveFrom: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err: any) {
      console.error('❌ Error fetching fee settings:', err.response?.data || err.message);
      setCurrentFee(0);
      setSettings({
        monthlyFee: 0,
        effectiveFrom: new Date().toISOString().split('T')[0],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (settings.monthlyFee <= 0) {
      setMessage({ type: 'error', text: 'Fee amount must be greater than 0' });
      return;
    }

    if (!settings.effectiveFrom) {
      setMessage({ type: 'error', text: 'Please select an effective date' });
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving fee settings:', settings);
      
      // ✅ Use correct endpoint
      const response = await api.put('/api/admin/payments/fee-settings', {
        monthlyFee: settings.monthlyFee,
        effectiveFrom: settings.effectiveFrom,
      });
      
      console.log('✅ Save response:', response.data);
      
      if (response.data.success) {
        setCurrentFee(settings.monthlyFee);
        setMessage({ 
          type: 'success', 
          text: `Fee settings updated successfully! Applied to ${response.data.data.roomsUpdated || response.data.data.roomsCreated} rooms.` 
        });
        
        setTimeout(() => {
          setMessage(null);
          fetchSettings();
        }, 2000);
      }
    } catch (err: any) {
      console.error('❌ Error saving settings:', err.response?.data || err.message);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update fee settings' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Select a date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'short'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="font-medium">{message.text}</p>
        </motion.div>
      )}

      {/* Current Fee Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-6 border rounded-xl ${
          currentFee === 0
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-card border-border'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl ${
            currentFee === 0
              ? 'bg-yellow-500/20'
              : 'bg-primary/10'
          }`}>
            <DollarSign className={`w-6 h-6 ${
              currentFee === 0
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-primary'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {currentFee === 0 ? 'No Fee Structure Configured' : 'Current Monthly Fee'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentFee === 0 ? 'Create an initial fee structure' : 'Applied to all students'}
            </p>
          </div>
        </div>
        {currentFee > 0 ? (
          <>
            <p className="text-4xl font-bold text-primary">₹{currentFee.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-2">Effective from: {formatDisplayDate(settings.effectiveFrom)}</p>
          </>
        ) : (
          <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
              Create the initial fee structure below to get started
            </p>
          </div>
        )}
      </motion.div>

      {/* Fee Update Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-card border border-border rounded-xl space-y-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {currentFee === 0 ? 'Create Initial Fee Structure' : 'Update Monthly Fee'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentFee === 0 
              ? 'Set up the base fee for all students' 
              : 'This will apply to all students for future months.'}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Monthly Fee (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="100"
              value={settings.monthlyFee || 0}
              onChange={(e) => setSettings(prev => ({ ...prev, monthlyFee: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-8 pr-4 py-3 bg-background border border-input rounded-lg text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="5000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Effective From *
          </label>
          
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none z-10" />
            
            <input
              type="date"
              value={settings.effectiveFrom}
              onChange={(e) => setSettings(prev => ({ ...prev, effectiveFrom: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-12 pr-4 py-3 bg-background border border-input rounded-lg text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 transition-all cursor-pointer"
            />
            
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="p-1.5 bg-primary/10 rounded group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-lg">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              {formatDisplayDate(settings.effectiveFrom)}
            </p>
          </div>
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                {currentFee === 0 ? (
                  <li>This will create the fee structure for all rooms</li>
                ) : (
                  <>
                    <li>Changes affect all students globally</li>
                    <li>Existing payment records remain unchanged</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving || settings.monthlyFee <= 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? 'Saving...' : currentFee === 0 ? 'Create Fee Structure' : 'Update Fee Settings'}
        </motion.button>
      </motion.div>

      {/* Fee Change Preview */}
      {currentFee > 0 && settings.monthlyFee !== currentFee && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-muted/30 border border-border rounded-xl"
        >
          <p className="text-sm font-semibold text-foreground mb-3">Preview:</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-muted-foreground">Current</p>
              <p className="text-lg font-bold">₹{currentFee.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-2xl text-muted-foreground">→</div>
            <div>
              <p className="text-muted-foreground">New</p>
              <p className="text-lg font-bold text-primary">₹{(settings.monthlyFee || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}