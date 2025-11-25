import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Download, Loader2, Calendar, BarChart3, TrendingUp, AlertCircle, FileText, PieChart } from "lucide-react";
import { adminComplaintAPI } from "../../../lib/complaint.api";
import { ComplaintStatusBadge } from "../../../Components/Complaints/ ComplaintStatusBadge";
import { PriorityIndicator } from "../../../Components/Complaints/PriorityIndicator";

interface ReportStats {
  total: number;
  pending: number;
  acknowledged: number;
  inProgress: number;
  resolved: number;
  closed: number;
  rejected: number;
  averageResolutionTime?: number;
}

interface ComplaintReport {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  student: { name: string };
  createdAt: string;
  resolvedAt?: string;
}

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

export const ComplaintReports = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ComplaintReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [reportResponse, statsResponse, categoryResponse] = await Promise.all([
        adminComplaintAPI.getReport(user?.tenantId || "", { startDate, endDate }),
        adminComplaintAPI.getStats(user?.tenantId || ""),
        adminComplaintAPI.getByCategory(user?.tenantId || ""),
      ]);

      console.log("📊 Report Response:", reportResponse);
      console.log("📈 Stats Response:", statsResponse);
      console.log("📋 Category Response:", categoryResponse);

      setReportData(reportResponse.data?.data || []);
      setStats(statsResponse.data);
      setCategoryData(categoryResponse.data || []);
      setReportGenerated(true);
    } catch (err: any) {
      console.error("Error generating report:", err);
      setError(err.response?.data?.message || err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!reportData || reportData.length === 0) return;

    const headers = [
      "Complaint ID",
      "Title",
      "Status",
      "Priority",
      "Category",
      "Student Name",
      "Submitted Date",
      "Resolved Date",
      "Resolution Time (Days)",
    ];

    const rows = reportData.map((complaint) => {
      const createdDate = new Date(complaint.createdAt);
      const resolvedDate = complaint.resolvedAt ? new Date(complaint.resolvedAt) : null;
      const resolutionTime = resolvedDate
        ? Math.ceil((resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        : "-";

      return [
        complaint.id,
        complaint.title,
        complaint.status,
        complaint.priority,
        complaint.category,
        complaint.student?.name || "N/A",
        createdDate.toLocaleDateString(),
        resolvedDate ? resolvedDate.toLocaleDateString() : "Pending",
        resolutionTime,
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `complaints-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (!reportData || reportData.length === 0) return;

    let htmlContent = `
      <html>
        <head>
          <title>Complaints Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
            .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .stat-label { font-size: 12px; color: #666; }
            .stat-value { font-size: 24px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .report-date { color: #666; font-size: 12px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Complaints Report</h1>
          <div class="report-date">
            Generated on: ${new Date().toLocaleDateString()}<br>
            Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}
          </div>
          
          <h2>Summary Statistics</h2>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Total Complaints</div>
              <div class="stat-value">${stats?.total || 0}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Resolved</div>
              <div class="stat-value">${stats?.resolved || 0}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Pending</div>
              <div class="stat-value">${stats?.pending || 0}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Avg Resolution (Days)</div>
              <div class="stat-value">${stats?.averageResolutionTime?.toFixed(1) || "N/A"}</div>
            </div>
          </div>

          <h2>Complaints Details</h2>
          <table>
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Student</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${reportData
                .map(
                  (complaint) => `
                <tr>
                  <td>${complaint.id}</td>
                  <td>${complaint.title}</td>
                  <td>${complaint.status}</td>
                  <td>${complaint.priority}</td>
                  <td>${complaint.category}</td>
                  <td>${complaint.student?.name || "N/A"}</td>
                  <td>${new Date(complaint.createdAt).toLocaleDateString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Complaint Reports
              </h1>
              <p className="text-muted-foreground mt-1">
                Generate and analyze complaint reports with detailed statistics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Select Date Range</h2>
              <p className="text-sm text-muted-foreground">Choose the period for your report</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <span className="text-destructive text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex items-end">
              <motion.button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Generate Report
                  </div>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Section */}
        <AnimatePresence>
          {reportGenerated && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Total Complaints", value: stats.total, icon: BarChart3, color: "primary" },
                { label: "Resolved", value: stats.resolved, icon: TrendingUp, color: "chart-2" },
                { label: "Pending", value: stats.pending, icon: AlertCircle, color: "secondary" },
                { label: "Avg Resolution", value: `${stats.averageResolutionTime?.toFixed(1) || "N/A"} days`, icon: Calendar, color: "chart-1" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`relative overflow-hidden p-6 rounded-xl border border-border bg-card shadow-sm`}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}/5 rounded-full -mr-12 -mt-12`} />
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center mb-3`}>
                        <Icon className={`w-5 h-5 text-${stat.color}`} />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Breakdown */}
        <AnimatePresence>
          {reportGenerated && categoryData && categoryData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Complaints by Category</h2>
                  <p className="text-sm text-muted-foreground">Distribution across different types</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryData.map((item, index) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ x: 4, scale: 1.02 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-all cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{item.category}</p>
                      <p className="text-sm text-muted-foreground">{item.count} complaints</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{item.count}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Distribution */}
        <AnimatePresence>
          {reportGenerated && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-foreground mb-6">Status Distribution</h2>

              <div className="space-y-4">
                {[
                  { label: "Pending", value: stats.pending, color: "bg-secondary" },
                  { label: "Acknowledged", value: stats.acknowledged, color: "bg-chart-1" },
                  { label: "In Progress", value: stats.inProgress, color: "bg-chart-2" },
                  { label: "Resolved", value: stats.resolved, color: "bg-primary" },
                  { label: "Closed", value: stats.closed, color: "bg-chart-3" },
                  { label: "Rejected", value: stats.rejected, color: "bg-destructive" },
                ]
                  .filter((item) => item.value > 0)
                  .map((item, index) => {
                    const percentage = ((item.value / stats.total) * 100).toFixed(1);
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{item.label}</span>
                          <span className="text-sm font-semibold text-muted-foreground">
                            {item.value} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${item.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + index * 0.05 }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complaints Table */}
        <AnimatePresence>
          {reportGenerated && reportData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden"
            >
              <h2 className="text-lg font-bold text-foreground mb-6">Detailed Complaints</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Priority</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((complaint, index) => (
                      <motion.tr
                        key={complaint.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.02 }}
                        className="border-b border-border hover:bg-accent/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                          {complaint.id.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground max-w-xs truncate">
                          {complaint.title}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <ComplaintStatusBadge 
                            status={complaint.status as "PENDING" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED"} 
                            size="sm" 
                          />
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <PriorityIndicator 
                            priority={complaint.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} 
                            size="sm" 
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {complaint.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {complaint.student?.name || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Download Buttons */}
        <AnimatePresence>
          {reportGenerated && reportData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4"
            >
              <motion.button
                onClick={handleDownloadCSV}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-chart-2 text-primary-foreground font-semibold rounded-lg hover:bg-chart-2/90 transition-all shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                Download as CSV
              </motion.button>

              <motion.button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground font-semibold rounded-lg hover:bg-destructive/90 transition-all shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                Download as PDF
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {reportGenerated && reportData.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl bg-accent/30"
            >
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-foreground">No complaints found</h3>
              <p className="text-muted-foreground mt-2">Try selecting a different date range</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};