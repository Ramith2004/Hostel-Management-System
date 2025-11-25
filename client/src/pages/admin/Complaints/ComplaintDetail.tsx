import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader, AlertCircle, CheckCircle } from "lucide-react";
import { adminComplaintAPI } from "../../../lib/complaint.api";
import { ComplaintStatusBadge } from "../../../Components/Complaints/ ComplaintStatusBadge";
import { PriorityIndicator } from "../../../Components/Complaints/PriorityIndicator";
import { ComplaintCommentSection } from "../../../Components/Complaints/ComplaintCommentSection";
import { ComplaintTimeline } from "../../../Components/Complaints/ComplaintTimeline";


export const ComplaintDetail = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [complaint, setComplaint] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolveData, setResolveData] = useState({
    resolutionNotes: "",
  });

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const complaintData = await adminComplaintAPI.getComplaintDetail(
        user?.tenantId || "",
        complaintId || ""
      );
      setComplaint(complaintData.data);

      const commentsData = await adminComplaintAPI.getComments(
        user?.tenantId || "",
        complaintId || ""
      );
      setComments(commentsData.data);
    } catch (err: any) {
      setError(err.message || "Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      setUpdating(true);
      await adminComplaintAPI.updateStatus(
        user?.tenantId || "",
        complaintId || "",
        status
      );
      setComplaint((prev: any) => ({ ...prev, status }));
    } catch (err: any) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    try {
      setUpdating(true);
      await adminComplaintAPI.resolveComplaint(
        user?.tenantId || "",
        complaintId || "",
        {
          status: "RESOLVED",
          resolutionNotes: resolveData.resolutionNotes,
        }
      );
      setComplaint((prev: any) => ({
        ...prev,
        status: "RESOLVED",
        resolutionNotes: resolveData.resolutionNotes,
      }));
      setShowResolveForm(false);
    } catch (err: any) {
      console.error("Failed to resolve complaint:", err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading complaint...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !complaint) {
    return (
      <motion.div
        className="min-h-screen bg-white dark:bg-gray-900 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-semibold mb-8 hover:text-blue-600"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-300 mb-1">
                Error Loading Complaint
              </h3>
              <p className="text-red-800 dark:text-red-200">
                {error || "Complaint not found"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-white dark:bg-gray-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-semibold mb-8 hover:text-blue-600"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Complaints
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                  {complaint.title}
                </h1>
                <ComplaintStatusBadge status={complaint.status} size="lg" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {complaint.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <PriorityIndicator priority={complaint.priority} />
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg">
                  {complaint.category}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg">
                  {complaint.student?.name}
                </div>
                {complaint.room?.roomNumber && (
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg">
                    Room {complaint.room.roomNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Submitted By
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {complaint.student?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {complaint.student?.email}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Submitted On
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  {formatDate(complaint.createdAt)}
                </p>
              </div>
            </div>

            {/* Status Actions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-4">
                Update Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["PENDING", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"].map(
                  (status) => (
                    <motion.button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updating || complaint.status === status}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        complaint.status === status
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {status}
                    </motion.button>
                  )
                )}
              </div>
            </div>

            {/* Resolution Section */}
            {complaint.status === "RESOLVED" && complaint.resolutionNotes ? (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-300">
                      Resolved
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {formatDate(complaint.resolvedAt)}
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-green-900 dark:text-green-100">
                    {complaint.resolutionNotes}
                  </p>
                </div>
              </div>
            ) : complaint.status !== "RESOLVED" && complaint.status !== "CLOSED" ? (
              <>
                {!showResolveForm ? (
                  <motion.button
                    onClick={() => setShowResolveForm(true)}
                    className="w-full px-6 py-3 bg-green-500 dark:bg-green-600 text-white font-semibold rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Resolve Complaint
                  </motion.button>
                ) : (
                  <motion.div
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-bold text-green-900 dark:text-green-300">
                      Resolve This Complaint
                    </h3>
                    <textarea
                      value={resolveData.resolutionNotes}
                      onChange={(e) =>
                        setResolveData((prev) => ({
                          ...prev,
                          resolutionNotes: e.target.value,
                        }))
                      }
                      placeholder="Describe the resolution..."
                      rows={4}
                      className="w-full px-4 py-2 border border-green-300 dark:border-green-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                    />
                    <div className="flex gap-3">
                      <motion.button
                        onClick={handleResolve}
                        disabled={updating || !resolveData.resolutionNotes.trim()}
                        className="flex-1 px-4 py-2 bg-green-500 dark:bg-green-600 text-white font-semibold rounded-lg hover:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {updating ? "Resolving..." : "Confirm Resolution"}
                      </motion.button>
                      <motion.button
                        onClick={() => setShowResolveForm(false)}
                        className="flex-1 px-4 py-2 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 font-semibold rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : null}

            {/* Comments Section */}
            <ComplaintCommentSection
              tenantId={user?.tenantId || ""}
              complaintId={complaint.id}
              comments={comments}
              userRole="ADMIN"
              onCommentAdded={fetchComplaintDetails}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Timeline */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <ComplaintTimeline
                complaint={complaint}
                currentStatus={complaint.status}
              />
            </div>

            {/* Quick Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-4">
                Quick Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Complaint ID
                  </p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-50">
                    {complaint.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Comments
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    {comments.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Priority Level
                  </p>
                  <div className="mt-2">
                    <PriorityIndicator priority={complaint.priority} size="md" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};