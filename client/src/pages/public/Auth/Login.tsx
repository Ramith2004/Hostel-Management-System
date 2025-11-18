import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { API_ROUTES } from '../../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post(API_ROUTES.LOGIN, formData);
      setSuccess('Login successful! Redirecting to dashboard...');
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
if (response.data.user && response.data.user.role) {
  localStorage.setItem('userRole', response.data.user.role);
}
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(Array.isArray(errorMessage) ? errorMessage[0]?.message : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      {/* Background gradient elements */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl bg-primary"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl bg-accent"
        animate={{ y: [0, -50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Main card */}
      <motion.div
        className="w-full max-w-md z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Card container */}
        <motion.div
          className="rounded-3xl shadow-lg p-8 backdrop-blur-sm bg-card"
          style={{
            boxShadow: '0 20px 40px hsl(var(--shadow-color) / 0.2)',
          }}
          variants={itemVariants}
        >
          {/* Header */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <motion.h1
              className="text-4xl font-bold mb-2 text-primary"
            >
              Welcome Back
            </motion.h1>
            <p className="text-muted-foreground">
              Sign in to your account
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-4 p-4 rounded-xl border-l-4 bg-destructive/10 border-destructive text-destructive"
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              className="mb-4 p-4 rounded-xl border-l-4 bg-green-100 border-green-500 text-green-700"
              variants={messageVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-sm font-medium">{success}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              variants={itemVariants}
              whileHover="hover"
              whileTap="tap"
              className="w-full py-3 rounded-xl font-semibold text-lg transition-all disabled:opacity-60 bg-primary text-primary-foreground"
            >
              {loading ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Signup Link */}
          <motion.div className="text-center mt-6" variants={itemVariants}>
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <a
                href="/register"
                className="font-semibold transition-colors text-primary"
              >
                Create one
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}