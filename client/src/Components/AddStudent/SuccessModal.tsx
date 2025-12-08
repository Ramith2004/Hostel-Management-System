import { motion } from 'framer-motion';
import { CheckCircle2, Mail, MapPin, User, Copy, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface SuccessData {
  studentName: string;
  studentEmail: string;
  defaultPassword: string;
  roomDetails: {
    roomNumber: string;
    floorName: string;
    buildingName: string;
  };
}

interface SuccessModalProps {
  data: SuccessData;
  onClose: () => void;
}

export default function SuccessModal({ data, onClose }: SuccessModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Success Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-border p-6">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="flex-shrink-0"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Student Created Successfully!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Account is ready and room has been assigned
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Student Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-background border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Student Name
                </p>
                <p className="text-sm font-semibold text-foreground mt-1 truncate">
                  {data.studentName}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background border border-border rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Email Address
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded flex-1 truncate">
                    {data.studentEmail}
                  </code>
                  <button
                    onClick={() => handleCopy(data.studentEmail, 'email')}
                    className="p-1.5 hover:bg-muted rounded transition flex-shrink-0"
                    title="Copy email"
                  >
                    <Copy
                      className={`w-3.5 h-3.5 transition ${
                        copiedField === 'email'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-primary/5 border border-primary/20 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 flex items-center justify-center">
                🔑
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Default Password
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs font-mono text-foreground bg-card border border-border px-2 py-1 rounded flex-1">
                    {showPassword ? data.defaultPassword : '••••••••'}
                  </code>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 hover:bg-muted rounded transition flex-shrink-0"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCopy(data.defaultPassword, 'password')}
                    className="p-1.5 hover:bg-muted rounded transition flex-shrink-0"
                    title="Copy password"
                  >
                    <Copy
                      className={`w-3.5 h-3.5 transition ${
                        copiedField === 'password'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Student must change password on first login
                </p>
              </div>
            </div>
          </motion.div>

          {/* Room Assignment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-background border border-border rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Room Assignment
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Room {data.roomDetails.roomNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.roomDetails.buildingName} • {data.roomDetails.floorName}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Warning/Info Box */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3"
          >
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              <span className="font-semibold">Important:</span> Share the email and password with the student securely. They must change the password on first login.
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-4 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold text-sm"
          >
            Continue
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}