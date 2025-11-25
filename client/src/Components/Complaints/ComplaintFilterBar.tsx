import { motion } from "framer-motion";
import { Search, X, Filter } from "lucide-react";
import { useState } from "react";

interface ComplaintFilterBarProps {
  onFiltersChange: (filters: any) => void;
  currentFilters?: any;
  onClearFilters?: () => void;
}

const categories = [
  "MAINTENANCE",
  "ELECTRICAL",
  "PLUMBING",
  "HOUSEKEEPING",
  "INTERNET",
  "FURNITURE",
  "SAFETY",
  "HYGIENE",
  "NOISE",
  "OTHER",
];

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statuses = [
  "PENDING",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "REJECTED",
];

export const ComplaintFilterBar = ({
  onFiltersChange,
  currentFilters = {},
  onClearFilters,
}: ComplaintFilterBarProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const handleFilterChange = (key: string, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleClear = () => {
    setLocalFilters({});
    if (onClearFilters) onClearFilters();
    onFiltersChange({});
  };

  return (
    <motion.div
      className="border border-border rounded-xl p-6 space-y-4 bg-card shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search complaints by title or description..."
          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          value={localFilters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Status
          </label>
          <select
            className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all cursor-pointer"
            value={localFilters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Priority
          </label>
          <select
            className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all cursor-pointer"
            value={localFilters.priority || ""}
            onChange={(e) => handleFilterChange("priority", e.target.value || undefined)}
          >
            <option value="">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Category
          </label>
          <select
            className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all cursor-pointer"
            value={localFilters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value || undefined)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <motion.button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`mt-auto px-4 py-2.5 border border-border rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            showAdvanced
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? "Hide Advanced" : "Advanced"}
        </motion.button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              From Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              value={localFilters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              To Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              value={localFilters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
            />
          </div>
        </motion.div>
      )}

      {/* Clear Button */}
      {Object.keys(localFilters).some(key => localFilters[key] && key !== 'page' && key !== 'limit') && (
        <motion.button
          onClick={handleClear}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-muted-foreground hover:text-destructive font-medium transition-colors border border-border rounded-lg hover:bg-destructive/5 hover:border-destructive"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </motion.button>
      )}
    </motion.div>
  );
};