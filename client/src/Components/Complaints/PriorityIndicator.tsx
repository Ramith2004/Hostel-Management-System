import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface PriorityIndicatorProps {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  size?: "sm" | "md" | "lg";
}

const priorityConfig = {
  LOW: {
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: Info,
    label: "Low",
  },
  MEDIUM: {
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: AlertCircle,
    label: "Medium",
  },
  HIGH: {
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    icon: AlertTriangle,
    label: "High",
  },
  URGENT: {
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    icon: AlertTriangle,
    label: "Urgent",
  },
};

export const PriorityIndicator = ({ priority, size = "md" }: PriorityIndicatorProps) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgColor}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Icon className={`${config.color} ${sizeClasses[size]}`} />
      <span className={`${config.color} font-medium text-sm`}>{config.label}</span>
    </motion.div>
  );
};