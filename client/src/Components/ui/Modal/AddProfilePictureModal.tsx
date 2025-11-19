import React, { useState, useRef } from 'react';
import api, { API_ROUTES } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Upload, AlertCircle, CheckCircle, X } from 'lucide-react';

interface AddProfilePictureModalProps {
  onClose: () => void;
  onSuccess: (profilePicture: string) => void;
}

const AddProfilePictureModal: React.FC<AddProfilePictureModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setError('');
      return;
    }

    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, and WebP formats are allowed');
      setSelectedFile(null);
      setPreview('');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      setSelectedFile(null);
      setPreview('');
      return;
    }

    setSelectedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const event = {
        target: { files: [file] }
      } as any;
      handleFileSelect(event);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Convert image to base64 for simple upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          
          const response = await api.post(API_ROUTES.USER_PROFILE_PICTURE, {
            profilePicture: base64String
          });

          setSuccess('Profile picture updated successfully!');
          setTimeout(() => {
            onSuccess(response.data.profilePicture);
          }, 1500);
        } catch (err: any) {
          console.error('Upload error:', err);
          setError(err.response?.data?.message || 'Failed to upload profile picture');
          setLoading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error: any) {
      console.error('Error:', error);
      setError('Failed to process image');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md rounded-xl border-2 shadow-2xl overflow-hidden"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="px-6 py-4 border-b-2 flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Image className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Upload Profile Picture
          </h2>
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg border-2 flex gap-3"
                style={{
                  background: `var(--destructive)15`,
                  borderColor: 'var(--destructive)',
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--destructive)' }} />
                <p className="text-sm" style={{ color: 'var(--destructive)' }}>
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Alert */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-lg border-2 flex gap-3"
                style={{
                  background: `var(--chart-1)15`,
                  borderColor: 'var(--chart-1)',
                }}
              >
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--chart-1)' }} />
                <p className="text-sm" style={{ color: 'var(--chart-1)' }}>
                  {success}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ borderColor: 'var(--primary)' }}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
            style={{
              borderColor: 'var(--border)',
              background: `var(--primary)05`,
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              disabled={loading}
              style={{ display: 'none' }}
            />
            
            {preview ? (
              <div className="space-y-4">
                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <p className="font-semibold text-foreground truncate">{selectedFile?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {((selectedFile?.size ?? 0) / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Upload className="w-12 h-12 mx-auto" style={{ color: 'var(--primary)' }} />
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground">Click or drag image here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, GIF, WebP (Max 5MB)
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Change File Button */}
          {preview && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg font-semibold border-2 transition-all"
              style={{
                background: 'var(--card)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
              }}
            >
              Choose Different Image
            </motion.button>
          )}

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex gap-3 pt-4 border-t-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-semibold border-2 transition-all disabled:opacity-50"
              style={{
                background: 'var(--card)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)',
              }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading || !selectedFile}
              className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Upload className="w-4 h-4" />
                  </motion.div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Picture
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 -z-10"
        onClick={onClose}
      />
    </motion.div>
  );
};

export default AddProfilePictureModal;