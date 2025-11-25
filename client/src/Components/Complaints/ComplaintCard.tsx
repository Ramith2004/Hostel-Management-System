import { motion } from "framer-motion";
import { Calendar, MapPin, User, ArrowRight, MessageSquare } from "lucide-react";
import { ComplaintStatusBadge } from "./ ComplaintStatusBadge.tsx";
import { PriorityIndicator } from "./PriorityIndicator";
import { useNavigate } from "react-router-dom";

interface ComplaintCardProps {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string;
  createdAt: string;
  roomNumber?: string;
  studentName?: string;
  commentCount?: number;
  userRole: "STUDENT" | "ADMIN" | "WARDEN";
  tenantId: string;
}

export const ComplaintCard = ({
  id,
  title,
  description,
  status,
  priority,
  category,
  createdAt,
  roomNumber,
  studentName,
  commentCount = 0,
  userRole,
  tenantId,
}: ComplaintCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    console.log("Navigating to complaint:", { id, userRole, tenantId });
    
    if (userRole === "STUDENT") {
      navigate(`/student/complaints/${id}`, { 
        state: { complaintId: id, tenantId } 
      });
    } else if (userRole === "ADMIN" || userRole === "WARDEN") {
      navigate(`/admin/complaints/${id}`, { 
        state: { complaintId: id, tenantId } 
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      className="group relative border border-border rounded-xl p-5 bg-card hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={handleViewDetails}
    >
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="flex-shrink-0">
            <ComplaintStatusBadge status={status} size="sm" />
          </div>
        </div>

        {/* Tags Section */}
        <div className="flex items-center gap-2 flex-wrap mb-4 pb-4 border-b border-border">
          <PriorityIndicator priority={priority} size="sm" />
          <div className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
            {category}
          </div>
          {commentCount > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
              <MessageSquare className="w-3.5 h-3.5" />
              {commentCount}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{formatDate(createdAt)}</span>
          </div>
          {roomNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Room {roomNumber}</span>
            </div>
          )}
          {studentName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{studentName}</span>
            </div>
          )}
        </div>

        {/* View Details Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-muted text-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 group/btn shadow-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};