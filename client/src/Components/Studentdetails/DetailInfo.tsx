import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  User,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  studentProfile?: {
    guardianName: string;
    guardianPhone: string;
    address: string;
    dateOfBirth: string;
    enrollmentNumber: string;
    course: string;
    year: string;
    emergencyContact: string;
    emergencyContactPhone: string;
  };
}

interface DetailInfoProps {
  student: StudentData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailInfo({ student, isOpen, onClose }: DetailInfoProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [isOpen]);

  if (!student) return null;

  const profile = student.studentProfile;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="detail-drawer-backdrop"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="detail-drawer-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle */}
            <div className="detail-drawer-handle">
              <div className="detail-drawer-handle-bar" onClick={onClose} />
            </div>

            {/* Drawer Content */}
            <div className="detail-drawer-content">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                      color: 'var(--primary-foreground)',
                    }}
                  >
                    {student.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold text-foreground truncate">
                      {student.name}
                    </h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-2 truncate">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors flex-shrink-0 ml-4"
                  style={{ background: 'var(--muted)' }}
                >
                  <X className="w-6 h-6 text-foreground" />
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <motion.div
                  whileHover={{ translateY: -4 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-semibold text-foreground text-sm">
                    {student.phone}
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ translateY: -4 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-semibold inline-block"
                    style={{
                      background:
                        student.status === 'ACTIVE'
                          ? 'var(--chart-1)'
                          : 'var(--muted-foreground)',
                      color:
                        student.status === 'ACTIVE'
                          ? 'var(--background)'
                          : 'var(--foreground)',
                    }}
                  >
                    {student.status}
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ translateY: -4 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <p className="text-xs text-muted-foreground mb-1">Joined</p>
                  <p className="font-semibold text-foreground text-sm">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </motion.div>
              </div>

              {/* Content Sections */}
              <div className="space-y-8">
                {/* Academic Information */}
                {profile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--primary-foreground)',
                        }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Academic Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        label="Enrollment Number"
                        value={profile.enrollmentNumber || 'N/A'}
                      />
                      <InfoCard label="Course" value={profile.course || 'N/A'} />
                      <InfoCard label="Year" value={profile.year || 'N/A'} />
                      <InfoCard
                        label="Date of Birth"
                        value={
                          profile.dateOfBirth
                            ? new Date(profile.dateOfBirth).toLocaleDateString()
                            : 'N/A'
                        }
                      />
                    </div>
                  </motion.div>
                )}

                {/* Guardian Information */}
                {profile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: 'var(--secondary)',
                          color: 'var(--secondary-foreground)',
                        }}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Guardian Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        label="Guardian Name"
                        value={profile.guardianName || 'N/A'}
                      />
                      <InfoCard
                        label="Guardian Phone"
                        value={profile.guardianPhone || 'N/A'}
                        icon={<Phone className="w-4 h-4" />}
                      />
                      <div className="col-span-full">
                        <InfoCard
                          label="Address"
                          value={profile.address || 'N/A'}
                          icon={<MapPin className="w-4 h-4" />}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Emergency Contact */}
                {profile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: 'var(--destructive)',
                          color: 'var(--destructive-foreground)',
                        }}
                      >
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Emergency Contact
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        label="Contact Name"
                        value={profile.emergencyContact || 'N/A'}
                      />
                      <InfoCard
                        label="Contact Phone"
                        value={profile.emergencyContactPhone || 'N/A'}
                        icon={<Phone className="w-4 h-4" />}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer spacing */}
              <div className="h-4" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Info Card Component
interface InfoCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function InfoCard({ label, value, icon }: InfoCardProps) {
  return (
    <motion.div
      whileHover={{ translateY: -2, scale: 1.02 }}
      className="p-4 rounded-lg border-2 transition-all"
      style={{
        background: 'var(--muted)',
        borderColor: 'var(--border)',
      }}
    >
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="font-semibold text-foreground text-sm break-words">
        {value}
      </p>
    </motion.div>
  );
}