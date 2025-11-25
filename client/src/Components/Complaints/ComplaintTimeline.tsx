import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  PlayCircle,
  FileCheck,
  Lock
} from "lucide-react";

interface ComplaintTimelineProps {
  complaint: any;
  currentStatus: string;
}

const statusSteps = [
  { 
    key: "PENDING", 
    label: "Submitted", 
    icon: Clock,
    color: "bg-yellow-500",
    description: "Complaint submitted and awaiting review"
  },
  { 
    key: "ACKNOWLEDGED", 
    label: "Acknowledged", 
    icon: AlertCircle,
    color: "bg-blue-500",
    description: "Complaint has been acknowledged by admin"
  },
  { 
    key: "IN_PROGRESS", 
    label: "In Progress", 
    icon: PlayCircle,
    color: "bg-purple-500",
    description: "Team is working on resolving the issue"
  },
  { 
    key: "RESOLVED", 
    label: "Resolved", 
    icon: CheckCircle2,
    color: "bg-green-500",
    description: "Issue has been resolved"
  },
  { 
    key: "CLOSED", 
    label: "Closed", 
    icon: Lock,
    color: "bg-gray-500",
    description: "Complaint closed successfully"
  },
];

const rejectedStep = { 
  key: "REJECTED", 
  label: "Rejected", 
  icon: XCircle,
  color: "bg-red-500",
  description: "Complaint was rejected"
};

export const ComplaintTimeline = ({ complaint, currentStatus }: ComplaintTimelineProps) => {
  // Check if complaint is rejected
  const isRejected = currentStatus === "REJECTED";
  
  // Get current status index
  const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);
  
  // If rejected, show only pending and rejected
  const stepsToShow = isRejected 
    ? [statusSteps[0], rejectedStep] 
    : statusSteps;

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-6 shadow-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="font-semibold text-foreground mb-6">Status Timeline</h3>
      
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        {/* Steps */}
        <div className="space-y-6">
          {stepsToShow.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = isRejected 
              ? (step.key === "PENDING" || step.key === "REJECTED")
              : currentIndex >= index;
            const isCurrent = step.key === currentStatus;
            const isPast = isRejected 
              ? false 
              : currentIndex > index;

            return (
              <motion.div
                key={step.key}
                className="relative pl-12"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Icon Container */}
                <motion.div
                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? `${step.color} border-transparent`
                      : "bg-muted border-border"
                  } z-10`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    boxShadow: isCurrent ? "0 0 0 4px rgba(var(--primary), 0.2)" : "none"
                  }}
                  transition={{ 
                    delay: index * 0.1 + 0.2,
                    duration: 0.3,
                    boxShadow: {
                      repeat: isCurrent ? Infinity : 0,
                      duration: 2,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <motion.div
                    animate={{
                      scale: isCurrent ? [1, 1.2, 1] : 1,
                      rotate: isCompleted ? 0 : 0
                    }}
                    transition={{
                      scale: {
                        repeat: isCurrent ? Infinity : 0,
                        duration: 1.5,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    <Icon 
                      className={`w-4 h-4 ${
                        isCompleted ? "text-white" : "text-muted-foreground"
                      }`}
                    />
                  </motion.div>
                </motion.div>

                {/* Content */}
                <motion.div
                  className={`pb-2 ${
                    isCurrent 
                      ? "bg-primary/5 border border-primary/20 rounded-lg p-3 -ml-3" 
                      : ""
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold text-sm ${
                      isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <motion.span
                        className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Current
                      </motion.span>
                    )}
                    {isPast && !isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  
                  <p className={`text-xs leading-relaxed ${
                    isCompleted ? "text-muted-foreground" : "text-muted-foreground/60"
                  }`}>
                    {step.description}
                  </p>

                  {/* Show timestamp for completed steps */}
                  {isCompleted && complaint && (
                    <motion.p
                      className="text-xs text-muted-foreground mt-1 flex items-center gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      <Clock className="w-3 h-3" />
                      {step.key === "PENDING" && formatDate(complaint.createdAt)}
                      {step.key === "ACKNOWLEDGED" && complaint.acknowledgedAt && formatDate(complaint.acknowledgedAt)}
                      {step.key === "IN_PROGRESS" && complaint.inProgressAt && formatDate(complaint.inProgressAt)}
                      {step.key === "RESOLVED" && complaint.resolvedAt && formatDate(complaint.resolvedAt)}
                      {step.key === "CLOSED" && complaint.closedAt && formatDate(complaint.closedAt)}
                      {step.key === "REJECTED" && complaint.rejectedAt && formatDate(complaint.rejectedAt)}
                    </motion.p>
                  )}

                  {/* Show resolution notes for resolved status */}
                  {step.key === "RESOLVED" && complaint.resolutionNotes && isCompleted && (
                    <motion.div
                      className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded text-xs"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <p className="text-green-800 dark:text-green-200">
                        <span className="font-semibold">Resolution: </span>
                        {complaint.resolutionNotes}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Animated connecting line for current step */}
                {isCurrent && index < stepsToShow.length - 1 && (
                  <motion.div
                    className="absolute left-4 top-8 w-0.5 bg-gradient-to-b from-primary to-transparent"
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Percentage */}
        {!isRejected && (
          <motion.div
            className="mt-6 pt-4 border-t border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {Math.round((currentIndex + 1) / statusSteps.length * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / statusSteps.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Rejection Notice */}
        {isRejected && complaint.resolutionNotes && (
          <motion.div
            className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-1">
                  Rejection Reason
                </h4>
                <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                  {complaint.resolutionNotes}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Helper function to format date
const formatDate = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};