import { useState, useEffect, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Loader, AlertCircle, Lock } from 'lucide-react';
import { fetchFloors } from '../../lib/hostel.api';
import { fetchAvailableRooms } from '../../lib/hostel.api';
import StudentDetailsForm from './StudentDetailsForm';

interface Building {
  id: string;
  buildingName: string;
  buildingCode: string;
}

interface Floor {
  id: string;
  floorNumber: number;
  floorName: string;
  totalRooms: number;
  occupiedRooms: number;
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  occupied: number;
  hasAttachedBathroom: boolean;
  hasBalcony: boolean;
  hasACFacility: boolean;
  hasWifi: boolean;
  status: string;
}

interface RoomAssignmentModalProps {
  building: Building;
  onClose: () => void;
  onSuccess: (data: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function RoomAssignmentModal({
  building,
  onClose,
  onSuccess,
  setIsLoading,
}: RoomAssignmentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFloors();
  }, []);

  const loadFloors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFloors(building.id);
      setFloors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  

  const handleFloorSelect = async (floor: Floor) => {
    setSelectedFloor(floor);
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAvailableRooms(floor.id);
      
      // ✅ FILTER OUT FULL ROOMS
      const availableRooms = data.filter((room: Room) => {
        // Show only rooms that have capacity available
        return room.occupied < room.capacity && room.status !== 'FULL' && room.status !== 'MAINTENANCE';
      });

      if (availableRooms.length === 0) {
        setError('No available rooms on this floor. All rooms are full or under maintenance.');
        setRooms([]);
        setLoading(false);
        return;
      }

      setRooms(availableRooms);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    // ✅ FINAL CHECK: Ensure room still has capacity
    if (room.occupied >= room.capacity) {
      setError(`Room ${room.roomNumber} is now full. Please select another room.`);
      return;
    }
    setSelectedRoom(room);
    setError(null);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 1) {
      onClose();
    } else if (step === 2) {
      setStep(1);
      setSelectedFloor(null);
      setRooms([]);
      setError(null);
    } else if (step === 3) {
      setStep(2);
      setSelectedRoom(null);
      setError(null);
    }
  };

  // ✅ Helper function to check if room is available
  const isRoomAvailable = (room: Room) => {
    return room.occupied < room.capacity && room.status !== 'FULL' && room.status !== 'MAINTENANCE';
  };

  // ✅ Helper function to get capacity color
  const getCapacityColor = (occupied: number, capacity: number) => {
    const percentage = (occupied / capacity) * 100;
    if (percentage >= 100) return 'from-red-500 to-red-600';
    if (percentage >= 75) return 'from-orange-500 to-orange-600';
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-blue-500';
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Assign Room to Student</h2>
            <p className="text-sm text-slate-600 mt-1">
              {building.buildingName} • Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-200">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Floor Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Floor</h3>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-red-900 font-medium">Error</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                ) : floors.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No floors available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {floors.map((floor, index) => (
                      <motion.button
                        key={floor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleFloorSelect(floor)}
                        className="text-left p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{floor.floorName}</h4>
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            Floor {floor.floorNumber}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Total: {floor.totalRooms} rooms</span>
                          <span className="text-green-600 font-medium">
                            {floor.totalRooms - floor.occupiedRooms} available
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Room Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Room</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Floor: <span className="font-semibold">{selectedFloor?.floorName}</span>
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-red-900 font-medium">No Available Rooms</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No available rooms on this floor</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rooms.map((room, index) => {
                      const available = isRoomAvailable(room);
                      const capacityColor = getCapacityColor(room.occupied, room.capacity);

                      return (
                        <motion.button
                          key={room.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleRoomSelect(room)}
                          disabled={!available}
                          className={`text-left p-4 border-2 rounded-lg transition ${
                            available
                              ? 'border-slate-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                              : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                              Room {room.roomNumber}
                              {!available && <Lock className="w-4 h-4 text-red-500" />}
                            </h4>
                            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                              {room.roomType}
                            </span>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Capacity</span>
                              <span className={`font-semibold ${available ? 'text-slate-900' : 'text-red-600'}`}>
                                {room.occupied}/{room.capacity}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                className={`bg-gradient-to-r ${capacityColor} h-2 rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            {!available && (
                              <p className="text-xs text-red-600 font-medium">🔒 Room is full</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {room.hasACFacility && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">AC</span>
                            )}
                            {room.hasWifi && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">WiFi</span>
                            )}
                            {room.hasAttachedBathroom && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Bathroom</span>
                            )}
                            {room.hasBalcony && (
                              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">Balcony</span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Student Details */}
            {step === 3 && selectedRoom && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <StudentDetailsForm
                  room={selectedRoom}
                  floor={selectedFloor}
                  building={building}
                  onSuccess={onSuccess}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Close' : 'Back'}
          </button>

          {step < 3 && (
            <div className="text-sm text-slate-600">
              Step {step} of 3
            </div>
          )}

          {step === 2 && (
            <button
              disabled
              className="text-sm text-slate-500"
            >
              Next: Select a room →
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}