import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader, BarChart3, AlertCircle } from "lucide-react";
import { ComplaintCard } from "../../../Components/Complaints/ComplaintCard";
import { ComplaintFilterBar } from "../../../Components/Complaints/ComplaintFilterBar";
import { adminComplaintAPI } from "../../../lib/complaint.api";

interface StatsCard {
  label: string;
  value: number;
  color: string;
  icon: string;
}

export const AllComplaints = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    fetchComplaints();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔵 Fetching complaints with filters:", {
        tenantId: user?.tenantId,
        filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      const response = await adminComplaintAPI.getComplaints(
        user?.tenantId || "",
        { ...filters, page: pagination.page, limit: pagination.limit }
      );

      console.log("🟢 Full API Response:", response);
      console.log("🟢 Response Data:", response.data);
      console.log("🟢 Response Pagination:", response.pagination);

      // Handle the response structure correctly
      const complaintsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const paginationData = response.pagination || {
        page: pagination.page,
        limit: pagination.limit,
        total: complaintsData.length,
        totalPages: Math.ceil(complaintsData.length / pagination.limit),
      };

      console.log("✅ Setting complaints:", complaintsData);
      console.log("✅ Setting pagination:", paginationData);

      setComplaints(complaintsData);
      setPagination(paginationData);
    } catch (err: any) {
      console.error("🔴 Fetch complaints error:", err);
      console.error("🔴 Error response:", err.response?.data);
      console.error("🔴 Error message:", err.message);
      
      setError(err.response?.data?.message || err.message || "Failed to fetch complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      console.log("🔵 Fetching stats for tenantId:", user?.tenantId);
      
      const response = await adminComplaintAPI.getStats(user?.tenantId || "");
      
      console.log("🟢 Stats Response:", response);
      
      setStats(response.data || response);
    } catch (err: any) {
      console.error("🔴 Failed to fetch stats:", err);
      console.error("🔴 Stats error response:", err.response?.data);
      
      // Set default stats if fetch fails
      setStats({
        total: 0,
        pending: 0,
        acknowledged: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        rejected: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const statsCards: StatsCard[] = stats
    ? [
        {
          label: "Total",
          value: stats.total || 0,
          color: "bg-card border-border",
          icon: "📋",
        },
        {
          label: "Pending",
          value: stats.pending || 0,
          color: "bg-card border-border",
          icon: "⏳",
        },
        {
          label: "In Progress",
          value: stats.inProgress || 0,
          color: "bg-card border-border",
          icon: "⚙️",
        },
        {
          label: "Resolved",
          value: stats.resolved || 0,
          color: "bg-card border-border",
          icon: "✅",
        },
      ]
    : [];

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleFiltersChange = (newFilters: any) => {
    console.log("🔵 Filters changed:", newFilters);
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  };

  const handleClearFilters = () => {
    console.log("🔵 Clearing filters");
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            All Complaints
          </h1>
          <p className="text-muted-foreground">
            Manage and resolve all student complaints
          </p>
        </motion.div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-card border border-border rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {statsCards.map((card, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-xl border shadow-sm ${card.color}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="text-3xl mb-2">{card.icon}</div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Filter Bar */}
        <div className="mb-6">
          <ComplaintFilterBar
            onFiltersChange={handleFiltersChange}
            currentFilters={filters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Loading complaints...</p>
          </motion.div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Error Loading Complaints</h3>
              <p className="text-sm text-destructive/80">{error}</p>
              <button
                onClick={fetchComplaints}
                className="mt-3 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && complaints.length === 0 && (
          <motion.div
            className="text-center py-20 bg-card rounded-xl border border-border"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Complaints Found
            </h3>
            <p className="text-muted-foreground">
              {Object.keys(filters).length > 0
                ? "No complaints match your current filters. Try adjusting them."
                : "There are no complaints to display at the moment."}
            </p>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={handleClearFilters}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Complaints List */}
        {!loading && !error && complaints.length > 0 && (
          <>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {complaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ComplaintCard
                    id={complaint.id}
                    title={complaint.title}
                    description={complaint.description}
                    status={complaint.status}
                    priority={complaint.priority}
                    category={complaint.category}
                    createdAt={complaint.createdAt}
                    roomNumber={complaint.room?.roomNumber}
                    studentName={complaint.student?.name}
                    commentCount={complaint.comments?.length || 0}
                    userRole="ADMIN"
                    tenantId={user?.tenantId || ""}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-2 mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg font-medium border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <motion.button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          pagination.page === page
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {page}
                      </motion.button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg font-medium border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </motion.div>
            )}

            {/* Results Info */}
            <motion.div
              className="text-center mt-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Showing {complaints.length} of {pagination.total} complaints
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};