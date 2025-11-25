import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Send, Loader } from "lucide-react";
import { studentComplaintAPI, adminComplaintAPI } from "../../lib/complaint.api";

interface Comment {
  id: string;
  comment: string;
  user: {
    name: string;
    role: string;
  };
  createdAt: string;
  isInternal?: boolean;
  commentType?: string;
}

interface ComplaintCommentSectionProps {
  tenantId: string;
  complaintId: string;
  comments: Comment[];
  userRole: "STUDENT" | "ADMIN" | "WARDEN";
  onCommentAdded: () => void;
}

export const ComplaintCommentSection = ({
  tenantId,
  complaintId,
  comments,
  userRole,
  onCommentAdded,
}: ComplaintCommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const api = userRole === "STUDENT" ? studentComplaintAPI : adminComplaintAPI;
      await api.addComment(tenantId, complaintId, {
        comment: newComment,
        isInternal,
        commentType: "COMMENT",
      });
      setNewComment("");
      setIsInternal(false);
      onCommentAdded();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setLoading(false);
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
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50">Comments</h3>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              className={`p-4 rounded-lg border ${
                comment.isInternal
                  ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">
                    {comment.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {comment.user.role}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
              {comment.isInternal && (
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  Internal Note
                </div>
              )}
              <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.comment}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Comment */}
      <motion.div
        className="border-t border-gray-200 dark:border-gray-700 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          />

          {userRole !== "STUDENT" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mark as internal note (not visible to student)
              </span>
            </label>
          )}

          <motion.button
            onClick={handleAddComment}
            disabled={!newComment.trim() || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post Comment
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};