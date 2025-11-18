import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Building2, Loader, AlertCircle, Users, DoorOpen, Layers, ArrowRight, MapPin } from 'lucide-react';
import { fetchBuildings } from '../../lib/hostel.api';

interface Building {
  id: string;
  buildingName: string;
  buildingCode: string;
  address: string;
  totalFloors: number;
  totalRooms: number;
  occupiedRooms: number;
}

interface HostelSelectorProps {
  onSelect: (building: Building) => void;
  isLoading: boolean;
}

const HostelSelector = forwardRef(({ onSelect, isLoading }: HostelSelectorProps, ref) => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const data = await fetchBuildings();

      console.log('API Response:', data);
      
      const buildingsArray = Array.isArray(data) 
        ? data 
        : (data?.buildings || data?.data || []);
      
      setBuildings(buildingsArray);
      setError(null);
    } catch (err: any) {
      console.error('Error loading buildings:', err);
      setError(err.message || 'Failed to load hostels');
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    loadBuildings,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mb-4"
        >
          <Loader className="w-12 h-12" style={{ color: 'var(--primary)' }} />
        </motion.div>
        <p className="text-muted-foreground text-lg font-medium">Loading hostels...</p>
        <p className="text-muted-foreground text-sm mt-2">Please wait while we fetch available accommodations</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-8 border-2"
        style={{ 
          background: 'var(--destructive)',
          borderColor: 'var(--destructive)'
        }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="w-8 h-8 flex-shrink-0" style={{ color: 'var(--destructive)' }} />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Hostels</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadBuildings}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
              style={{ 
                background: 'var(--destructive)',
                color: 'var(--destructive-foreground)'
              }}
            >
              Try Again
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Select Your Hostel</h2>
        <p className="text-muted-foreground">Choose from available accommodations and view real-time availability</p>
      </div>
      
      {!buildings || buildings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-16 border-2 border-dashed text-center"
          style={{ 
            background: 'var(--muted)',
            borderColor: 'var(--border)'
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex p-4 rounded-full mb-6"
            style={{ background: 'var(--card)' }}
          >
            <Building2 className="w-12 h-12 text-muted-foreground" />
          </motion.div>
          <p className="text-foreground text-xl font-semibold mb-2">No Hostels Available</p>
          <p className="text-muted-foreground">Please create a hostel first to proceed with student onboarding</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map((building, index) => {
            const availableRooms = building.totalRooms - building.occupiedRooms;
            const occupancyRate = building.totalRooms > 0 ? (building.occupiedRooms / building.totalRooms) * 100 : 0;
            const isAvailable = availableRooms > 0;

            return (
              <motion.button
                key={building.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => onSelect(building)}
                disabled={isLoading || !isAvailable}
                className="text-left group relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  background: 'var(--card)',
                  borderColor: isAvailable ? 'var(--border)' : 'var(--destructive)',
                }}
              >
                {/* Background gradient on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, var(--primary)20, var(--secondary)20)' }}
                />
                
                {/* Availability Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: isAvailable ? 'var(--chart-1)' : 'var(--destructive)',
                      color: isAvailable ? 'var(--background)' : 'var(--destructive-foreground)'
                    }}
                  >
                    {isAvailable ? `${availableRooms} Available` : 'Full'}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {building.buildingName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 font-mono">{building.buildingCode}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="flex-shrink-0 p-3 rounded-xl"
                      style={{ background: 'var(--primary)20', color: 'var(--primary)' }}
                    >
                      <Building2 className="w-6 h-6" />
                    </motion.div>
                  </div>

                  {/* Address */}
                  {building.address && (
                    <div className="flex items-start gap-2 mb-4 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground line-clamp-2">{building.address}</p>
                    </div>
                  )}

                  {/* Divider */}
                  <div 
                    className="h-px my-4"
                    style={{ background: 'var(--border)' }}
                  />

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { icon: DoorOpen, label: 'Total', value: building.totalRooms, color: 'var(--primary)' },
                      { icon: Users, label: 'Occupied', value: building.occupiedRooms, color: 'var(--destructive)' },
                      { icon: Layers, label: 'Floors', value: building.totalFloors, color: 'var(--secondary)' }
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="text-center">
                          <div 
                            className="inline-flex p-2 rounded-lg mb-2"
                            style={{ background: `${stat.color}20`, color: stat.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="font-bold text-foreground text-lg">{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Occupancy Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">Occupancy</span>
                      <span className="text-xs font-bold text-foreground">{Math.round(occupancyRate)}%</span>
                    </div>
                    <div 
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ background: 'var(--muted)' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${occupancyRate}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, var(--primary), var(--secondary))`
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  {isAvailable && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="mt-4 flex items-center gap-2 justify-between text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--primary)' }}
                    >
                      <span>Select this hostel</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
});

HostelSelector.displayName = 'HostelSelector';

export default HostelSelector;