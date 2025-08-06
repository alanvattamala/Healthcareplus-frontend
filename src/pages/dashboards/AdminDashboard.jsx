import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Card, Button, Modal } from '../../components';
import { handleLogout, getCurrentUser, requireAuth } from '../../utils/auth';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDoctorVerificationModal, setShowDoctorVerificationModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [notificationText, setNotificationText] = useState('');

  // Check authentication on component mount
  useEffect(() => {
    requireAuth(navigate);
  }, [navigate]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const onLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be redirected to the login page and will need to sign in again.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Logout!',
      cancelButtonText: 'Cancel',
      backdrop: true,
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-semibold text-gray-900',
        content: 'text-gray-600',
        confirmButton: 'rounded-lg px-6 py-2 font-medium',
        cancelButton: 'rounded-lg px-6 py-2 font-medium'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogout(navigate);
      }
    });
  };

  const userData = getCurrentUser() || {};

  // Mock data for admin dashboard
  const systemStats = {
    totalUsers: 15420,
    activeDoctors: 234,
    appointmentsToday: 89,
    totalRevenue: 125680,
    pendingVerifications: 12,
    activeIssues: 7
  };

  const userList = [
    {
      id: 'U001',
      name: 'John Smith',
      email: 'john.smith@email.com',
      type: 'Patient',
      status: 'Active',
      registeredDate: '2025-01-15',
      lastLogin: '2025-08-03',
      avatar: '👨'
    },
    {
      id: 'U002',
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@hospital.com',
      type: 'Doctor',
      status: 'Active',
      registeredDate: '2025-02-20',
      lastLogin: '2025-08-04',
      avatar: '👩‍⚕️'
    },
    {
      id: 'U003',
      name: 'Michael Johnson',
      email: 'michael.j@email.com',
      type: 'Patient',
      status: 'Blocked',
      registeredDate: '2025-03-10',
      lastLogin: '2025-07-28',
      avatar: '👨'
    }
  ];

  const pendingDoctors = [
    {
      id: 'D001',
      name: 'Dr. Emily Davis',
      email: 'emily.davis@medical.com',
      specialization: 'Cardiology',
      license: 'MD12345',
      experience: '8 years',
      status: 'Pending',
      submittedDate: '2025-08-01',
      documents: ['License', 'Degree', 'Experience Certificate'],
      avatar: '👩‍⚕️'
    },
    {
      id: 'D002',
      name: 'Dr. Robert Brown',
      email: 'robert.brown@clinic.com',
      specialization: 'Neurology',
      license: 'MD67890',
      experience: '12 years',
      status: 'Pending',
      submittedDate: '2025-08-02',
      documents: ['License', 'Degree', 'Experience Certificate'],
      avatar: '👨‍⚕️'
    }
  ];

  const appointmentAnalytics = [
    { department: 'Cardiology', today: 15, thisWeek: 89, thisMonth: 356 },
    { department: 'Neurology', today: 12, thisWeek: 67, thisMonth: 289 },
    { department: 'Pediatrics', today: 18, thisWeek: 98, thisMonth: 412 },
    { department: 'Orthopedics', today: 10, thisWeek: 56, thisMonth: 234 },
    { department: 'Dermatology', today: 8, thisWeek: 45, thisMonth: 178 }
  ];

  const specializations = [
    { id: 1, name: 'Cardiology', doctorCount: 23, status: 'Active' },
    { id: 2, name: 'Neurology', doctorCount: 18, status: 'Active' },
    { id: 3, name: 'Pediatrics', doctorCount: 31, status: 'Active' },
    { id: 4, name: 'Orthopedics', doctorCount: 15, status: 'Active' },
    { id: 5, name: 'Dermatology', doctorCount: 12, status: 'Active' }
  ];

  const issuesAndFeedback = [
    {
      id: 'I001',
      type: 'Issue',
      title: 'Login problems on mobile app',
      user: 'John Doe',
      priority: 'High',
      status: 'Open',
      date: '2025-08-03',
      description: 'Users experiencing login failures on iOS app'
    },
    {
      id: 'F001',
      type: 'Feedback',
      title: 'Suggestion for appointment reminders',
      user: 'Jane Smith',
      priority: 'Medium',
      status: 'Under Review',
      date: '2025-08-02',
      description: 'Request for SMS reminders 1 hour before appointments'
    },
    {
      id: 'I002',
      type: 'Issue',
      title: 'Payment gateway timeout',
      user: 'Michael Brown',
      priority: 'Critical',
      status: 'In Progress',
      date: '2025-08-01',
      description: 'Payment processing taking too long causing timeouts'
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-blue-600' },
    { id: 'users', label: 'User Management', icon: '👥', gradient: 'from-green-500 to-green-600' },
    { id: 'doctors', label: 'Doctor Verification', icon: '👨‍⚕️', gradient: 'from-purple-500 to-purple-600' },
    { id: 'analytics', label: 'Appointment Analytics', icon: '📈', gradient: 'from-pink-500 to-rose-600' },
    { id: 'notifications', label: 'Notifications', icon: '📢', gradient: 'from-indigo-500 to-indigo-600' },
    { id: 'specializations', label: 'Specializations', icon: '🏥', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'issues', label: 'Issues & Feedback', icon: '🎫', gradient: 'from-cyan-500 to-cyan-600' },
    { id: 'reports', label: 'Reports', icon: '📋', gradient: 'from-orange-500 to-orange-600' },
    { id: 'settings', label: 'System Settings', icon: '⚙️', gradient: 'from-gray-500 to-gray-600' }
  ];

  const approveDoctor = (doctorId) => {
    Swal.fire({
      title: 'Success!',
      text: `Doctor ${doctorId} approved successfully!`,
      icon: 'success',
      confirmButtonColor: '#10B981',
      confirmButtonText: 'OK'
    });
    setShowDoctorVerificationModal(false);
  };

  const rejectDoctor = (doctorId) => {
    Swal.fire({
      title: 'Rejected',
      text: `Doctor ${doctorId} rejected.`,
      icon: 'info',
      confirmButtonColor: '#6B7280',
      confirmButtonText: 'OK'
    });
    setShowDoctorVerificationModal(false);
  };

  const blockUser = (userId) => {
    Swal.fire({
      title: 'User Blocked',
      text: `User ${userId} has been blocked.`,
      icon: 'warning',
      confirmButtonColor: '#EF4444',
      confirmButtonText: 'OK'
    });
    setShowUserModal(false);
  };

  const sendNotification = () => {
    if (notificationText.trim()) {
      Swal.fire({
        title: 'Notification Sent!',
        text: `Notification sent: ${notificationText}`,
        icon: 'success',
        confirmButtonColor: '#10B981',
        confirmButtonText: 'OK'
      });
      setNotificationText('');
      setShowNotificationModal(false);
    }
  };

  const generateReport = (type) => {
    Swal.fire({
      title: 'Generating Report',
      text: `Generating ${type} report...`,
      icon: 'info',
      confirmButtonColor: '#3B82F6',
      confirmButtonText: 'OK'
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                  Welcome, {userData.firstName || 'Admin'}! 🛡️
                </h2>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  System Administration Dashboard • {currentTime.toLocaleDateString()}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16"></div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{systemStats.totalUsers.toLocaleString()}</div>
                  <div className="text-blue-100 text-xs sm:text-sm">Total Users</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{systemStats.activeDoctors}</div>
                  <div className="text-emerald-100 text-xs sm:text-sm">Active Doctors</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{systemStats.appointmentsToday}</div>
                  <div className="text-purple-100 text-xs sm:text-sm">Today's Appointments</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">${systemStats.totalRevenue.toLocaleString()}</div>
                  <div className="text-orange-100 text-xs sm:text-sm">Total Revenue</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{systemStats.pendingVerifications}</div>
                  <div className="text-red-100 text-xs sm:text-sm">Pending Verifications</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">{systemStats.activeIssues}</div>
                  <div className="text-yellow-100 text-xs sm:text-sm">Active Issues</div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2 text-xl">⚡</span>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Button 
                      onClick={() => setActiveTab('doctors')}
                      className="flex flex-col items-center p-3 sm:p-4 h-auto bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-800 hover:text-purple-900 transition-all duration-300 transform hover:scale-105"
                      variant="outline"
                    >
                      <span className="text-xl sm:text-2xl mb-1 sm:mb-2">👨‍⚕️</span>
                      <span className="text-xs sm:text-sm font-medium text-center leading-tight">Verify Doctors</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('users')}
                      className="flex flex-col items-center p-3 sm:p-4 h-auto bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 text-green-800 hover:text-green-900 transition-all duration-300 transform hover:scale-105"
                      variant="outline"
                    >
                      <span className="text-xl sm:text-2xl mb-1 sm:mb-2">👥</span>
                      <span className="text-xs sm:text-sm font-medium text-center leading-tight">Manage Users</span>
                    </Button>
                    <Button 
                      onClick={() => setShowNotificationModal(true)}
                      className="flex flex-col items-center p-3 sm:p-4 h-auto bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-800 hover:text-blue-900 transition-all duration-300 transform hover:scale-105"
                      variant="outline"
                    >
                      <span className="text-xl sm:text-2xl mb-1 sm:mb-2">📢</span>
                      <span className="text-xs sm:text-sm font-medium text-center leading-tight">Send Alert</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('reports')}
                      className="flex flex-col items-center p-3 sm:p-4 h-auto bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 text-orange-800 hover:text-orange-900 transition-all duration-300 transform hover:scale-105"
                      variant="outline"
                    >
                      <span className="text-xl sm:text-2xl mb-1 sm:mb-2">📋</span>
                      <span className="text-xs sm:text-sm font-medium text-center leading-tight">Generate Reports</span>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2 text-xl">🕐</span>
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600">✅</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Dr. Sarah Wilson verified</div>
                        <div className="text-xs text-gray-500">2 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600">👤</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">New user registration: John Smith</div>
                        <div className="text-xs text-gray-500">15 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <span className="text-red-600">🚫</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">User Michael Johnson blocked</div>
                        <div className="text-xs text-gray-500">1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">👥</span>
                User Management
              </h2>
              <div className="flex space-x-2">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-sm">
                  <span className="mr-2">📊</span>
                  Export Users
                </Button>
              </div>
            </div>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                                {user.avatar}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                              user.type === 'Doctor' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.type}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                              user.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">{user.lastLogin}</td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => blockUser(user.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                {user.status === 'Active' ? 'Block' : 'Unblock'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'doctors':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">👨‍⚕️</span>
                Doctor Verification
              </h2>
              <div className="text-sm text-gray-500">
                {pendingDoctors.length} pending verifications
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingDoctors.map((doctor) => (
                <Card key={doctor.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl">
                        {doctor.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{doctor.name}</h3>
                        <p className="text-gray-600">{doctor.specialization}</p>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                      </div>
                      <span className="inline-flex px-3 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-700">
                        {doctor.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500">License</div>
                          <div className="font-medium">{doctor.license}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500">Experience</div>
                          <div className="font-medium">{doctor.experience}</div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-600">Documents Submitted</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doctor.documents.map((doc, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setShowDoctorVerificationModal(true);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        Review Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">📈</span>
                Appointment Analytics
              </h2>
            </div>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Department-wise Appointments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Today</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">This Week</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">This Month</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentAnalytics.map((dept) => (
                        <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">{dept.department}</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium">
                              {dept.today}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{dept.thisWeek}</td>
                          <td className="py-4 px-4 text-gray-600">{dept.thisMonth}</td>
                          <td className="py-4 px-4">
                            <span className="text-green-600">↗️ +12%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">📢</span>
                Broadcast Notifications
              </h2>
              <Button 
                onClick={() => setShowNotificationModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <span className="mr-2">📢</span>
                Send Notification
              </Button>
            </div>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">System Maintenance Alert</h4>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                    <p className="text-gray-600 text-sm">Scheduled maintenance on August 5th from 2:00 AM to 4:00 AM</p>
                    <div className="mt-2">
                      <span className="inline-flex px-2 py-1 text-xs rounded bg-green-100 text-green-700">Sent to All Users</span>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">New Feature Announcement</h4>
                      <span className="text-xs text-gray-500">1 day ago</span>
                    </div>
                    <p className="text-gray-600 text-sm">Introducing AI-powered symptom checker for better diagnosis</p>
                    <div className="mt-2">
                      <span className="inline-flex px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">Sent to Doctors</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'specializations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">🏥</span>
                Manage Specializations
              </h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <span className="mr-2">➕</span>
                Add Specialization
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specializations.map((spec) => (
                <Card key={spec.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-900">{spec.name}</h3>
                      <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                        spec.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {spec.status}
                      </span>
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600">{spec.doctorCount}</div>
                      <div className="text-sm text-gray-500">Active Doctors</div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        Disable
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'issues':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">🎫</span>
                Issues & Feedback
              </h2>
            </div>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <div className="space-y-4">
                  {issuesAndFeedback.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                            item.type === 'Issue' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.type}
                          </span>
                          <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                            item.priority === 'Critical' ? 'bg-red-200 text-red-800' :
                            item.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">By: {item.user}</span>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs rounded ${
                            item.status === 'Open' ? 'bg-red-100 text-red-700' :
                            item.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
                            Respond
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">📋</span>
                Reports Generation
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Daily Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Users, appointments, and revenue for today</p>
                  <Button 
                    onClick={() => generateReport('Daily')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Generate CSV
                  </Button>
                </div>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">📈</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Weekly Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Comprehensive weekly analytics and trends</p>
                  <Button 
                    onClick={() => generateReport('Weekly')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    Generate CSV
                  </Button>
                </div>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">Monthly Report</h3>
                  <p className="text-gray-600 text-sm mb-4">Complete monthly performance summary</p>
                  <Button 
                    onClick={() => generateReport('Monthly')}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    Generate CSV
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Feature Coming Soon</h3>
              <p className="text-gray-600">This feature is under development and will be available soon.</p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden mr-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  HealthcarePlus - Admin Panel
                </h1>
                <p className="text-sm text-gray-500 font-medium">System Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </div>
                <div className="text-xs text-gray-500">Super Administrator</div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-sm sm:text-lg">
                  {(userData.firstName || 'A')[0]}
                </span>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
              >
                <span className="mr-2">🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl h-[calc(100vh-4rem)] border-r border-gray-200 z-50 
                         overflow-y-auto transition-transform duration-300 ease-in-out
                         lg:translate-x-0 lg:z-30 lg:sticky lg:top-16 ${
                           isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                         }`}>
          <nav className="p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false); // Close mobile menu when item is selected
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105 group ${
                    activeTab === item.id
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <span className={`text-xl transition-transform duration-300 ${
                    activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
                  }`}>{item.icon}</span>
                  <span className={`text-sm font-medium ${
                    activeTab === item.id ? 'font-semibold' : ''
                  }`}>{item.label}</span>
                  {activeTab === item.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 min-h-screen lg:ml-0">
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
                {selectedUser.avatar}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-500">User ID: {selectedUser.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Account Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Account Type</div>
                  <div className="font-medium text-gray-700">{selectedUser.type}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-medium text-gray-700">{selectedUser.status}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Activity</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Registration Date</div>
                  <div className="font-medium text-blue-700">{selectedUser.registeredDate}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">Last Login</div>
                  <div className="font-medium text-green-700">{selectedUser.lastLogin}</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => blockUser(selectedUser.id)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                {selectedUser.status === 'Active' ? '🚫 Block User' : '✅ Unblock User'}
              </Button>
              <Button variant="outline">📧 Send Message</Button>
              <Button variant="outline" onClick={() => setShowUserModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Doctor Verification Modal */}
      <Modal
        isOpen={showDoctorVerificationModal}
        onClose={() => setShowDoctorVerificationModal(false)}
        title="Doctor Verification"
        size="lg"
      >
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl">
                {selectedDoctor.avatar}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                <p className="text-gray-600">{selectedDoctor.specialization}</p>
                <p className="text-sm text-gray-500">{selectedDoctor.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Professional Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Medical License</div>
                  <div className="font-medium text-gray-700">{selectedDoctor.license}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Experience</div>
                  <div className="font-medium text-gray-700">{selectedDoctor.experience}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Application Details</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Submitted Date</div>
                  <div className="font-medium text-blue-700">{selectedDoctor.submittedDate}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600">Status</div>
                  <div className="font-medium text-yellow-700">{selectedDoctor.status}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Documents Submitted</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDoctor.documents.map((doc, index) => (
                  <span key={index} className="inline-flex px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                    ✓ {doc}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => approveDoctor(selectedDoctor.id)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                ✅ Approve Doctor
              </Button>
              <Button 
                onClick={() => rejectDoctor(selectedDoctor.id)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                ❌ Reject Application
              </Button>
              <Button variant="outline" onClick={() => setShowDoctorVerificationModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Notification Modal */}
      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title="Send Broadcast Notification"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Message</label>
            <textarea
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter your notification message..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>All Users</option>
              <option>Doctors Only</option>
              <option>Patients Only</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={sendNotification}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              📢 Send Notification
            </Button>
            <Button variant="outline" onClick={() => setShowNotificationModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default AdminDashboard;
