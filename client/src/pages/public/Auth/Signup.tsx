import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { API_ROUTES } from '../../../lib/api';

export default function Signup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const [tenantId, setTenantId] = useState('');

  // Step 1: Organization Details
  const [orgData, setOrgData] = useState({
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Step 2: Personal Details
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  // Step 1: Validate and move to Step 2
  const handleStep1Next = () => {
    if (!orgData.organizationName || !orgData.organizationType || !orgData.address) {
      setError('Please fill in all required fields');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2: Register user and complete onboarding
  const handleStep2Next = async () => {
    if (!personalData.name || !personalData.email || !personalData.phone || !personalData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (personalData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    await submitRegistration();
  };

  const submitRegistration = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.post(API_ROUTES.REGISTER, {
        name: personalData.name,
        email: personalData.email,
        phone: personalData.phone,
        password: personalData.password,
      });

      if (response.data.token) {
        setToken(response.data.token);
        setTenantId(response.data.tenant.id);

        // Complete onboarding with organization data
        await completeOnboarding(response.data.token);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(Array.isArray(errorMessage) ? errorMessage[0]?.message : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (authToken: string) => {
    try {
      await api.post(
        API_ROUTES.ONBOARD_COMPLETE,
        {
          organizationData: {
            organizationName: orgData.organizationName,
            organizationType: orgData.organizationType,
            registrationNumber: orgData.registrationNumber,
            address: orgData.address,
            city: orgData.city,
            state: orgData.state,
            postalCode: orgData.postalCode,
            country: orgData.country,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      setSuccess('Registration completed successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Onboarding failed. Please try again.';
      setError(Array.isArray(errorMessage) ? errorMessage[0]?.message : errorMessage);
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

  const messageVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
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
        className="w-full max-w-2xl z-10"
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
            <motion.h1 className="text-4xl font-bold mb-2 text-primary">
              Create Account
            </motion.h1>
            <p className="text-muted-foreground">
              Step {currentStep} of 2: {currentStep === 1 ? 'Organization Details' : 'Personal Details'}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="flex gap-2">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    step <= currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
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

          {/* Step 1: Organization Details */}
          {currentStep === 1 && (
            <motion.form
              className="space-y-5"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  placeholder="Your Organization Name"
                  value={orgData.organizationName}
                  onChange={handleOrgChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Organization Type *
                </label>
                <select
                  name="organizationType"
                  value={orgData.organizationType}
                  onChange={handleOrgChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Type</option>
                  <option value="BOYS">Boys Hostel</option>
                  <option value="GIRLS">Girls Hostel</option>
                  <option value="CO">Co-Education</option>
                  <option value="DORM">Dormatory</option>
                </select>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="Your Registration Number"
                  value={orgData.registrationNumber}
                  onChange={handleOrgChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={orgData.address}
                  onChange={handleOrgChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={orgData.city}
                    onChange={handleOrgChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={orgData.state}
                    onChange={handleOrgChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={orgData.postalCode}
                    onChange={handleOrgChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-2 text-foreground">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={orgData.country}
                    onChange={handleOrgChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </motion.div>
              </div>

              <motion.button
                type="button"
                onClick={handleStep1Next}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-full py-3 rounded-xl font-semibold text-lg transition-all bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next: Personal Details
              </motion.button>

              <motion.div className="text-center" variants={itemVariants}>
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <a href="/login" className="font-semibold transition-colors text-primary hover:text-primary/80">
                    Sign In
                  </a>
                </p>
              </motion.div>
            </motion.form>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <motion.form
              className="space-y-5"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={personalData.name}
                  onChange={handlePersonalChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={personalData.email}
                  onChange={handlePersonalChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={personalData.phone}
                  onChange={handlePersonalChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={personalData.password}
                  onChange={handlePersonalChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-input text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs mt-1 text-muted-foreground">
                  Minimum 8 characters required
                </p>
              </motion.div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 py-3 rounded-xl font-semibold text-lg transition-all border-2 border-border text-foreground hover:bg-muted"
                >
                  Back
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleStep2Next}
                  disabled={loading}
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="flex-1 py-3 rounded-xl font-semibold text-lg transition-all disabled:opacity-60 bg-primary text-primary-foreground hover:bg-primary/90"
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
                    'Complete Registration'
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}