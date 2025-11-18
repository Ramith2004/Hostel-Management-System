import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
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
  onSuccess: (data: any) => void;
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

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.includes('@')) return 'Invalid email format';
    if (!formData.phone.trim()) return 'Phone is required';
    if (formData.phone.length < 10) return 'Phone must be at least 10 digits';
    if (!formData.guardianName.trim()) return 'Guardian name is required';
    if (!formData.guardianPhone.trim()) return 'Guardian phone is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.emergencyContact.trim()) return 'Emergency contact is required';
    if (!formData.emergencyContactPhone.trim()) return 'Emergency contact phone is required';
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

      const response = await createStudentWithRoomAssignment(payload);

      onSuccess({
        studentName: formData.name,
        studentEmail: formData.email,
        roomDetails: {
          roomNumber: room.roomNumber,
          floorName: floor?.floorName || 'N/A',
          buildingName: building.buildingName,
        },
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
        <p className="text-sm text-slate-600 mb-2">Room Assignment Summary</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {building.buildingName} • {floor?.floorName || 'Floor'} • Room {room.roomNumber}
            </p>
            <p className="text-sm text-slate-600">{room.roomType} Room • Capacity: {room.capacity}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">Type</p>
            <p className="font-bold text-blue-600">{room.roomType}</p>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-900 font-medium">Validation Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      <h3 className="text-lg font-semibold text-slate-900">Student Details</h3>

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="john@example.com"
          />
        </div>
      </div>

      {/* Phone & DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="9876543210"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Guardian Details */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Guardian Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Guardian Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Parent Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Guardian Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="9876543210"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          placeholder="Enter full address"
        />
      </div>

      {/* Emergency Contact */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Emergency Contact Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="9876543210"
            />
          </div>
        </div>
      </div>

      {/* Academic Info */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Academic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enrollment Number
            </label>
            <input
              type="text"
              name="enrollmentNumber"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enrollment #"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Course
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="B.Tech"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Year
            </label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="1st Year"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Creating & Sending Email...
          </>
        ) : (
          <>
            <Mail className="w-5 h-5" />
            Confirm & Send Email
          </>
        )}
      </motion.button>

      <p className="text-xs text-slate-600 text-center">
        Temporary password will be sent to student email
      </p>
    </form>
  );
}