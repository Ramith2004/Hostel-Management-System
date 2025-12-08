import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.ts';
import studentProfileRoutes from './routes/student-profile.route.ts';
import allocationRoutes from './routes/Admin/allocation.route.ts';
import dashboardRoutes from './routes/Admin/dashboard.route.ts';
import roomRoutes from './routes/Admin/Hostel/room.route.ts';
import studentsRoutes from './routes/Admin/student.route.ts';
import hostelRoutes from './routes/Admin/Hostel/mainhostel.route.ts';
import studentComplaintRoutes from './routes/Student/complaint.route.ts';
import profileRoutes from './routes/profile.route.ts';
import adminComplaintResolutionRoutes from "./routes/Admin/Hostel/complaintResolution.route.ts";
import paymentRoutes from './routes/Admin/Hostel/payment.route.ts';
import studentPaymentRoutes from './routes/Student/studentpayment.route.ts';
import adminPaymentRoutes from './routes/Admin/adminpaymentdashboard.route.ts';
import adminPaymentSettingsRoutes from './routes/Admin/Hostel/adminpaymentsetting.route.ts'; // ✅ Fee settings
import eventRoutes from "./routes/Admin/event.route.ts";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ FIXED: CORS Configuration - Enhanced with x-tenant-id header
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hostel-x.vercel.app',
    'https://hostel-management-system-n5o6mzg73-ramith-chatterjees-projects.vercel.app', // ✅ Add your Vercel/deployed frontend URL here
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/student-profile', studentProfileRoutes);
app.use('/api/admin/allocation', allocationRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/room', roomRoutes);
app.use('/api/admin/student', studentsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin/hostel', hostelRoutes);

// Event Routes
app.use('/api/admin/events', eventRoutes);

// Complaint Routes
app.use("/api/complaints/student", studentComplaintRoutes);
app.use("/api/complaints/admin", adminComplaintResolutionRoutes);

// Payment Routes
app.use('/api/admin/hostel/payments', paymentRoutes);
app.use('/api/student/payments', studentPaymentRoutes);

// ✅ FIXED: Register fee settings FIRST, then payment dashboard
// Fee Settings routes (specific routes)
app.use('/api/admin/payments/fee-settings', adminPaymentSettingsRoutes);

// Payment Dashboard routes (more general routes)
app.use('/api/admin/payments', adminPaymentRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Hospital Management API is running', status: 'healthy' });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.path} not found`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}`);
  console.log(`🌍 CORS enabled for:`, corsOptions.origin);
  console.log(`📋 Allowed headers:`, corsOptions.allowedHeaders);
});