import { useState, useEffect, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Building2, Home, Settings, ChevronDown, Loader, Edit2, Check, X, Users, DoorOpen, TrendingUp, Trash2, AlertTriangle } from 'lucide-react';
import HostelModal from '../../../Components/ui/Modal/HostelModal';
import EditHostelModal from '../../../Components/ui/Modal/EditHostelModal';
import FloorModal from '../../../Components/ui/Modal/FloorModal';
import RoomModal from '../../../Components/ui/Modal/RoomModal';
import api, { API_ROUTES } from '../../../lib/api';

// Define the Building type
type Building = {
  id: string;
  buildingName: string;
  buildingCode: string;
  description?: string;
  address: string;
  contactPerson?: string;
  contactPhone: string;
  imageUrl?: string;
  constructedYear?: number;
  totalFloors: number;
  createdAt: string;
  updatedAt: string;
};

// Define the Room type
type Room = {
  id: string;
  roomName: string;
  roomNumber: string;
  capacity: number;
  roomType: "SINGLE" | "DOUBLE" | "TRIPLE" | "QUAD" | "DORMITORY";
  allocations?: Array<{
    id: string;
    studentId: string;
    status: string;
  }>;
};

// Define the Floor type
type Floor = {
  id: string;
  floorNumber: number;
  floorName: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
  rooms?: Room[];
};

// Define the HostelData type
type HostelData = {
  totalFloors: number;
  totalRooms: number;
  floors: Floor[];
};

