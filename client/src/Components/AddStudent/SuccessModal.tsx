import { motion } from 'framer-motion';
import { CheckCircle2, Mail, MapPin, User, X } from 'lucide-react';

interface SuccessData {
  studentName: string;
  studentEmail: string;
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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Success Icon */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center border-b border-green-200">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="inline-block"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mt-4">Success!</h2>
          <p className="text-slate-600 mt-2">Student account created and room assigned</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-6">
          {/* Student Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          >
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Student</p>
                <p className="text-lg font-semibold text-slate-900">{data.studentName}</p>
              </div>
            </div>
          </motion.div>

          {/* Email Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-blue-50 rounded-lg p-4 border border-blue-200"
          >
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Email Sent</p>
                <p className="text-sm text-slate-900 font-medium break-all">{data.studentEmail}</p>
                <p className="text-xs text-slate-600 mt-1">Credentials sent to student</p>
              </div>
            </div>
          </motion.div>

          {/* Room Assignment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-purple-50 rounded-lg p-4 border border-purple-200"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Room Assigned</p>
                <p className="text-sm text-slate-900 font-medium mt-1">
                  Room {data.roomDetails.roomNumber}
                </p>
                <p className="text-xs text-slate-600">
                  {data.roomDetails.buildingName} • {data.roomDetails.floorName}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Note:</span> The student has received a temporary password via email. They should change it on first login.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Add Another Student
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-3 hover:bg-slate-200 rounded-lg transition text-slate-600"
            title="Close"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}