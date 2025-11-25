import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ComplaintCard } from "../../../Components/Complaints/ComplaintCard";
import { ComplaintFilterBar } from "../../../Components/Complaints/ComplaintFilterBar";
import { ComplaintForm } from "../../../Components/Complaints/ComplaintForm";
import { useComplaints } from "../../../hooks/useComplaints";
import { useComplaintFilters } from "../../../hooks/useComplaintFilters";

export const MyComplaints = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [showForm, setShowForm] = useState(false);

  // Use the complaint filters hook
  const { filters, updateMultipleFilters, setPage, clearFilters } = useComplaintFilters();

  // Pass filters to useComplaints hook
  const { complaints, loading, error, pagination, refetch } = useComplaints(
    user?.tenantId || "",
    "STUDENT",
    filters
  );

  // Actually update filters state!
  const handleFilterChange = (newFilters: any) => {
    updateMultipleFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleSuccess = () => {
    setShowForm(false);
    refetch();
  };

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // Early return if no user
  if (!user || !user.tenantId) {
    return (
      <motion.div
        className="min-h-screen bg-background p-6 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <p className="text-destructive text-lg font-semibold">
            User not authenticated. Please login again.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              My Complaints
            </h1>
            <p className="text-muted-foreground">
              Track and manage all your submitted complaints
            </p>
          </div>
          <motion.button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            New Complaint
          </motion.button>
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <ComplaintFilterBar 
            onFiltersChange={handleFilterChange}
            currentFilters={filters} // <-- FIXED HERE
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Active Filters Display */}
        {Object.keys(filters).filter(key => key !== 'page' && key !== 'limit' && filters[key as keyof typeof filters]).length > 0 && (
          <motion.div
            className="mb-6 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-sm text-muted-foreground">Active Filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (key === 'page' || key === 'limit' || !value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
                >
                  <span className="font-medium">{key}:</span> {value}
                </span>
              );
            })}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            className="flex flex-col items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="animate-spin w-12 h-12 mb-4 border-4 border-primary border-t-transparent rounded-full"></span>
            <p className="text-muted-foreground">Loading complaints...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="font-semibold mb-2">Error loading complaints</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && complaints.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No Complaints Found
            </h3>
            <p className="text-muted-foreground mb-6">
              {Object.keys(filters).filter(key => key !== 'page' && key !== 'limit' && filters[key as keyof typeof filters]).length > 0
                ? "No complaints match your current filters. Try adjusting your search."
                : "You haven't submitted any complaints yet"}
            </p>
            <div className="flex gap-3 justify-center">
              {Object.keys(filters).filter(key => key !== 'page' && key !== 'limit' && filters[key as keyof typeof filters]).length > 0 && (
                <motion.button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Filters
                </motion.button>
              )}
              <motion.button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                Submit Your First Complaint
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Complaints Grid */}
        {!loading && !error && complaints.length > 0 && (
          <>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {complaints.map((complaint, index) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                    commentCount={complaint.comments?.length || 0}
                    userRole="STUDENT"
                    tenantId={user.tenantId}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-2 mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <motion.button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm ${
                        pagination.page === pageNum
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ComplaintForm
          tenantId={user.tenantId}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </motion.div>
  );
};