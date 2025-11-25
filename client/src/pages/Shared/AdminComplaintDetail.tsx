import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  Edit,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle
} from "lucide-react";
import { adminComplaintAPI } from "../../lib/complaint.api";
import { ComplaintStatusBadge } from "../../Components/Complaints/ ComplaintStatusBadge";
import { PriorityIndicator } from "../../Components/Complaints/PriorityIndicator";
import { ComplaintTimeline } from "../../Components/Complaints/ComplaintTimeline";
import toast from "react-hot-toast";

const statusOptions = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
  { value: "ACKNOWLEDGED", label: "Acknowledged", color: "bg-blue-500" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-purple-500" },
  { value: "RESOLVED", label: "Resolved", color: "bg-green-500" },
  { value: "CLOSED", label: "Closed", color: "bg-gray-500" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-500" },
];

export const AdminComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    comment: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id || !user?.tenantId) return;
    fetchComplaint();
  }, [id, user?.tenantId]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔵 Fetching complaint detail:", { id, tenantId: user.tenantId });
      
      const response = await adminComplaintAPI.getComplaintDetail(user.tenantId, id!);
      
      console.log("🟢 Complaint detail response:", response);
      
      setComplaint(response.data);
      setStatusUpdate({ status: response.data.status, comment: "" });
    } catch (err: any) {
      console.error("🔴 Error fetching complaint:", err);
      setError(err.response?.data?.message || err.message || "Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      toast.error("Please select a status");
      return;
    }

    if (!statusUpdate.comment.trim()) {
      toast.error("Please add a comment about this status update");
      return;
    }

    try {
      setUpdating(true);

      console.log("🔵 Updating status:", { id, tenantId: user.tenantId, statusUpdate });

      // Update status
      await adminComplaintAPI.updateStatus(user.tenantId, id!, statusUpdate.status);

      // Add comment
      await adminComplaintAPI.addComment(user.tenantId, id!, {
        comment: statusUpdate.comment,
        isInternal: false,
        commentType: "STATUS_UPDATE",
      });

      toast.success("Status updated successfully");
      setShowStatusModal(false);
      fetchComplaint(); // Refresh complaint data
    } catch (err: any) {
      console.error("🔴 Error updating status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive font-semibold mb-2">Error</p>
            <p className="text-muted-foreground">{error || "Complaint not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Complaints
        </motion.button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Complaint Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <motion.div
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-3">
                    {complaint.title}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <ComplaintStatusBadge status={complaint.status} />
                    <PriorityIndicator priority={complaint.priority} />
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
                      {complaint.category}
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowStatusModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit className="w-4 h-4" />
                  Update Status
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Description
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                {complaint.attachmentUrl && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Attachment
                    </h3>
                    <img
                      src={complaint.attachmentUrl}
                      alt="Complaint attachment"
                      className="rounded-lg border border-border max-w-md hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(complaint.attachmentUrl, '_blank')}
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Admin Comments & Updates
              </h3>
              
              {complaint.comments && complaint.comments.length > 0 ? (
                <div className="space-y-4">
                  {complaint.comments.map((comment: any, index: number) => (
                    <motion.div
                      key={comment.id}
                      className="border border-border rounded-lg p-4 bg-muted/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">
                              {comment.user?.name || "Admin"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {comment.user?.role || "ADMIN"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      {comment.commentType === "STATUS_UPDATE" && (
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-primary">Status Update</span>
                        </div>
                      )}
                      <p className="text-sm text-foreground leading-relaxed pl-10">
                        {comment.comment}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Info Card */}
            <motion.div
              className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="font-semibold text-foreground">Complaint Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-muted-foreground text-xs">Student</p>
                    <p className="text-foreground font-medium">{complaint.student?.name}</p>
                    <p className="text-muted-foreground text-xs">{complaint.student?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-xs">Submitted</p>
                    <p className="text-foreground">{formatDate(complaint.createdAt)}</p>
                  </div>
                </div>

                {complaint.room && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Room</p>
                      <p className="text-foreground">
                        {complaint.room.roomNumber} - {complaint.room.roomName}
                      </p>
                      {complaint.room.building && (
                        <p className="text-xs text-muted-foreground">
                          {complaint.room.building.buildingName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {complaint.resolvedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Resolved</p>
                      <p className="text-foreground">{formatDate(complaint.resolvedAt)}</p>
                    </div>
                  </div>
                )}

                {complaint.resolvedByUser && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Resolved By</p>
                      <p className="text-foreground">{complaint.resolvedByUser.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Timeline */}
            <ComplaintTimeline 
              complaint={complaint}
              currentStatus={complaint.status}
            />
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !updating && setShowStatusModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">Update Status</h3>
                  <button
                    onClick={() => !updating && setShowStatusModal(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    disabled={updating}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status Selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Select Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setStatusUpdate({ ...statusUpdate, status: option.value })}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            statusUpdate.status === option.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          }`}
                          disabled={updating}
                        >
                          <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-1`} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Add Comment <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={statusUpdate.comment}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, comment: e.target.value })}
                      placeholder="Explain the status update..."
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-[100px]"
                      disabled={updating}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowStatusModal(false)}
                      className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-foreground hover:bg-accent transition-colors"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStatusUpdate}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Update
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};