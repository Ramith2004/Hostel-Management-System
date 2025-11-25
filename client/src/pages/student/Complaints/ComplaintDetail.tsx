import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader, AlertCircle } from "lucide-react";
import { studentComplaintAPI } from "../../../lib/complaint.api";
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

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const complaintData = await studentComplaintAPI.getComplaintDetail(
        user?.tenantId || "",
        complaintId || ""
      );
      setComplaint(complaintData.data);

      const commentsData = await studentComplaintAPI.getComments(
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
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading complaint...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !complaint) {
    return (
      <motion.div
        className="min-h-screen bg-background p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary font-semibold mb-8 hover:opacity-80 transition-opacity duration-300"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-destructive mb-1">
                Error Loading Complaint
              </h3>
              <p className="text-destructive/80">
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
      className="min-h-screen bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary font-semibold mb-8 hover:opacity-80 transition-opacity duration-300"
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
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-foreground">
                  {complaint.title}
                </h1>
                <ComplaintStatusBadge status={complaint.status} size="lg" />
              </div>
              <p className="text-muted-foreground mb-4">
                {complaint.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <PriorityIndicator priority={complaint.priority} />
                <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                  {complaint.category}
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                  {complaint.room?.roomNumber && `Room ${complaint.room.roomNumber}`}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">
                  Submitted On
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {formatDate(complaint.createdAt)}
                </p>
              </div>
              {complaint.resolvedAt && (
                <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20 shadow-sm">
                  <p className="text-sm text-secondary-foreground mb-1">
                    Resolved On
                  </p>
                  <p className="text-lg font-semibold text-secondary-foreground">
                    {formatDate(complaint.resolvedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Resolution Notes */}
            {complaint.resolutionNotes && (
              <div className="bg-secondary/10 rounded-xl p-6 border border-secondary/20 shadow-sm">
                <h3 className="font-bold text-secondary-foreground mb-3">
                  Resolution Notes
                </h3>
                <p className="text-secondary-foreground/80">
                  {complaint.resolutionNotes}
                </p>
              </div>
            )}

            {/* Comments Section */}
            <ComplaintCommentSection
              tenantId={user?.tenantId || ""}
              complaintId={complaint.id}
              comments={comments}
              userRole="STUDENT"
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
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <ComplaintTimeline
                complaint={complaint}
                currentStatus={complaint.status}
              />
            </div>

            {/* Quick Info */}
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-foreground mb-4">
                Quick Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Complaint ID
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {complaint.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Comments
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {comments.length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};