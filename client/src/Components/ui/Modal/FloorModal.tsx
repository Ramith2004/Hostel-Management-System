import { useState } from "react";
import { X, AlertCircle, CheckCircle, Building2, Hash, FileText, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../lib/api.ts";

interface FloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingId: string;
  buildingName: string;
  onFloorAdded?: () => void;
}

interface FloorFormData {
  floorNumber: number;
  floorName: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "UNDER_MAINTENANCE";
}

export default function FloorModal({
  isOpen,
  onClose,
  buildingId,
  buildingName,
  onFloorAdded,
}: FloorModalProps) {
  const [formData, setFormData] = useState<FloorFormData>({
    floorNumber: 0,
    floorName: "",
    description: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "floorNumber") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (formData.floorNumber < 0) {
      setError("Floor number must be non-negative");
      return false;
    }

    if (!formData.floorName.trim()) {
      setError("Floor name is required");
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
        floorNumber: formData.floorNumber,
        floorName: formData.floorName,
        description: formData.description,
        status: formData.status,
      };

      await api.post("/api/admin/hostel/floors", payload);

      setSuccess(true);
      setTimeout(() => {
        setFormData({
          floorNumber: 0,
          floorName: "",
          description: "",
          status: "ACTIVE",
        });
        setSuccess(false);
        onFloorAdded?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to create floor. Please try again."
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
        staggerChildren: 0.1,
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

  const statusOptions = [
    { value: "ACTIVE", label: "Active", icon: Shield, color: "text-green-600" },
    { value: "INACTIVE", label: "Inactive", icon: Shield, color: "text-gray-600" },
    { value: "UNDER_MAINTENANCE", label: "Under Maintenance", icon: Shield, color: "text-amber-600" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            onClick={onClose}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl"
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
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Building2 className="w-7 h-7 text-primary-foreground" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                      Add New Floor
                    </h2>
                    <p className="text-sm text-primary-foreground/80 mt-1">
                      Create a new floor in your hostel building
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
              className="p-6 sm:p-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Building Info Card */}
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
                      Selected Building
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-foreground">
                      {buildingName}
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
                        Floor created successfully!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Fields Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6"
                variants={containerVariants}
              >
                {/* Floor Number */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                    <Hash className="w-4 h-4 text-primary" />
                    Floor Number
                    <span className="text-destructive">*</span>
                  </label>
                  <motion.div
                    animate={{
                      boxShadow:
                        focusedField === "floorNumber"
                          ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                          : "0 0 0 0px transparent",
                    }}
                    className="relative"
                  >
                    <input
                      type="number"
                      id="floorNumber"
                      name="floorNumber"
                      value={formData.floorNumber}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("floorNumber")}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      min="0"
                      className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-muted/50 disabled:cursor-not-allowed transition-all"
                      placeholder="e.g., 0, 1, 2"
                    />
                  </motion.div>
                  <motion.p
                    className="text-xs text-muted-foreground mt-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    0 = Ground Floor, 1 = First Floor, etc.
                  </motion.p>
                </motion.div>

                {/* Floor Name */}
                <motion.div variants={itemVariants}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2.5">
                    <FileText className="w-4 h-4 text-primary" />
                    Floor Name
                    <span className="text-destructive">*</span>
                  </label>
                  <motion.div
                    animate={{
                      boxShadow:
                        focusedField === "floorName"
                          ? "0 0 0 3px rgb(var(--color-primary) / 0.1)"
                          : "0 0 0 0px transparent",
                    }}
                    className="relative"
                  >
                    <input
                      type="text"
                      id="floorName"
                      name="floorName"
                      value={formData.floorName}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField("floorName")}
                      onBlur={() => setFocusedField(null)}
                      disabled={loading}
                      className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-muted/50 disabled:cursor-not-allowed transition-all"
                      placeholder="e.g., Ground Floor"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Status Selection */}
              <motion.div variants={itemVariants} className="mb-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  Status
                  <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.label
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={formData.status === option.value}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="sr-only"
                        />
                        <motion.div
                          className={`rounded-lg border-2 p-3 sm:p-4 transition-all ${
                            formData.status === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                          animate={{
                            boxShadow:
                              formData.status === option.value
                                ? "0 0 0 4px rgb(var(--color-primary) / 0.1)"
                                : "none",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={
                                formData.status === option.value
                                  ? { scale: [1, 1.2, 1], rotate: 360 }
                                  : { scale: 1, rotate: 0 }
                              }
                              transition={{ duration: 0.5 }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                formData.status === option.value
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {formData.status === option.value && (
                                <motion.div
                                  className="w-2 h-2 bg-primary-foreground rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                />
                              )}
                            </motion.div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-foreground">
                                {option.label}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </motion.label>
                    );
                  })}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div variants={itemVariants} className="mb-6">
                <label className="text-sm font-semibold text-foreground mb-2.5 block">
                  Description
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
                    placeholder="Add any additional details about this floor..."
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
                        <Building2 className="w-5 h-5" />
                      </motion.div>
                      <span>Create Floor</span>
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