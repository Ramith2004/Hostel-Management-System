import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HostelSelector from '../../../../Components/AddStudent/HostelSelector';
import RoomAssignmentModal from '../../../../Components/AddStudent/RoomAssignmentModal';
import SuccessModal from '../../../../Components/AddStudent/SuccessModal';

interface Building {
  id: string;
  buildingName: string;
  buildingCode: string;
  address: string;
  totalFloors: number;
  totalRooms: number;
  occupiedRooms: number;
}

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

export default function AddStudent() {
  const [step, setStep] = useState<'hostel' | 'room' | 'success'>('hostel');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hostelSelectorRef = useRef(null);

  // ✅ Step 1: Hostel Selected
  const handleHostelSelect = (building: Building) => {
    setSelectedBuilding(building);
    setStep('room');
  };

  // ✅ Step 2: Student Created Successfully
  const handleStudentSuccess = (data: SuccessData) => {
    setSuccessData(data);
    setStep('success');
  };

  // ✅ Step 3: Close Success Modal
  const handleCloseSuccess = () => {
    setStep('hostel');
    setSelectedBuilding(null);
    setSuccessData(null);
    // Refresh hostel list
    if (hostelSelectorRef.current) {
      (hostelSelectorRef.current as any).loadBuildings();
    }
  };

  // ✅ Step 3: Close Room Assignment Modal
  const handleCloseRoom = () => {
    setStep('hostel');
    setSelectedBuilding(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Add New Student</h1>
        <p className="text-muted-foreground">
          {step === 'hostel' && 'Step 1: Select a hostel'}
          {step === 'room' && 'Step 2: Assign a room and enter student details'}
          {step === 'success' && 'Student created successfully!'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Hostel Selection */}
        {step === 'hostel' && (
          <motion.div
            key="hostel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HostelSelector
              ref={hostelSelectorRef}
              onSelect={handleHostelSelect}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Step 2: Room Assignment & Student Details */}
        {step === 'room' && selectedBuilding && (
          <motion.div
            key="room"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <RoomAssignmentModal
              building={selectedBuilding}
              onClose={handleCloseRoom}
              onSuccess={handleStudentSuccess}
              setIsLoading={setIsLoading}
            />
          </motion.div>
        )}

        {/* Step 3: Success Modal */}
        {step === 'success' && successData && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <SuccessModal
              data={successData}
              onClose={handleCloseSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}