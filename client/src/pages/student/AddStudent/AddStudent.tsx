import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Sparkles, CheckCircle2, Mail, Zap } from 'lucide-react';
import HostelSelector from '../../../Components/AddStudent/HostelSelector';
import RoomAssignmentModal from '../../../Components/AddStudent/RoomAssignmentModal';
import SuccessModal from '../../../Components/AddStudent/SuccessModal';

interface SuccessData {
  studentName: string;
  studentEmail: string;
  roomDetails: {
    roomNumber: string;
    floorName: string;
    buildingName: string;
  };
}

export default function AddStudent() {
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hostelSelectorRef = useRef<any>(null);

  const handleHostelSelect = (building: any) => {
    setSelectedBuilding(building);
    setShowRoomModal(true);
  };

  const handleAssignmentSuccess = (data: SuccessData) => {
    setSuccessData(data);
    setShowSuccessModal(true);
    setShowRoomModal(false);
    setSelectedBuilding(null);
  };

  const handleReset = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    setSelectedBuilding(null);
    
    if (hostelSelectorRef.current) {
      hostelSelectorRef.current.loadBuildings();
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="p-3 rounded-xl shadow-lg flex-shrink-0"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <GraduationCap className="w-8 h-8" />
            </motion.div>
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
                  Student Onboarding
                </h1>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                <p className="text-lg text-muted-foreground">
                  Complete your hostel assignment in three simple steps
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 p-6 rounded-xl border"
          style={{ 
            background: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="space-y-4">
            {/* Steps */}
            <div className="flex items-center gap-4">
              {[
                { num: 1, label: 'Select Hostel', desc: 'Choose your accommodation building', icon: '🏢' },
                { num: 2, label: 'Pick Room', desc: 'Select available room', icon: '🚪', active: false },
                { num: 3, label: 'Confirm Details', desc: 'Complete student information', icon: '✓', active: false }
              ].map((step, idx) => (
                <div key={idx} className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div
                      animate={{ scale: idx === 0 ? [1, 1.05, 1] : 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-md"
                      style={{
                        background: idx === 0 ? 'var(--primary)' : 'var(--muted)',
                        color: idx === 0 ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3 
                        className="font-semibold text-sm"
                        style={{ color: idx === 0 ? 'var(--primary)' : 'var(--foreground)' }}
                      >
                        {step.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                  {idx < 2 && (
                    <div 
                      className="h-1 rounded-full"
                      style={{ background: 'var(--border)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 rounded-2xl shadow-xl overflow-hidden border"
          style={{ 
            background: 'var(--card)',
            borderColor: 'var(--border)'
          }}
        >
          <div 
            className="h-1"
            style={{ 
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
            }}
          />
          <div className="p-8 md:p-10">
            <HostelSelector 
              ref={hostelSelectorRef}
              onSelect={handleHostelSelect} 
              isLoading={isLoading} 
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { 
              icon: Zap, 
              title: 'Quick Process', 
              desc: 'Complete onboarding in just 3 steps',
              color: 'var(--chart-2)'
            },
            { 
              icon: Mail, 
              title: 'Instant Notification', 
              desc: 'Credentials sent automatically via email',
              color: 'var(--primary)'
            },
            { 
              icon: CheckCircle2, 
              title: 'Real-time Updates', 
              desc: 'Occupancy stats update instantly',
              color: 'var(--chart-1)'
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
                className="rounded-xl p-6 border backdrop-blur-sm hover:shadow-lg transition-shadow"
                style={{ 
                  background: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex p-3 rounded-lg mb-4"
                  style={{ background: `${feature.color}20`, color: feature.color }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showRoomModal && selectedBuilding && (
          <RoomAssignmentModal
            building={selectedBuilding}
            onClose={() => setShowRoomModal(false)}
            onSuccess={handleAssignmentSuccess}
            setIsLoading={setIsLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && successData && (
          <SuccessModal
            data={successData}
            onClose={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}