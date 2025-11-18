import { useState } from "react";
import { X, AlertCircle, CheckCircle, Building2, Hash, FileText, Users, Grid3X3, Zap, Droplets, Wifi, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../lib/api.ts";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  floorId: string;
  buildingName: string;
  floorName: string;
  onRoomAdded?: () => void;
}

interface RoomFormData {
  roomNumber: string;
  roomName: string;
  roomType: "SINGLE" | "DOUBLE" | "TRIPLE" | "QUAD" | "DORMITORY";
  description: string;
  hasAttachedBathroom: boolean;
  hasBalcony: boolean;
  hasACFacility: boolean;
  hasHotWater: boolean;
  hasFurniture: boolean;
  hasWifi: boolean;
  hasTV: boolean;
  hasRefrigerator: boolean;
}

// Room type configuration with capacity and default floor area
const roomTypeOptions = [
  { value: "SINGLE", label: "Single", capacity: 1, description: "1 person", defaultArea: 120 },
  { value: "DOUBLE", label: "Double", capacity: 2, description: "2 people", defaultArea: 180 },
  { value: "TRIPLE", label: "Triple", capacity: 3, description: "3 people", defaultArea: 240 },
  { value: "QUAD", label: "Quad", capacity: 4, description: "4 people", defaultArea: 300 },
  { value: "DORMITORY", label: "Dormitory", capacity: 5, description: "5+ people", defaultArea: 400 },
];

const amenities = [
  { id: "hasAttachedBathroom", label: "Attached Bathroom", icon: Droplets },
  { id: "hasBalcony", label: "Balcony", icon: Wind },
  { id: "hasACFacility", label: "AC Facility", icon: Wind },
  { id: "hasHotWater", label: "Hot Water", icon: Zap },
  { id: "hasFurniture", label: "Furnished", icon: Grid3X3 },
  { id: "hasWifi", label: "WiFi", icon: Wifi },
  { id: "hasTV", label: "Television", icon: Grid3X3 },
  { id: "hasRefrigerator", label: "Refrigerator", icon: Droplets },
];

