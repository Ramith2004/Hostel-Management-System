import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, User, Clock, Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { studentComplaintAPI } from "../../lib/complaint.api";
import { ComplaintStatusBadge } from "../../Components/Complaints/ ComplaintStatusBadge";
import { PriorityIndicator } from "../../Components/Complaints/PriorityIndicator";
import { ComplaintTimeline } from "../../Components/Complaints/ComplaintTimeline";

export const ComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user?.tenantId) {
      console.error("Missing id or tenantId:", { id, tenantId: user?.tenantId });
      setError("Missing required parameters");
      setLoading(false);
      return;
    }
    fetchComplaint();
  }, [id, user?.tenantId]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔵 Fetching complaint detail:", { 
        id, 
        tenantId: user.tenantId,
        fullUrl: `${user.tenantId}/${id}`
      });
      
      if (!id) {
        throw new Error("Complaint ID is missing");
      }

      const response = await studentComplaintAPI.getComplaintDetail(user.tenantId, id);
      
      console.log("🟢 Complaint detail response:", response);
      
      setComplaint(response.data);
    } catch (err: any) {
      console.error("🔴 Error fetching complaint:", err);
      console.error("🔴 Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || err.message || "Failed to load complaint details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
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
            <button
              onClick={fetchComplaint}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
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
          Back to My Complaints
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
              <div className="mb-4">
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

            {/* Admin Updates */}
            {complaint.comments && complaint.comments.length > 0 ? (
              <motion.div
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Updates & Responses
                </h3>
                
                <div className="space-y-4">
                  {complaint.comments.map((comment: any, index: number) => (
                    <motion.div
                      key={comment.id}
                      className="border border-border rounded-lg p-4 bg-accent/30"
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
                              {comment.user?.role === "ADMIN" ? "Admin" : comment.user?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pl-10">
                        {comment.comment}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="bg-card border border-border rounded-xl p-8 shadow-sm text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Updates Yet
                </h3>
                <p className="text-muted-foreground text-sm">
                  The admin team will post updates here as they work on your complaint
                </p>
              </motion.div>
            )}
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
                        {complaint.room.roomNumber} {complaint.room.roomName && `- ${complaint.room.roomName}`}
                      </p>
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
    </motion.div>
  );
};