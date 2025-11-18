import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Loader, CreditCard, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/api';

interface HostelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hostel: any) => void;
}

type ModalStep = 'form' | 'payment' | 'success';

export default function HostelModal({ isOpen, onClose, onSuccess }: HostelModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('form');
  const [formData, setFormData] = useState({
    buildingName: '',
    buildingCode: '',
    description: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    imageUrl: '',
    constructedYear: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [paymentError, setPaymentError] = useState('');

  const HOSTEL_SETUP_AMOUNT = 5000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate buildingCode from buildingName
      ...(name === 'buildingName' && { buildingCode: value.toUpperCase().replace(/\s+/g, '-') }),
    }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.buildingName || !formData.buildingCode || !formData.address || !formData.contactPhone) {
      setError('Please fill in all required fields');
      return;
    }

    // Move to payment step
    setError('');
    setCurrentStep('payment');
  };

  const validatePaymentData = () => {
    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
      setPaymentError('Please fill in all payment details');
      return false;
    }

    // Basic card number validation (16 digits)
    if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
      setPaymentError('Card number must be 16 digits');
      return false;
    }

    // Expiry date validation (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
      setPaymentError('Expiry date must be in MM/YY format');
      return false;
    }

    // CVV validation (3-4 digits)
    if (!/^\d{3,4}$/.test(paymentData.cvv)) {
      setPaymentError('CVV must be 3-4 digits');
      return false;
    }

    return true;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (!validatePaymentData()) {
      return;
    }

    setIsLoading(true);

    try {
      // Process payment (mock payment - in production, use Razorpay/Stripe)
      // Simulating payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // After successful payment, create the building
      const submitData = {
        ...formData,
        constructedYear: formData.constructedYear ? parseInt(formData.constructedYear) : null,
      };

      const response = await api.post('/api/admin/hostel/buildings', submitData);
      
      if (response.data.success || response.status === 201) {
        setCurrentStep('success');
        
        // Auto close after 3 seconds and call success
        setTimeout(() => {
          onSuccess(response.data.data);
          resetModal();
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process payment and create building';
      setPaymentError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setCurrentStep('form');
    setFormData({
      buildingName: '',
      buildingCode: '',
      description: '',
      address: '',
      contactPerson: '',
      contactPhone: '',
      imageUrl: '',
      constructedYear: '',
    });
    setPaymentData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
    });
    setError('');
    setPaymentError('');
  };

  const handleClose = () => {
    if (currentStep !== 'success') {
      resetModal();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl mx-4 bg-card rounded-xl shadow-lg border border-border max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card rounded-t-xl">
              <div className="flex items-center gap-3">
                {currentStep === 'form' && <Building2 className="w-6 h-6 text-primary" />}
                {currentStep === 'payment' && <CreditCard className="w-6 h-6 text-primary" />}
                {currentStep === 'success' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                <h2 className="text-2xl font-bold text-foreground">
                  {currentStep === 'form' && 'Create New Building'}
                  {currentStep === 'payment' && 'Payment'}
                  {currentStep === 'success' && 'Success!'}
                </h2>
              </div>
              {currentStep !== 'success' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Form */}
              {currentStep === 'form' && (
                <motion.form
                  onSubmit={handleFormSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Building Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="buildingName"
                          value={formData.buildingName}
                          onChange={handleChange}
                          required
                          placeholder="Enter building name"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Building Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="buildingCode"
                          value={formData.buildingCode}
                          onChange={handleChange}
                          required
                          placeholder="AUTO-GENERATED"
                          readOnly
                          className="w-full px-4 py-2 rounded-lg border border-border bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter building description"
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Address</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        placeholder="Enter full address"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          placeholder="Enter contact person name"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Contact Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          required
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Constructed Year
                        </label>
                        <input
                          type="number"
                          name="constructedYear"
                          value={formData.constructedYear}
                          onChange={handleChange}
                          placeholder="2020"
                          min="1900"
                          max={new Date().getFullYear()}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Image URL
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
                    >
                      Next: Payment
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* Step 2: Payment */}
              {currentStep === 'payment' && (
                <motion.form
                  onSubmit={handlePaymentSubmit}
                  className="space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {paymentError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      {paymentError}
                    </motion.div>
                  )}

                  {/* Payment Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-blue-700 font-medium">Hostel Setup Fee</p>
                        <p className="text-2xl font-bold text-blue-900">₹{HOSTEL_SETUP_AMOUNT.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-600">One-time payment</p>
                        <p className="text-xs text-blue-600 mt-1">Building: {formData.buildingName}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Card Details</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handlePaymentChange}
                        required
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cardholder Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={paymentData.cardName}
                        onChange={handlePaymentChange}
                        required
                        placeholder="Name on card"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Expiry Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={handlePaymentChange}
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handlePaymentChange}
                          required
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      🔒 Your payment information is secure and encrypted. This is a demo payment gateway.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-border">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setCurrentStep('form')}
                      disabled={isLoading}
                      className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors font-medium disabled:opacity-50"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                      {isLoading ? 'Processing...' : `Pay ₹${HOSTEL_SETUP_AMOUNT.toLocaleString('en-IN')}`}
                    </motion.button>
                  </div>
                </motion.form>
              )}

              {/* Step 3: Success */}
              {currentStep === 'success' && (
                <motion.div
                  className="text-center py-8 space-y-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h3>
                    <p className="text-muted-foreground">
                      Your building <strong>{formData.buildingName}</strong> has been created successfully.
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-sm text-green-700">
                      ✓ Payment of ₹{HOSTEL_SETUP_AMOUNT.toLocaleString('en-IN')} received<br/>
                      ✓ Building setup completed<br/>
                      ✓ You can now add floors and rooms
                    </p>
                  </motion.div>

                  <p className="text-sm text-muted-foreground">Redirecting to dashboard in 3 seconds...</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}