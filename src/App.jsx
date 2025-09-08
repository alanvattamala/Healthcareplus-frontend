import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  Home,
  SignIn,
  SignUp,
  ForgotPassword,
  VerificationPending,
  PatientDashboard,
  DoctorDashboard,
  AdminDashboard
} from './pages';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/verification-pending" element={<VerificationPending />} />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verification-pending" element={<VerificationPending />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboards/patient" element={<PatientDashboard />} />
          <Route path="/dashboards/doctor" element={<DoctorDashboard />} />
          <Route path="/dashboards/admin" element={<AdminDashboard />} />
          
          {/* Legacy dashboard routes for backward compatibility */}
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
