import React, { useState, useEffect } from 'react';
import api, { API_ROUTES } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Image as ImageIcon, Loader, AlertCircle, Phone, BookOpen, Calendar, Mail, Shield } from 'lucide-react';
import ChangePasswordModal from '../../Components/ui/Modal/ChangePasswordModal';
import AddProfilePictureModal from '../../Components/ui/Modal/AddProfilePictureModal';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  profilePicture?: string;
  department?: string;
  registrationNumber?: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await api.get(API_ROUTES.USER_PROFILE);

      if (response.data?.user) {
        setUserData(response.data.user);
        setError('');
      } else {
        setError('Invalid response format');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
  };

  const handleProfilePictureSuccess = (newProfilePicture: string) => {
    if (userData) {
      setUserData({ ...userData, profilePicture: newProfilePicture });
    }
    setShowProfilePictureModal(false);
  };

  if (loading) {
    return (
      <div className="w-full bg-background flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <Loader className="w-16 h-16" style={{ color: 'var(--primary)' }} />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-background transition-colors duration-300" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }} />
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-xl border-2 shadow-xl"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--destructive)',
            }}
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1" style={{ color: 'var(--destructive)' }} />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-2">Error loading profile</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchUserData}
                  className="px-6 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    background: 'var(--destructive)',
                    color: 'var(--destructive-foreground)',
                  }}
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="w-full bg-background p-6" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background transition-colors duration-300" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Background Gradient Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            {userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase()}
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div
              className="rounded-2xl border-2 shadow-xl overflow-hidden sticky top-6"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="p-6">
                {/* Profile Picture */}
                <motion.div
                  className="mb-6 flex justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div
                    className="w-40 h-40 rounded-full overflow-hidden border-4 flex items-center justify-center shadow-2xl hover:shadow-lg transition-shadow"
                    style={{ borderColor: 'var(--primary)' }}
                  >
                    {userData.profilePicture ? (
                      <img
                        src={userData.profilePicture}
                        alt={userData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-5xl font-bold"
                        style={{
                          background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                          color: 'var(--primary-foreground)',
                        }}
                      >
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* User Info */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-1">{userData.name}</h2>
                  <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                    <Mail className="w-4 h-4" />
                    {userData.email}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfilePictureModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-lg"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Change Picture
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 hover:shadow-lg"
                    style={{
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchUserData}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 hover:shadow-lg"
                    style={{
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <Loader className="w-4 h-4" />
                    Refresh
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Information Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Information Card */}
            <div
              className="rounded-2xl border-2 shadow-xl overflow-hidden"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="px-6 py-4 border-b-2 flex items-center gap-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `var(--primary)15` }}
                >
                  <User className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="text-xl font-bold text-foreground">Personal Information</h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <InfoRow
                  label="Full Name"
                  value={userData.name}
                  icon={<User className="w-5 h-5" />}
                />

                {/* Email */}
                <InfoRow
                  label="Email Address"
                  value={userData.email}
                  icon={<Mail className="w-5 h-5" />}
                />

                {/* Role */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    <span className="text-sm font-semibold text-muted-foreground">Role</span>
                  </div>
                  <span
                    className="px-4 py-1 rounded-full text-xs font-semibold transition-all hover:shadow-lg"
                    style={{
                      background: `var(--primary)20`,
                      color: 'var(--primary)',
                    }}
                  >
                    {userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Phone */}
                {userData.phone && (
                  <InfoRow
                    label="Phone Number"
                    value={userData.phone}
                    icon={<Phone className="w-5 h-5" />}
                  />
                )}

                {/* Department */}
                {userData.department && (
                  <InfoRow
                    label="Department"
                    value={userData.department}
                    icon={<BookOpen className="w-5 h-5" />}
                  />
                )}

                {/* Registration Number */}
                {userData.registrationNumber && (
                  <InfoRow
                    label="Registration Number"
                    value={userData.registrationNumber}
                    icon={<User className="w-5 h-5" />}
                  />
                )}

                {/* Member Since */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                    <span className="text-sm font-semibold text-muted-foreground">Member Since</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status Card */}
            <div
              className="rounded-2xl border-2 shadow-xl overflow-hidden"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="px-6 py-4 border-b-2 flex items-center gap-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `var(--chart-1)15` }}
                >
                  <Shield className="w-5 h-5" style={{ color: 'var(--chart-1)' }} />
                </div>
                <h3 className="text-xl font-bold text-foreground">Account Status</h3>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="text-lg font-semibold text-foreground">Active</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse"
                    style={{ background: `var(--chart-1)20` }}
                  >
                    <div className="w-6 h-6 rounded-full" style={{ background: 'var(--chart-1)' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPasswordModal && (
          <ChangePasswordModal
            onClose={() => setShowPasswordModal(false)}
            onSuccess={handlePasswordChangeSuccess}
          />
        )}
        {showProfilePictureModal && (
          <AddProfilePictureModal
            onClose={() => setShowProfilePictureModal(false)}
            onSuccess={handleProfilePictureSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Info Row Component
interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between py-3"
    >
      <div className="flex items-center gap-3">
        {icon && <span style={{ color: 'var(--primary)' }}>{icon}</span>}
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground max-w-xs text-right truncate">
        {value}
      </span>
    </motion.div>
  );
}

export default Profile;