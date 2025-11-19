import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route.ts';
import studentProfileRoutes from './routes/student-profile.route.ts';
import allocationRoutes from './routes/Admin/allocation.route.ts';
import dashboardRoutes from './routes/Admin/dashboard.route.ts';
import roomRoutes from './routes/Admin/Hostel/room.route.ts';
import studentsRoutes from './routes/Admin/student.route.ts';
import hostelRoutes from './routes/Admin/Hostel/mainhostel.route.ts';
import studentComplaintRoutes from './routes/Admin/Hostel/mainstudent.route.ts';
import profileRoutes from './routes/profile.route.ts';
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.headers['content-type'] = 'application/json';
  }
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

// Hostel Management Routes
app.use('/api/admin/hostel', hostelRoutes);

// Student Routes (Complaints, etc.)
app.use('/api/student', studentComplaintRoutes);
// Sample route
app.get('/', (req, res) => {
  res.send('Hospital Management API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});