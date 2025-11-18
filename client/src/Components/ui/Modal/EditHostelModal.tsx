import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';

interface EditHostelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedBuilding: any) => void;
  buildingData: {
    id: string;
    buildingName: string;
    buildingCode: string;
    description?: string;
    address: string;
    contactPerson?: string;
    contactPhone: string;
    imageUrl?: string;
    constructedYear?: number;
  } | null;
}

export default function EditHostelModal({ isOpen, onClose, onSuccess, buildingData }: EditHostelModalProps) {
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
  const [successMessage, setSuccessMessage] = useState('');

  // Populate form with existing data when modal opens
  useEffect(() => {
    if (isOpen && buildingData) {
      setFormData({
        buildingName: buildingData.buildingName || '',
        buildingCode: buildingData.buildingCode || '',
        description: buildingData.description || '',
        address: buildingData.address || '',
        contactPerson: buildingData.contactPerson || '',
        contactPhone: buildingData.contactPhone || '',
        imageUrl: buildingData.imageUrl || '',
        constructedYear: buildingData.constructedYear?.toString() || '',
      });
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen, buildingData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.buildingName || !formData.buildingCode || !formData.address || !formData.contactPhone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!buildingData?.id) {
      setError('Building ID is missing');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const submitData = {
        buildingName: formData.buildingName,
        buildingCode: formData.buildingCode,
        description: formData.description,
        address: formData.address,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        imageUrl: formData.imageUrl,
        constructedYear: formData.constructedYear ? parseInt(formData.constructedYear) : null,
      };

      const response = await api.put(`/api/admin/hostel/buildings/${buildingData.id}`, submitData);
      
      if (response.data.success || response.status === 200) {
        setSuccessMessage('Building updated successfully!');
        
        // Auto close after 2 seconds and call success
        setTimeout(() => {
          onSuccess(response.data.data);
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update building';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccessMessage('');
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
                <Building2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Edit Building</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    {successMessage}
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
                        disabled={isLoading}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                        placeholder="Enter building code"
                        disabled={isLoading}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={isLoading}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={isLoading}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isLoading}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isLoading}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isLoading}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                        disabled={isLoading}
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                    {isLoading ? 'Updating...' : 'Update Building'}
                  </motion.button>
                </div>
              </motion.form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}