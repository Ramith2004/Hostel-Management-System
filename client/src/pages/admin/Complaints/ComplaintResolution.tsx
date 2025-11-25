import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Activity, Clock, CheckCircle2, AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import { adminComplaintAPI } from "../../../lib/complaint.api";

interface CategoryData {
  category: string;
  count: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export const ComplaintResolution = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔵 Fetching resolution data for tenant:", user?.tenantId);
      
      const [categoryRes, statsRes] = await Promise.all([
        adminComplaintAPI.getByCategory(user?.tenantId || ""),
        adminComplaintAPI.getStats(user?.tenantId || ""),
      ]);
      
      console.log("🟢 Category data:", categoryRes);
      console.log("🟢 Stats data:", statsRes);
      
      setCategoryData(categoryRes.data || []);
      setStats(statsRes.data);
    } catch (err: any) {
      console.error("🔴 Failed to fetch data:", err);
      setError(err.response?.data?.message || err.message || "Failed to load resolution data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading resolution data...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Failed to Load Data</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <motion.button
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all mx-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const resolutionRate = stats && stats.total > 0
    ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100)
    : 0;

  const pendingTotal = stats ? stats.pending + stats.inProgress : 0;

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  Resolution Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track complaint resolution progress and analytics
                </p>
              </div>
            </div>
            <motion.button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          className="grid lg:grid-cols-4 md:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {/* Total Complaints */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total
                </span>
              </div>
              <p className="text-4xl font-bold text-foreground mb-1">
                {stats?.total || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Total Complaints
              </p>
            </div>
          </motion.div>

          {/* Resolution Rate */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-chart-2" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rate
                </span>
              </div>
              <p className="text-4xl font-bold text-foreground mb-1">
                {resolutionRate}%
              </p>
              <p className="text-sm text-muted-foreground">
                Resolution Rate
              </p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-chart-2 to-chart-3"
                  initial={{ width: 0 }}
                  animate={{ width: `${resolutionRate}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Resolved Count */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-chart-2" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Resolved
                </span>
              </div>
              <p className="text-4xl font-bold text-foreground mb-1">
                {stats ? stats.resolved + stats.closed : 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Successfully Resolved
              </p>
            </div>
          </motion.div>

          {/* Pending Count */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="relative overflow-hidden bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pending
                </span>
              </div>
              <p className="text-4xl font-bold text-foreground mb-1">
                {pendingTotal}
              </p>
              <p className="text-sm text-muted-foreground">
                {stats?.pending || 0} pending, {stats?.inProgress || 0} in progress
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Status Breakdown */}
        {stats && (
          <motion.div
            variants={itemVariants}
            className="bg-card border border-border rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Status Distribution
                </h3>
                <p className="text-sm text-muted-foreground">
                  Overview of all complaint statuses
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: "Pending", value: stats.pending, color: "bg-secondary", bgColor: "bg-secondary/10", textColor: "text-secondary" },
                { label: "Acknowledged", value: stats.acknowledged, color: "bg-chart-1", bgColor: "bg-chart-1/10", textColor: "text-chart-1" },
                { label: "In Progress", value: stats.inProgress, color: "bg-chart-2", bgColor: "bg-chart-2/10", textColor: "text-chart-2" },
                { label: "Resolved", value: stats.resolved, color: "bg-primary", bgColor: "bg-primary/10", textColor: "text-primary" },
                { label: "Closed", value: stats.closed, color: "bg-chart-3", bgColor: "bg-chart-3/10", textColor: "text-chart-3" },
                { label: "Rejected", value: stats.rejected, color: "bg-destructive", bgColor: "bg-destructive/10", textColor: "text-destructive" },
              ].map((status, index) => (
                <motion.div
                  key={status.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`${status.bgColor} border border-border rounded-lg p-4 cursor-pointer transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${status.textColor}`}>
                      {status.label}
                    </span>
                    <span className={`text-2xl font-bold ${status.textColor}`}>
                      {status.value}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={status.color}
                      initial={{ width: 0 }}
                      animate={{ width: stats.total > 0 ? `${(status.value / stats.total) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Category Breakdown */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Complaints by Category
              </h3>
              <p className="text-sm text-muted-foreground">
                Distribution across different complaint types
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {categoryData.map((cat, index) => {
              const maxCount = Math.max(...categoryData.map((c) => c.count));
              const percentage = (cat.count / maxCount) * 100;

              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {((cat.count / categoryData.reduce((sum, c) => sum + c.count, 0)) * 100).toFixed(1)}%
                      </span>
                      <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 1.2 + index * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {categoryData.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No category data available</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};