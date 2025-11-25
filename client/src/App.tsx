import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home';
import Signup from './pages/public/Auth/Signup';
import Login from './pages/public/Auth/Login';
import Unauthorized from './pages/public/Unauthorized';
import NotFound from './pages/public/NotFound';
import ProtectedRoute from './Components/common/ProtectedRoute';
import AppLayout from './Components/layout/AppLayout';
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard';
import WardenDashboard from './pages/warden/DashBoard/WardenDashboard';
import StudentDashboard from './pages/student/Dashboard/StudentDashboard';
import Hostel from './pages/admin/Hostel/Hostel';
import AddStudent from './pages/admin/Students/AddStudent/AddStudent';
import AllStudents from './pages/admin/Students/AllStudentsDetails/AllStudents';
import Profile from './pages/Shared/Profile';
import { MyComplaints } from './pages/student/Complaints/MyComplaints';
import { ComplaintDetail } from './pages/Shared/StudentComplaintDetail';
import { AllComplaints } from './pages/admin/Complaints/AllComplaints';
import { AdminComplaintDetail } from './pages/Shared/AdminComplaintDetail';
import { ComplaintResolution } from './pages/admin/Complaints/ComplaintResolution';
import { ComplaintReports } from './pages/admin/Complaints/ComplaintReports';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Role-based Dashboard Routing */}
          <Route index element={<DashboardRedirect />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="warden"
            element={
              <ProtectedRoute allowedRoles={['WARDEN']}>
                <WardenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
        </Route>

        {/* Complaint Redirect Route */}
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <ComplaintRedirect />
            </ProtectedRoute>
          }
        />

        {/* Student Complaint Routes */}
        <Route
          path="/student/complaints"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MyComplaints />} />
          <Route path=":id" element={<ComplaintDetail />} />
        </Route>

        {/* Admin Complaint Routes - IMPORTANT: Specific routes BEFORE :id */}
        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WARDEN']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AllComplaints />} />
          {/* Specific routes MUST come before the dynamic :id route */}
          <Route path="resolution" element={<ComplaintResolution />} />
          <Route path="reports" element={<ComplaintReports />} />
          {/* Dynamic :id route MUST be last */}
          <Route path=":id" element={<AdminComplaintDetail />} />
        </Route>

        {/* Student Management Routes */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WARDEN']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AddStudent />} />
        </Route>
        <Route
          path="/allstudents"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WARDEN']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AllStudents />} />
        </Route>

        {/* Room Management Routes */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WARDEN']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Hostel />} />
        </Route>

        {/* 404 Not Found - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// Helper component to redirect to role-specific dashboard
const DashboardRedirect = () => {
  const userRole = localStorage.getItem('userRole');
  
  switch (userRole) {
    case 'ADMIN':
      return <Navigate to="/dashboard/admin" replace />;
    case 'WARDEN':
      return <Navigate to="/dashboard/warden" replace />;
    case 'STUDENT':
      return <Navigate to="/dashboard/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Helper component to redirect to role-specific complaint page
const ComplaintRedirect = () => {
  const userRole = localStorage.getItem('userRole');
  
  switch (userRole) {
    case 'STUDENT':
      return <Navigate to="/student/complaints" replace />;
    case 'ADMIN':
    case 'WARDEN':
      return <Navigate to="/admin/complaints" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;