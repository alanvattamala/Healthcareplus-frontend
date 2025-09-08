import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Card, Button, Modal } from '../../components';
import { requireRole, checkAuthAndRedirect } from '../../utils/auth';
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
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  NoSymbolIcon,
  DocumentCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  IdentificationIcon,
  AcademicCapIcon,
  BanknotesIcon,
  BeakerIcon,
  PencilIcon,
  TrashIcon,
  PowerIcon
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
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    verifiedDoctors: 0,
    pendingDoctors: 0
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [filterVerificationStatus, setFilterVerificationStatus] = useState('');
  const [filterActiveStatus, setFilterActiveStatus] = useState('');
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
    // Check authentication and role on component mount
    const checkAuth = async () => {
      try {
        // Check if user is authenticated and has admin role
        const userData = checkAuthAndRedirect(navigate);
        
        if (!userData) {
          setIsLoading(false);
          return;
        }

        // Verify user has admin role
        if (!requireRole(navigate, 'admin')) {
          setIsLoading(false);
          return;
        }

        // For demo purposes, create mock admin data if none exists or if role is missing
        let adminData = userData;
        if (!adminData.role || adminData.role !== 'admin') {
          adminData = {
            ...userData,
            id: 'admin-001',
            name: 'Admin User',
            email: 'admin@healthcareplus.com',
            role: 'admin',
            avatar: '👨‍💼'
          };
          
          // Update localStorage with role
          localStorage.setItem('user', JSON.stringify(adminData));
          localStorage.setItem('token', 'demo-admin-token-123');
        }
        
        setUser(adminData);
        setIsLoading(false);
        
        // Fetch pending doctors after authentication
        fetchPendingDoctors();
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate('/auth/signin');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch users and stats when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers();
      fetchUserStats();
    }
  }, [activeTab, filterUserType, filterVerificationStatus, filterActiveStatus]);

  // Handle pagination
  useEffect(() => {
    if (activeTab === 'users') {
      fetchAllUsers(currentPage);
    }
  }, [currentPage]);

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

  // Function to fetch pending doctors from API
  const fetchPendingDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/pending-doctors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingDoctors(data.data.doctors);
      } else {
        console.error('Failed to fetch pending doctors');
        // Set empty array on error to avoid UI issues
        setPendingDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
      setPendingDoctors([]);
    }
  };

  // Fetch all users
  const fetchAllUsers = async (page = 1, limit = 10) => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (filterUserType) params.append('userType', filterUserType);
      if (filterVerificationStatus) params.append('verificationStatus', filterVerificationStatus);
      if (filterActiveStatus) params.append('active', filterActiveStatus);

      const response = await fetch(`http://localhost:3001/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.data.users || []);
        setCurrentPage(data.data.currentPage || 1);
        setTotalPages(data.data.totalPages || 1);
      } else {
        console.error('Failed to fetch users');
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data.stats || {});
      } else {
        console.error('Failed to fetch user stats');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const viewDoctorVerification = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorVerificationModal(true);
  };

  const blockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const user = allUsers.find(u => u._id === userId);
      const newStatus = user?.isActive !== false ? false : true;
      
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          isActive: newStatus
        }),
      });

      if (response.ok) {
        toast.success(`User ${newStatus ? 'activated' : 'blocked'} successfully!`);
        setShowUserModal(false);
        // Refresh the users list
        fetchAllUsers(currentPage);
        // Update the selected user for the modal
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, isActive: newStatus });
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const editUser = (user) => {
    // Open user details modal for editing
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const deleteUser = async (userId) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone. The user will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete User!',
      cancelButtonText: 'Cancel',
      backdrop: true,
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-semibold text-gray-900',
        htmlContainer: 'text-gray-600',
        confirmButton: 'rounded-lg px-6 py-3 font-medium',
        cancelButton: 'rounded-lg px-6 py-3 font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          toast.success('User deleted successfully!');
          // Refresh the users list
          fetchAllUsers(currentPage);
          fetchUserStats(); // Update stats
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Network error. Please try again.');
      }
    }
  };

  const toggleUserStatus = async (userId) => {
    const user = allUsers.find(u => u._id === userId);
    const newStatus = user?.isActive !== false ? false : true;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          isActive: newStatus
        }),
      });

      if (response.ok) {
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        // Refresh the users list
        fetchAllUsers(currentPage);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const approveDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/verify-doctor/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'verified'
        }),
      });

      if (response.ok) {
        toast.success('Doctor approved successfully!');
        setShowDoctorVerificationModal(false);
        // Refresh the pending doctors list
        fetchPendingDoctors();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to approve doctor');
      }
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const rejectDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/verify-doctor/${doctorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'rejected'
        }),
      });

      if (response.ok) {
        toast.success('Doctor verification rejected');
        setShowDoctorVerificationModal(false);
        // Refresh the pending doctors list
        fetchPendingDoctors();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to reject doctor');
      }
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      toast.error('Network error. Please try again.');
    }
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
                    <div key={doctor._id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                          👨‍⚕️
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{`${doctor.firstName} ${doctor.lastName}`}</p>
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
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <UserGroupIcon className="mr-2 sm:mr-3 w-8 h-8 text-purple-600" />
                User Management
              </h2>
              <Button 
                onClick={() => setShowNotificationModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <BellIcon className="w-5 h-5 mr-2" />
                Send Notification
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold">{userStats.totalUsers || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-400/30 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Patients</p>
                    <p className="text-3xl font-bold">{userStats.totalPatients || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-400/30 rounded-full flex items-center justify-center">
                    <HeartIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Doctors</p>
                    <p className="text-3xl font-bold">{userStats.totalDoctors || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-400/30 rounded-full flex items-center justify-center">
                    <BeakerIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Verified Doctors</p>
                    <p className="text-3xl font-bold">{userStats.verifiedDoctors || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-400/30 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={filterUserType}
                      onChange={(e) => setFilterUserType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All User Types</option>
                      <option value="patient">Patients</option>
                      <option value="doctor">Doctors</option>
                      <option value="admin">Admins</option>
                    </select>

                    <select
                      value={filterVerificationStatus}
                      onChange={(e) => setFilterVerificationStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Verification</option>
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <select
                      value={filterActiveStatus}
                      onChange={(e) => setFilterActiveStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 lg:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Button 
                    onClick={() => fetchAllUsers(1)}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 px-6"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </Card>

            {/* Users Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {allUsers.length} users on page {currentPage} of {totalPages}
                </p>
              </div>

              {usersLoading ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              ) : allUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                                  {user.userType === 'doctor' ? (
                                    <BeakerIcon className="w-6 h-6" />
                                  ) : user.userType === 'admin' ? (
                                    <IdentificationIcon className="w-6 h-6" />
                                  ) : (
                                    <UserIcon className="w-6 h-6" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.userType === 'doctor' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.userType === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.verificationStatus === 'verified' || user.isEmailVerified === true
                                  ? 'bg-green-100 text-green-800'
                                  : user.verificationStatus === 'pending' || user.isEmailVerified === false
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : user.verificationStatus === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <div className={`mr-1.5 h-2 w-2 rounded-full ${
                                  user.verificationStatus === 'verified' || user.isEmailVerified === true
                                    ? 'bg-green-400'
                                    : user.verificationStatus === 'pending' || user.isEmailVerified === false
                                    ? 'bg-yellow-400'
                                    : user.verificationStatus === 'rejected'
                                    ? 'bg-red-400'
                                    : 'bg-gray-400'
                                }`} />
                                {user.verificationStatus === 'verified' || user.isEmailVerified === true
                                  ? 'Verified'
                                  : user.verificationStatus === 'pending' || user.isEmailVerified === false
                                  ? 'Pending'
                                  : user.verificationStatus === 'rejected'
                                  ? 'Rejected'
                                  : 'N/A'
                                }
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.isActive !== false 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                <div className={`mr-1.5 h-2 w-2 rounded-full ${
                                  user.isActive !== false 
                                    ? 'bg-green-400'
                                    : 'bg-red-400'
                                }`} />
                                {user.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.specialization || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {/* Activate/Deactivate Button */}
                                <Button
                                  size="sm"
                                  onClick={() => toggleUserStatus(user._id)}
                                  className={`${
                                    user.isActive !== false
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                                  } border`}
                                >
                                  {user.isActive !== false ? (
                                    <NoSymbolIcon className="w-4 h-4 mr-1" />
                                  ) : (
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                  )}
                                  {user.isActive !== false ? 'Deactivate' : 'Activate'}
                                </Button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => editUser(user)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-colors"
                                  title="Edit User"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>

                                {/* Delete Button - Only show for non-admin users */}
                                {user.userType !== 'admin' && (
                                  <button
                                    onClick={() => deleteUser(user._id)}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-colors"
                                    title="Delete User"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden divide-y divide-gray-200">
                    {allUsers.map((user) => (
                      <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                            {user.userType === 'doctor' ? (
                              <BeakerIcon className="w-7 h-7" />
                            ) : user.userType === 'admin' ? (
                              <IdentificationIcon className="w-7 h-7" />
                            ) : (
                              <UserIcon className="w-7 h-7" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                              </h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.userType === 'doctor' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : user.userType === 'admin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex space-x-2">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  user.verificationStatus === 'verified' || user.isEmailVerified === true
                                    ? 'bg-green-100 text-green-800'
                                    : user.verificationStatus === 'pending' || user.isEmailVerified === false
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : user.verificationStatus === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  <div className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                    user.verificationStatus === 'verified' || user.isEmailVerified === true
                                      ? 'bg-green-400'
                                      : user.verificationStatus === 'pending' || user.isEmailVerified === false
                                      ? 'bg-yellow-400'
                                      : user.verificationStatus === 'rejected'
                                      ? 'bg-red-400'
                                      : 'bg-gray-400'
                                  }`} />
                                  {user.verificationStatus === 'verified' || user.isEmailVerified === true
                                    ? 'Verified'
                                    : user.verificationStatus === 'pending' || user.isEmailVerified === false
                                    ? 'Pending'
                                    : user.verificationStatus === 'rejected'
                                    ? 'Rejected'
                                    : 'N/A'
                                  }
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  user.isActive !== false 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  <div className={`mr-1 h-1.5 w-1.5 rounded-full ${
                                    user.isActive !== false 
                                      ? 'bg-green-400'
                                      : 'bg-red-400'
                                  }`} />
                                  {user.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Action Buttons for Mobile */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {/* Activate/Deactivate Button */}
                              <Button
                                size="sm"
                                onClick={() => toggleUserStatus(user._id)}
                                className={`${
                                  user.isActive !== false
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-300'
                                } border`}
                              >
                                {user.isActive !== false ? (
                                  <NoSymbolIcon className="w-4 h-4 mr-1" />
                                ) : (
                                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                                )}
                                {user.isActive !== false ? 'Deactivate' : 'Activate'}
                              </Button>

                              {/* Edit Button */}
                              <button
                                onClick={() => editUser(user)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-colors"
                                title="Edit User"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>

                              {/* Delete Button - Only show for non-admin users */}
                              {user.userType !== 'admin' && (
                                <button
                                  onClick={() => deleteUser(user._id)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-colors"
                                  title="Delete User"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            {user.specialization && (
                              <p className="text-xs text-gray-500 mt-2">
                                Specialization: {user.specialization}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            ← Previous
                          </Button>
                          <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next →
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                          Total: {userStats.totalUsers || 0} users
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
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
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  {selectedUser.userType === 'doctor' ? (
                    <BeakerIcon className="w-12 h-12" />
                  ) : selectedUser.userType === 'admin' ? (
                    <IdentificationIcon className="w-12 h-12" />
                  ) : (
                    <UserIcon className="w-12 h-12" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900">{`${selectedUser.firstName} ${selectedUser.lastName}`}</h3>
                  <p className="text-xl text-blue-600 font-medium">{selectedUser.email}</p>
                  <p className="text-gray-600 mt-1">User ID: {selectedUser._id}</p>
                  <div className="mt-3 flex gap-2">
                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                      selectedUser.userType === 'doctor' 
                        ? 'bg-purple-100 text-purple-800'
                        : selectedUser.userType === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1)}
                    </span>
                    {selectedUser.verificationStatus && (
                      <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                        selectedUser.verificationStatus === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : selectedUser.verificationStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.verificationStatus.charAt(0).toUpperCase() + selectedUser.verificationStatus.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Full Name
                    </div>
                    <div className="text-lg font-semibold text-blue-800">{`${selectedUser.firstName} ${selectedUser.lastName}`}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      Email Address
                    </div>
                    <div className="font-medium text-green-800">{selectedUser.email}</div>
                  </div>
                  {selectedUser.phone && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600 font-medium flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        Phone Number
                      </div>
                      <div className="font-medium text-purple-800">{selectedUser.phone}</div>
                    </div>
                  )}
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Registration Date
                    </div>
                    <div className="font-medium text-orange-800">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Account Details</h4>
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-sm text-indigo-600 font-medium flex items-center">
                      <IdentificationIcon className="w-4 h-4 mr-2" />
                      User Type
                    </div>
                    <div className="text-lg font-bold text-indigo-800 capitalize">{selectedUser.userType}</div>
                  </div>
                  {selectedUser.verificationStatus && (
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <div className="text-sm text-teal-600 font-medium flex items-center">
                        <ShieldCheckIcon className="w-4 h-4 mr-2" />
                        Verification Status
                      </div>
                      <div className="font-medium text-teal-800 capitalize">{selectedUser.verificationStatus}</div>
                    </div>
                  )}
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="text-sm text-cyan-600 font-medium flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Account Status
                    </div>
                    <div className="font-medium text-cyan-800">{selectedUser.isActive !== false ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="text-sm text-pink-600 font-medium">Email Verified</div>
                    <div className="font-medium text-pink-800">{selectedUser.isEmailVerified ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information (for doctors) */}
            {selectedUser.userType === 'doctor' && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUser.specialization && (
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="text-sm text-emerald-600 font-medium flex items-center">
                        <BeakerIcon className="w-4 h-4 mr-2" />
                        Specialization
                      </div>
                      <div className="font-medium text-emerald-800">{selectedUser.specialization}</div>
                    </div>
                  )}
                  {selectedUser.medicalLicenseNumber && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-sm text-amber-600 font-medium flex items-center">
                        <DocumentCheckIcon className="w-4 h-4 mr-2" />
                        Medical License
                      </div>
                      <div className="font-medium text-amber-800 font-mono">{selectedUser.medicalLicenseNumber}</div>
                    </div>
                  )}
                  {selectedUser.experience && (
                    <div className="bg-rose-50 p-4 rounded-lg">
                      <div className="text-sm text-rose-600 font-medium flex items-center">
                        <AcademicCapIcon className="w-4 h-4 mr-2" />
                        Experience
                      </div>
                      <div className="font-medium text-rose-800">{selectedUser.experience}</div>
                    </div>
                  )}
                  {selectedUser.consultationFee && (
                    <div className="bg-violet-50 p-4 rounded-lg">
                      <div className="text-sm text-violet-600 font-medium flex items-center">
                        <BanknotesIcon className="w-4 h-4 mr-2" />
                        Consultation Fee
                      </div>
                      <div className="font-medium text-violet-800">${selectedUser.consultationFee}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Account Actions</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => blockUser(selectedUser._id)}
                  className={`flex-1 py-3 px-6 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 ${
                    selectedUser.isActive !== false 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  }`}
                >
                  <span className="flex items-center justify-center space-x-2">
                    {selectedUser.isActive !== false ? (
                      <NoSymbolIcon className="w-6 h-6" />
                    ) : (
                      <CheckCircleIcon className="w-6 h-6" />
                    )}
                    <span>{selectedUser.isActive !== false ? 'Block User' : 'Activate User'}</span>
                  </span>
                </Button>
                {selectedUser.userType === 'doctor' && selectedUser.verificationStatus === 'pending' && (
                  <Button 
                    onClick={() => viewDoctorVerification(selectedUser)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 px-6 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <EyeIcon className="w-6 h-6" />
                      <span>Review Verification</span>
                    </span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => setShowUserModal(false)}
                  className="py-3 px-6 text-lg border-2 border-gray-300 hover:border-gray-400"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDoctorVerificationModal}
        onClose={() => setShowDoctorVerificationModal(false)}
        title="Doctor Verification Review"
        size="xl"
      >
        {selectedDoctor && (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
                  👨‍⚕️
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900">{`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}</h3>
                  <p className="text-xl text-blue-600 font-medium">{selectedDoctor.specialization}</p>
                  <p className="text-gray-600 mt-1">{selectedDoctor.email}</p>
                  <div className="mt-3">
                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                      selectedDoctor.verificationStatus === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : selectedDoctor.verificationStatus === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Status: {selectedDoctor.verificationStatus.charAt(0).toUpperCase() + selectedDoctor.verificationStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h4>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Full Name</div>
                    <div className="text-lg font-semibold text-blue-800">{`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Email Address</div>
                    <div className="font-medium text-green-800">{selectedDoctor.email}</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Phone Number</div>
                    <div className="font-medium text-purple-800">{selectedDoctor.phone}</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Registration Date</div>
                    <div className="font-medium text-orange-800">{new Date(selectedDoctor.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Professional Details</h4>
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-sm text-indigo-600 font-medium">Medical License Number</div>
                    <div className="text-lg font-bold text-indigo-800 font-mono">{selectedDoctor.medicalLicenseNumber}</div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="text-sm text-teal-600 font-medium">Specialization</div>
                    <div className="font-medium text-teal-800">{selectedDoctor.specialization}</div>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <div className="text-sm text-cyan-600 font-medium">Years of Experience</div>
                    <div className="font-medium text-cyan-800">{selectedDoctor.experience}</div>
                  </div>
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="text-sm text-pink-600 font-medium">User Type</div>
                    <div className="font-medium text-pink-800 capitalize">{selectedDoctor.userType}</div>
                  </div>
                  {selectedDoctor.consultationFee && (
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="text-sm text-emerald-600 font-medium">Consultation Fee</div>
                      <div className="font-medium text-emerald-800">${selectedDoctor.consultationFee}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(selectedDoctor.otherSpecialization || selectedDoctor.verificationDocument) && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDoctor.otherSpecialization && (
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-sm text-amber-600 font-medium">Other Specialization</div>
                      <div className="font-medium text-amber-800">{selectedDoctor.otherSpecialization}</div>
                    </div>
                  )}
                  {selectedDoctor.verificationDocument && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 font-medium">Verification Documents</div>
                      <div className="font-medium text-gray-800">Uploaded</div>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline">
                        View Documents
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Actions */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Verification Actions</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => approveDoctor(selectedDoctor._id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  disabled={selectedDoctor.verificationStatus === 'verified'}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>✅</span>
                    <span>Approve Doctor</span>
                  </span>
                </Button>
                <Button 
                  onClick={() => rejectDoctor(selectedDoctor._id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  disabled={selectedDoctor.verificationStatus === 'rejected'}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>❌</span>
                    <span>Reject Application</span>
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDoctorVerificationModal(false)}
                  className="py-3 px-6 text-lg border-2 border-gray-300 hover:border-gray-400"
                >
                  Close
                </Button>
              </div>
              {selectedDoctor.verificationStatus !== 'pending' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 text-sm">
                    This doctor has already been {selectedDoctor.verificationStatus}. 
                    Actions are disabled to maintain data integrity.
                  </p>
                </div>
              )}
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
