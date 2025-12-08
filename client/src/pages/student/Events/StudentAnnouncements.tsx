import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Loader, AlertCircle, X, User, Clock } from 'lucide-react';
import { studentEventService, type Event } from '../../../lib/event.api';

const StudentAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Event | null>(null);
  const itemsPerPage = 6;

  // Fetch published announcements on component mount and page change
  useEffect(() => {
    fetchPublishedAnnouncements();
  }, [currentPage]);

  const fetchPublishedAnnouncements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await studentEventService.getPublishedEvents(currentPage, itemsPerPage);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleReadMore = (announcement: Event) => {
    setSelectedAnnouncement(announcement);
  };

  const handleCloseModal = () => {
    setSelectedAnnouncement(null);
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
      transition: { type: "spring" as any, damping: 20, stiffness: 300 },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-2">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with the latest hostel announcements</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcements List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-lg">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-96 bg-card border border-border rounded-2xl"
          >
            <Bell className="w-16 h-16 text-muted mb-4 opacity-50" />
            <p className="text-foreground font-medium text-lg mb-2">No announcements</p>
            <p className="text-muted-foreground">Check back soon for new announcements!</p>
          </motion.div>
        ) : (
          <>
            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalAnnouncements}</span> announcement{totalAnnouncements !== 1 ? 's' : ''} available
              </p>
            </motion.div>

            {/* Announcements Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 mb-8"
            >
              <AnimatePresence>
                {announcements.map((announcement) => (
                  <motion.div
                    key={announcement.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, y: 20 }}
                    className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 p-6"
                  >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="relative space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bell className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {announcement.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(announcement.eventDate)}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {announcement.description}
                      </p>

                      {/* Footer */}
                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {announcement.status}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.05, x: 2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReadMore(announcement)}
                          className="text-primary font-semibold text-sm hover:text-primary/80 transition-colors flex items-center gap-1"
                        >
                          Read More →
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="flex gap-2 flex-wrap justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 font-medium"
                  >
                    ← Previous
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground shadow-lg'
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
                    Next →
                  </motion.button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ✅ Announcement Detail Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl z-50"
            >
              {/* Header */}
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Announcement Details</h2>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    {selectedAnnouncement.title}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {selectedAnnouncement.status}
                  </span>
                </motion.div>

                {/* Meta Information */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Announcement Date</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatDate(selectedAnnouncement.eventDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Posted At</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatDateTime(selectedAnnouncement.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 col-span-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Posted By</p>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedAnnouncement.creator?.name || 'Admin'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="text-lg font-semibold text-foreground mb-3">Content</h4>
                  <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedAnnouncement.description}
                    </p>
                  </div>
                </motion.div>

                {/* Location Info */}
                {selectedAnnouncement.location && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-sm font-semibold text-foreground">
                      {selectedAnnouncement.location}
                    </p>
                  </motion.div>
                )}

                {/* Close Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-border"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCloseModal}
                    className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all font-semibold"
                  >
                    Close
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentAnnouncements;