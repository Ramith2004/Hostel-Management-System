import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Bell, Eye, EyeOff, Loader, Calendar } from 'lucide-react';
import AnnouncementForm from '../../../Components/Events/AnnouncementForm';
import { adminEventService, type Event } from '../../../lib/event.api';

const AnnouncementsList: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Event | undefined>(undefined);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const itemsPerPage = 10;

  // Fetch announcements on component mount and page change
  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminEventService.getEvents(currentPage, itemsPerPage);
      setAnnouncements(result.events);
      setTotalPages(result.pagination.pages);
      setTotalAnnouncements(result.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch announcements');
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedAnnouncement(undefined);
    setIsFormOpen(true);
  };

  const handleEditClick = (announcement: Event) => {
    setSelectedAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (selectedAnnouncement) {
        await adminEventService.updateEvent(selectedAnnouncement.id, data);
        setSuccessMessage('Announcement updated successfully!');
      } else {
        await adminEventService.createEvent(data);
        setSuccessMessage('Announcement posted successfully!');
      }
      
      // Reset to first page and refresh
      setCurrentPage(1);
      await fetchAnnouncements();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (announcementId: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        setIsSubmitting(true);
        await adminEventService.deleteEvent(announcementId);
        setSuccessMessage('Announcement deleted successfully!');
        setCurrentPage(1);
        await fetchAnnouncements();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        setError(err.message || 'Failed to delete announcement');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-muted', text: 'text-muted-foreground', icon: EyeOff },
      PUBLISHED: { bg: 'bg-primary/10', text: 'text-primary', icon: Eye },
      CANCELLED: { bg: 'bg-destructive/10', text: 'text-destructive', icon: null },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg}`}>
        {IconComponent && <IconComponent className="w-4 h-4" />}
        <span className={`text-xs font-semibold ${config.text}`}>{status}</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { damping: 20, stiffness: 300 },
    },
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-foreground">Announcements Management</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Post Announcement
          </motion.button>
        </div>
        <p className="text-muted-foreground">Create and manage announcements for students</p>
      </motion.div>

      {/* Success Alert */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm font-medium"
          >
            ✓ {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm font-medium"
          >
            ✕ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Announcements</p>
              <p className="text-3xl font-bold text-foreground">{totalAnnouncements}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Published</p>
              <p className="text-3xl font-bold text-foreground">
                {announcements.filter(a => a.status === 'PUBLISHED').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Drafts</p>
              <p className="text-3xl font-bold text-foreground">
                {announcements.filter(a => a.status === 'DRAFT').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <EyeOff className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Announcements Table/Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading announcements...</p>
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Bell className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
              <p className="text-foreground font-medium mb-2">No announcements posted yet</p>
              <p className="text-muted-foreground mb-6">Click "Post Announcement" to share your first announcement</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateClick}
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium"
              >
                Post Announcement
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Posted On</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Content</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {announcements.map((announcement, index) => (
                    <motion.tr
                      key={announcement.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{announcement.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(announcement.eventDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(announcement.status)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                          {announcement.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(announcement)}
                            disabled={isSubmitting}
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors disabled:opacity-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(announcement.id)}
                            disabled={isSubmitting}
                            className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {!isLoading && announcements.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages} ({totalAnnouncements} total announcements)
          </p>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 font-medium"
            >
              Previous
            </motion.button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                {page}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 font-medium"
            >
              Next
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Announcement Form Modal */}
      <AnnouncementForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAnnouncement(undefined);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedAnnouncement}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AnnouncementsList;