import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, Mail } from 'lucide-react';
import { createStudentWithRoomAssignment } from '../../lib/student.api';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
}

interface Floor {
  id: string;
  floorName: string;
}

interface Building {
  id: string;
  buildingName: string;
}

interface StudentDetailsFormProps {
  room: Room;
  floor: Floor | null;
  building: Building;
  onSuccess: (data: {
    studentName: string;
    studentEmail: string;
    defaultPassword: string;
    roomDetails: {
      roomNumber: string;
      floorName: string;
      buildingName: string;
    };
  }) => void;
  setIsLoading: (loading: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  dateOfBirth: string;
  emergencyContact: string;
  emergencyContactPhone: string;
  course: string;
  year: string;
  enrollmentNumber: string;
}

export default function StudentDetailsForm({
  room,
  floor,
  building,
  onSuccess,
  setIsLoading,
}: StudentDetailsFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    course: '',
    year: '',
    enrollmentNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) return 'Name is required';
    if (!formData.email?.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Invalid email';
    if (!formData.phone?.trim() || formData.phone.length < 10) return 'Valid phone required';
    if (!formData.guardianName?.trim()) return 'Guardian name required';
    if (!formData.guardianPhone?.trim()) return 'Guardian phone required';
    if (!formData.address?.trim()) return 'Address required';
    if (!formData.dateOfBirth) return 'Date of birth required';
    if (!formData.emergencyContact?.trim()) return 'Emergency contact required';
    if (!formData.emergencyContactPhone?.trim()) return 'Emergency phone required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsLoading(true);

      const payload = {
        ...formData,
        roomId: room.id,
      };

      await createStudentWithRoomAssignment(payload);

      onSuccess({
        studentName: formData.name,
        studentEmail: formData.email,
        defaultPassword: '12345678', // Replace with actual password if available
        roomDetails: {
          roomNumber: room.roomNumber,
          floorName: floor?.floorName || 'N/A',
          buildingName: building.buildingName,
        },
      });

      // Reset form
      setFormData({
        name: '', email: '', phone: '', guardianName: '', guardianPhone: '',
        address: '', dateOfBirth: '', emergencyContact: '', emergencyContactPhone: '',
        course: '', year: '', enrollmentNumber: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create student');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Room Preview */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
      >
        <p className="text-sm text-slate-600 mb-2">Room Assignment</p>
        <p className="font-semibold text-slate-900">
          {building.buildingName} • {floor?.floorName || 'Floor'} • Room {room.roomNumber}
        </p>
        <p className="text-sm text-slate-600">{room.roomType} • Capacity: {room.capacity}</p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-medium text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      <h3 className="text-lg font-semibold text-slate-900">Student Details</h3>

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name *" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email *" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      {/* Phone & DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone *" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      {/* Guardian */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Guardian Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Guardian Name *" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="Guardian Phone *" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      {/* Address */}
      <textarea name="address" value={formData.address} onChange={handleChange} rows={2} placeholder="Address *" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />

      {/* Emergency Contact */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Contact Name *" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} placeholder="Contact Phone *" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      {/* Academic Info */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Academic Info</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" name="enrollmentNumber" value={formData.enrollmentNumber} onChange={handleChange} placeholder="Enrollment #" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="Course" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          <input type="text" name="year" value={formData.year} onChange={handleChange} placeholder="Year" className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Confirm & Send
          </>
        )}
      </motion.button>

      <p className="text-xs text-slate-600 text-center">Password will be sent to email</p>
    </form>
  );
}