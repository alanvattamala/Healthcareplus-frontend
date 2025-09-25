import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Card, Button, Modal, Calendar } from '../../components';
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
  PowerIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  ArchiveBoxIcon,
  PlusIcon,
  LightBulbIcon,
  SparklesIcon
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
  const [showScheduleStartModal, setShowScheduleStartModal] = useState(false);
  const [scheduleJustStarted, setScheduleJustStarted] = useState(false);
  const [justSubmittedSchedule, setJustSubmittedSchedule] = useState(false);
  const [wasWithinSchedule, setWasWithinSchedule] = useState(false);
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

  // Consultation fee management state
  const [consultationFee, setConsultationFee] = useState({
    amount: null,
    status: 'not_set', // 'not_set', 'pending', 'approved', 'rejected'
    rejectionReason: null
  });
  const [showConsultationFeeModal, setShowConsultationFeeModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState(null);
  const [approvalDetails, setApprovalDetails] = useState(null);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeValidationError, setFeeValidationError] = useState('');
  const [currency, setCurrency] = useState('INR');

  // Schedule setup state for first-time daily login
  const [hasScheduleToday, setHasScheduleToday] = useState(null); // null = checking, true = has schedule, false = needs setup
  const [showScheduleSetupModal, setShowScheduleSetupModal] = useState(false);
  const [scheduleSetup, setScheduleSetup] = useState({
    startTime: '',
    endTime: ''
  });
  const [scheduleSetupError, setScheduleSetupError] = useState('');

  // Go online confirmation modal state
  const [showGoOnlineModal, setShowGoOnlineModal] = useState(false);
  const [goOnlineModalData, setGoOnlineModalData] = useState({
    title: '',
    message: '',
    source: '' // 'schedule' or 'availability'
  });

  // Upcoming Schedules Management State
  const [selectedDates, setSelectedDates] = useState([]);
  const [scheduleMode, setScheduleMode] = useState('same'); // 'same' or 'custom'
  const [defaultTimes, setDefaultTimes] = useState({
    startTime: '09:00',
    endTime: '17:00'
  });
  const [customSchedules, setCustomSchedules] = useState({});
  const [existingSchedules, setExistingSchedules] = useState({});
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [completedSchedules, setCompletedSchedules] = useState({});
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Helper function to format date as YYYY-MM-DD without timezone issues
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    
    return isExpired;
  };

  // Function to check if current time is within scheduled period
  const isWithinScheduledTime = () => {
    if (!hasSetAvailability || !doctorAvailability.dailySchedule.startTime || !doctorAvailability.dailySchedule.endTime) {
      return false;
    }

    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const [startHour, startMinute] = doctorAvailability.dailySchedule.startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = doctorAvailability.dailySchedule.endTime.split(':').map(Number);
    const endTotalMinutes = endHour * 60 + endMinute;

    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
  };

  // Function to check if schedule just started (within 2 minutes of start time or just entered schedule)
  const checkScheduleJustStarted = () => {
    if (!hasSetAvailability || !doctorAvailability.dailySchedule.startTime) {
      return false;
    }

    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const [startHour, startMinute] = doctorAvailability.dailySchedule.startTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;

    // Check if current time is within 2 minutes of start time (gives more flexibility)
    const timeDifference = currentTotalMinutes - startTotalMinutes;
    return timeDifference >= 0 && timeDifference <= 2;
  };

  // Function to handle schedule extension
  const handleScheduleExtension = () => {
    console.log('handleScheduleExtension called - showing modal');
    setShowScheduleExpiredModal(true);
    setShowExtensionPrompt(false);
  };

  // Function to handle extending schedule
  const handleExtendSchedule = () => {
    setShowScheduleExpiredModal(false);
    setJustSubmittedSchedule(false);
    
    // Show options for quick extension
    Swal.fire({
      title: 'Extend Your Schedule',
      text: 'How would you like to extend your availability?',
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Extend by 1 Hour',
      denyButtonText: 'Extend by 2 Hours',
      cancelButtonText: 'Custom Extension',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#0ea5e9',
      cancelButtonColor: '#6b7280'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Extend by 1 hour
        await extendScheduleByHours(1);
      } else if (result.isDenied) {
        // Extend by 2 hours
        await extendScheduleByHours(2);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Redirect to availability section for custom extension
        setActiveTab('availability');
      }
    });
  };

  // Function to extend schedule by specified hours
  const extendScheduleByHours = async (hours) => {
    const [endHour, endMinute] = doctorAvailability.dailySchedule.endTime.split(':').map(Number);
    const newEndHour = (endHour + hours) % 24;
    const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    const updatedAvailability = {
      ...doctorAvailability,
      dailySchedule: {
        ...doctorAvailability.dailySchedule,
        endTime: newEndTime,
        isActive: true
      },
      isAvailable: true
    };

    try {
      // Update local state
      setDoctorAvailability(updatedAvailability);
      setScheduleExpired(false);
      setShowExtensionPrompt(false);
      setIsOnline(true);

      // Save to database
      const saveResult = await saveAvailabilityToDatabase(updatedAvailability);
      
      if (saveResult.success) {
        Swal.fire({
          title: 'Schedule Extended!',
          text: `Your availability has been extended until ${newEndTime}. You are now online.`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Error extending schedule:', error);
      Swal.fire({
        title: 'Extension Failed',
        text: 'Schedule extended locally but failed to sync with server.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
    }
  };

  // Persistence functions for schedule state
  const saveScheduleStateToLocalStorage = (state) => {
    try {
      const userId = user?.id;
      if (userId) {
        const scheduleState = {
          scheduleExpired: state.scheduleExpired,
          scheduleJustStarted: state.scheduleJustStarted,
          hasSetAvailability: state.hasSetAvailability,
          timestamp: Date.now()
        };
        localStorage.setItem(`doctorScheduleState_${userId}`, JSON.stringify(scheduleState));
      }
    } catch (error) {
      console.error('Error saving schedule state to localStorage:', error);
    }
  };

  const loadScheduleStateFromLocalStorage = () => {
    try {
      const userId = user?.id;
      if (userId) {
        const saved = localStorage.getItem(`doctorScheduleState_${userId}`);
        if (saved) {
          const state = JSON.parse(saved);
          // Only restore state if it's from today (within 24 hours)
          const isRecent = Date.now() - state.timestamp < 24 * 60 * 60 * 1000;
          if (isRecent) {
            return state;
          }
        }
      }
    } catch (error) {
      console.error('Error loading schedule state from localStorage:', error);
    }
    return null;
  };

  const clearScheduleStateFromLocalStorage = () => {
    try {
      const userId = user?.id;
      if (userId) {
        localStorage.removeItem(`doctorScheduleState_${userId}`);
      }
    } catch (error) {
      console.error('Error clearing schedule state from localStorage:', error);
    }
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
    
    try {
      // Update local state
      setIsOnline(false);
      setDoctorAvailability(newAvailability);
      // Don't set schedule expired when manually going offline
      // setScheduleExpired(true); // REMOVED - this was causing the issue
      setShowScheduleExpiredModal(false);
      setShowExtensionPrompt(false);
      setJustSubmittedSchedule(false);
      
      // Save to database
      const saveResult = await saveAvailabilityToDatabase(newAvailability);
      
      if (saveResult.success) {
        // Show confirmation
        Swal.fire({
          title: 'Gone Offline',
          text: 'You are now offline. Patients cannot book new appointments.',
          icon: 'info',
          confirmButtonColor: '#6b7280',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Error going offline:', error);
      Swal.fire({
        title: 'Offline Status Updated',
        text: 'You are offline locally but failed to sync with server.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
    }
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

  // Helper function to save both schedule and availability to database
  const saveBothToDatabase = async (scheduleData, availabilityData) => {
    const token = localStorage.getItem('token');
    const errors = [];

    try {
      // 1. Save to schedule collection with timestamp
      const scheduleResponse = await fetch('http://localhost:3001/api/schedules/today', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startTime: scheduleData.startTime,
          endTime: scheduleData.endTime,
          lastUpdated: new Date().toISOString(),
          submittedAt: new Date().toISOString()
        })
      });

      if (!scheduleResponse.ok) {
        const errorData = await scheduleResponse.json();
        errors.push(`Schedule save failed: ${errorData.message || 'Unknown error'}`);
      }

      // 2. Save to availability collection (for compatibility) with timestamp
      const availabilityWithTimestamp = {
        ...availabilityData,
        lastUpdated: new Date().toISOString(),
        submittedAt: new Date().toISOString()
      };
      const availabilityResult = await saveAvailabilityToDatabase(availabilityWithTimestamp);
      if (!availabilityResult.success) {
        errors.push(`Availability save failed: ${availabilityResult.error}`);
      }

      if (errors.length > 0) {
        throw new Error(errors.join('; '));
      }

      return { success: true };
    } catch (error) {
      console.error('Database operations failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Enhanced function to handle going online with schedule validation
  const handleGoOnline = async () => {
    // Check if doctor has set today's schedule
    if (hasScheduleToday === false) {
      Swal.fire({
        title: 'Schedule Not Set',
        text: 'Please set your daily schedule before going online.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
        showCancelButton: true,
        confirmButtonText: 'Set Schedule Now',
        cancelButtonText: 'Later'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowScheduleSetupModal(true);
        }
      });
      return;
    }

    // Check if doctor has set availability and if current time is within scheduled period
    if (!hasSetAvailability) {
      Swal.fire({
        title: 'No Schedule Set',
        text: 'Please set your availability schedule before going online.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    if (!isWithinScheduledTime()) {
      const { startTime, endTime } = doctorAvailability.dailySchedule;
      Swal.fire({
        title: 'Outside Scheduled Hours',
        text: `You can only go online during your scheduled hours (${startTime} - ${endTime}). Please wait for your scheduled time or update your availability.`,
        icon: 'info',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const newAvailability = {
      ...doctorAvailability,
      isAvailable: true,
      dailySchedule: {
        ...doctorAvailability.dailySchedule,
        isActive: true
      }
    };

    // Set online status
    setDoctorAvailability(newAvailability);
    setIsOnline(true);
    
    // Save to database
    const saveResult = await saveAvailabilityToDatabase(newAvailability);
    
    if (saveResult.success) {
      const { startTime, endTime } = doctorAvailability.dailySchedule;
      Swal.fire({
        title: 'Online!',
        text: `You are now online during your scheduled hours (${startTime} - ${endTime})`,
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
  };

  // Handle fee amount input change and clear validation errors
  const handleFeeAmountChange = (e) => {
    setFeeAmount(e.target.value);
    setFeeValidationError(''); // Clear validation error when user starts typing
  };

  // Handle opening consultation fee modal
  const handleOpenConsultationFeeModal = () => {
    setFeeValidationError(''); // Clear any previous validation errors
    
    // If updating existing fee, pre-fill with current amount
    if (consultationFee.amount && consultationFee.status === 'approved') {
      setFeeAmount(consultationFee.amount.toString());
    } else {
      setFeeAmount('');
    }
    
    setShowConsultationFeeModal(true);
  };

  // Consultation fee handlers
  const handleSubmitConsultationFee = async () => {
    // Clear previous validation errors
    setFeeValidationError('');
    
    // Validate empty or zero amount
    if (!feeAmount || parseFloat(feeAmount) <= 0) {
      setFeeValidationError('Please enter a valid consultation fee amount greater than zero.');
      return;
    }

    // Validate same amount (if current fee exists and approved)
    if (consultationFee.amount && consultationFee.status === 'approved' && parseFloat(feeAmount) === consultationFee.amount) {
      setFeeValidationError('Please enter a different amount. You cannot submit the same consultation fee that is already approved.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        Swal.fire({
          title: 'Authentication Error',
          text: 'Please log in again to submit your consultation fee.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
        return;
      }

      console.log('Submitting consultation fee:', {
        amount: parseFloat(feeAmount),
        currency: currency
      });

      const response = await fetch('http://localhost:3001/api/approvals/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'consultation_fee',
          requestData: {
            amount: parseFloat(feeAmount),
            currency: currency
          }
        })
      });

      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (response.ok) {
        setConsultationFee({
          amount: parseFloat(feeAmount),
          status: 'pending',
          rejectionReason: null
        });
        
        setShowConsultationFeeModal(false);
        setFeeAmount('');
        
        Swal.fire({
          title: 'Fee Submitted!',
          text: 'Your consultation fee has been submitted for admin approval. You will be notified once it\'s reviewed.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 4000
        });
      } else {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting consultation fee:', error);
      
      let errorMessage = 'Failed to submit consultation fee. Please try again.';
      
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please check if the server is running.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        title: 'Submission Failed',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleSkipConsultationFee = () => {
    setShowConsultationFeeModal(false);
    setConsultationFee({
      amount: null,
      status: 'not_set',
      rejectionReason: null
    });
  };

  // Schedule setup handlers
  const handleScheduleSetupChange = (field, value) => {
    setScheduleSetup(prev => ({
      ...prev,
      [field]: value
    }));
    setScheduleSetupError('');
  };

  // Upcoming Schedules API Functions
  const fetchExistingSchedules = async (dates) => {
    try {
      const token = localStorage.getItem('token');
      const dateStrings = dates.map(date => {
        const dateStr = typeof date === 'string' ? date : formatDateString(new Date(date));
        return dateStr;
      }).join(',');

      const response = await fetch(`http://localhost:3001/api/schedules/check-exists?dates=${dateStrings}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setExistingSchedules(result.data.scheduleExists);
      } else {
        console.error('Failed to fetch existing schedules');
      }
    } catch (error) {
      console.error('Error fetching existing schedules:', error);
    }
  };

  const fetchUpcomingSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/schedules/upcoming', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUpcomingSchedules(result.data.schedules);
        
        // Also update existing schedules for calendar indicators
        const existingByDate = {};
        result.data.schedules.forEach(schedule => {
          const dateStr = formatDateString(new Date(schedule.date));
          existingByDate[dateStr] = schedule;
        });
        setExistingSchedules(existingByDate);
      } else {
        console.error('Failed to fetch upcoming schedules');
      }
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
    }
  };

  const fetchCompletedSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch schedule history (past schedules) from the database
      const response = await fetch('http://localhost:3001/api/schedules/history?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Convert array to object with date as key for easy lookup
        // Only include past dates (completed schedules)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare dates only
        
        const completedByDate = {};
        result.data.schedules.forEach(schedule => {
          const scheduleDate = new Date(schedule.date);
          scheduleDate.setHours(0, 0, 0, 0);
          
          // Only include schedules from past dates
          if (scheduleDate < today) {
            const dateStr = formatDateString(scheduleDate);
            completedByDate[dateStr] = {
              ...schedule,
              status: 'completed'
            };
          }
        });
        setCompletedSchedules(completedByDate);
      } else {
        console.error('Failed to fetch completed schedules');
        setCompletedSchedules({});
      }
    } catch (error) {
      console.error('Error fetching completed schedules:', error);
      setCompletedSchedules({});
    }
  };

  const saveUpcomingSchedules = async (schedules) => {
    try {
      setScheduleLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3001/api/schedules/upcoming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ schedules })
      });

      const result = await response.json();

      if (response.ok) {
        await fetchUpcomingSchedules(); // Refresh the list
        return { success: true, data: result };
      } else {
        throw new Error(result.message || 'Failed to save schedules');
      }
    } catch (error) {
      console.error('Error saving upcoming schedules:', error);
      return { success: false, error: error.message };
    } finally {
      setScheduleLoading(false);
    }
  };

  const deleteUpcomingSchedule = async (scheduleId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/schedules/upcoming/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUpcomingSchedules(); // Refresh the list
        return { success: true };
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting upcoming schedule:', error);
      return { success: false, error: error.message };
    }
  };

  // Upcoming Schedules Handlers
  const handleDateSelect = (date, isSelected) => {
    const dateStr = formatDateString(date);
    
    if (isSelected) {
      // Remove date
      setSelectedDates(prev => prev.filter(d => {
        const dStr = typeof d === 'string' ? d : formatDateString(new Date(d));
        return dStr !== dateStr;
      }));
      
      // Remove from custom schedules
      setCustomSchedules(prev => {
        const newSchedules = { ...prev };
        delete newSchedules[dateStr];
        return newSchedules;
      });
    } else {
      // Add date - store as date string to avoid timezone issues
      setSelectedDates(prev => [...prev, dateStr]);
      
      // Initialize custom schedule with default times
      if (scheduleMode === 'custom') {
        setCustomSchedules(prev => ({
          ...prev,
          [dateStr]: {
            startTime: defaultTimes.startTime,
            endTime: defaultTimes.endTime
          }
        }));
      }
    }
  };

  const handleScheduleModeChange = (mode) => {
    setScheduleMode(mode);
    
    if (mode === 'custom') {
      // Initialize custom schedules for selected dates
      const newCustomSchedules = {};
      selectedDates.forEach(date => {
        const dateStr = typeof date === 'string' ? date : formatDateString(new Date(date));
        newCustomSchedules[dateStr] = {
          startTime: defaultTimes.startTime,
          endTime: defaultTimes.endTime
        };
      });
      setCustomSchedules(newCustomSchedules);
    } else {
      setCustomSchedules({});
    }
  };

  // Helper function to validate time range
  const validateTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return true; // Allow empty values during input
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    // Check if end time is after start time
    if (end <= start) return false;
    
    // Check if the duration is at least 30 minutes
    const duration = (end - start) / (1000 * 60); // duration in minutes
    return duration >= 30;
  };

  // Helper function to show time validation error
  const showTimeValidationError = (message) => {
    Swal.fire({
      title: 'Invalid Time Range',
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#EF4444'
    });
  };

  // Helper function to get input styling based on validation
  const getTimeInputStyling = (startTime, endTime, isEndTimeField = false) => {
    const baseStyle = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors";
    
    if (!startTime || !endTime) {
      return `${baseStyle} border-gray-300 focus:ring-blue-500`;
    }
    
    const isValid = validateTimeRange(startTime, endTime);
    
    if (isValid) {
      return `${baseStyle} border-green-300 bg-green-50 focus:ring-green-500`;
    } else if (isEndTimeField) {
      return `${baseStyle} border-red-300 bg-red-50 focus:ring-red-500`;
    } else {
      return `${baseStyle} border-gray-300 focus:ring-blue-500`;
    }
  };

  // Helper function to get validation message
  const getTimeValidationMessage = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end <= start) {
      return "End time must be after start time";
    }
    
    const duration = (end - start) / (1000 * 60);
    if (duration < 30) {
      return "Schedule must be at least 30 minutes long";
    }
    
    return null;
  };

  const handleDefaultTimesChange = (field, value) => {
    const newTimes = {
      ...defaultTimes,
      [field]: value
    };
    
    // Validate time range when both start and end times are set
    if (newTimes.startTime && newTimes.endTime) {
      if (!validateTimeRange(newTimes.startTime, newTimes.endTime)) {
        showTimeValidationError('End time must be after start time and the schedule must be at least 30 minutes long.');
        return; // Don't update if validation fails
      }
    }
    
    setDefaultTimes(newTimes);
  };

  const handleCustomScheduleChange = (date, field, value) => {
    const currentSchedule = customSchedules[date] || {};
    const newSchedule = {
      ...currentSchedule,
      [field]: value
    };
    
    // Validate time range when both start and end times are set
    if (newSchedule.startTime && newSchedule.endTime) {
      if (!validateTimeRange(newSchedule.startTime, newSchedule.endTime)) {
        showTimeValidationError(`End time must be after start time and the schedule must be at least 30 minutes long for ${new Date(date).toLocaleDateString()}.`);
        return; // Don't update if validation fails
      }
    }
    
    setCustomSchedules(prev => ({
      ...prev,
      [date]: newSchedule
    }));
  };

  const validateScheduleData = (schedules) => {
    const errors = [];
    
    schedules.forEach((schedule, index) => {
      const { date, startTime, endTime } = schedule;
      
      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        errors.push(`Invalid time format for ${date}`);
        return;
      }
      
      // Validate time logic
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      
      if (endMinutes <= startMinutes) {
        errors.push(`End time must be after start time for ${date}`);
      }
      
      if (endMinutes - startMinutes < 30) {
        errors.push(`Schedule must be at least 30 minutes long for ${date}`);
      }
    });
    
    return errors;
  };

  const handleSaveUpcomingSchedules = async () => {
    if (selectedDates.length === 0) {
      Swal.fire({
        title: 'No Dates Selected',
        text: 'Please select at least one date to create schedules.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    // Prepare schedule data
    const schedules = selectedDates.map(date => {
      const dateStr = typeof date === 'string' ? date : formatDateString(new Date(date));
      
      if (scheduleMode === 'custom' && customSchedules[dateStr]) {
        return {
          date: dateStr,
          startTime: customSchedules[dateStr].startTime,
          endTime: customSchedules[dateStr].endTime
        };
      } else {
        return {
          date: dateStr,
          startTime: defaultTimes.startTime,
          endTime: defaultTimes.endTime
        };
      }
    });

    // Validate data
    const validationErrors = validateScheduleData(schedules);
    if (validationErrors.length > 0) {
      Swal.fire({
        title: 'Validation Errors',
        html: validationErrors.map(error => `• ${error}`).join('<br>'),
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // Check for existing schedules
    const conflictingDates = [];
    schedules.forEach(schedule => {
      if (existingSchedules[schedule.date]) {
        conflictingDates.push(schedule.date);
      }
    });

    if (conflictingDates.length > 0) {
      const result = await Swal.fire({
        title: 'Existing Schedules Found',
        html: `The following dates already have schedules:<br><br>
          <strong>${conflictingDates.join(', ')}</strong><br><br>
          Do you want to overwrite them?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Overwrite',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    // Save schedules
    const saveResult = await saveUpcomingSchedules(schedules);

    if (saveResult.success) {
      const { successCount, errorCount } = saveResult.data;
      
      Swal.fire({
        title: 'Schedules Saved!',
        html: `Successfully saved ${successCount} schedule(s).${errorCount > 0 ? `<br>${errorCount} schedule(s) had errors.` : ''}`,
        icon: successCount > 0 ? 'success' : 'warning',
        confirmButtonColor: '#10b981'
      });

      // Reset form
      setSelectedDates([]);
      setCustomSchedules({});
      setShowUpcomingSchedulesModal(false);
      
      // Refresh existing schedules
      await fetchExistingSchedules(selectedDates);
    } else {
      Swal.fire({
        title: 'Save Failed',
        text: saveResult.error,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDeleteUpcomingSchedule = async (scheduleId, date) => {
    const result = await Swal.fire({
      title: 'Delete Schedule?',
      text: `Are you sure you want to delete the schedule for ${date}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteUpcomingSchedule(scheduleId);
      
      if (deleteResult.success) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Schedule has been deleted.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } else {
        Swal.fire({
          title: 'Delete Failed',
          text: deleteResult.error,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const validateScheduleTime = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return 'Both start time and end time are required';
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    if (endTotalMinutes <= startTotalMinutes) {
      return 'End time must be after start time';
    }

    const durationMinutes = endTotalMinutes - startTotalMinutes;
    if (durationMinutes < 60) {
      return 'Schedule duration must be at least 1 hour';
    }

    return null;
  };

  const handleSubmitScheduleSetup = async () => {
    const { startTime, endTime } = scheduleSetup;
    
    // Validate schedule
    const validationError = validateScheduleTime(startTime, endTime);
    if (validationError) {
      setScheduleSetupError(validationError);
      return;
    }

    try {
      // Save to both schedule API and update availability
      const updatedAvailability = {
        ...doctorAvailability,
        isAvailable: true,
        dailySchedule: {
          date: new Date().toISOString().split('T')[0],
          isActive: true,
          startTime,
          endTime
        }
      };

      // Use the helper function to save to both collections
      const saveResult = await saveBothToDatabase(
        { startTime, endTime },
        updatedAvailability
      );

      if (saveResult.success) {
        // Check if the start time has already begun
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const startTotalMinutes = startHour * 60 + startMinute;

        const timeHasStarted = currentTotalMinutes >= startTotalMinutes;
        
        // Update state
        setHasScheduleToday(true);
        setHasSetAvailability(true);
        setShowScheduleSetupModal(false);
        
        // Update doctor availability
        setDoctorAvailability(prev => ({
          ...prev,
          dailySchedule: {
            date: new Date().toISOString().split('T')[0],
            isActive: true,
            startTime,
            endTime
          }
        }));

        // Reset form
        setScheduleSetup({
          startTime: '',
          endTime: ''
        });
        setScheduleSetupError('');

        // Show different messages based on whether time has started
        if (timeHasStarted) {
          // Time has started - show custom modal offering to go online
          setGoOnlineModalData({
            title: 'Schedule Set Successfully!',
            message: 'Your daily schedule has been set. Since your scheduled time has already started, would you like to go online now?',
            source: 'schedule'
          });
          setShowGoOnlineModal(true);
        } else {
          // Time hasn't started yet - just show success message
          Swal.fire({
            title: 'Success!',
            text: 'Your daily schedule has been set successfully. You will be able to go online at your scheduled time.',
            icon: 'success',
            confirmButtonColor: '#10B981'
          });
        }
      } else {
        setScheduleSetupError(saveResult.error || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setScheduleSetupError('Network error. Please try again.');
    }
  };

  const handleSkipScheduleSetup = () => {
    setShowScheduleSetupModal(false);
    // Keep hasScheduleToday as false, doctor will remain offline
  };

  // Go online modal handlers
  const handleGoOnlineConfirm = () => {
    setIsOnline(true);
    setShowGoOnlineModal(false);
    
    Swal.fire({
      title: 'You\'re Online!',
      text: 'You are now accepting patients.',
      icon: 'success',
      confirmButtonColor: '#10b981',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleGoOnlineCancel = () => {
    setShowGoOnlineModal(false);
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
                    
                    // Restore schedule state from localStorage after user data is loaded
                    setTimeout(() => {
                      const savedState = loadScheduleStateFromLocalStorage();
                      if (savedState) {
                        setScheduleExpired(savedState.scheduleExpired);
                        setScheduleJustStarted(savedState.scheduleJustStarted);
                        setWasWithinSchedule(savedState.wasWithinSchedule || false);
                        // hasSetAvailability should come from backend, not localStorage
                      }
                    }, 100); // Small delay to ensure user state is set
                  }
                }
              } catch (availabilityError) {
                console.error('Error loading availability:', availabilityError);
              }

              // Load doctor's consultation fee
              try {
                const feeResponse = await fetch('http://localhost:3001/api/users/doctor/consultation-fee', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });

                if (feeResponse.ok) {
                  const feeData = await feeResponse.json();
                  console.log('Fee data received:', feeData.data);
                  
                  // Check if consultation fee is set in User collection
                  const userConsultationFee = feeData.data.consultationFee;
                  const hasValidFee = userConsultationFee && userConsultationFee > 0;
                  
                  console.log('User consultation fee from DB:', userConsultationFee);
                  console.log('Has valid fee:', hasValidFee);
                  
                  if (hasValidFee) {
                    // Consultation fee is set and > 0 in User collection
                    setConsultationFee({
                      amount: userConsultationFee,
                      status: 'approved', // If it's in User collection, it's approved
                      rejectionReason: null
                    });
                    console.log('Consultation fee is set, not showing modal');
                    // Don't show modal since fee is already set
                  } else {
                    // No valid consultation fee set, prompt doctor
                    console.log('No valid consultation fee set (0 or null), showing modal');
                    setConsultationFee({
                      amount: 0,
                      status: 'not_set',
                      rejectionReason: null
                    });
                    setShowConsultationFeeModal(true);
                  }
                } else {
                  // API error, assume no fee is set and prompt doctor
                  console.log('API error loading consultation fee, assuming not set');
                  setConsultationFee({
                    amount: 0,
                    status: 'not_set', 
                    rejectionReason: null
                  });
                  setShowConsultationFeeModal(true);
                }
              } catch (feeError) {
                console.error('Error loading consultation fee:', feeError);
                // On error, assume no fee is set and prompt doctor
                console.log('Fee loading error, assuming not set and showing modal');
                setConsultationFee({
                  amount: 0,
                  status: 'not_set',
                  rejectionReason: null
                });
                setShowConsultationFeeModal(true);
              }
            }

            // Check for recent rejected approval requests
            if (userData.userType === 'doctor') {
              try {
                const approvalsResponse = await fetch('http://localhost:3001/api/approvals/my-requests', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });

                if (approvalsResponse.ok) {
                  const approvalsData = await approvalsResponse.json();
                  console.log('Doctor approvals data:', approvalsData.data);

                  // Find the most recent consultation fee request (any status)
                  const consultationFeeRequests = approvalsData.data.approvals
                    ?.filter(approval => approval.type === 'consultation_fee')
                    ?.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

                  if (consultationFeeRequests && consultationFeeRequests.length > 0) {
                    const latestRequest = consultationFeeRequests[0];
                    console.log('Latest consultation fee request:', latestRequest);

                    // Update consultation fee status based on latest request
                    if (latestRequest.status === 'pending') {
                      setConsultationFee(prev => ({
                        ...prev,
                        status: 'pending'
                      }));
                    } else if (latestRequest.status === 'rejected') {
                      setConsultationFee(prev => ({
                        ...prev,
                        status: 'rejected',
                        rejectionReason: latestRequest.reason
                      }));

                      // Check if this rejection is recent and should be shown
                      const rejectionTime = new Date(latestRequest.processedAt);
                      const now = new Date();
                      const timeDiff = now - rejectionTime;
                      const hoursAgo = timeDiff / (1000 * 60 * 60);

                      // Show if it's within 24 hours and hasn't been acknowledged
                      if (hoursAgo <= 24) {
                        const rejectionKey = `rejection_shown_${latestRequest._id}`;
                        const hasBeenShown = localStorage.getItem(rejectionKey);

                        if (!hasBeenShown) {
                          setRejectionDetails(latestRequest);
                          setTimeout(() => {
                            setShowRejectionModal(true);
                          }, 1000); // Show after a brief delay
                        }
                      }
                    } else if (latestRequest.status === 'approved') {
                      // Check if this approval is recent and should be shown
                      const approvalTime = new Date(latestRequest.processedAt);
                      const now = new Date();
                      const timeDiff = now - approvalTime;
                      const hoursAgo = timeDiff / (1000 * 60 * 60);

                      // Show if it's within 24 hours and hasn't been acknowledged
                      if (hoursAgo <= 24) {
                        const approvalKey = `approval_shown_${latestRequest._id}`;
                        const hasBeenShown = localStorage.getItem(approvalKey);

                        if (!hasBeenShown) {
                          setApprovalDetails(latestRequest);
                          setTimeout(() => {
                            setShowApprovalModal(true);
                          }, 1500); // Show after rejection modal if both exist
                        }
                      }
                    }
                  }
                } else {
                  console.log('Could not load approval requests');
                }
              } catch (approvalError) {
                console.error('Error loading approval requests:', approvalError);
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

  // Check for today's schedule on component mount
  useEffect(() => {
    const checkTodaySchedule = async () => {
      if (!user || user.userType !== 'doctor') return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/schedules/today', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data.schedule) {
            // Schedule exists for today
            setHasScheduleToday(true);
            // Update the doctor availability with today's schedule
            setDoctorAvailability(prev => ({
              ...prev,
              dailySchedule: {
                date: new Date().toISOString().split('T')[0],
                isActive: true,
                startTime: data.data.schedule.startTime,
                endTime: data.data.schedule.endTime
              }
            }));
            // Set hasSetAvailability to true since schedule exists
            setHasSetAvailability(true);
          } else {
            // No schedule set for today
            setHasScheduleToday(false);
            // Show the schedule setup modal after a brief delay only if no schedule exists
            setTimeout(() => {
              setShowScheduleSetupModal(true);
            }, 1000);
          }
        } else if (response.status === 404) {
          // No schedule found for today
          setHasScheduleToday(false);
          setHasSetAvailability(false);
          setTimeout(() => {
            setShowScheduleSetupModal(true);
          }, 1000);
        } else {
          console.error('Error checking today\'s schedule:', response.statusText);
          setHasScheduleToday(false);
          setHasSetAvailability(false);
        }
      } catch (error) {
        console.error('Error checking today\'s schedule:', error);
        setHasScheduleToday(false);
        setHasSetAvailability(false);
      }
    };

    // Only check schedule if user is loaded
    if (user && user.userType === 'doctor') {
      checkTodaySchedule();
    }
  }, [user]);

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

  // Save schedule state to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      saveScheduleStateToLocalStorage({
        scheduleExpired,
        scheduleJustStarted,
        hasSetAvailability,
        wasWithinSchedule
      });
    }
  }, [scheduleExpired, scheduleJustStarted, hasSetAvailability, wasWithinSchedule, user?.id]);

  // Monitor schedule expiry and automatic online/offline status
  useEffect(() => {
    // Only check if we have a schedule set and not already showing modal
    if (hasSetAvailability && doctorAvailability.dailySchedule?.endTime && !showScheduleExpiredModal) {
      const isExpired = checkScheduleExpiry();
      const withinSchedule = isWithinScheduledTime();
      
      console.log('Schedule monitoring check:', {
        hasSetAvailability,
        scheduleExpired,
        activeTab,
        isExpired,
        withinSchedule,
        isOnline,
        showExtensionPrompt,
        showScheduleExpiredModal,
        currentTime: new Date().toLocaleTimeString(),
        startTime: doctorAvailability.dailySchedule?.startTime,
        endTime: doctorAvailability.dailySchedule?.endTime
      });
      
      // Check if schedule just started (either time-based or transition-based)
      const justStarted = checkScheduleJustStarted();
      const justEnteredSchedule = !wasWithinSchedule && withinSchedule;
      
      // Only show start modal if schedule was just submitted and conditions are met
      if ((justStarted || justEnteredSchedule) && justSubmittedSchedule && !scheduleJustStarted && !showScheduleStartModal && !isOnline) {
        console.log('Schedule just started after submission - showing start modal', { justStarted, justEnteredSchedule });
        setScheduleJustStarted(true);
        setShowScheduleStartModal(true);
      }
      
      // Reset schedule just started flag when no longer at start time and not within schedule
      if (!justStarted && !withinSchedule && scheduleJustStarted) {
        setScheduleJustStarted(false);
      }
      
      // Update previous schedule status for transition detection
      setWasWithinSchedule(withinSchedule);
      
      // Automatically set offline if outside scheduled hours and currently online
      if (!withinSchedule && isOnline && !justSubmittedSchedule) {
        console.log('Outside scheduled hours - automatically going offline');
        setIsOnline(false);
        
        // Also update the availability in database
        const updatedAvailability = {
          ...doctorAvailability,
          isAvailable: false
        };
        setDoctorAvailability(updatedAvailability);
        saveAvailabilityToDatabase(updatedAvailability);
        
        if (!isExpired) {
          // Before scheduled time - only show info if not just submitted
          Swal.fire({
            title: 'Outside Scheduled Hours',
            text: `You are automatically offline. Your schedule starts at ${doctorAvailability.dailySchedule.startTime}.`,
            icon: 'info',
            confirmButtonColor: '#3b82f6'
          });
        }
      }
      
      // If schedule just expired and we haven't shown the modal yet
      // Only trigger automatically if this wasn't just submitted (submission logic handles this)
      if (isExpired && !scheduleExpired && !justSubmittedSchedule) {
        console.log('Schedule just expired - triggering modal and going offline');
        setScheduleExpired(true);
        setShowScheduleExpiredModal(true);
        
        // Automatically go offline when schedule expires
        setIsOnline(false);
        const updatedAvailability = {
          ...doctorAvailability,
          isAvailable: false
        };
        setDoctorAvailability(updatedAvailability);
        saveAvailabilityToDatabase(updatedAvailability);
      }
    }
  }, [currentTime, hasSetAvailability, doctorAvailability.dailySchedule?.endTime, doctorAvailability.dailySchedule?.startTime, showScheduleExpiredModal, scheduleExpired, isOnline, scheduleJustStarted, showScheduleStartModal, wasWithinSchedule, justSubmittedSchedule]);

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

  // Load upcoming schedules when tab is active
  useEffect(() => {
    if (activeTab === 'upcoming-schedules') {
      fetchUpcomingSchedules();
      fetchCompletedSchedules();
    }
  }, [activeTab]);

  // Fetch existing schedules when dates are selected
  useEffect(() => {
    if (selectedDates.length > 0) {
      fetchExistingSchedules(selectedDates);
    }
  }, [selectedDates]);

  // Load completed schedules and upcoming schedules on component mount for calendar display
  useEffect(() => {
    fetchCompletedSchedules();
    fetchUpcomingSchedules();
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
        // Clear schedule state before logging out
        clearScheduleStateFromLocalStorage();
        handleLogout(navigate);
      }
    });
  };

  // Updated sidebar items with Heroicons
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: HomeIcon, gradient: 'from-blue-500 to-blue-600' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDaysIcon, gradient: 'from-green-500 to-green-600' },
    { id: 'patients', label: 'Patients', icon: UsersIcon, gradient: 'from-purple-500 to-purple-600' },
    { id: 'upcoming-schedules', label: 'Set Schedules', icon: ClockIcon, gradient: 'from-emerald-500 to-emerald-600' },
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
      gender: 'Female',
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
      gender: 'Male',
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
      gender: 'Female',
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
      vitals: { bp: '140/90', hr: '78', temp: '98.6°F' }
    },
    {
      id: 'P12346',
      name: 'Michael Chen',
      age: 45,
      gender: 'Male',
      lastVisit: '2025-07-30',
      condition: 'Diabetes Type 2',
      vitals: { bp: '130/85', hr: '82', temp: '99.1°F' }
    },
    {
      id: 'P12347',
      name: 'Emily Davis',
      age: 32,
      gender: 'Female',
      lastVisit: '2025-08-01',
      condition: 'Allergic Dermatitis',
      vitals: { bp: '120/80', hr: '72', temp: '98.4°F' }
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
                        hasScheduleToday === false
                          ? 'bg-yellow-500/20 text-yellow-100'
                          : isOnline && doctorAvailability.dailySchedule.isActive 
                            ? 'bg-green-500/20 text-green-100' 
                            : 'bg-red-500/20 text-red-100'
                      }`}>
                        <div className={`w-3 h-3 rounded-full ${
                          hasScheduleToday === false
                            ? 'bg-yellow-300'
                            : isOnline && doctorAvailability.dailySchedule.isActive 
                              ? 'bg-green-300' 
                              : 'bg-red-300'
                        } animate-pulse`}></div>
                        <span className="text-sm font-medium">
                          {hasScheduleToday === false
                            ? 'Schedule Not Set'
                            : isOnline && doctorAvailability.dailySchedule.isActive 
                              ? 'Online & Available' 
                              : 'Offline'
                          }
                        </span>
                      </div>
                      <Button 
                        onClick={async () => {
                          if (hasScheduleToday === false) {
                            setShowScheduleSetupModal(true);
                          } else if (!isOnline) {
                            // Use the same enhanced validation as floating button
                            handleGoOnline();
                          } else {
                            // Going offline
                            handleGoOffline();
                          }
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/20 text-sm"
                        size="sm"
                      >
                        {hasScheduleToday === false
                          ? 'Set Schedule'
                          : isOnline 
                            ? 'Go Offline' 
                            : 'Go Online'
                        }
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
                      {hasScheduleToday === false ? (
                        <Button 
                          onClick={() => setShowScheduleSetupModal(true)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-white border-blue-300/30 text-xs sm:text-sm px-3 py-1 flex items-center space-x-1"
                          size="sm"
                        >
                          <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Set Schedule</span>
                          <span className="sm:hidden">Set</span>
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setActiveTab('availability')}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-white border-emerald-300/30 text-xs sm:text-sm px-3 py-1 flex items-center space-x-1"
                          size="sm"
                        >
                          <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 " />
                          <span className="hidden sm:inline">Update Schedule</span>
                          <span className="sm:hidden">Update</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 mt-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      {hasScheduleToday === true && doctorAvailability.dailySchedule.startTime && doctorAvailability.dailySchedule.endTime ? (
                        <div className="space-y-2">
                          <div className="text-white text-sm sm:text-base font-medium">
                            <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
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
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              isWithinScheduledTime() 
                                ? 'bg-blue-400 animate-pulse' 
                                : 'bg-gray-400'
                            }`}></div>
                            <span className={`text-xs ${
                              isWithinScheduledTime() 
                                ? 'text-blue-200' 
                                : 'text-gray-400'
                            }`}>
                              {isWithinScheduledTime() 
                                ? 'Can Go Online Now' 
                                : 'Outside Schedule Hours'
                              }
                            </span>
                          </div>
                        </div>
                      ) : hasScheduleToday === false ? (
                        <div className="space-y-2">
                          <div className="text-yellow-200 text-sm font-medium flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>No schedule set for today</span>
                          </div>
                          <div className="text-yellow-200/80 text-xs">
                            Set your daily schedule to start accepting patients
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-blue-200 text-sm font-medium flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                            <span>Checking today's schedule...</span>
                          </div>
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
                    <ChartBarIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {consultationFee.amount && consultationFee.amount > 0
                      ? `₹${consultationFee.amount}` 
                      : '--'
                    }
                  </div>
                  <div className="text-orange-100 text-xs sm:text-sm">Consultation Fee</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    {consultationFee.status === 'not_set' ? 'Not Set' :
                     consultationFee.status === 'pending' ? 'Pending Approval' :
                     consultationFee.status === 'approved' ? 'Active' :
                     consultationFee.status === 'rejected' ? 'Rejected' : 'Unknown'}
                  </div>
                  {consultationFee.status === 'not_set' && (
                    <Button
                      onClick={handleOpenConsultationFeeModal}
                      className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/20 text-xs px-3 py-1"
                      size="sm"
                    >
                      Set Fee
                    </Button>
                  )}
                  {consultationFee.amount > 0 && (
                    <Button
                      onClick={handleOpenConsultationFeeModal}
                      className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/20 text-xs px-3 py-1"
                      size="sm"
                    >
                      Update Fee
                    </Button>
                  )}
                  {consultationFee.status === 'rejected' && (
                    <Button
                      onClick={handleOpenConsultationFeeModal}
                      className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/20 text-xs px-3 py-1"
                      size="sm"
                    >
                      Resubmit
                    </Button>
                  )}
                </div>
              </Card>
            </div>

            {/* Quick Actions - Enhanced Responsive Design */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <PowerIcon className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
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
                <CalendarDaysIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                <span className="hidden sm:inline">Appointment Management</span>
                <span className="sm:hidden">Appointments</span>
              </h2>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                <PlusIcon className="mr-2 h-5 w-5" />
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
                <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-purple-600" />
                <span className="hidden sm:inline">Patient Profiles</span>
                <span className="sm:hidden">Patients</span>
              </h2>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-sm">
                <UserIcon className="w-4 h-4 mr-2" />
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
                    
                    // Check current time and schedule times
                    const currentTime = new Date();
                    const currentHours = currentTime.getHours();
                    const currentMinutes = currentTime.getMinutes();
                    const currentTotalMinutes = currentHours * 60 + currentMinutes;

                    const [startHour, startMinute] = updatedAvailability.dailySchedule.startTime.split(':').map(Number);
                    const [endHour, endMinute] = updatedAvailability.dailySchedule.endTime.split(':').map(Number);
                    const startTotalMinutes = startHour * 60 + startMinute;
                    const endTotalMinutes = endHour * 60 + endMinute;

                    // Determine schedule status
                    const isWithinSchedule = currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
                    const isAfterSchedule = currentTotalMinutes >= endTotalMinutes;
                    const isBeforeSchedule = currentTotalMinutes < startTotalMinutes;
                    
                    // Update local state first
                    setDoctorAvailability(updatedAvailability);
                    setIsOnline(true);
                    
                    // Save to both database collections
                    const saveResult = await saveBothToDatabase(
                      {
                        startTime: updatedAvailability.dailySchedule.startTime,
                        endTime: updatedAvailability.dailySchedule.endTime
                      },
                      updatedAvailability
                    );

                    if (!saveResult.success) {
                      throw new Error(saveResult.error);
                    }
                    
                    // Set that the doctor has now configured their availability
                    setHasSetAvailability(true);
                    setHasScheduleToday(true);
                    setJustSubmittedSchedule(true);
                    
                    // Reset schedule expiry flags when new schedule is set
                    setScheduleExpired(false);
                    setShowExtensionPrompt(false);
                    setShowScheduleExpiredModal(false);
                    
                    // Show success message first
                    await Swal.fire({
                      title: 'Success!',
                      text: 'Your availability schedule has been saved successfully.',
                      icon: 'success',
                      confirmButtonColor: '#10b981',
                      timer: 1500,
                      showConfirmButton: false
                    });

                    // Now show appropriate modal based on current time vs schedule
                    if (isWithinSchedule) {
                      // Currently within schedule time - show "Schedule Started" modal
                      setShowScheduleStartModal(true);
                    } else if (isAfterSchedule) {
                      // Current time is after schedule end - show "Schedule Ended" modal
                      setShowScheduleExpiredModal(true);
                    } else {
                      // Before schedule time - just redirect to overview
                      setActiveTab('overview');
                    }
                    
                    // Reset the just submitted flag after a delay
                    setTimeout(() => {
                      setJustSubmittedSchedule(false);
                    }, 3000);
                    
                  } catch (error) {
                    console.error('Error saving availability and schedule:', error);
                    
                    // Rollback local state if database save failed
                    setDoctorAvailability(prev => ({
                      ...prev,
                      isAvailable: false,
                      dailySchedule: {
                        ...prev.dailySchedule,
                        isActive: false
                      }
                    }));
                    setIsOnline(false);
                    setJustSubmittedSchedule(false);
                    
                    Swal.fire({
                      title: 'Error!',
                      text: error.message || 'Failed to save availability and schedule details. Please try again.',
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
                <CpuChipIcon className="mr-3 h-8 w-8 text-purple-600" />
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
                      <CpuChipIcon className="mr-2 h-5 w-5" />
                      Generate AI Analysis
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">AI Suggestions</h3>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <ComputerDesktopIcon className="mr-2 h-5 w-5 text-blue-600" />
                      AI Analysis Result:
                    </h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Based on the symptoms provided, the AI suggests consideration of:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        <span>Viral Upper Respiratory Infection (85% confidence)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-yellow-500">?</span>
                        <span>Allergic Rhinitis (15% confidence)</span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-700 flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        This is AI-generated suggestion only. Please use your professional judgment for final diagnosis.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <ArchiveBoxIcon className="mr-2 h-5 w-5" />
                    Save Analysis
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
                <BeakerIcon className="mr-3 h-8 w-8 text-green-600" />
                E-Prescription Generator
              </h2>
              <Button 
                onClick={() => setShowPrescriptionModal(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
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
                      <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                        <ComputerDesktopIcon className="mr-2 h-5 w-5 text-blue-600" />
                        AI Suggestions:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <span>Amoxicillin 500mg - Common for respiratory infections</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          <span>Ibuprofen 400mg - For pain and inflammation</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      <ArchiveBoxIcon className="mr-2 h-5 w-5" />
                      Generate & Send Prescription
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
                <ChatBubbleLeftIcon className="mr-3 h-8 w-8 text-blue-600" />
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
                        <ChatBubbleLeftIcon className="h-8 w-8 sm:h-10 sm:w-10 mb-2 text-blue-600" />
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

      case 'upcoming-schedules':
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                  <ClockIcon className="w-8 h-8 mr-3 text-emerald-600" />
                  Set Your Schedules
                </h2>
                <p className="text-gray-600 mt-2">Manage your upcoming availability and work schedules</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  {selectedDates.length} Date{selectedDates.length !== 1 ? 's' : ''} Selected
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <LightBulbIcon className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">How to set your schedules:</h3>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>• Select dates on the calendar to create schedules</li>
                      <li>• Choose to use the same times for all dates or set custom times for each day</li>
                      <li>• Green dots indicate dates that already have schedules</li>
                      <li>• Purple dots indicate completed schedules from the past</li>
                      <li>• You can overwrite existing schedules by selecting those dates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Calendar Section */}
              <div className="xl:col-span-2">
                <Card className="bg-white shadow-xl border-0">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <CalendarDaysIcon className="w-6 h-6 mr-2 text-blue-500" />
                      Select Dates
                    </h3>
                    <Calendar
                      selectedDates={selectedDates}
                      onDateSelect={handleDateSelect}
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days from now
                      multiSelect={true}
                      existingSchedules={existingSchedules}
                      completedSchedules={completedSchedules}
                    />
                  </div>
                </Card>
              </div>

              {/* Schedule Configuration Section */}
              <div className="space-y-6">
                <Card className="bg-white shadow-xl border-0">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Cog6ToothIcon className="w-6 h-6 mr-2 text-green-500" />
                      Configure Times
                    </h3>

                    {/* Schedule Mode Selection */}
                    <div className="space-y-4 mb-6">
                      <label className="text-sm font-medium text-gray-700">Schedule Mode</label>
                      <div className="space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="scheduleMode"
                            value="same"
                            checked={scheduleMode === 'same'}
                            onChange={(e) => handleScheduleModeChange(e.target.value)}
                            className="mt-0.5 w-4 h-4 text-blue-600"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Same times for all dates</span>
                            <p className="text-xs text-gray-500 mt-1">Apply identical schedule to all selected dates</p>
                          </div>
                        </label>
                        <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="scheduleMode"
                            value="custom"
                            checked={scheduleMode === 'custom'}
                            onChange={(e) => handleScheduleModeChange(e.target.value)}
                            className="mt-0.5 w-4 h-4 text-blue-600"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Custom times for each date</span>
                            <p className="text-xs text-gray-500 mt-1">Set individual times for each selected date</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Default Times - Only show when same mode is selected */}
                    {scheduleMode === 'same' && (
                      <div className="space-y-4 mb-6">
                        <label className="text-sm font-medium text-gray-700">
                          Schedule Times
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={defaultTimes.startTime}
                              onChange={(e) => handleDefaultTimesChange('startTime', e.target.value)}
                              className={getTimeInputStyling(defaultTimes.startTime, defaultTimes.endTime, false)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">End Time</label>
                            <input
                              type="time"
                              value={defaultTimes.endTime}
                              onChange={(e) => handleDefaultTimesChange('endTime', e.target.value)}
                              className={getTimeInputStyling(defaultTimes.startTime, defaultTimes.endTime, true)}
                            />
                          </div>
                        </div>
                        {getTimeValidationMessage(defaultTimes.startTime, defaultTimes.endTime) && (
                          <div className="text-red-600 text-xs mt-2 flex items-center">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            {getTimeValidationMessage(defaultTimes.startTime, defaultTimes.endTime)}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Custom Times for Each Date - Inline */}
                    {scheduleMode === 'custom' && selectedDates.length > 0 && (
                      <div className="space-y-4 mb-6">
                        <label className="text-sm font-medium text-gray-700 flex items-center">
                          <ClockIcon className="w-4 h-4 mr-2 text-purple-500" />
                          Custom Times for Each Date
                        </label>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {selectedDates.map((date, index) => {
                            const dateStr = typeof date === 'string' ? date : formatDateString(new Date(date));
                            const customSchedule = customSchedules[dateStr] || { startTime: defaultTimes.startTime, endTime: defaultTimes.endTime };
                            
                            return (
                              <div key={dateStr} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="text-sm font-semibold text-gray-900 mb-3">
                                  {new Date(dateStr).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                                    <input
                                      type="time"
                                      value={customSchedule.startTime}
                                      onChange={(e) => handleCustomScheduleChange(dateStr, 'startTime', e.target.value)}
                                      className={getTimeInputStyling(customSchedule.startTime, customSchedule.endTime, false)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                                    <input
                                      type="time"
                                      value={customSchedule.endTime}
                                      onChange={(e) => handleCustomScheduleChange(dateStr, 'endTime', e.target.value)}
                                      className={getTimeInputStyling(customSchedule.startTime, customSchedule.endTime, true)}
                                    />
                                  </div>
                                </div>
                                {getTimeValidationMessage(customSchedule.startTime, customSchedule.endTime) && (
                                  <div className="text-red-600 text-xs mt-2 flex items-center">
                                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                                    {getTimeValidationMessage(customSchedule.startTime, customSchedule.endTime)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Selected Dates Summary */}
                    {selectedDates.length > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="text-sm font-medium text-emerald-800 mb-2">
                          Selected Dates ({selectedDates.length})
                        </div>
                        <div className="text-xs text-emerald-600 space-y-1 max-h-24 overflow-y-auto">
                          {selectedDates.slice(0, 8).map((date, index) => {
                            const dateStr = typeof date === 'string' ? date : formatDateString(new Date(date));
                            return (
                              <div key={dateStr} className="flex justify-between items-center">
                                <span>
                                  {new Date(dateStr).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                {existingSchedules[dateStr] && (
                                  <span className="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded-full">
                                    Has Schedule
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {selectedDates.length > 8 && (
                            <div className="text-emerald-500 text-center pt-1 border-t border-emerald-200">
                              ... and {selectedDates.length - 8} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-6">
                      <Button
                        onClick={handleSaveUpcomingSchedules}
                        disabled={scheduleLoading || selectedDates.length === 0}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        {scheduleLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Saving Schedules...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Save {selectedDates.length} Schedule{selectedDates.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Current Upcoming Schedules */}
            {upcomingSchedules.length > 0 && (
              <Card className="bg-white shadow-xl border-0">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <ArchiveBoxIcon className="w-6 h-6 mr-2 text-purple-500" />
                    Current Upcoming Schedules
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
                    {upcomingSchedules.map((schedule) => (
                      <div key={schedule._id} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {new Date(schedule.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <button
                            onClick={() => handleDeleteUpcomingSchedule(schedule._id, new Date(schedule.date).toLocaleDateString())}
                            className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete schedule"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-3 h-3" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Active
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      default:
        return (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-16 w-16 mb-4 text-yellow-600" />
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
                      ${activeTab === item.id
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-green-700 shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-blue-600 rounded-r-full" />
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      p-2 rounded-lg mr-3 transition-all duration-200
                      ${activeTab === item.id
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
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                <UserIcon className="h-10 w-10" />
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
                <BeakerIcon className="mr-2 h-5 w-5" />
                Write Prescription
              </Button>
              <Button variant="outline">
                <ChartBarIcon className="mr-2 h-5 w-5" />
                View Vitals History
              </Button>
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
              <BeakerIcon className="mr-2 h-5 w-5" />
              Generate Prescription
            </Button>
            <Button variant="outline" onClick={() => setShowPrescriptionModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40 lg:hidden">
          <div className="grid grid-cols-6 gap-1 px-2 py-2">
            {sidebarItems.slice(0, 6).map((item) => {
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
                    transition-all duration-200 min-h-[60px] relative
                    ${activeTab === item.id
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className={`w-5 h-5 mb-1 ${activeTab === item.id ? 'text-green-600' : 'text-gray-500'}`} />
                  <span className={`text-xs font-medium truncate ${activeTab === item.id ? 'text-green-600' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  {activeTab === item.id && (
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
          if (!isOnline) {
            // Use the enhanced handleGoOnline function which includes schedule validation
            handleGoOnline();
          } else {
            // Going offline
            handleGoOffline();
          }
        }}
        className={`
          fixed w-14 h-14 sm:w-16 sm:h-16 ${
            isOnline 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
              : hasSetAvailability && isWithinScheduledTime()
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse'
                : hasSetAvailability 
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
          } text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 
          flex items-center justify-center transform hover:scale-110 
          ${isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'}
          z-50 ${
            !isOnline && hasSetAvailability && !isWithinScheduledTime() 
              ? 'opacity-60 cursor-not-allowed' 
              : ''
          }
        `}
        title={
          isOnline 
            ? 'Go Offline' 
            : hasSetAvailability 
              ? isWithinScheduledTime()
                ? 'Go Online (Schedule Active)'
                : `Schedule: ${doctorAvailability.dailySchedule?.startTime} - ${doctorAvailability.dailySchedule?.endTime}`
              : 'Set Schedule First'
        }
      >
        <PowerIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${isOnline ? 'text-white' : 'text-white'}`} />
      </button>

      
      {/* Schedule Expired Modal */}
      {console.log('Rendering modal check:', showScheduleExpiredModal)}
      {showScheduleExpiredModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 transform animate-in fade-in zoom-in duration-500"
               onClick={(e) => e.stopPropagation()}>
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
                <LightBulbIcon className="mr-2 h-5 w-5 text-blue-600" />
                You can always adjust your schedule in the Availability section
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Start Modal */}
      {showScheduleStartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-in fade-in zoom-in duration-500"
               onClick={(e) => e.stopPropagation()}>
            {/* Header with animated icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <ClockIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <CheckCircleIcon className="mr-3 h-8 w-8 text-green-600" />
                Schedule Started!
              </h2>
              <p className="text-gray-600">
                Your scheduled availability period has begun. You can now go online to start accepting appointments.
              </p>
            </div>

            {/* Schedule info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-green-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Today's Schedule</p>
                <p className="text-lg font-bold text-gray-900">
                  {doctorAvailability.dailySchedule?.startTime} - {doctorAvailability.dailySchedule?.endTime}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={async () => {
                  setShowScheduleStartModal(false);
                  setJustSubmittedSchedule(false);
                  // Go online immediately
                  handleGoOnline();
                  // Navigate to overview
                  setActiveTab('overview');
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 py-4 text-lg font-semibold transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  <PowerIcon className="w-5 h-5 mr-3" />
                  <span>Go Online Now</span>
                </div>
              </Button>
              
              <Button
                onClick={() => {
                  setShowScheduleStartModal(false);
                  setJustSubmittedSchedule(false);
                  setActiveTab('overview');
                }}
                variant="outline"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-[1.02] py-4 text-lg font-semibold"
              >
                <span>Dismiss</span>
              </Button>
            </div>
            
            {/* Info note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <p className="text-sm text-blue-700 text-center font-medium">
                <SparklesIcon className="mr-2 h-5 w-5 text-green-600" />
                Your patients can now see you're available for appointments
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Fee Modal */}
      <Modal 
        isOpen={showConsultationFeeModal}
        onClose={() => setShowConsultationFeeModal(false)}
        title={consultationFee.amount > 0 ? "Update Consultation Fee" : "Set Consultation Fee"}
        size="md"
        backgroundBlur={true}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {consultationFee.amount > 0 ? 'Update Your Consultation Fee' : 'Set Your Consultation Fee'}
            </h3>
            <p className="text-sm text-gray-600">
              {consultationFee.amount > 0
                ? 'Update your consultation fee per patient. Changes will be submitted to the admin for approval.'
                : 'Please set your consultation fee per patient. This will be submitted to the admin for approval.'
              }
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                <span className="text-gray-700 font-medium">INR (₹)</span>
                <span className="ml-2 text-sm text-gray-500">- Indian Rupee</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fee Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={feeAmount}
                  onChange={handleFeeAmountChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the amount you charge per consultation
              </p>
            </div>
              
            {feeValidationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  {feeValidationError}
                </p>
              </div>
            )}

            {consultationFee.status === 'rejected' && consultationFee.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Previous submission was rejected:
                </p>
                <p className="text-sm text-red-700">
                  {consultationFee.rejectionReason}
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Approval Required
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your consultation fee will be reviewed by admin before being activated. You'll be notified once approved.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleSkipConsultationFee}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSubmitConsultationFee}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Submit for Approval
            </Button>
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

      {/* Rejection Notification Modal */}
      <Modal 
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          // Mark this rejection as shown so it doesn't appear again
          if (rejectionDetails) {
            localStorage.setItem(`rejection_shown_${rejectionDetails._id}`, 'true');
          }
        }}
        title="Consultation Fee Request Rejected"
        size="md"
        backgroundBlur={true}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Consultation Fee Request Was Rejected
            </h3>
            <p className="text-sm text-gray-600">
              The admin has reviewed your consultation fee request and provided feedback for improvement.
            </p>
          </div>

          {rejectionDetails && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Request Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Amount:</span> ₹{rejectionDetails.requestData?.amount}</p>
                  <p><span className="font-medium">Currency:</span> {rejectionDetails.requestData?.currency}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(rejectionDetails.submittedAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Processed:</span> {new Date(rejectionDetails.processedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {rejectionDetails.reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Admin's Feedback:</h4>
                  <p className="text-sm text-red-700">{rejectionDetails.reason}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => {
                setShowRejectionModal(false);
                if (rejectionDetails) {
                  localStorage.setItem(`rejection_shown_${rejectionDetails._id}`, 'true');
                }
                // Open the consultation fee modal to resubmit
                handleOpenConsultationFeeModal();
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit New Request
            </Button>
            <Button
              onClick={() => {
                setShowRejectionModal(false);
                if (rejectionDetails) {
                  localStorage.setItem(`rejection_shown_${rejectionDetails._id}`, 'true');
                }
              }}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approval Notification Modal */}
      <Modal 
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          // Mark this approval as shown so it doesn't appear again
          if (approvalDetails) {
            localStorage.setItem(`approval_shown_${approvalDetails._id}`, 'true');
          }
        }}
        title="Consultation Fee Request Approved!"
        icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />}
        size="md"
        backgroundBlur={true}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Congratulations! Your Request is Approved
            </h3>
            <p className="text-sm text-gray-600">
              Your consultation fee has been approved by the admin and is now active in your profile.
            </p>
          </div>

          {approvalDetails && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Approved Details:</h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p><span className="font-medium">Amount:</span> ₹{approvalDetails.requestData?.amount}</p>
                  <p><span className="font-medium">Currency:</span> {approvalDetails.requestData?.currency}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(approvalDetails.submittedAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Approved:</span> {new Date(approvalDetails.processedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">What's Next?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your consultation fee is now visible to patients when they book appointments with you. 
                      You can update this fee anytime from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              onClick={() => {
                setShowApprovalModal(false);
                if (approvalDetails) {
                  localStorage.setItem(`approval_shown_${approvalDetails._id}`, 'true');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              Got it, Thanks!
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Setup Modal */}
      <Modal 
        isOpen={showScheduleSetupModal && hasScheduleToday === false}
        onClose={handleSkipScheduleSetup}
        title="Set Your Daily Schedule"
        size="md"
        backgroundBlur={true}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Set Your Schedule for Today
            </h3>
            <p className="text-sm text-gray-600">
              Please set your availability schedule for today to start accepting patients. 
              You can update this anytime during the day.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={scheduleSetup.startTime}
                onChange={(e) => handleScheduleSetupChange('startTime', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={scheduleSetup.endTime}
                onChange={(e) => handleScheduleSetupChange('endTime', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {scheduleSetupError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{scheduleSetupError}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClockIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Schedule Guidelines:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Minimum schedule duration: 1 hour</li>
                    <li>• You'll automatically go offline after end time</li>
                    <li>• You can extend your schedule anytime during the day</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleSkipScheduleSetup}
              className="bg-gray-500 hover:bg-gray-600 text-white flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSubmitScheduleSetup}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              disabled={!scheduleSetup.startTime || !scheduleSetup.endTime}
            >
              Set Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* Go Online Confirmation Modal */}
      <Modal 
        isOpen={showGoOnlineModal}
        onClose={handleGoOnlineCancel}
        title={goOnlineModalData.title}
        size="md"
        backgroundBlur={true}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <PowerIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Go Online?
            </h3>
            <p className="text-sm text-gray-600">
              {goOnlineModalData.message}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse mt-0.5"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">
                  <strong>Going Online Means:</strong>
                </p>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• Patients can see you're available</li>
                  <li>• You'll start receiving appointment requests</li>
                  <li>• Your status will show as "Online & Available"</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleGoOnlineCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white flex-1"
            >
              Stay Offline
            </Button>
            <Button
              onClick={handleGoOnlineConfirm}
              className="bg-green-600 hover:bg-green-700 text-white flex-1 flex items-center justify-center space-x-2"
            >
              <PowerIcon className="w-4 h-4" />
              <span>Go Online Now</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


export default DoctorDashboard;
