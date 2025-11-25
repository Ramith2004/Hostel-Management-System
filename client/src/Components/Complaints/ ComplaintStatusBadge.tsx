import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, XCircle, Eye } from "lucide-react";

interface ComplaintStatusBadgeProps {
  status: "PENDING" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REJECTED";
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  PENDING: {
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    icon: Clock,
    label: "Pending",
  },
  ACKNOWLEDGED: {
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: Eye,
    label: "Acknowledged",
  },
  IN_PROGRESS: {
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    icon: AlertCircle,
    label: "In Progress",
  },
  RESOLVED: {
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    icon: CheckCircle,
    label: "Resolved",
  },
  CLOSED: {
    color: "text-teal-500",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
    icon: CheckCircle,
    label: "Closed",
  },
  REJECTED: {
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    icon: XCircle,
    label: "Rejected",
  },
};

export const ComplaintStatusBadge = ({ status, size = "md" }: ComplaintStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor} w-fit`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Icon className={`${config.color} ${sizeClasses[size]}`} />
      <span className={`${config.color} font-medium text-sm`}>{config.label}</span>
    </motion.div>
  );
};