// Define Delete Confirmation Modal Props
interface DeleteConfirmationProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  title,
  description,
  itemName,
  isLoading,
  onConfirm,
  onCancel,
}: DeleteConfirmationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 rounded-lg bg-destructive/10"
                >
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </motion.div>
                <h2 className="text-lg font-bold text-foreground">{title}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-2">{description}</p>
              <p className="text-sm font-semibold text-foreground bg-accent/50 p-3 rounded-lg border border-border">
                {itemName}
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-border flex gap-3">
              <motion.button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Hostel() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hostelData, setHostelData] = useState<HostelData>({
    totalFloors: 0,
    totalRooms: 0,
    floors: [],
  });
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingFloorStatus, setEditingFloorStatus] = useState<"ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE" | null>(null);
  const [isAddingFloor, setIsAddingFloor] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [selectedFloorForRoom, setSelectedFloorForRoom] = useState<{ id: string; name: string } | null>(null);
  const [isAddingBuilding, setIsAddingBuilding] = useState(false);
  const [isEditingBuilding, setIsEditingBuilding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFloorId, setUpdatingFloorId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Delete Confirmation States
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'floor' | 'room' | null;
    id: string | null;
    name: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    type: null,
    id: null,
    name: '',
    isLoading: false,
  });

  // Fetch buildings on component mount
  useEffect(() => {
    fetchBuildings();
  }, []);

  // Fetch building details when selected building changes
  useEffect(() => {
    if (selectedBuildingId) {
      fetchBuildingDetails(selectedBuildingId);
    }
  }, [selectedBuildingId]);

  const fetchBuildings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(API_ROUTES.HOSTEL_BUILDINGS);

      if (response.data.success) {
        setBuildings(response.data.data.buildings || response.data.data);
        // Auto-select first building if available
        if (response.data.data.buildings?.length > 0) {
          setSelectedBuildingId(response.data.data.buildings[0].id);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch buildings';
      setError(errorMessage);
      console.error('Error fetching buildings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuildingDetails = async (buildingId: string) => {
    try {
      const response = await api.get(`${API_ROUTES.HOSTEL_BUILDINGS}/${buildingId}`);

      if (response.data.success) {
        const building = response.data.data;
        setHostelData({
          totalFloors: building.totalFloors || 0,
          totalRooms: building.floors?.reduce((sum: number, floor: any) => sum + (floor.rooms?.length || 0), 0) || 0,
          floors: building.floors || [],
        });
      }
    } catch (err: any) {
      console.error('Error fetching building details:', err);
    }
  };

  const handleBuildingSuccess = (newBuilding: Building) => {
    setBuildings([...buildings, newBuilding]);
    setSelectedBuildingId(newBuilding.id);
    setIsAddingBuilding(false);
  };

  const handleBuildingUpdate = (updatedBuilding: Building) => {
    setBuildings(buildings.map(b => b.id === updatedBuilding.id ? updatedBuilding : b));
    setIsEditingBuilding(false);
    // Refresh building details to reflect updated data
    if (selectedBuildingId === updatedBuilding.id) {
      fetchBuildingDetails(updatedBuilding.id);
    }
  };

  const handleFloorAdded = () => {
    // Refresh building details to show the new floor/room
    if (selectedBuildingId) {
      fetchBuildingDetails(selectedBuildingId);
    }
  };

  const handleAddRoomClick = (floorId: string, floorName: string) => {
    setSelectedFloorForRoom({ id: floorId, name: floorName });
    setIsAddingRoom(true);
  };

  const handleUpdateFloorStatus = async (floorId: string, newStatus: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE") => {
    try {
      setUpdatingFloorId(floorId);
      setUpdateError(null);

      await api.put(`${API_ROUTES.HOSTEL_FLOORS}/${floorId}`, {
        status: newStatus,
      });

      setHostelData((prevData) => ({
        ...prevData,
        floors: prevData.floors.map((floor) =>
          floor.id === floorId ? { ...floor, status: newStatus } : floor
        ),
      }));

      setEditingFloorId(null);
      setEditingFloorStatus(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update floor status';
      setUpdateError(errorMessage);
      console.error('Error updating floor status:', err);
    } finally {
      setUpdatingFloorId(null);
    }
  };

  const handleDeleteFloor = async () => {
    try {
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: true }));

      await api.delete(`${API_ROUTES.HOSTEL_FLOORS}/${deleteConfirmation.id}`);

      // Update local state
      setHostelData((prevData) => ({
        ...prevData,
        totalFloors: prevData.totalFloors - 1,
        floors: prevData.floors.filter((floor) => floor.id !== deleteConfirmation.id),
      }));

      setDeleteConfirmation({
        isOpen: false,
        type: null,
        id: null,
        name: '',
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete floor';
      setUpdateError(errorMessage);
      console.error('Error deleting floor:', err);
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteRoom = async () => {
    try {
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: true }));

      await api.delete(`${API_ROUTES.HOSTEL_ROOMS}/${deleteConfirmation.id}`);

      // Update local state
      setHostelData((prevData) => ({
        ...prevData,
        totalRooms: prevData.totalRooms - 1,
        floors: prevData.floors.map((floor) => ({
          ...floor,
          rooms: floor.rooms?.filter((room) => room.id !== deleteConfirmation.id) || [],
        })),
      }));

      setDeleteConfirmation({
        isOpen: false,
        type: null,
        id: null,
        name: '',
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete room';
      setUpdateError(errorMessage);
      console.error('Error deleting room:', err);
      setDeleteConfirmation((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const openDeleteFloorConfirmation = (floorId: string, floorName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'floor',
      id: floorId,
      name: floorName,
      isLoading: false,
    });
  };

  const openDeleteRoomConfirmation = (roomId: string, roomName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'room',
      id: roomId,
      name: roomName,
      isLoading: false,
    });
  };

  // Calculate floor statistics
  const calculateFloorStats = (floor: Floor) => {
    const totalRooms = floor.rooms?.length || 0;
    const totalStudents = floor.rooms?.reduce((sum, room) => {
      return sum + (room.allocations?.filter(a => a.status === 'ACTIVE' || a.status === 'ALLOCATED')?.length || 0);
    }, 0) || 0;
    const totalCapacity = floor.rooms?.reduce((sum, room) => sum + (room.capacity || 0), 0) || 0;
    const occupancyRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
    const availableSeats = totalCapacity - totalStudents;

    return {
      totalRooms,
      totalStudents,
      totalCapacity,
      occupancyRate,
      availableSeats,
    };
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'INACTIVE':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'UNDER_MAINTENANCE':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const selectedBuilding = buildings.find((building) => building.id === selectedBuildingId) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {isLoading ? (
            // Loading State
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-foreground">Loading buildings...</span>
            </div>
          ) : buildings.length === 0 ? (
            // No Buildings Available
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                No Buildings Available
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your first building to get started with hostel management.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddingBuilding(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add Building
              </motion.button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-primary" />
                  <h1 className="text-4xl font-bold text-foreground">
                    Hostel Management
                  </h1>
                </div>

                {/* Building Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors font-medium text-foreground"
                  >
                    {selectedBuilding?.buildingName || 'Select Building'}
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{
                      opacity: isDropdownOpen ? 1 : 0,
                      y: isDropdownOpen ? 0 : -10,
                      pointerEvents: isDropdownOpen ? 'auto' : 'none',
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50"
                  >
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                      {buildings.map((building) => (
                        <motion.button
                          key={building.id}
                          whileHover={{ backgroundColor: 'var(--color-accent)' }}
                          onClick={() => {
                            setSelectedBuildingId(building.id);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 rounded-md text-foreground transition-colors hover:bg-accent"
                        >
                          <div className="font-medium">{building.buildingName}</div>
                          <div className="text-xs text-muted-foreground">{building.buildingCode}</div>
                        </motion.button>
                      ))}
                      <motion.button
                        whileHover={{ backgroundColor: 'var(--color-accent)' }}
                        onClick={() => {
                          setIsAddingBuilding(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 rounded-md text-primary font-medium transition-colors flex items-center gap-2 border-t border-border mt-2 pt-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Building
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between"
                >
                  <span>{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              )}

              {/* Action Buttons */}
              {selectedBuilding && (
                <div className="flex gap-4 flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddingFloor(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5" />
                    Add Floor
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fetchBuildings()}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-border text-foreground hover:bg-accent transition-colors font-semibold"
                  >
                    <Home className="w-5 h-5" />
                    Refresh
                  </motion.button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Building Details */}
        {selectedBuilding && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Building Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card rounded-lg border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Building Info</h3>
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{selectedBuilding.buildingName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Code</p>
                  <p className="font-medium text-foreground">{selectedBuilding.buildingCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground">{selectedBuilding.address}</p>
                </div>
                {selectedBuilding.contactPhone && (
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selectedBuilding.contactPhone}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card rounded-lg border border-border shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground text-sm">Total Floors</p>
                  <p className="text-3xl font-bold text-primary">{hostelData.totalFloors}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Rooms</p>
                  <p className="text-3xl font-bold text-primary">{hostelData.totalRooms}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card rounded-lg border border-border shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditingBuilding(true)}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  Edit Building
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedFloor(expandedFloor ? null : hostelData.floors[0]?.id || null)}
                  className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors font-medium text-sm"
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Update Error Message */}
        {updateError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between"
          >
            <span>{updateError}</span>
            <button
              onClick={() => setUpdateError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}

        {/* Floors Section */}
        {selectedBuilding && hostelData.floors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-foreground">Floors Overview</h2>
            {hostelData.floors.map((floor) => {
              const stats = calculateFloorStats(floor);
              return (
                <motion.div
                  key={floor.id}
                  className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  {/* Floor Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {floor.floorName || `Floor ${floor.floorNumber}`}
                        </h3>
                        {floor.description && (
                          <p className="text-xs text-muted-foreground">{floor.description}</p>
                        )}
                      </div>
                      {/* Floor Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadgeColor(floor.status)}`}>
                        {floor.status.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingFloorId === floor.id ? (
                        <>
                          {/* Status Edit Dropdown */}
                          <select
                            value={editingFloorStatus || floor.status}
                            onChange={(e) =>
                              setEditingFloorStatus(e.target.value as "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE")
                            }
                            className="px-3 py-1 rounded-lg border border-border bg-card text-foreground text-sm"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                          </select>
                          {/* Confirm Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              if (editingFloorStatus) {
                                handleUpdateFloorStatus(floor.id, editingFloorStatus);
                              }
                            }}
                            disabled={updatingFloorId === floor.id}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                          >
                            {updatingFloorId === floor.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check size={18} />
                            )}
                          </motion.button>
                          {/* Cancel Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditingFloorId(null);
                              setEditingFloorStatus(null);
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={18} />
                          </motion.button>
                        </>
                      ) : (
                        <>
                          {/* Edit Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditingFloorId(floor.id);
                              setEditingFloorStatus(floor.status);
                            }}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <Edit2 size={18} className="text-blue-600" />
                          </motion.button>
                          {/* Add Room Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddRoomClick(floor.id, floor.floorName || `Floor ${floor.floorNumber}`)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            title="Add Room to this Floor"
                          >
                            <Plus size={18} className="text-green-600" />
                          </motion.button>
                          {/* Delete Floor Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              openDeleteFloorConfirmation(floor.id, floor.floorName || `Floor ${floor.floorNumber}`)
                            }
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            title="Delete Floor"
                          >
                            <Trash2 size={18} className="text-destructive" />
                          </motion.button>
                          {/* Expand Button */}
                          <motion.button
                            onClick={() =>
                              setExpandedFloor(expandedFloor === floor.id ? null : floor.id)
                            }
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <ChevronDown
                              className="w-5 h-5"
                              style={{
                                transform:
                                  expandedFloor === floor.id ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s',
                              }}
                            />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Floor Statistics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {/* Total Rooms */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Total Rooms</p>
                        <DoorOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{stats.totalRooms}</p>
                    </div>

                    {/* Students Living */}
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Students</p>
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-700">{stats.totalStudents}</p>
                    </div>

                    {/* Total Capacity */}
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Capacity</p>
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{stats.totalCapacity}</p>
                    </div>

                    {/* Available Seats */}
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Available</p>
                        <Home className="w-4 h-4 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-700">{stats.availableSeats}</p>
                    </div>

                    {/* Occupancy Rate */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-muted-foreground font-medium">Occupancy</p>
                        <div className="w-4 h-4 rounded-full bg-gray-300" />
                      </div>
                      <p className={`text-2xl font-bold ${getOccupancyColor(stats.occupancyRate)}`}>
                        {stats.occupancyRate}%
                      </p>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Occupancy Progress</span>
                      <span className={`text-xs font-semibold ${getOccupancyColor(stats.occupancyRate)}`}>
                        {stats.totalStudents}/{stats.totalCapacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stats.occupancyRate >= 80
                            ? 'bg-red-500'
                            : stats.occupancyRate >= 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Rooms List */}
                  {expandedFloor === floor.id && floor.rooms && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 space-y-2 border-t border-border pt-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">Rooms Details ({floor.rooms.length})</h4>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddRoomClick(floor.id, floor.floorName || `Floor ${floor.floorNumber}`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-semibold"
                        >
                          <Plus size={14} />
                          Add Room
                        </motion.button>
                      </div>

                      {floor.rooms.length > 0 ? (
                        floor.rooms.map((room: Room) => {
                          const occupiedSeats = room.allocations?.filter(a => a.status === 'ACTIVE' || a.status === 'ALLOCATED')?.length || 0;
                          const roomOccupancyRate = room.capacity > 0 ? Math.round((occupiedSeats / room.capacity) * 100) : 0;
                          return (
                            <motion.div
                              key={room.id}
                              className="p-3 bg-muted/50 rounded-lg text-sm border border-border hover:border-primary/30 transition-colors group"
                              whileHover={{ scale: 1.01 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium text-foreground">{room.roomName || room.roomNumber}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Type: <span className="font-semibold">{room.roomType}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                    roomOccupancyRate >= 80 ? 'bg-red-100 text-red-700' :
                                    roomOccupancyRate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {occupiedSeats}/{room.capacity}
                                  </span>
                                  {/* Delete Room Button */}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      openDeleteRoomConfirmation(room.id, room.roomName || room.roomNumber)
                                    }
                                    className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                                    title="Delete Room"
                                  >
                                    <Trash2 size={14} className="text-destructive" />
                                  </motion.button>
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-300 ${
                                    roomOccupancyRate >= 80 ? 'bg-red-500' :
                                    roomOccupancyRate >= 60 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(roomOccupancyRate, 100)}%` }}
                                />
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p className="text-sm">No rooms added yet</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title={deleteConfirmation.type === 'floor' ? 'Delete Floor' : 'Delete Room'}
        description={
          deleteConfirmation.type === 'floor'
            ? 'Are you sure you want to delete this floor? All associated rooms will also be deleted. This action cannot be undone.'
            : 'Are you sure you want to delete this room? This action cannot be undone.'
        }
        itemName={deleteConfirmation.name}
        isLoading={deleteConfirmation.isLoading}
        onConfirm={() => {
          if (deleteConfirmation.type === 'floor') {
            handleDeleteFloor();
          } else if (deleteConfirmation.type === 'room') {
            handleDeleteRoom();
          }
        }}
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            type: null,
            id: null,
            name: '',
            isLoading: false,
          })
        }
      />

      {/* Building Modal */}
      <HostelModal
        isOpen={isAddingBuilding}
        onClose={() => setIsAddingBuilding(false)}
        onSuccess={handleBuildingSuccess}
      />

      {/* Edit Building Modal */}
      <EditHostelModal
        isOpen={isEditingBuilding}
        onClose={() => setIsEditingBuilding(false)}
        onSuccess={handleBuildingUpdate}
        buildingData={selectedBuilding}
      />

      {/* Floor Modal */}
      {selectedBuilding && (
        <FloorModal
          isOpen={isAddingFloor}
          onClose={() => setIsAddingFloor(false)}
          buildingId={selectedBuilding.id}
          buildingName={selectedBuilding.buildingName}
          onFloorAdded={handleFloorAdded}
        />
      )}

      {/* Room Modal */}
      {selectedBuilding && selectedFloorForRoom && (
        <RoomModal
          isOpen={isAddingRoom}
          onClose={() => {
            setIsAddingRoom(false);
            setSelectedFloorForRoom(null);
          }}
          buildingId={selectedBuilding.id}
          floorId={selectedFloorForRoom.id}
          buildingName={selectedBuilding.buildingName}
          floorName={selectedFloorForRoom.name}
          onRoomAdded={handleFloorAdded}
        />
      )}
    </div>
  );
}