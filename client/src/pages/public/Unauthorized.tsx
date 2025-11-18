import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-destructive/10 rounded-full mb-6"
        >
          <ShieldAlert size={48} className="text-destructive" />
        </motion.div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Go to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default Unauthorized;