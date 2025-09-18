import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Card, Button, Modal } from '../../components';
import { handleLogout, getCurrentUser, requireRole, checkAuthAndRedirect } from '../../utils/auth';
import {
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  HomeIcon,
  CalendarDaysIcon,
  UsersIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  ChartBarIcon,
  BeakerIcon,
  PowerIcon
} from '@heroicons/react/24/outline';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(false); // Default to offline
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [hasTimeExceeded, setHasTimeExceeded] = useState(false);
  const [showTimeInputs, setShowTimeInputs] = useState(false);
  const [hasSetAvailability, setHasSetAvailability] = useState(false);
  const [scheduleExpired, setScheduleExpired] = useState(false);
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false);
  const [showScheduleExpiredModal, setShowScheduleExpiredModal] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Availability management state
  const [doctorAvailability, setDoctorAvailability] = useState({
    isAvailable: false, // Default to unavailable
    dailySchedule: {
      date: new Date().toISOString().split('T')[0],
      isActive: false, // Default to inactive
      startTime: '00:00', // Default to 00:00
      endTime: '00:00'   // Default to 00:00
    },
    breakTime: {
      enabled: false,
      startTime: '12:00',
      endTime: '13:00'
    },
    specialNotes: ''
  });

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New Patient Registration',
      message: 'Sarah Johnson has registered and requested an appointment',
      time: '5 minutes ago',
      type: 'patient',
      unread: true
    },
    {
      id: 2,
      title: 'Appointment Reminder',
      message: 'Video consultation with Michael Chen in 30 minutes',
      time: '25 minutes ago',
      type: 'appointment',
      unread: true
    },
    {
      id: 3,
      title: 'Prescription Refill Request',
      message: 'Emily Davis requested refill for Lisinopril',
      time: '1 hour ago',
      type: 'prescription',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(notification => notification.unread).length;

  // Validation function for availability settings
  const validateAvailabilitySettings = (availability) => {
    const { startTime, endTime } = availability.dailySchedule;
    
    // Check if both times are set when going online
    if (availability.isAvailable && (!startTime || !endTime)) {
      Swal.fire({
        title: 'Invalid Time Settings',
        text: 'Please set both start time and end time to go online.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return false;
    }

    // Check if start time is before end time
    if (availability.isAvailable && startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      if (startMinutes >= endMinutes) {
        Swal.fire({
          title: 'Invalid Time Range',
          text: 'Start time must be before end time.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b'
        });
        return false;
      }

      // Check minimum availability duration (at least 30 minutes)
      if (endMinutes - startMinutes < 30) {
        Swal.fire({
          title: 'Minimum Duration Required',
          text: 'Availability duration must be at least 30 minutes.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b'
        });
        return false;
      }
    }

    return true;
  };

  // Helper function to get current time in HH:MM format for min attribute
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Function to check if current time has exceeded scheduled end time
  const checkScheduleExpiry = () => {
    if (!hasSetAvailability || !doctorAvailability.dailySchedule.endTime) {
      return false;
    }

    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const [endHour, endMinute] = doctorAvailability.dailySchedule.endTime.split(':').map(Number);
    const endTotalMinutes = endHour * 60 + endMinute;

    const isExpired = currentTotalMinutes > endTotalMinutes;
    
    // Update schedule expired state if it has expired and not already set
    if (isExpired && !scheduleExpired) {
      setScheduleExpired(true);
    }
    
    return isExpired;
  };

  // Function to handle schedule extension
  const handleScheduleExtension = () => {
    setShowScheduleExpiredModal(true);
    setShowExtensionPrompt(false);
  };

  // Function to handle extending schedule
  const handleExtendSchedule = () => {
    setShowScheduleExpiredModal(false);
    setShowExtensionPrompt(false);
    setActiveTab('availability');
  };

  // Function to handle going offline
  const handleGoOffline = async () => {
    const newAvailability = {
      ...doctorAvailability,
      isAvailable: false,
      dailySchedule: {
        ...doctorAvailability.dailySchedule,
        isActive: false
      }
    };
    
    setIsOnline(false);
    setDoctorAvailability(newAvailability);
    setScheduleExpired(true);
    setShowScheduleExpiredModal(false);
    
    // Save to database
    await saveAvailabilityToDatabase(newAvailability);
    
    // Show confirmation
    Swal.fire({
      title: 'Gone Offline',
      text: 'You are now offline. Patients cannot book new appointments.',
      icon: 'info',
      confirmButtonColor: '#6b7280',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Function to save availability to database
  const saveAvailabilityToDatabase = async (availability) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/api/users/doctor/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          availability: {
            ...availability,
            dailySchedule: {
              ...availability.dailySchedule,
              date: new Date().toISOString().split('T')[0] // Always use current date
            }
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        throw new Error(data.message || 'Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      return { success: false, error: error.message };
    }
  };

  // Enhanced function to handle going online with default times
  const handleGoOnline = async () => {
    const currentHour = new Date().getHours().toString().padStart(2, '0');
    const currentMinute = new Date().getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Set default end time to 8 hours from current time
    const endHour = (new Date().getHours() + 8) % 24;
    const defaultEndTime = `${endHour.toString().padStart(2, '0')}:${currentMinute}`;

    const newAvailability = {
      ...doctorAvailability,
      isAvailable: true,
      dailySchedule: {
        ...doctorAvailability.dailySchedule,
        isActive: true,
        startTime: currentTime,
        endTime: defaultEndTime
      }
    };

    // Validate before setting
    if (validateAvailabilitySettings(newAvailability)) {
      setDoctorAvailability(newAvailability);
      setIsOnline(true);
      
      // Save to database
      const saveResult = await saveAvailabilityToDatabase(newAvailability);
      
      if (saveResult.success) {
        Swal.fire({
          title: 'Online!',
          text: `You are now online from ${currentTime} to ${defaultEndTime}`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        // Show error but keep the UI updated
        Swal.fire({
          title: 'Warning',
          text: 'You are online locally, but failed to sync with server. Please check your connection.',
          icon: 'warning',
          confirmButtonColor: '#f59e0b'
        });
      }
    }
  };

  // Check authentication and role on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated and has doctor role
        const userData = checkAuthAndRedirect(navigate);
        
        if (!userData) {
          setIsLoading(false);
          return;
        }

        // Verify user has doctor role
        if (!requireRole(navigate, 'doctor')) {
          setIsLoading(false);
          return;
        }

        // Load doctor data from backend
        const token = localStorage.getItem('token');
        
        try {
          // Try to get fresh user data from backend
          const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const currentUser = data.data.user;
            
            setUser(currentUser);
            
            // Load doctor's availability if user has doctor role
            if (currentUser.userType === 'doctor') {
              try {
                const availabilityResponse = await fetch('http://localhost:3001/api/users/doctor/availability', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });

                if (availabilityResponse.ok) {
                  const availabilityData = await availabilityResponse.json();
                  if (availabilityData.data.availability) {
                    setDoctorAvailability(availabilityData.data.availability);
                    
                    // Check if doctor has previously set availability
                    const availability = availabilityData.data.availability;
                    const hasSchedule = availability.dailySchedule && 
                                       (availability.dailySchedule.startTime || 
                                        availability.dailySchedule.endTime ||
                                        availability.dailySchedule.breakStart ||
                                        availability.dailySchedule.breakEnd);
                    setHasSetAvailability(!!hasSchedule);
                    
                    // Check if the schedule has already expired
                    if (hasSchedule && availability.dailySchedule.endTime) {
                      const currentTime = new Date();
                      const currentHours = currentTime.getHours();
                      const currentMinutes = currentTime.getMinutes();
                      const currentTotalMinutes = currentHours * 60 + currentMinutes;

                      const [endHour, endMinute] = availability.dailySchedule.endTime.split(':').map(Number);
                      const endTotalMinutes = endHour * 60 + endMinute;

                      if (currentTotalMinutes > endTotalMinutes) {
                        setScheduleExpired(true);
                        // If the schedule is expired, set the doctor as offline
                        setIsOnline(false);
                      } else {
                        // If within schedule time and isAvailable, set online
                        setIsOnline(availability.isAvailable && availability.dailySchedule.isActive);
                      }
                    }
                  }
                }
              } catch (availabilityError) {
                console.error('Error loading availability:', availabilityError);
              }
            }
          } else {
            // Fallback to localStorage data if API fails
            console.log('⚠️ API failed, using localStorage data');
            
            // For demo purposes, create mock doctor data if none exists or if role is missing
            let doctorData = userData;
            if (!doctorData.role) {
              doctorData = {
                ...userData,
                id: '12345',
                firstName: 'Dr. Sarah',
                lastName: 'Wilson',
                name: 'Dr. Sarah Wilson',
                email: 'dr.sarah@healthcareplus.com',
                role: 'doctor',
                specialization: 'General Medicine',
                verificationStatus: 'verified' // Default for demo
              };
              
              // Update localStorage with role
              localStorage.setItem('user', JSON.stringify(doctorData));
              localStorage.setItem('token', 'demo-doctor-token-123');
            }
            
            setUser(doctorData);
          }
        } catch (apiError) {
          console.error('API request failed:', apiError);
          
          setUser(userData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate('/auth/signin');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor schedule expiry
  useEffect(() => {
    if (hasSetAvailability && isOnline && !scheduleExpired && activeTab !== 'availability') {
      const isExpired = checkScheduleExpiry();
      if (isExpired && !showExtensionPrompt && !showScheduleExpiredModal) {
        setShowExtensionPrompt(true);
        handleScheduleExtension();
      }
    }
  }, [currentTime, hasSetAvailability, isOnline, scheduleExpired, showExtensionPrompt, activeTab, showScheduleExpiredModal]);

  // Handle clicks outside dropdowns
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

  // Mobile detection
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

  // Monitor availability time and prompt for extension
  useEffect(() => {
    let timeCheckInterval;

    if (isOnline && doctorAvailability.dailySchedule.isActive) {
      timeCheckInterval = setInterval(() => {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        const endTime = doctorAvailability.dailySchedule.endTime;

        // Convert times to minutes for comparison
        const [currentHour, currentMinute] = currentTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const currentMinutes = currentHour * 60 + currentMinute;
        const endMinutes = endHour * 60 + endMinute;

        // Check if current time has exceeded end time and we haven't already shown the modal
        if (currentMinutes >= endMinutes && !hasTimeExceeded && !showExtensionModal) {
          setHasTimeExceeded(true);
          setShowExtensionModal(true);
        }
      }, 60000); // Check every minute
    }

    return () => {
      if (timeCheckInterval) {
        clearInterval(timeCheckInterval);
      }
    };
  }, [isOnline, doctorAvailability.dailySchedule.isActive, doctorAvailability.dailySchedule.endTime, hasTimeExceeded, showExtensionModal]);

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

  // Updated sidebar items with Heroicons
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: HomeIcon, gradient: 'from-blue-500 to-blue-600' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDaysIcon, gradient: 'from-green-500 to-green-600' },
    { id: 'patients', label: 'Patients', icon: UsersIcon, gradient: 'from-purple-500 to-purple-600' },
    { id: 'availability', label: 'Availability', icon: ClockIcon, gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'prescriptions', label: 'E-Prescribe', icon: BeakerIcon, gradient: 'from-pink-500 to-rose-600' },
    { id: 'records', label: 'Records', icon: DocumentTextIcon, gradient: 'from-indigo-500 to-indigo-600' },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftIcon, gradient: 'from-cyan-500 to-cyan-600' }
  ];

  // Mock data for doctor dashboard
  const todaysAppointments = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'Video Call',
      status: 'confirmed',
      symptoms: 'Headache, fever',
      patientId: 'P12345',
      avatar: '👩',
      priority: 'normal'
    },
    {
      id: 2,
      patient: 'Michael Chen',
      time: '2:15 PM',
      type: 'In-person',
      status: 'pending',
      symptoms: 'Chest pain, shortness of breath',
      patientId: 'P12346',
      avatar: '👨',
      priority: 'high'
    },
    {
      id: 3,
      patient: 'Emily Davis',
      time: '4:00 PM',
      type: 'Video Call',
      status: 'confirmed',
      symptoms: 'Skin rash',
      patientId: 'P12347',
      avatar: '👩',
      priority: 'normal'
    }
  ];

  const patientList = [
    {
      id: 'P12345',
      name: 'Sarah Johnson',
      age: 28,
      gender: 'Female',
      lastVisit: '2025-07-28',
      condition: 'Hypertension',
      vitals: { bp: '140/90', hr: '78', temp: '98.6°F' },
      avatar: '👩'
    },
    {
      id: 'P12346',
      name: 'Michael Chen',
      age: 45,
      gender: 'Male',
      lastVisit: '2025-07-30',
      condition: 'Diabetes Type 2',
      vitals: { bp: '130/85', hr: '82', temp: '99.1°F' },
      avatar: '👨'
    },
    {
      id: 'P12347',
      name: 'Emily Davis',
      age: 32,
      gender: 'Female',
      lastVisit: '2025-08-01',
      condition: 'Allergic Dermatitis',
      vitals: { bp: '120/80', hr: '72', temp: '98.4°F' },
      avatar: '👩'
    }
  ];

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'doctor',
        time: new Date()
      };
      setChatMessages([...chatMessages, userMessage]);
      setNewMessage('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Welcome Section - Enhanced */}
            <div className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome back, Dr. {user?.firstName || user?.name || 'Doctor'}! 
                </h2>
                <p className="text-green-100 text-sm sm:text-base lg:text-lg">
                  Your medical practice overview • {currentTime.toLocaleDateString()}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
                  {!hasSetAvailability ? (
                    // Initial state - show setup prompt
                    <>
                      <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-orange-500/20 text-orange-100">
                        <div className="w-3 h-3 rounded-full bg-orange-300 animate-pulse"></div>
                        <span className="text-sm font-medium">Schedule Not Set</span>
                      </div>
                      <Button 
                        onClick={() => setActiveTab('availability')}
                        className="bg-emerald-500/30 hover:bg-emerald-500/40 text-white border-emerald-300/30 text-sm"
                        size="sm"
                      >
                        Set Today's Schedule
                      </Button>
                    </>
                  ) : (
                    // After availability is set - show online/offline controls
                    <>
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                        isOnline && doctorAvailability.dailySchedule.isActive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          isOnline && doctorAvailability.dailySchedule.isActive ? 'bg-green-300' : 'bg-red-300'
                        } animate-pulse`}></div>
                        <span className="text-sm font-medium">
                          {isOnline && doctorAvailability.dailySchedule.isActive ? 'Online & Available' : 'Offline'}
                        </span>
                      </div>
                      <Button 
                        onClick={() => {
                          if (!isOnline) {
                            // Check if schedule has expired
                            if (scheduleExpired || checkScheduleExpiry()) {
                              Swal.fire({
                                title: 'Schedule Expired',
                                text: 'Your previous schedule has expired. Please set a new schedule before going online.',
                                icon: 'warning',
                                confirmButtonColor: '#f59e0b',
                                confirmButtonText: 'Set New Schedule'
                              }).then(() => {
                                setActiveTab('availability');
                              });
                              return;
                            }

                            // Going online - set both states
                            const newAvailability = {
                              ...doctorAvailability,
                              isAvailable: true,
                              dailySchedule: {
                                ...doctorAvailability.dailySchedule,
                                isActive: true
                              }
                            };
                            
                            setIsOnline(true);
                            setDoctorAvailability(newAvailability);
                            
                            // Save to database
                            saveAvailabilityToDatabase(newAvailability);
                          } else {
                            // Going offline
                            const newAvailability = {
                              ...doctorAvailability,
                              isAvailable: false,
                              dailySchedule: {
                                ...doctorAvailability.dailySchedule,
                                isActive: false
                              }
                            };
                            
                            setIsOnline(false);
                            setDoctorAvailability(newAvailability);
                            
                            // Save to database
                            saveAvailabilityToDatabase(newAvailability);
                          }
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20 text-sm"
                        size="sm"
                      >
                        {isOnline ? 'Go Offline' : 'Go Online'}
                      </Button>
                    </>
                  )}
                </div>

                {/* Quick Availability Controls */}
                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="w-5 h-5 text-white" />
                      <span className="text-white font-medium text-sm sm:text-base">Today's Schedule</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button 
                        onClick={() => setActiveTab('availability')}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-white border-emerald-300/30 text-xs sm:text-sm px-3 py-1 flex items-center space-x-1"
                        size="sm"
                      >
                        <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 " />
                        <span className="hidden sm:inline">Manage Availability</span>
                        <span className="sm:hidden">Manage</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 mt-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      {hasSetAvailability && doctorAvailability.dailySchedule.startTime && doctorAvailability.dailySchedule.endTime ? (
                        <div className="space-y-2">
                          <div className="text-white text-sm sm:text-base font-medium">
                            {doctorAvailability.dailySchedule.startTime} - {doctorAvailability.dailySchedule.endTime}
                            {doctorAvailability.breakTime?.enabled && (
                              <span className="text-white/80 text-xs sm:text-sm ml-2">
                                (Break: {doctorAvailability.breakTime.startTime}-{doctorAvailability.breakTime.endTime})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              scheduleExpired ? 'bg-red-400' : (
                                checkScheduleExpiry() ? 'bg-orange-400 animate-pulse' : 'bg-green-400'
                              )
                            }`}></div>
                            <span className={`text-xs ${
                              scheduleExpired ? 'text-red-200' : (
                                checkScheduleExpiry() ? 'text-orange-200' : 'text-green-200'
                              )
                            }`}>
                              {scheduleExpired ? 'Schedule Expired' : (
                                checkScheduleExpiry() ? 'Schedule Ending Soon' : 'Active Schedule'
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-200 text-sm">
                          No schedule set for today
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20" />
              <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -left-4 -bottom-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-white/5 rounded-full blur-2xl" />
            </div>

            {/* Stats Cards - Enhanced Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <CalendarDaysIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{todaysAppointments.length}</div>
                  <div className="text-blue-100 text-xs sm:text-sm">Today's Appointments</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    Next: {todaysAppointments[0]?.time}
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <UsersIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{patientList.length}</div>
                  <div className="text-emerald-100 text-xs sm:text-sm">Total Patients</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    Active
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">5</div>
                  <div className="text-purple-100 text-xs sm:text-sm">Pending Reviews</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    Urgent
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <ChatBubbleLeftIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">12</div>
                  <div className="text-orange-100 text-xs sm:text-sm">New Messages</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    Unread
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions - Enhanced Responsive Design */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">⚡</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Button 
                  onClick={() => setActiveTab('prescriptions')}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-800 hover:text-blue-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <BeakerIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-blue-600" />
                  <span className="text-xs sm:text-sm font-semibold">E-Prescription</span>
                  <span className="text-xs text-blue-600 mt-1">Write Rx</span>
                </Button>

                <Button 
                  onClick={() => setActiveTab('patients')}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-800 hover:text-purple-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-purple-600" />
                  <span className="text-xs sm:text-sm font-semibold">Patient Profiles</span>
                  <span className="text-xs text-purple-600 mt-1">View Patients</span>
                </Button>

                <Button 
                  onClick={() => setActiveTab('appointments')}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 text-green-800 hover:text-green-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <CalendarDaysIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-green-600" />
                  <span className="text-xs sm:text-sm font-semibold">Appointments</span>
                  <span className="text-xs text-green-600 mt-1">Manage Schedule</span>
                </Button>

                <Button 
                  onClick={() => setActiveTab('chat')}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200 border border-cyan-200 text-cyan-800 hover:text-cyan-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-cyan-600" />
                  <span className="text-xs sm:text-sm font-semibold">Live Chat</span>
                  <span className="text-xs text-cyan-600 mt-1">Message Patients</span>
                </Button>
              </div>
            </Card>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">📅</span>
                <span className="hidden sm:inline">Appointment Management</span>
                <span className="sm:hidden">Appointments</span>
              </h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                <span className="mr-2">➕</span>
                <span className="hidden sm:inline">New Appointment</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Today's Appointments</h3>
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl">
                              {appointment.avatar}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-gray-900">{appointment.patient}</div>
                              <div className="text-sm text-gray-600 font-medium">{appointment.symptoms}</div>
                              <div className="text-xs text-gray-500">Patient ID: {appointment.patientId}</div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-lg font-bold text-gray-800">{appointment.time}</div>
                            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                              appointment.type === 'Video Call' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {appointment.type}
                            </span>
                            <div className="flex space-x-2 mt-2">
                              <Button size="sm" className="bg-green-500 hover:bg-green-600">Complete</Button>
                              <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">Cancel</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Status</h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-sm text-green-700">Scheduled</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-blue-700">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <div className="text-2xl font-bold text-red-600">1</div>
                      <div className="text-sm text-red-700">No-show</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'patients':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-2 sm:mr-3 text-2xl sm:text-3xl">👥</span>
                <span className="hidden sm:inline">Patient Profiles</span>
                <span className="sm:hidden">Patients</span>
              </h2>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-sm">
                <span className="mr-2">👤</span>
                <span className="hidden sm:inline">Add Patient</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patientList.map((patient) => (
                <Card key={patient.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl">
                        {patient.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{patient.name}</h3>
                        <p className="text-gray-600">{patient.age} years • {patient.gender}</p>
                        <p className="text-xs text-gray-500">ID: {patient.id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Last Visit</div>
                        <div className="font-medium">{patient.lastVisit}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-xs text-red-600">Condition</div>
                        <div className="font-medium text-red-700">{patient.condition}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-xs text-blue-600">BP</div>
                          <div className="font-medium text-blue-700">{patient.vitals.bp}</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-xs text-green-600">HR</div>
                          <div className="font-medium text-green-700">{patient.vitals.hr}</div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-xs text-orange-600">Temp</div>
                          <div className="font-medium text-orange-700">{patient.vitals.temp}</div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setSelectedPatient(patient);
                        setShowPatientModal(true);
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      View Full Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'availability':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-emerald-600" />
                <span className="hidden sm:inline">Availability Management</span>
                <span className="sm:hidden">Availability</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Schedule */}
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-emerald-600" />
                    Today's Schedule - {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className="space-y-4">
                    <div className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">
                            Today's Schedule
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                            doctorAvailability.dailySchedule.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              doctorAvailability.dailySchedule.isActive ? 'bg-green-500' : 'bg-red-500'
                            } animate-pulse`}></div>
                            <span className="text-sm font-medium">
                              {doctorAvailability.dailySchedule.isActive ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <Button
                            onClick={() => {
                              const newStatus = !doctorAvailability.dailySchedule.isActive;
                              setDoctorAvailability(prev => ({
                                ...prev,
                                dailySchedule: {
                                  ...prev.dailySchedule,
                                  isActive: newStatus
                                }
                              }));
                              // Show time inputs when making available
                              setShowTimeInputs(newStatus);
                            }}
                            className={`px-3 py-1 text-white text-xs rounded-lg transition-all duration-200 ${
                              doctorAvailability.dailySchedule.isActive
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                            size="sm"
                          >
                            {doctorAvailability.dailySchedule.isActive ? 'Set Unavailable' : 'Set Available'}
                          </Button>
                        </div>
                      </div>
                      
                      {doctorAvailability.dailySchedule.isActive && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <label className="text-sm text-gray-600 mb-1 block">Start Time</label>
                              <input
                                type="time"
                                value={doctorAvailability.dailySchedule.startTime}
                                min={getCurrentTimeString()}
                                onChange={(e) => {
                                  const newStartTime = e.target.value;
                                  const { endTime } = doctorAvailability.dailySchedule;
                                  
                                  // Validate start time is not after end time
                                  if (endTime && newStartTime >= endTime) {
                                    Swal.fire({
                                      title: 'Invalid Time',
                                      text: 'Start time must be before end time.',
                                      icon: 'warning',
                                      confirmButtonColor: '#f59e0b',
                                      timer: 2000,
                                      showConfirmButton: false
                                    });
                                    return;
                                  }
                                  
                                  setDoctorAvailability(prev => ({
                                    ...prev,
                                    dailySchedule: { 
                                      ...prev.dailySchedule, 
                                      startTime: newStartTime 
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm text-gray-600 mb-1 block">End Time</label>
                              <input
                                type="time"
                                value={doctorAvailability.dailySchedule.endTime}
                                min={doctorAvailability.dailySchedule.startTime || getCurrentTimeString()}
                                onChange={(e) => {
                                  const newEndTime = e.target.value;
                                  const { startTime } = doctorAvailability.dailySchedule;
                                  
                                  // Validate end time is after start time
                                  if (startTime && newEndTime <= startTime) {
                                    Swal.fire({
                                      title: 'Invalid Time',
                                      text: 'End time must be after start time.',
                                      icon: 'warning',
                                      confirmButtonColor: '#f59e0b',
                                      timer: 2000,
                                      showConfirmButton: false
                                    });
                                    return;
                                  }
                                  
                                  // Validate minimum duration (30 minutes)
                                  if (startTime && newEndTime) {
                                    const [startHour, startMinute] = startTime.split(':').map(Number);
                                    const [endHour, endMinute] = newEndTime.split(':').map(Number);
                                    const startMinutes = startHour * 60 + startMinute;
                                    const endMinutes = endHour * 60 + endMinute;
                                    
                                    if (endMinutes - startMinutes < 30) {
                                      Swal.fire({
                                        title: 'Minimum Duration Required',
                                        text: 'Availability duration must be at least 30 minutes.',
                                        icon: 'warning',
                                        confirmButtonColor: '#f59e0b',
                                        timer: 2000,
                                        showConfirmButton: false
                                      });
                                      return;
                                    }
                                  }
                                  
                                  setDoctorAvailability(prev => ({
                                    ...prev,
                                    dailySchedule: { 
                                      ...prev.dailySchedule, 
                                      endTime: newEndTime 
                                    }
                                  }));
                                  // Reset time exceeded flag when manually changing end time
                                  setHasTimeExceeded(false);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                              <ClockIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Schedule Summary</span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Available from {doctorAvailability.dailySchedule.startTime} to {doctorAvailability.dailySchedule.endTime}
                              {doctorAvailability.breakTime.enabled && (
                                <span> (Break: {doctorAvailability.breakTime.startTime} - {doctorAvailability.breakTime.endTime})</span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!doctorAvailability.dailySchedule.isActive && (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <ClockIcon className="w-12 h-12 mx-auto" />
                          </div>
                          <span className="text-gray-500 font-medium">Not available today</span>
                          <p className="text-sm text-gray-400 mt-1">Click "Set Available" to set your availability</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Break Time & Settings */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6 space-y-6">
                  {/* Break Time */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2 text-orange-600" />
                      Break Time
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={doctorAvailability.breakTime.enabled}
                          onChange={(e) => setDoctorAvailability(prev => ({
                            ...prev,
                            breakTime: { ...prev.breakTime, enabled: e.target.checked }
                          }))}
                          className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Enable daily break</span>
                      </div>
                      
                      {doctorAvailability.breakTime.enabled && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">Start Time</label>
                            <input
                              type="time"
                              value={doctorAvailability.breakTime.startTime}
                              min={doctorAvailability.dailySchedule.startTime || getCurrentTimeString()}
                              max={doctorAvailability.dailySchedule.endTime}
                              onChange={(e) => setDoctorAvailability(prev => ({
                                ...prev,
                                breakTime: { ...prev.breakTime, startTime: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">End Time</label>
                            <input
                              type="time"
                              value={doctorAvailability.breakTime.endTime}
                              min={doctorAvailability.breakTime.startTime || doctorAvailability.dailySchedule.startTime || getCurrentTimeString()}
                              max={doctorAvailability.dailySchedule.endTime}
                              onChange={(e) => setDoctorAvailability(prev => ({
                                ...prev,
                                breakTime: { ...prev.breakTime, endTime: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Notes */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Special Notes
                    </h3>
                    <textarea
                      value={doctorAvailability.specialNotes}
                      onChange={(e) => setDoctorAvailability(prev => ({
                        ...prev,
                        specialNotes: e.target.value
                      }))}
                      placeholder="Add any special notes about your availability..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Save Complete Availability Button */}
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={async () => {
                  // Always set the doctor as available when saving
                  const updatedAvailability = {
                    ...doctorAvailability,
                    isAvailable: true,
                    dailySchedule: {
                      ...doctorAvailability.dailySchedule,
                      isActive: true
                    }
                  };

                  // Validate settings before saving
                  const isValid = validateAvailabilitySettings(updatedAvailability);
                  if (!isValid) {
                    return;
                  }

                  try {
                    setIsLoading(true);
                    
                    // Update local state first
                    setDoctorAvailability(updatedAvailability);
                    setIsOnline(true);
                    
                    // Save to database
                    await saveAvailabilityToDatabase(updatedAvailability);
                    
                    // Set that the doctor has now configured their availability
                    setHasSetAvailability(true);
                    
                    // Reset schedule expiry flags when new schedule is set
                    setScheduleExpired(false);
                    setShowExtensionPrompt(false);
                    setShowScheduleExpiredModal(false);
                    
                    // Success - redirect to overview
                    Swal.fire({
                      title: 'Success!',
                      text: 'You are now available! Your details have been saved successfully.',
                      icon: 'success',
                      confirmButtonColor: '#10b981',
                      timer: 1500,
                      showConfirmButton: false
                    });
                    
                    // Redirect to overview after state is updated
                    setTimeout(() => {
                      setActiveTab('overview');
                    }, 1600);
                    
                  } catch (error) {
                    console.error('Error saving availability:', error);
                    Swal.fire({
                      title: 'Error!',
                      text: error.message || 'Failed to save availability details',
                      icon: 'error',
                      confirmButtonColor: '#ef4444',
                      confirmButtonText: 'Try Again'
                    });
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Availability Details'
                )}
              </Button>
            </div>
          </div>
        );

      case 'diagnosis':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">🧠</span>
                AI Diagnosis Support
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Patient Symptoms</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        placeholder="Enter patient symptoms..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Relevant medical history..."
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                      🧠 Generate AI Analysis
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">AI Suggestions</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">🤖 AI Analysis Result:</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Based on the symptoms provided, the AI suggests consideration of:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Viral Upper Respiratory Infection (85% confidence)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-yellow-500">?</span>
                        <span>Allergic Rhinitis (15% confidence)</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-700">
                        ⚠️ This is AI-generated suggestion only. Please use your professional judgment for final diagnosis.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                    💾 Save Analysis
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">💊</span>
                E-Prescription Generator
              </h2>
              <Button 
                onClick={() => setShowPrescriptionModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <span className="mr-2">➕</span>
                New Prescription
              </Button>
            </div>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Create Prescription</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                        <option>Select Patient</option>
                        {patientList.map(patient => (
                          <option key={patient.id} value={patient.id}>{patient.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medication</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Start typing medication name..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                          <option>Once daily</option>
                          <option>Twice daily</option>
                          <option>Three times daily</option>
                          <option>Four times daily</option>
                          <option>As needed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 7 days, 2 weeks"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional instructions for the patient..."
                      />
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">🤖 AI Suggestions:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>Amoxicillin 500mg - Common for respiratory infections</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span>Ibuprofen 400mg - For pain and inflammation</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      💾 Generate & Send Prescription
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'chat':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">💬</span>
                Live Chat with Patients
              </h2>
              <div className="text-sm text-gray-500">
                Last active: {currentTime.toLocaleTimeString()}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Active Chats</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {patientList.map((patient) => (
                      <div key={patient.id} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base">
                          {patient.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">{patient.name}</div>
                          <div className="text-xs text-gray-500">Online</div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border-0 shadow-xl h-80 sm:h-96">
                <div className="flex flex-col h-full p-3 sm:p-4">
                  <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 sm:px-4 py-2 rounded-lg text-sm ${
                          message.sender === 'doctor' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          <div>{message.text}</div>
                          <div className={`text-xs mt-1 ${
                            message.sender === 'doctor' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.time.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {chatMessages.length === 0 && (
                      <div className="text-center text-gray-500 py-6 sm:py-8">
                        <div className="text-3xl sm:text-4xl mb-2">💬</div>
                        <div className="text-sm sm:text-base">Select a patient to start chatting</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <Button 
                      onClick={sendChatMessage}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-sm px-3 sm:px-4"
                    >
                      <span className="hidden sm:inline">Send</span>
                      <span className="sm:hidden">→</span>
                    </Button>
                  </div>
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

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Doctor Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden mr-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">H+</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  HealthcarePlus
                </h1>
                <p className="text-xs text-gray-500">Doctor Portal</p>
              </div>
            </div>
            
            {/* Right Section - Notifications and Profile */}
            <div className="flex items-center space-x-4">
              
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileDropdown(false);
                  }}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
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
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileDropdown(!showProfileDropdown);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {(user?.firstName || user?.name || 'D')[0]}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName || user?.name}
                    </div>
                    <div className="text-xs text-gray-500">Dr. {user?.id || '12345'}</div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        // Add profile navigation logic here
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        // Add settings navigation logic here
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-500" />
                      Settings
                    </button>
                    
                    <hr className="my-2" />
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        onLogout();
                      }}
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
        {/* Mobile Sidebar Overlay */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 
          bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50
          transform transition-transform duration-300 ease-in-out z-50 lg:z-30
          ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          overflow-y-auto
        `}>
          
          {/* Mobile Close Button */}
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
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-xl text-left
                      transition-all duration-200 group relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-700 shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-blue-600 rounded-r-full" />
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      p-2 rounded-lg mr-3 transition-all duration-200
                      ${isActive 
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                      }
                    `}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    {/* Label */}
                    <span className={`
                      font-medium text-sm
                      ${isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}
                    `}>
                      {item.label}
                    </span>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-blue-500/0 group-hover:from-green-500/5 group-hover:to-blue-500/5 rounded-xl transition-all duration-200" />
                  </button>
                );
              })}
            </div>
            
            {/* Sign Out Button - Fixed at bottom */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  if (isMobile) setIsSidebarOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center px-4 py-3 rounded-xl text-left
                         text-red-600 hover:bg-red-50 hover:text-red-700
                         transition-all duration-200 group relative overflow-hidden"
              >
                {/* Icon */}
                <div className="p-2 rounded-lg mr-3 transition-all duration-200
                               bg-red-100 group-hover:bg-red-200">
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </div>
                
                {/* Label */}
                <span className="font-medium text-sm">
                  Sign Out
                </span>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 rounded-xl transition-all duration-200" />
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isMobile ? 'ml-0' : 'lg:ml-0'}
          min-h-screen bg-gradient-to-br from-gray-50/50 via-green-50/30 to-blue-50/50
        `}>
          <div className={`p-4 sm:p-6 lg:p-8 ${isMobile ? 'pb-20' : 'pb-4'}`}>
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Patient Profile Modal */}
      <Modal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Patient Profile"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
                {selectedPatient.avatar}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-gray-600">{selectedPatient.age} years • {selectedPatient.gender}</p>
                <p className="text-sm text-gray-500">Patient ID: {selectedPatient.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Medical Information</h4>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600">Current Condition</div>
                  <div className="font-medium text-red-700">{selectedPatient.condition}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Last Visit</div>
                  <div className="font-medium text-blue-700">{selectedPatient.lastVisit}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Current Vitals</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Blood Pressure</span>
                    <span className="font-medium">{selectedPatient.vitals.bp}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Heart Rate</span>
                    <span className="font-medium">{selectedPatient.vitals.hr}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Temperature</span>
                    <span className="font-medium">{selectedPatient.vitals.temp}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setActiveTab('prescriptions')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                💊 Write Prescription
              </Button>
              <Button variant="outline">📊 View Vitals History</Button>
              <Button variant="outline" onClick={() => setShowPatientModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Patient Profile Modal */}
      <Modal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Patient Profile"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl">
                {selectedPatient.avatar}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-gray-600">{selectedPatient.age} years • {selectedPatient.gender}</p>
                <p className="text-sm text-gray-500">Patient ID: {selectedPatient.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Medical Information</h4>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600">Current Condition</div>
                  <div className="font-medium text-red-700">{selectedPatient.condition}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Last Visit</div>
                  <div className="font-medium text-blue-700">{selectedPatient.lastVisit}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Current Vitals</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Blood Pressure</span>
                    <span className="font-medium">{selectedPatient.vitals.bp}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Heart Rate</span>
                    <span className="font-medium">{selectedPatient.vitals.hr}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Temperature</span>
                    <span className="font-medium">{selectedPatient.vitals.temp}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={() => setActiveTab('prescriptions')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                💊 Write Prescription
              </Button>
              <Button variant="outline">📊 View Vitals History</Button>
              <Button variant="outline" onClick={() => setShowPatientModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Prescription Modal */}
      <Modal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        title="Create New Prescription"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter patient name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter medications and dosage instructions..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="7"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              💊 Generate Prescription
            </Button>
            <Button variant="outline" onClick={() => setShowPrescriptionModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40 lg:hidden">
          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {sidebarItems.slice(0, 4).map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    flex flex-col items-center justify-center py-2 px-1 rounded-lg
                    transition-all duration-200 min-h-[60px]
                    ${isActive 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className={`w-5 h-5 mb-1 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                  <span className={`text-xs font-medium truncate ${isActive ? 'text-green-600' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-green-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Availability Toggle Button */}
      <button
        onClick={async () => {
          if (!hasSetAvailability) {
            // If no schedule is set, redirect to availability section
            setActiveTab('availability');
            return;
          }

          if (!isOnline) {
            // Check if schedule has expired
            if (scheduleExpired || checkScheduleExpiry()) {
              Swal.fire({
                title: 'Schedule Expired',
                text: 'Your previous schedule has expired. Please set a new schedule before going online.',
                icon: 'warning',
                confirmButtonColor: '#f59e0b',
                confirmButtonText: 'Set New Schedule'
              }).then(() => {
                setActiveTab('availability');
              });
              return;
            }

            // Going online - set both states
            const newAvailability = {
              ...doctorAvailability,
              isAvailable: true,
              dailySchedule: {
                ...doctorAvailability.dailySchedule,
                isActive: true
              }
            };
            
            setIsOnline(true);
            setDoctorAvailability(newAvailability);
            
            // Save to database
            const saveResult = await saveAvailabilityToDatabase(newAvailability);
            
            if (saveResult.success) {
              Swal.fire({
                title: 'Online',
                text: 'You are now online and available for appointments.',
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                title: 'Warning',
                text: 'You are online locally, but failed to sync with server.',
                icon: 'warning',
                confirmButtonColor: '#f59e0b'
              });
            }
          } else {
            // Going offline - set everything to offline/unavailable
            const newAvailability = {
              ...doctorAvailability,
              isAvailable: false,
              dailySchedule: {
                ...doctorAvailability.dailySchedule,
                isActive: false
              }
            };
            
            setIsOnline(false);
            setDoctorAvailability(newAvailability);
            
            // Save offline status to database
            const saveResult = await saveAvailabilityToDatabase(newAvailability);
            
            if (saveResult.success) {
              Swal.fire({
                title: 'Offline',
                text: 'You are now offline. Patients cannot book new appointments.',
                icon: 'info',
                confirmButtonColor: '#6b7280',
                timer: 2000,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                title: 'Warning',
                text: 'You are offline locally, but failed to sync with server.',
                icon: 'warning',
                confirmButtonColor: '#f59e0b'
              });
            }
          }
        }}
        className={`
          fixed w-14 h-14 sm:w-16 sm:h-16 ${
            isOnline 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          } text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 
          flex items-center justify-center transform hover:scale-110 
          ${isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'}
          z-50
        `}
        title={isOnline ? 'Go Offline' : 'Go Online'}
      >
        <PowerIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${isOnline ? 'text-white' : 'text-white'}`} />
      </button>

      
      {/* Schedule Expired Modal */}
      {showScheduleExpiredModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 transform animate-in fade-in zoom-in duration-500">
            {/* Header with animated icon */}
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ClockIcon className="w-10 h-10 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Schedule Time Ended</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your scheduled availability time 
                <span className="font-semibold text-orange-600 mx-1">
                  ({doctorAvailability.dailySchedule.startTime} - {doctorAvailability.dailySchedule.endTime})
                </span>
                has ended. What would you like to do?
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleExtendSchedule}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] py-4 text-lg font-semibold"
              >
                <div className="flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 mr-3" />
                  <span>Extend My Schedule</span>
                </div>
              </Button>
              
              <Button
                onClick={handleGoOffline}
                variant="outline"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-[1.02] py-4 text-lg font-semibold"
              >
                <div className="flex items-center justify-center">
                  <PowerIcon className="w-5 h-5 mr-3" />
                  <span>Go Offline</span>
                </div>
              </Button>
            </div>
            
            {/* Info note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-sm text-blue-700 text-center font-medium">
                💡 You can always adjust your schedule in the Availability section
              </p>
            </div>
          </div>
        </div>
      )}
      
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


export default DoctorDashboard;