export default function RoomModal({
  isOpen,
  onClose,
  buildingId,
  floorId,
  buildingName,
  floorName,
  onRoomAdded,
}: RoomModalProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    roomNumber: "",
    roomName: "",
    roomType: "SINGLE",
    description: "",
    hasAttachedBathroom: false,
    hasBalcony: false,
    hasACFacility: false,
    hasHotWater: false,
    hasFurniture: true,
    hasWifi: false,
    hasTV: false,
    hasRefrigerator: false,
  });

  const [customFloorArea, setCustomFloorArea] = useState<string>("");
  const [useCustomArea, setUseCustomArea] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Get capacity and default area based on room type
  const getRoomTypeDetails = (roomType: string) => {
    const type = roomTypeOptions.find((t) => t.value === roomType);
    return {
      capacity: type?.capacity || 1,
      defaultArea: type?.defaultArea || 120,
    };
  };

  const roomTypeDetails = getRoomTypeDetails(formData.roomType);
  const finalFloorArea = useCustomArea ? customFloorArea : roomTypeDetails.defaultArea.toString();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (error) setError(null);
  };

  const handleFloorAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomFloorArea(value);
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.roomNumber.trim()) {
      setError("Room number is required");
      return false;
    }

    if (useCustomArea && (!customFloorArea || isNaN(parseFloat(customFloorArea)))) {
      setError("Floor area must be a valid number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        buildingId,
        floorId,
        roomNumber: formData.roomNumber,
        roomName: formData.roomName || formData.roomNumber,
        roomType: formData.roomType,
        capacity: roomTypeDetails.capacity, // Auto-set from room type
        description: formData.description,
        hasAttachedBathroom: formData.hasAttachedBathroom,
        hasBalcony: formData.hasBalcony,
        hasACFacility: formData.hasACFacility,
        hasHotWater: formData.hasHotWater,
        hasFurniture: formData.hasFurniture,
        hasWifi: formData.hasWifi,
        hasTV: formData.hasTV,
        hasRefrigerator: formData.hasRefrigerator,
        floorArea: parseFloat(finalFloorArea),
      };

      await api.post("/api/admin/hostel/rooms", payload);

      setSuccess(true);
      setTimeout(() => {
        setFormData({
          roomNumber: "",
          roomName: "",
          roomType: "SINGLE",
          description: "",
          hasAttachedBathroom: false,
          hasBalcony: false,
          hasACFacility: false,
          hasHotWater: false,
          hasFurniture: true,
          hasWifi: false,
          hasTV: false,
          hasRefrigerator: false,
        });
        setCustomFloorArea("");
        setUseCustomArea(false);
        setSuccess(false);
        onRoomAdded?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create room. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            onClick={onClose}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl rounded-2xl bg-card border border-border shadow-2xl my-8"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header - Gradient Background */}
            <motion.div
              className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 px-6 py-6 sm:px-8 sm:py-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-primary/10 blur-3xl"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180] }}
                  transition={{ duration: 15, repeat: Infinity }}
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <motion.div
                  className="flex items-center gap-3 flex-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Grid3X3 className="w-7 h-7 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                      Add New Room
                    </h2>
                    <p className="text-sm text-primary-foreground/80 mt-1">
                      {buildingName} → {floorName}
                    </p>
                  </div>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  disabled={loading}
                  className="ml-4 p-2 rounded-full hover:bg-primary-foreground/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6 text-primary-foreground" />
                </motion.button>
              </div>
            </motion.div>

            {/* Body */}
            <motion.form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 max-h-[calc(100vh-200px)] overflow-y-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Building & Floor Info */}
              <motion.div
                className="mb-6 rounded-xl bg-accent p-4 border border-border"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 rounded-lg bg-primary/10"
                  >
                    <Building2 className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                      Location
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-foreground">
                      {buildingName} - {floorName}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mb-4 rounded-xl bg-destructive/10 p-4 border border-destructive/20"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    className="mb-4 rounded-xl bg-green-500/10 p-4 border border-green-500/20"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ scale: [0, 1], rotate: [0, 360] }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </motion.div>
                      <p className="text-sm text-green-700 font-semibold">
                        Room created successfully!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Basic Information Section */}
              <motion.div variants={itemVariants} className="mb-8">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  Basic Information
                </h3>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  variants={containerVariants}
                >
                  {/* Room Number */}
                  <motion.div variants={itemVariants}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                      <Hash className="w-4 h-4 text-primary" />
                      Room Number
                      <span className="text-destructive">*</span>
                    </label>
                    <motion.div
                      animate={{
                        boxShadow:
                          focusedField === "roomNumber"
                            ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                            : "0 0 0 0px transparent",
                      }}
                      className="relative"
                    >
                      <input
                        type="text"
                        id="roomNumber"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("roomNumber")}
                        onBlur={() => setFocusedField(null)}
                        disabled={loading}
                        className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-muted/50 disabled:cursor-not-allowed transition-all"
                        placeholder="e.g., A101, B205"
                      />
                    </motion.div>
                  </motion.div>

                  {/* Room Name */}
                  <motion.div variants={itemVariants}>
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                      <FileText className="w-4 h-4 text-primary" />
                      Room Name (Optional)
                    </label>
                    <motion.div
                      animate={{
                        boxShadow:
                          focusedField === "roomName"
                            ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                            : "0 0 0 0px transparent",
                      }}
                      className="relative"
                    >
                      <input
                        type="text"
                        id="roomName"
                        name="roomName"
                        value={formData.roomName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField("roomName")}
                        onBlur={() => setFocusedField(null)}
                        disabled={loading}
                        className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-muted/50 disabled:cursor-not-allowed transition-all"
                        placeholder="e.g., Corner Room"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Room Type Selection with Auto Capacity & Area */}
              <motion.div variants={itemVariants} className="mb-8">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 block flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Room Type
                  <span className="text-destructive">*</span>
                </label>
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-5 gap-3"
                  variants={containerVariants}
                >
                  {roomTypeOptions.map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative cursor-pointer"
                      variants={itemVariants}
                    >
                      <input
                        type="radio"
                        name="roomType"
                        value={option.value}
                        checked={formData.roomType === option.value}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="sr-only"
                      />
                      <motion.div
                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                          formData.roomType === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/30 hover:border-primary/50"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        animate={{
                          boxShadow:
                            formData.roomType === option.value
                              ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                              : "none",
                        }}
                      >
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                        {formData.roomType === option.value && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-2 pt-2 border-t border-primary/20 space-y-1"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <Users className="w-3 h-3 text-primary" />
                              <span className="text-xs font-bold text-primary">
                                {option.capacity} {option.capacity === 1 ? "Person" : "People"}
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <Grid3X3 className="w-3 h-3 text-primary" />
                              <span className="text-xs font-bold text-primary">
                                ≈ {option.defaultArea} sq ft
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.label>
                  ))}
                </motion.div>
              </motion.div>

              {/* Floor Area Override Section */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="rounded-xl bg-accent/50 p-4 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4 text-primary" />
                      Room Specifications
                    </h3>
                    <motion.label
                      className="flex items-center gap-2 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <input
                        type="checkbox"
                        checked={useCustomArea}
                        onChange={(e) => setUseCustomArea(e.target.checked)}
                        disabled={loading}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-foreground">
                        Custom Area
                      </span>
                    </motion.label>
                  </div>

                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    variants={containerVariants}
                  >
                    {/* Capacity Display (Read-only) */}
                    <motion.div variants={itemVariants}>
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                        <Users className="w-4 h-4 text-primary" />
                        Capacity
                      </label>
                      <div className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        {roomTypeDetails.capacity} {roomTypeDetails.capacity === 1 ? "Person" : "People"}
                      </div>
                    </motion.div>

                    {/* Floor Area */}
                    <motion.div variants={itemVariants}>
                      <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                        <Grid3X3 className="w-4 h-4 text-primary" />
                        Floor Area
                        {useCustomArea && <span className="text-destructive">*</span>}
                      </label>
                      <motion.div
                        animate={{
                          boxShadow:
                            focusedField === "floorArea"
                              ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                              : "0 0 0 0px transparent",
                        }}
                        className="relative"
                      >
                        <input
                          type="number"
                          id="floorArea"
                          value={finalFloorArea}
                          onChange={handleFloorAreaChange}
                          onFocus={() => setFocusedField("floorArea")}
                          onBlur={() => setFocusedField(null)}
                          disabled={loading || !useCustomArea}
                          step="0.01"
                          min="0"
                          className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-muted/50 disabled:cursor-not-allowed transition-all disabled:opacity-70"
                          placeholder="Floor area in sq ft/sq m"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                          {useCustomArea ? "Custom" : "Auto"}
                        </span>
                      </motion.div>
                      <motion.p
                        className="text-xs text-muted-foreground mt-1.5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {useCustomArea 
                          ? "Enter custom floor area value"
                          : `Auto-calculated as ${roomTypeDetails.defaultArea} sq ft for ${formData.roomType} room`
                        }
                      </motion.p>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Amenities Section */}
              <motion.div variants={itemVariants} className="mb-8">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Amenities
                </h3>

                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                  variants={containerVariants}
                >
                  {amenities.map((amenity) => {
                    const Icon = amenity.icon;
                    const isChecked = formData[amenity.id as keyof RoomFormData] as boolean;

                    return (
                      <motion.label
                        key={amenity.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative cursor-pointer"
                        variants={itemVariants}
                      >
                        <input
                          type="checkbox"
                          name={amenity.id}
                          checked={isChecked}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="sr-only"
                        />
                        <motion.div
                          className={`rounded-lg border-2 p-3 text-center transition-all flex items-center justify-center flex-col gap-2 ${
                            isChecked
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                          animate={{
                            boxShadow: isChecked
                              ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                              : "none",
                          }}
                        >
                          <motion.div
                            animate={isChecked ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Icon className="w-5 h-5 text-primary" />
                          </motion.div>
                          <p className="text-xs font-semibold text-foreground">
                            {amenity.label}
                          </p>
                        </motion.div>
                      </motion.label>
                    );
                  })}
                </motion.div>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants} className="mb-6">
                <label className="text-sm font-semibold text-foreground mb-2.5 block">
                  Description (Optional)
                </label>
                <motion.div
                  animate={{
                    boxShadow:
                      focusedField === "description"
                        ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                        : "0 0 0 0px transparent",
                  }}
                  className="relative"
                >
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-muted/50 disabled:cursor-not-allowed transition-all resize-none"
                    placeholder="Add any additional details about this room..."
                  />
                </motion.div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                className="flex gap-3"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-border bg-card text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold py-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold py-3 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Grid3X3 className="w-5 h-5" />
                      </motion.div>
                      <span>Create Room</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}