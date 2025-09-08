import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Card, Button, Modal } from '../../components';
import {
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Mock data
  const notifications = [
    {
      id: 1,
      title: "New Doctor Registration",
      message: "Dr. Sarah Johnson has submitted verification documents",
      time: "2 minutes ago",
      type: "info",
      unread: true
    },
    {
      id: 2,
      title: "System Maintenance",
      message: "Scheduled maintenance tonight at 2:00 AM",
      time: "1 hour ago",
      type: "warning",
      unread: true
    },
    {
      id: 3,
      title: "User Report",
      message: "Weekly user activity report is ready",
      time: "3 hours ago",
      type: "success",
      unread: false
    }
  ];

  const recentUsers = [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      type: "Patient",
      status: "Active",
      registeredDate: "2024-01-15",
      lastLogin: "2 hours ago",
      avatar: "👨‍💼"
    },
    {
      id: 2,
      name: "Dr. Sarah Wilson",
      email: "sarah@example.com",
      type: "Doctor",
      status: "Pending",
      registeredDate: "2024-01-14",
      lastLogin: "1 day ago",
      avatar: "👩‍⚕️"
    }
  ];

  const pendingDoctors = [
    {
      id: 1,
      name: "Dr. Michael Chen",
      email: "michael@example.com",
      specialization: "Cardiology",
      license: "MD12345",
      experience: "10 years",
      status: "Pending Review",
      submittedDate: "2024-01-15",
      documents: ["License", "Degree", "Experience"],
      avatar: "👨‍⚕️"
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: HomeIcon, gradient: 'from-blue-500 to-purple-600' },
    { id: 'users', label: 'Users', icon: UsersIcon, gradient: 'from-green-500 to-teal-600' },
    { id: 'doctors', label: 'Doctors', icon: UserPlusIcon, gradient: 'from-purple-500 to-pink-600' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDaysIcon, gradient: 'from-orange-500 to-red-600' },
    { id: 'departments', label: 'Departments', icon: BuildingOfficeIcon, gradient: 'from-indigo-500 to-blue-600' },
    { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon, gradient: 'from-teal-500 to-cyan-600' }
  ];

  // Effects
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Mock authentication
    setTimeout(() => {
      setUser({
        name: "Admin User",
        email: "admin@healthcareplus.com",
        role: "Administrator",
        avatar: "👨‍💼"
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  // Event handlers
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
        navigate('/auth/signin');
      }
    });
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const viewDoctorVerification = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorVerificationModal(true);
  };

  const blockUser = (userId) => {
    toast.success('User status updated successfully!');
    setShowUserModal(false);
  };

  const approveDoctor = (doctorId) => {
    toast.success('Doctor approved successfully!');
    setShowDoctorVerificationModal(false);
  };

  const rejectDoctor = (doctorId) => {
    toast.error('Doctor verification rejected');
    setShowDoctorVerificationModal(false);
  };

  const sendNotification = () => {
    if (notificationText.trim()) {
      toast.success('Notification sent to all users!');
      setNotificationText('');
      setShowNotificationModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.name}! 👨‍💼
                </h2>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
                  System administration overview • {currentTime.toLocaleDateString()}
                </p>
                <div className="text-sm text-purple-200 mt-2">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
              <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -left-4 -bottom-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-white/5 rounded-full blur-2xl" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">2,547</div>
                  <div className="text-blue-100 text-xs sm:text-sm">Total Users</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    +12% this month
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <UserPlusIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">156</div>
                  <div className="text-emerald-100 text-xs sm:text-sm">Active Doctors</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    +8% this month
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <CalendarDaysIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">1,234</div>
                  <div className="text-orange-100 text-xs sm:text-sm">Appointments</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    +15% this week
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <ChartBarIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">$45.2K</div>
                  <div className="text-purple-100 text-xs sm:text-sm">Revenue</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    +23% this month
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">👥</span>
                  Recent Users
                </h3>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.type} • {user.lastLogin}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewUserDetails(user)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                  <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">⚠️</span>
                  Pending Doctor Verifications
                </h3>
                <div className="space-y-4">
                  {pendingDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                          {doctor.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doctor.name}</p>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                        onClick={() => viewDoctorVerification(doctor)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
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
              <Button 
                onClick={() => setShowNotificationModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                📢 Send Notification
              </Button>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
              <p className="text-gray-600">User management interface will be implemented here.</p>
            </Card>
          </div>
        );

      case 'doctors':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">👩‍⚕️</span>
                Doctor Management
              </h2>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                ➕ Add Doctor
              </Button>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
              <p className="text-gray-600">Doctor management interface will be implemented here.</p>
            </Card>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">📅</span>
                Appointment Management
              </h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                📊 View Analytics
              </Button>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
              <p className="text-gray-600">Appointment management interface will be implemented here.</p>
            </Card>
          </div>
        );

      case 'departments':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">🏢</span>
                Department Management
              </h2>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                ➕ Add Department
              </Button>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
              <p className="text-gray-600">Department management interface will be implemented here.</p>
            </Card>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">📊</span>
                Reports & Analytics
              </h2>
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                📈 Generate Report
              </Button>
            </div>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
              <p className="text-gray-600">Reports and analytics interface will be implemented here.</p>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
              <p className="text-gray-600">Select a section from the sidebar.</p>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden mr-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">H+</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  HealthcarePlus
                </h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notifications.filter(n => n.unread).length}
                  </span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-200 ${notification.unread ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {(user?.name || 'A')[0]}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500">{user?.role}</div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
                      View Profile
                    </button>
                    
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-500" />
                      Settings
                    </button>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 
          bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50
          transform transition-transform duration-300 ease-in-out z-50 lg:z-30
          ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          overflow-y-auto
        `}>
          
          {/* Mobile close button */}
          {isMobile && (
            <div className="flex justify-end p-4 border-b border-gray-200">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          <nav className="p-4 flex flex-col h-full">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-xl text-left font-medium
                      transition-all duration-200 group relative overflow-hidden
                      ${activeTab === item.id
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <span className="font-medium text-sm">
                      {item.label}
                    </span>

                    {activeTab !== item.id && (
                      <div className="absolute inset-0 bg-gray-500/0 group-hover:bg-gray-500/5 rounded-xl transition-all duration-200" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Logout button */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={onLogout}
                className="w-full flex items-center px-4 py-3 rounded-xl text-left
                         text-red-600 hover:bg-red-50 hover:text-red-700
                         transition-all duration-200 group relative overflow-hidden"
              >
                <div className="p-2 rounded-lg mr-3 transition-all duration-200
                               bg-red-100 group-hover:bg-red-200">
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </div>
                
                <span className="font-medium text-sm">
                  Sign Out
                </span>

                <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 rounded-xl transition-all duration-200" />
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isMobile ? 'ml-0' : 'lg:ml-0'}
          min-h-screen bg-gradient-to-br from-gray-50/50 via-purple-50/30 to-indigo-50/50
        `}>
          <div className={`p-4 sm:p-6 lg:p-8 ${isMobile ? 'pb-20' : 'pb-4'}`}>
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40 lg:hidden">
          <div className="grid grid-cols-6 gap-1 px-2 py-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200
                    ${activeTab === item.id
                      ? `bg-gradient-to-t ${item.gradient} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
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
                <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">User Information</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">User Type</div>
                  <div className="font-medium text-blue-700">{selectedUser.type}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">Registration Date</div>
                  <div className="font-medium text-green-700">{selectedUser.registeredDate}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Account Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`font-medium ${selectedUser.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="font-medium">{selectedUser.lastLogin}</span>
                  </div>
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
              <Button variant="outline" onClick={() => setShowUserModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDoctorVerificationModal}
        onClose={() => setShowDoctorVerificationModal(false)}
        title="Doctor Verification Details"
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
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600">Medical License</div>
                  <div className="font-medium text-purple-700">{selectedDoctor.license}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Experience</div>
                  <div className="font-medium text-blue-700">{selectedDoctor.experience}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Verification Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="font-medium text-yellow-600">{selectedDoctor.status}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Submitted Date</span>
                    <span className="font-medium">{selectedDoctor.submittedDate}</span>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">Documents</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDoctor.documents.map((doc, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => approveDoctor(selectedDoctor.id)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                ✅ Approve Doctor
              </Button>
              <Button 
                onClick={() => rejectDoctor(selectedDoctor.id)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                ❌ Reject
              </Button>
              <Button variant="outline" onClick={() => setShowDoctorVerificationModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        title="Send System Notification"
        size="lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Send to</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>All Users</option>
              <option>All Doctors</option>
              <option>All Patients</option>
              <option>System Administrators</option>
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
