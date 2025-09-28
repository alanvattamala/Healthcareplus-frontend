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
  ChartBarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  BeakerIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  PhoneIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  VideoCameraIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! I'm your health assistant. How can I help you today?", sender: 'bot', time: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    bloodSugar: '',
    heartRate: '',
    temperature: ''
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState(null);
  const [user, setUser] = useState(null);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    reason: '',
    type: 'consultation'
  });
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [scheduledDates, setScheduledDates] = useState([]);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);
  const [selectedDateDoctors, setSelectedDateDoctors] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isLoadingDateDoctors, setIsLoadingDateDoctors] = useState(false);
  const [dateDoctorsError, setDateDoctorsError] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Filter and search state for selected date doctors
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, specialty, slots
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'Appointment Reminder',
      message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 10:30 AM',
      time: '5 minutes ago',
      type: 'appointment',
      unread: true
    },
    {
      id: 2,
      title: 'Lab Results Available',
      message: 'Your recent blood test results are now available in your medical records',
      time: '2 hours ago',
      type: 'results',
      unread: true
    },
    {
      id: 3,
      title: 'Medication Reminder',
      message: 'Time to take your evening medication - Lisinopril 10mg',
      time: '4 hours ago',
      type: 'medication',
      unread: false
    },
    {
      id: 4,
      title: 'Health Tip',
      message: 'Remember to stay hydrated! Aim for 8 glasses of water today.',
      time: '1 day ago',
      type: 'tip',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(notification => notification.unread).length;

  // Doctor filtering and search functions
  const getUniqueSpecialties = () => {
    const specialties = selectedDateDoctors.map(doctor => doctor.specialty);
    return [...new Set(specialties)].sort();
  };

  const getFilteredDoctors = () => {
    let filtered = selectedDateDoctors.filter(doctor => {
      const matchesSearch = doctorSearchTerm === '' || 
        doctor.name.toLowerCase().includes(doctorSearchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(doctorSearchTerm.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === '' || 
        doctor.specialty === selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'specialty':
          return a.specialty.localeCompare(b.specialty);
        case 'slots':
          return (b.availableTimes?.length || 0) - (a.availableTimes?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getDisplayDoctors = () => {
    const filtered = getFilteredDoctors();
    return showAllDoctors ? filtered : filtered.slice(0, 3);
  };

  const clearFilters = () => {
    setDoctorSearchTerm('');
    setSelectedSpecialty('');
    setSortBy('name');
  };

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Helper functions
  const getNextAvailableSlot = (scheduleInfo, availability) => {
    // Prefer schedule info if available, otherwise fall back to availability
    let startTime, isActive;
    
    if (scheduleInfo && scheduleInfo.isActive) {
      startTime = scheduleInfo.startTime;
      isActive = scheduleInfo.isActive;
    } else if (availability?.dailySchedule?.isActive) {
      startTime = availability.dailySchedule.startTime;
      isActive = availability.dailySchedule.isActive;
    } else {
      return 'Not available today';
    }
    
    if (!isActive || !startTime) {
      return 'Not available today';
    }
    
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (currentTime < startTime) {
      return `Today ${startTime}`;
    } else {
      return `Tomorrow ${startTime}`;
    }
  };

  const getWorkingHours = (scheduleInfo, availability) => {
    // Prefer schedule info if available, otherwise fall back to availability
    let startTime, endTime, isActive;
    
    if (scheduleInfo && scheduleInfo.isActive) {
      startTime = scheduleInfo.startTime;
      endTime = scheduleInfo.endTime;
      isActive = scheduleInfo.isActive;
    } else if (availability?.dailySchedule?.isActive) {
      startTime = availability.dailySchedule.startTime;
      endTime = availability.dailySchedule.endTime;
      isActive = availability.dailySchedule.isActive;
    } else {
      return { today: 'Unavailable' };
    }
    
    if (!isActive || !startTime || !endTime) {
      return { today: 'Unavailable' };
    }
    
    return {
      today: `${startTime} - ${endTime}`,
      tomorrow: `${startTime} - ${endTime}` // For demo
    };
  };

  // Fetch scheduled appointments from database
  const fetchScheduledAppointments = async () => {
    setIsLoadingSchedules(true);
    try {
      // TODO: Implement proper patient appointments endpoint
      // Currently using placeholder data until appointment system is ready
      console.log('Fetching scheduled appointments - using placeholder data');

      // Placeholder appointments data
      const placeholderAppointments = [
        {
          id: 1,
          doctor: 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          date: '2024-09-28',
          time: '10:00 AM',
          type: 'In-person',
          avatar: null,
          rating: 4.8,
          status: 'scheduled'
        },
        {
          id: 2,
          doctor: 'Dr. Michael Chen',
          specialty: 'Neurologist',
          date: '2024-09-30',
          time: '2:00 PM',
          type: 'Video Call',
          avatar: null,
          rating: 4.9,
          status: 'scheduled'
        }
      ];

      setUpcomingAppointments(placeholderAppointments);

      const placeholderSchedules = placeholderAppointments.map(appt => ({
        date: appt.date,
        hasSchedule: true,
        doctorId: appt.id,
        doctorName: appt.doctor,
        time: appt.time,
        times: [appt.time],
        status: appt.status
      }));

      setScheduledDates(placeholderSchedules);
    } catch (error) {
      console.error('Error with appointments:', error);
      setScheduledDates([]);
      setUpcomingAppointments([]);
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // Fetch doctors available for a specific date
  const fetchDoctorsForDate = async (dateString) => {
    setIsLoadingDateDoctors(true);
    setDateDoctorsError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/users/doctors/available-for-date?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Doctors for date response:', data);

      const doctors = data.data?.doctors || [];
      const formattedDoctors = doctors.map((doctor, index) => {
        const scheduleInfo = doctor.scheduleInfo || {};
        
        return {
          id: doctor._id,
          name: `Dr. ${doctor.firstName || 'Unknown'} ${doctor.lastName || 'Doctor'}`,
          specialty: doctor.specialization || 'General Practice',
          rating: 4.5 + (Math.random() * 0.4),
          availableTimes: scheduleInfo.availableSlots || [],
          totalSlots: scheduleInfo.totalSlots || 0,
          isAvailableOnDate: doctor.isAvailableOnDate || false,
          color: ['from-pink-500 to-rose-500', 'from-blue-500 to-indigo-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-violet-500'][index % 4],
          email: doctor.email,
          phone: doctor.phone || 'Not provided',
          experience: doctor.experience || '5+ years',
          consultationFee: doctor.consultationFee || 'Contact for pricing',
          workingHours: doctor.workingHoursForDate || 'Not available',
          scheduleDetails: {
            date: scheduleInfo.date,
            startTime: scheduleInfo.startTime,
            endTime: scheduleInfo.endTime,
            isActive: scheduleInfo.isActive
          },
          bio: `Experienced ${doctor.specialization || 'healthcare professional'} available for consultations.`,
          avatar: doctor.profileImage || null,
          status: data.isToday && scheduleInfo.startTime ? 'Available today' : 'Available on selected date'
        };
      });

      setSelectedDateDoctors(formattedDoctors);
      console.log(`Found ${formattedDoctors.length} doctors available for ${dateString}`);
    } catch (error) {
      console.error('Error fetching doctors for date:', error);
      setDateDoctorsError(error.message || 'Failed to load doctors for this date');
      setSelectedDateDoctors([]);
    } finally {
      setIsLoadingDateDoctors(false);
    }
  };

  const loadAvailableDoctors = async () => {
    try {
      setIsDoctorsLoading(true);
      setDoctorsError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch doctors from schedules collection using available doctors endpoint
      const response = await fetch('http://localhost:3001/api/users/doctors/available-daily', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Available doctors API response:', data); // Debug log
      
      const doctors = data.data?.doctors || [];
      console.log('Extracted doctors:', doctors); // Debug log
      
      if (!Array.isArray(doctors)) {
        throw new Error('Invalid data format received from server');
      }
      
      // Format doctors data for the UI
      const formattedDoctors = doctors.map((doctor, index) => {
        const availability = doctor.dailyAvailabilityInfo || {};
        const schedule = availability.todaySchedule || {};
        
        return {
          id: doctor._id,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialty: doctor.specialization || 'General Practice',
          rating: 4.5 + (Math.random() * 0.4), // Mock rating
          nextAvailable: availability.nextAvailableSlot || 'Check schedule',
          color: ['from-pink-500 to-rose-500', 'from-blue-500 to-indigo-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-violet-500'][index % 4],
          isAvailable: availability.isCurrentlyAvailable || true,
          availability: [schedule.startTime, schedule.endTime].filter(Boolean),
          currentSchedule: {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            status: 'available'
          },
          workingHours: {
            today: schedule.startTime && schedule.endTime ? 
              `${schedule.startTime} - ${schedule.endTime}` : 'Not available',
            general: schedule.startTime && schedule.endTime ? 
              `${schedule.startTime} - ${schedule.endTime}` : 'Flexible hours'
          },
          experience: `${Math.floor(Math.random() * 15) + 5} years`,
          email: doctor.email,
          phone: doctor.phone || 'Not provided',
          consultationFee: doctor.consultationFee || Math.floor(Math.random() * 50) + 50,
          bio: `Experienced ${doctor.specialization || 'healthcare professional'} with expertise in providing quality medical care.`,
          avatar: null, // Remove default emoji
          status: availability.isCurrentlyAvailable ? 'online' : 'offline',
          breakTime: availability.breakTime,
          specialNotes: availability.specialNotes || ''
        };
      });
      
      setAvailableDoctors(formattedDoctors);
      console.log('Formatted doctors:', formattedDoctors);
      
    } catch (error) {
      console.error('Error loading doctors from schedules:', error);
      setDoctorsError(error.message);
      setAvailableDoctors([]);
    } finally {
      setIsDoctorsLoading(false);
    }
  };

  // Check authentication and role on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated and has patient role
        const userData = checkAuthAndRedirect(navigate);
        
        if (!userData) {
          setIsLoading(false);
          return;
        }

        // Verify user has patient role
        if (!requireRole(navigate, 'patient')) {
          setIsLoading(false);
          return;
        }

        // For demo purposes, create mock patient data if none exists or if role is missing
        let patientData = userData;
        if (!patientData.role) {
          patientData = {
            ...userData,
            id: '12345',
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'patient'
          };
          
          // Update localStorage with role
          localStorage.setItem('user', JSON.stringify(patientData));
          localStorage.setItem('token', 'demo-patient-token-123');
        }
        
        setUser(patientData);
        
        // Load available doctors and scheduled appointments
        await loadAvailableDoctors();
        await fetchScheduledAppointments();
        
        // Load today's doctor availability by default
        const today = new Date();
        const todayString = formatDateString(today);
        await fetchDoctorsForDate(todayString);
        
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

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle escape key for floating menu
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowQuickActions(false);
      }
    };

    if (showQuickActions) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [showQuickActions]);

  // Reset view when filters change
  useEffect(() => {
    setShowAllDoctors(false);
  }, [doctorSearchTerm, selectedSpecialty]);

  // Reset filters when date changes
  useEffect(() => {
    clearFilters();
    setShowAllDoctors(false);
  }, [selectedDate]);

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

  // Enhanced mock data with more details - will be replaced by database data
  // const upcomingAppointments will be populated from scheduledDates state

  const recentPrescriptions = [
    { 
      id: 1, 
      doctor: 'Dr. Sarah Johnson', 
      medication: 'Lisinopril 10mg', 
      date: '2025-07-28', 
      status: 'Active',
      dosage: 'Once daily',
      refills: 2
    },
    { 
      id: 2, 
      doctor: 'Dr. Michael Chen', 
      medication: 'Metformin 500mg', 
      date: '2025-07-25', 
      status: 'Completed',
      dosage: 'Twice daily',
      refills: 0
    }
  ];

  const healthTips = [
    { 
      id: 1, 
      title: 'Stay Hydrated', 
      content: 'Drink at least 8 glasses of water daily for optimal health and better circulation.',
      category: 'Wellness',
      icon: 'water',
      readTime: '2 min read'
    },
    { 
      id: 2, 
      title: 'Regular Exercise', 
      content: '30 minutes of moderate exercise can improve your cardiovascular health significantly.',
      category: 'Fitness',
      icon: 'fitness',
      readTime: '3 min read'
    },
    { 
      id: 3, 
      title: 'Balanced Diet', 
      content: 'Include fruits, vegetables, and whole grains in your daily meals for better nutrition.',
      category: 'Nutrition',
      icon: 'nutrition',
      readTime: '4 min read'
    }
  ];

  const vitalsTrends = [
    { metric: 'Blood Pressure', value: '120/80', status: 'normal', trend: 'stable', color: 'green' },
    { metric: 'Heart Rate', value: '72 bpm', status: 'normal', trend: 'stable', color: 'blue' },
    { metric: 'Blood Sugar', value: '95 mg/dL', status: 'normal', trend: 'improving', color: 'green' },
    { metric: 'Temperature', value: '98.6°F', status: 'normal', trend: 'stable', color: 'blue' }
  ];

  // Filter doctors from schedules collection (all are available for booking)
  const getAvailableDoctors = () => {
    // Since we're fetching from schedules, all doctors have active schedules and are bookable
    return availableDoctors.filter(doctor => {
      // Show all doctors from schedules collection as they all have active schedules
      return doctor.currentSchedule && doctor.schedules && doctor.schedules.length > 0;
    });
  };

  // Function to handle booking appointment
  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
    // Reset appointment data
    setAppointmentData({
      date: '',
      time: '',
      reason: '',
      type: 'consultation'
    });
  };

  // Function to submit appointment booking
  const submitAppointmentBooking = async () => {
    if (!selectedDoctor || !appointmentData.date || !appointmentData.time || !appointmentData.reason) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: appointmentData.date,
          time: appointmentData.time,
          reason: appointmentData.reason,
          type: appointmentData.type
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShowBookingModal(false);
        Swal.fire({
          title: 'Appointment Booked!',
          text: `Your appointment with ${selectedDoctor.name} has been scheduled for ${appointmentData.date} at ${appointmentData.time}.`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        
        // Refresh available doctors or appointments list
        loadAvailableDoctors();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Swal.fire({
        title: 'Booking Failed',
        text: error.message || 'Failed to book appointment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const generateTimeSlots = (schedule) => {
    if (!schedule || !schedule.startTime || !schedule.endTime) {
      return [];
    }

    const slots = [];
    const startTime = schedule.startTime; // e.g., "09:00"
    const endTime = schedule.endTime; // e.g., "17:00"
    const breakStart = schedule.breakStart || "12:00";
    const breakEnd = schedule.breakEnd || "13:00";

    // Convert time string to minutes
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Convert minutes to time string
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const breakStartMinutes = timeToMinutes(breakStart);
    const breakEndMinutes = timeToMinutes(breakEnd);

    // Generate 30-minute slots
    for (let time = startMinutes; time < endMinutes; time += 30) {
      // Skip break time
      if (time >= breakStartMinutes && time < breakEndMinutes) {
        continue;
      }

      const timeString = minutesToTime(time);
      const endTimeString = minutesToTime(time + 30);
      
      slots.push({
        value: timeString,
        label: `${timeString} - ${endTimeString}`
      });
    }

    return slots;
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateString = (date) => {
    // Use local date values to avoid timezone conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateScheduled = (dateString) => {
    return scheduledDates.some(schedule => schedule.date === dateString);
  };

  const getSchedulesForDate = (dateString) => {
    return scheduledDates.filter(schedule => schedule.date === dateString);
  };

  const handleDateClick = async (date) => {
    // Check if clicking the same date - if so, unselect and go back to today
    if (date.toDateString() === selectedDate.toDateString()) {
      const today = new Date();
      // Set time to start of day to ensure consistent date comparison
      today.setHours(0, 0, 0, 0);
      setSelectedDate(today);
      const todayString = formatDateString(today);
      const todaySchedules = getSchedulesForDate(todayString);
      setSelectedDateSchedules(todaySchedules);
      
      // Fetch doctors available for today
      await fetchDoctorsForDate(todayString);
      return;
    }

    // Select the new date
    setSelectedDate(date);
    const dateString = formatDateString(date);
    const schedules = getSchedulesForDate(dateString);
    setSelectedDateSchedules(schedules);
    
    // Fetch doctors available for this date without showing alerts
    await fetchDoctorsForDate(dateString);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarMonth);
    const today = new Date();
    // Set time to start of day to ensure consistent date comparison
    today.setHours(0, 0, 0, 0);
    
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Day headers
    const dayHeaders = dayNames.map(day => (
      <div key={day} className="text-xs font-semibold text-gray-500 p-2 text-center">
        {day}
      </div>
    ));

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
      const dateString = formatDateString(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const hasSchedule = isDateScheduled(dateString);
      const isPast = date < today && !isToday;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isPast}
          className={`
            relative p-2 text-sm font-medium rounded-lg transition-all duration-200 
            hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isToday ? 'bg-blue-500 text-white font-bold' : ''}
            ${isSelected && !isToday ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' : ''}
            ${hasSchedule && !isToday && !isSelected ? 'bg-green-100 text-green-700 font-semibold' : ''}
            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:text-blue-700'}
            ${!isPast && !isToday && !isSelected && !hasSchedule ? 'hover:bg-gray-50' : ''}
          `}
        >
          {day}
          {hasSchedule && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          )}
          {isToday && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
          )}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Calendar Grid */}
        <div className="p-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayHeaders}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>
        
        {/* Legend */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-2 relative">
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-600">Has Schedule</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full mr-2"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Refresh calendar data
  const refreshCalendarData = async () => {
    await fetchScheduledAppointments();
    const dateString = formatDateString(selectedDate);
    await fetchDoctorsForDate(dateString);
  };

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: HomeIcon, gradient: 'from-blue-500 to-blue-600' },
    { id: 'symptom-checker', label: 'Symptom Checker', icon: BeakerIcon, gradient: 'from-green-500 to-green-600' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDaysIcon, gradient: 'from-purple-500 to-purple-600' },
    { id: 'prescriptions', label: 'E-Prescriptions', icon: DocumentTextIcon, gradient: 'from-pink-500 to-rose-600' },
    { id: 'medical-history', label: 'Medical History', icon: ClockIcon, gradient: 'from-indigo-500 to-indigo-600' },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftIcon, gradient: 'from-cyan-500 to-cyan-600' }
  ];

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'user',
        time: new Date()
      };
      
      setChatMessages([...chatMessages, userMessage]);
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          text: "Thank you for your message. A healthcare professional will respond shortly.",
          sender: 'bot',
          time: new Date()
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
      
      setNewMessage('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 sm:space-y-8">
            {/* Welcome Section - Enhanced */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-xl sm:rounded-2xl p-4 sm:p-8 overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.firstName || user?.name || 'Patient'}! 
                </h2>
                <p className="text-blue-100 text-sm sm:text-base lg:text-lg">
                  Here's your health overview for today • {currentTime.toLocaleDateString()}
                </p>
              </div>
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
              <div className="absolute -right-4 -top-4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -left-4 -bottom-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 bg-white/5 rounded-full blur-2xl" />
            </div>

            {/* Quick Stats - Enhanced Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <CalendarDaysIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{upcomingAppointments.length}</div>
                  <div className="text-blue-100 text-xs sm:text-sm">Upcoming Appointments</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    Next: {upcomingAppointments[0]?.date}
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <BeakerIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{recentPrescriptions.length}</div>
                  <div className="text-emerald-100 text-xs sm:text-sm">Active Prescriptions</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    All up to date ✓
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <DocumentTextIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">12</div>
                  <div className="text-purple-100 text-xs sm:text-sm">Medical Records</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 inline-block">
                    Updated
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="p-4 sm:p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <HeartIcon className="w-8 h-8 sm:w-10 sm:h-10 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">98%</div>
                  <div className="text-orange-100 text-xs sm:text-sm">Health Score</div>
                  <div className="mt-2 sm:mt-3 text-xs bg-white/20 rounded-full px-2 sm:px-3 py-1 flex items-center justify-center">
                    Excellent <svg className="w-3 h-3 ml-1 text-yellow-200" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions - Enhanced Responsive Design */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Button 
                  onClick={() => setShowSymptomChecker(true)}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 text-emerald-800 hover:text-emerald-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <BeakerIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-emerald-600" />
                  <span className="text-xs sm:text-sm font-semibold">AI Symptom Checker</span>
                  <span className="text-xs text-emerald-600 mt-1">Smart Analysis</span>
                </Button>

                <Button 
                  onClick={() => setActiveTab('appointments')}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-800 hover:text-blue-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <CalendarDaysIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-blue-600" />
                  <span className="text-xs sm:text-sm font-semibold">Book Appointment</span>
                  <span className="text-xs text-blue-600 mt-1">Available Today</span>
                </Button>

                <Button 
                  onClick={() => setShowChatbot(true)}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-800 hover:text-purple-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <ChatBubbleLeftIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-purple-600" />
                  <span className="text-xs sm:text-sm font-semibold">AI Health Assistant</span>
                  <span className="text-xs text-purple-600 mt-1">24/7 Support</span>
                </Button>

                <Button 
                  onClick={() => setActiveTab('vitals')}
                  className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 text-orange-800 hover:text-orange-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-orange-600" />
                  <span className="text-xs sm:text-sm font-semibold">Track Vitals</span>
                  <span className="text-xs text-orange-600 mt-1">Health Monitoring</span>
                </Button>
              </div>
            </Card>

            {/* Upcoming Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Upcoming Appointments
                  </h3>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 p-4 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                              <UserIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{appointment.doctor}</div>
                              <div className="text-sm text-gray-600">{appointment.specialty}</div>
                              <div className="flex items-center space-x-1 mt-1">
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                <span className="text-xs text-gray-500">{appointment.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{appointment.date}</div>
                            <div className="text-sm text-gray-600">{appointment.time}</div>
                            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium mt-2 ${
                              appointment.type === 'Video Call' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {appointment.type}
                            </span>
                          </div>
                        </div>
                        <div className={`absolute top-0 right-0 w-2 h-full ${
                          appointment.status === 'confirmed' ? 'bg-green-400' : 'bg-yellow-400'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <BeakerIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Prescriptions
                  </h3>
                  <div className="space-y-4">
                    {recentPrescriptions.map((prescription) => (
                      <div key={prescription.id} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 p-4 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{prescription.medication}</div>
                            <div className="text-sm text-gray-600">by {prescription.doctor}</div>
                            <div className="text-xs text-gray-500 mt-1">{prescription.date} • {prescription.dosage}</div>
                            {prescription.refills > 0 && (
                              <div className="text-xs text-blue-600 mt-1">
                                {prescription.refills} refills remaining
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                              prescription.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {prescription.status}
                            </span>
                          </div>
                        </div>
                        <div className={`absolute top-0 right-0 w-2 h-full ${
                          prescription.status === 'Active' ? 'bg-green-400' : 'bg-gray-300'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-6">
            {/* Header Section with Enhanced Design */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                      <CalendarDaysIcon className="w-8 h-8 mr-3 text-blue-200" />
                      Appointment Management
                    </h2>
                    <p className="text-blue-100 mt-2">Book, manage, and track your healthcare appointments</p>
                  </div>
                  <Button 
                    className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold px-6 py-3"
                    onClick={() => {
                      const availableDocs = availableDoctors;
                      if (availableDocs.length > 0) {
                        handleBookAppointment(availableDocs[0]);
                      } else {
                        Swal.fire({
                          title: 'No Doctors Available',
                          text: 'No doctors are currently available. Please check back later.',
                          icon: 'info',
                          confirmButtonColor: '#3b82f6'
                        });
                      }
                    }}
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Book New Appointment
                  </Button>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-4 text-center">
                  <CalendarDaysIcon className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
                  <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                  <div className="text-emerald-100 text-sm">Upcoming</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-4 text-center">
                  <UserIcon className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <div className="text-2xl font-bold">{availableDoctors.length}</div>
                  <div className="text-blue-100 text-sm">Available Doctors</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-4 text-center">
                  <ClockIcon className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-purple-100 text-sm">This Month</div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-4 text-center">
                  <HeartIcon className="w-8 h-8 mx-auto mb-2 text-orange-200" />
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-orange-100 text-sm">Completed</div>
                </div>
              </Card>
            </div>

            {/* Main Content Grid - Redesigned Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Calendar and Selected Date Info */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Interactive Calendar */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <CalendarDaysIcon className="w-6 h-6 mr-2 text-blue-600" />
                        Appointment Calendar
                      </h3>
                      {isLoadingSchedules && (
                        <div className="flex items-center text-blue-600 text-sm">
                          <svg className="animate-spin w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Loading...
                        </div>
                      )}
                    </div>
                    {renderCalendar()}
                  </div>
                </Card>

                {/* Selected Date Information */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Selected Date Details
                    </h4>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <span className="text-gray-600">Selected Date:</span>
                        <div className="font-semibold text-gray-900 mt-1">
                          {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      
                      {selectedDateSchedules.length > 0 ? (
                        <div>
                          <span className="text-gray-600 text-sm flex items-center"><DocumentTextIcon className="w-4 h-4 mr-1" />Scheduled Appointments:</span>
                          <div className="mt-2 space-y-2">
                            {selectedDateSchedules.map((schedule, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="font-semibold text-blue-900">{schedule.doctorName}</div>
                                <div className="text-sm text-blue-700 flex items-center">
                                  <ClockIcon className="w-4 h-4 mr-1" />{schedule.times ? schedule.times.join(', ') : schedule.time}
                                </div>
                                <div className="text-xs text-blue-600 mt-1">Status: {schedule.status}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3">
                          <CalendarDaysIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <div className="text-gray-500 text-sm">No appointments scheduled</div>
                        </div>
                      )}

                      {/* Available Doctors for Selected Date */}
                      <div className="border-t border-blue-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-600 text-sm flex items-center"><UserIcon className="w-4 h-4 mr-1" />Available Doctors:</span>
                          {isLoadingDateDoctors && (
                            <div className="text-xs text-blue-600">Loading...</div>
                          )}
                        </div>
                        
                        {isLoadingDateDoctors ? (
                          <div className="space-y-2">
                            {[1, 2].map((index) => (
                              <div key={index} className="animate-pulse">
                                <div className="flex items-center space-x-3 p-2 bg-gray-100 rounded-lg">
                                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                  <div className="flex-1 space-y-1">
                                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : selectedDateDoctors.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedDateDoctors.map((doctor, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-green-200 hover:border-green-300 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 bg-gradient-to-r ${doctor.color} rounded-full flex items-center justify-center text-white text-xs`}>
                                      <UserIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-green-900 text-sm">{doctor.name}</div>
                                      <div className="text-xs text-green-700">{doctor.specialty}</div>
                                      <div className="text-xs text-green-600 flex items-center">
                                        <svg className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                                        {doctor.rating.toFixed(1)}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs"
                                    onClick={() => handleBookAppointment(doctor)}
                                  >
                                    Book
                                  </Button>
                                </div>
                                {doctor.availableTimes && doctor.availableTimes.length > 0 && (
                                  <div className="mt-2 pt-2 border-t border-green-100">
                                    <div className="text-xs text-green-600 mb-1">Available Times:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {doctor.availableTimes.slice(0, 3).map((time, timeIndex) => (
                                        <span key={timeIndex} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                          {time}
                                        </span>
                                      ))}
                                      {doctor.availableTimes.length > 3 && (
                                        <span className="text-xs text-green-600">
                                          +{doctor.availableTimes.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <div className="text-gray-500 text-xs">No doctors available</div>
                            <div className="text-gray-400 text-xs mt-1">for this date</div>
                          </div>
                        )}
                        
                        
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Floating Quick Actions Button */}
              <div className={`fixed ${isMobile ? 'bottom-36 right-4' : 'bottom-28 right-8'} z-50`} ref={quickActionsRef}>
                {/* Quick Actions Dropdown */}
                {showQuickActions && (
                  <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 transform transition-all duration-300 origin-bottom-right scale-100 animate-in slide-in-from-bottom-3 fade-in">
                    <div className="p-5">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Quick Actions
                      </h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 text-sm py-2.5"
                          onClick={() => {
                            setActiveTab('overview');
                            setShowQuickActions(false);
                          }}
                        >
                          <EyeIcon className="w-4 h-4 mr-3" />
                          View Dashboard
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-sm py-2.5"
                          onClick={() => {
                            setShowQuickActions(false);
                            Swal.fire({
                              title: 'Upcoming Appointments',
                              html: `
                                <div class="text-left space-y-2">
                                  ${upcomingAppointments.length > 0 ? 
                                    upcomingAppointments.map(apt => 
                                      `<div class="p-3 bg-gray-50 rounded-lg">
                                        <strong>${apt.doctor}</strong><br>
                                        <span class="text-gray-600">${apt.date} at ${apt.time}</span><br>
                                        <span class="text-sm text-blue-600">${apt.type}</span>
                                      </div>`
                                    ).join('') :
                                    '<div class="text-center text-gray-500">No upcoming appointments</div>'
                                  }
                                </div>
                              `,
                              icon: 'info',
                              confirmButtonColor: '#3b82f6'
                            });
                          }}
                        >
                          <CalendarDaysIcon className="w-4 h-4 mr-3" />
                          View All Appointments
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 text-sm py-2.5"
                          onClick={() => {
                            setShowQuickActions(false);
                            fetchDoctorsForDate(formatDateString(selectedDate));
                          }}
                          disabled={isLoadingDateDoctors}
                        >
                          <svg className={`w-4 h-4 mr-3 ${isLoadingDateDoctors ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {isLoadingDateDoctors ? 'Refreshing...' : 'Refresh Doctors'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 text-sm py-2.5"
                          onClick={() => {
                            setShowQuickActions(false);
                            refreshCalendarData();
                          }}
                          disabled={isLoadingSchedules || isLoadingDateDoctors}
                        >
                          <svg className={`w-4 h-4 mr-3 ${(isLoadingSchedules || isLoadingDateDoctors) ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {(isLoadingSchedules || isLoadingDateDoctors) ? 'Updating...' : 'Refresh Calendar'}
                        </Button>
                        
                        {/* Separator */}
                        <div className="border-t border-gray-200 my-3"></div>
                        
                        {/* Primary Action */}
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm py-2.5 font-semibold"
                          onClick={() => {
                            setShowQuickActions(false);
                            if (availableDoctors.length > 0) {
                              handleBookAppointment(availableDoctors[0]);
                            } else {
                              Swal.fire({
                                title: 'No Doctors Available',
                                text: 'No doctors are currently available. Please check back later.',
                                icon: 'info',
                                confirmButtonColor: '#3b82f6'
                              });
                            }
                          }}
                        >
                          <PlusIcon className="w-4 h-4 mr-3" />
                          Book New Appointment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Floating Action Button */}
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className={`
                    w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                    text-white rounded-full shadow-2xl hover:shadow-3xl 
                    transition-all duration-300 transform hover:scale-110 active:scale-95
                    flex items-center justify-center group
                    ${showQuickActions ? 'ring-4 ring-blue-200 ring-opacity-50' : ''}
                  `}
                  aria-label="Quick Actions"
                >
                  <svg 
                    className={`w-7 h-7 transition-transform duration-300 ${showQuickActions ? 'rotate-45' : 'group-hover:rotate-90'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  
                  {/* Pulse animation when active */}
                  {showQuickActions && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-30"></div>
                  )}
                </button>
              </div>

              {/* Right Column - Available Doctors and Upcoming Appointments */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Selected Date Doctors Section */}
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 backdrop-blur-sm shadow-xl border-2 border-purple-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-purple-900 flex items-center">
                        <CalendarDaysIcon className="w-6 h-6 mr-2 text-purple-600" />
                        Doctors Available for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({selectedDateDoctors.length > 0 ? getFilteredDoctors().length : 0})
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-purple-700 font-medium bg-purple-100 px-3 py-1 rounded-full">
                            Selected Date
                          </div>
                          {(doctorSearchTerm || selectedSpecialty || sortBy !== 'name') && (
                            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                              <FunnelIcon className="h-3 w-3" />
                              Filtered
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Loading State */}
                      {isLoadingDateDoctors ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="animate-pulse">
                              <div className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg">
                                <div className="w-16 h-16 bg-gray-300 rounded-xl"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : dateDoctorsError ? (
                        /* Error State */
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 className="text-lg font-semibold text-red-600 mb-2">Failed to Load Doctors</h4>
                          <p className="text-red-500 text-sm mb-4">{dateDoctorsError}</p>
                          <Button
                            onClick={() => fetchDoctorsForDate(formatDateString(selectedDate))}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : selectedDateDoctors.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-8">
                          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-600 mb-2">No Doctor Schedule Available</h4>
                          <p className="text-gray-500 text-sm mb-4">
                            No doctors have scheduled availability for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                          </p>
                          <div className="space-y-2">
                            <p className="text-gray-400 text-xs">Try selecting a different date or check back later.</p>
                            <Button
                              onClick={() => fetchDoctorsForDate(formatDateString(selectedDate))}
                              variant="outline"
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                              Refresh
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Doctors Available - Show filters and list */
                        <div>
                      
                      {/* Filter and Search Section */}
                      {selectedDateDoctors.length > 1 && (
                        <div className="mb-6 p-4 bg-white/70 rounded-lg border border-purple-100">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-4 w-4 text-purple-500" />
                              </div>
                              <input
                                type="text"
                                placeholder="Search by doctor name or specialty..."
                                value={doctorSearchTerm}
                                onChange={(e) => setDoctorSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm placeholder-purple-400"
                              />
                            </div>
                            
                            {/* Specialty Filter */}
                            <div className="relative">
                              <select
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                                className="appearance-none bg-white border border-purple-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              >
                                <option value="">All Specialties</option>
                                {getUniqueSpecialties().map(specialty => (
                                  <option key={specialty} value={specialty}>{specialty}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <FunnelIcon className="h-4 w-4 text-purple-500" />
                              </div>
                            </div>
                            
                            {/* Sort Dropdown */}
                            <div className="relative">
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none bg-white border border-purple-200 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              >
                                <option value="name">Sort by Name</option>
                                <option value="specialty">Sort by Specialty</option>
                                <option value="slots">Sort by Availability</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDownIcon className="h-4 w-4 text-purple-500" />
                              </div>
                            </div>
                            
                            {/* Clear Filters Button */}
                            {(doctorSearchTerm || selectedSpecialty || sortBy !== 'name') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={clearFilters}
                                className="border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                              >
                                <XMarkIcon className="h-4 w-4" />
                                Clear
                              </Button>
                            )}
                          </div>
                          
                          {/* Quick Specialty Filters */}
                          {getUniqueSpecialties().length > 1 && (
                            <div className="mt-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-purple-700">Quick filters:</span>
                                <button
                                  onClick={() => setSelectedSpecialty('')}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    selectedSpecialty === '' 
                                      ? 'bg-purple-600 text-white' 
                                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  }`}
                                >
                                  All ({selectedDateDoctors.length})
                                </button>
                                {getUniqueSpecialties().slice(0, 4).map(specialty => {
                                  const count = selectedDateDoctors.filter(d => d.specialty === specialty).length;
                                  return (
                                    <button
                                      key={specialty}
                                      onClick={() => setSelectedSpecialty(specialty)}
                                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        selectedSpecialty === specialty 
                                          ? 'bg-purple-600 text-white' 
                                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                      }`}
                                    >
                                      {specialty} ({count})
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Filter Results Summary */}
                          {(doctorSearchTerm || selectedSpecialty) && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
                              <AdjustmentsHorizontalIcon className="h-4 w-4" />
                              <span>
                                Showing {getFilteredDoctors().length} of {selectedDateDoctors.length} doctors
                                {selectedSpecialty && (
                                  <span className="ml-2 bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs">
                                    {selectedSpecialty}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          {getDisplayDoctors().length > 2 && (
                            <div className="mt-2 flex items-center justify-center text-xs text-purple-500">
                              <span>↕ Scroll to see more doctors</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Selected Date Doctors List - Filtered View */}
                      <div className={`space-y-3 ${getDisplayDoctors().length > 2 ? 'max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100' : ''}`}>
                        {getFilteredDoctors().length === 0 ? (
                          <div className="text-center py-8">
                            <MagnifyingGlassIcon className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                            <p className="text-purple-600 font-medium">No doctors found</p>
                            <p className="text-purple-500 text-sm mt-1">
                              {doctorSearchTerm || selectedSpecialty 
                                ? 'Try adjusting your search or filter criteria' 
                                : 'No doctors available for this date'}
                            </p>
                            {(doctorSearchTerm || selectedSpecialty) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={clearFilters}
                                className="mt-3 border-purple-300 text-purple-700 hover:bg-purple-50"
                              >
                                Clear Filters
                              </Button>
                            )}
                          </div>
                        ) : (
                          getDisplayDoctors().map((doctor) => (
                          <div key={doctor.id} className="bg-white/90 p-6 rounded-xl border border-purple-200 hover:bg-white hover:shadow-xl transition-all duration-300 hover:border-purple-300">
                            {/* Doctor Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                                  <UserIcon className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-bold text-purple-900">
                                      {highlightSearchTerm(doctor.name, doctorSearchTerm)}
                                    </h4>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                      doctor.status === 'Available today' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {doctor.status || 'Available today'}
                                    </span>
                                  </div>
                                  <p className="text-purple-700 font-medium mb-1">
                                    {highlightSearchTerm(doctor.specialty, doctorSearchTerm)}
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-purple-600">
                                    <span className="flex items-center gap-1">
                                      <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                      {doctor.rating ? parseFloat(doctor.rating).toFixed(1) : '4.5'}/5
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <PhoneIcon className="h-4 w-4" />
                                      {doctor.phone || 'Available after booking'}
                                    </span>
                                    <span className="flex items-center gap-1 truncate">
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      {doctor.email || 'contact@hospital.com'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-purple-900 mb-1">
                                  {doctor.availableTimes.length} slots
                                </div>
                                <div className="text-lg font-bold text-purple-700">
                                  ₹{doctor.consultationFee || '50'}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDoctor(doctor);
                                    setShowBookingModal(true);
                                  }}
                                  className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md"
                                >
                                  Book Now
                                </Button>
                              </div>
                            </div>

                            {/* Doctor Details */}
                            <div className="bg-purple-50 rounded-lg p-4 mb-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-semibold text-purple-800 mb-2">Today's Schedule</h5>
                                  <p className="text-purple-700 text-sm">{doctor.workingHours}</p>
                                </div>
                                <div>
                                  <h5 className="text-sm font-semibold text-purple-800 mb-2">Professional Experience</h5>
                                  <p className="text-purple-700 text-sm">
                                    {doctor.experience || '5+ years'} of clinical practice
                                  </p>
                                  <p className="text-purple-600 text-sm mt-1">
                                    Specializing in {doctor.specialty?.toLowerCase() || 'general practice'}
                                  </p>
                                  {doctor.qualifications && (
                                    <p className="text-purple-600 text-xs mt-1 italic">
                                      {doctor.qualifications}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Available Time Slots */}
                            {doctor.availableTimes.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                  <ClockIcon className="h-4 w-4" />
                                  Available Time Slots ({doctor.availableTimes.length})
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {doctor.availableTimes.slice(0, 6).map((time, index) => (
                                    <button 
                                      key={index} 
                                      onClick={() => {
                                        setSelectedDoctor(doctor);
                                        setAppointmentData(prev => ({ ...prev, time: time }));
                                        setShowBookingModal(true);
                                      }}
                                      className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-purple-200 hover:border-purple-300"
                                    >
                                      {time}
                                    </button>
                                  ))}
                                  {doctor.availableTimes.length > 6 && (
                                    <div className="flex items-center text-purple-600 text-sm px-3 py-2">
                                      +{doctor.availableTimes.length - 6} more slots
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                        )}
                        {!showAllDoctors && getFilteredDoctors().length > 3 && (
                          <div className="text-center">
                            <button 
                              onClick={() => setShowAllDoctors(true)}
                              className="text-green-700 text-sm hover:text-green-800 font-medium bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                            >
                              <EyeIcon className="h-4 w-4" />
                              View all {getFilteredDoctors().length} doctors
                            </button>
                          </div>
                        )}
                        {showAllDoctors && getFilteredDoctors().length > 3 && (
                          <div className="text-center">
                            <button 
                              onClick={() => setShowAllDoctors(false)}
                              className="text-green-700 text-sm hover:text-green-800 font-medium bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                            >
                              <ChevronDownIcon className="h-4 w-4 rotate-180" />
                              Show less
                            </button>
                          </div>
                        )}
                      </div>
                        </div>
                      )}
                    </div>
                  </Card>
                
               

                {/* Upcoming Appointments Section */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <CalendarDaysIcon className="w-6 h-6 mr-2 text-purple-600" />
                      Your Upcoming Appointments
                    </h3>
                    
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                          <div key={appointment.id} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white via-purple-50 to-white p-6 border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
                                  <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="font-bold text-lg text-gray-900">{appointment.doctor}</div>
                                  <div className="text-sm text-gray-600">{appointment.specialty}</div>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-yellow-400 flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>{appointment.rating}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      appointment.status === 'confirmed' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {appointment.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-gray-900">{appointment.date}</div>
                                <div className="text-purple-600 font-semibold">{appointment.time}</div>
                                <span className={`inline-flex px-3 py-1 text-sm rounded-full font-medium mt-2 items-center ${
                                  appointment.type === 'Video Call' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {appointment.type === 'Video Call' ? 
                                    <VideoCameraIcon className="w-4 h-4 mr-1" /> : 
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                  }
                                  {appointment.type}
                                </span>
                              </div>
                            </div>
                            <div className={`absolute top-0 right-0 w-2 h-full ${
                              appointment.status === 'confirmed' ? 'bg-green-400' : 'bg-yellow-400'
                            }`}></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No upcoming appointments</h4>
                        <p className="text-gray-500 mb-4">Schedule your next appointment to maintain your health.</p>
                        <Button 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                          onClick={() => {
                            if (availableDoctors.length > 0) {
                              handleBookAppointment(availableDoctors[0]);
                            }
                          }}
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Schedule Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'vitals':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Vitals Tracker</h2>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                Add New Reading
              </Button>
            </div>
            
            {/* Vitals Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {vitalsTrends.map((vital, index) => (
                <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="text-center space-y-3">
                    <div className={`text-2xl font-bold ${vital.color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
                      {vital.value}
                    </div>
                    <div className="text-gray-700 font-medium">{vital.metric}</div>
                    <div className={`text-sm px-3 py-1 rounded-full inline-block ${
                      vital.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {vital.status}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-center">
                      Trend: {vital.trend === 'improving' ? 
                        <ChartBarIcon className="w-4 h-4 mx-1 text-green-600" /> : 
                        <ChartBarIcon className="w-4 h-4 mx-1 text-blue-600" />
                      } {vital.trend}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Log Your Vitals">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80 mmHg"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({...vitals, bloodPressure: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Sugar</label>
                    <input
                      type="text"
                      placeholder="100 mg/dL"
                      value={vitals.bloodSugar}
                      onChange={(e) => setVitals({...vitals, bloodSugar: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate</label>
                    <input
                      type="text"
                      placeholder="72 bpm"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({...vitals, heartRate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                    <input
                      type="text"
                      placeholder="98.6°F"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                    Save Vitals
                  </Button>
                </div>
              </Card>

              <Card title="Vitals History & Trends">
                <div className="space-y-4">
                  <div className="h-48 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <ChartBarIcon className="w-16 h-16 mx-auto mb-2 text-blue-500" />
                      <div className="font-medium">Interactive Chart</div>
                      <div className="text-sm text-gray-500">Track your health trends over time</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Recent Readings</h4>
                    {vitalsTrends.map((vital, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-600">{vital.metric}:</span>
                        <span className={`font-medium ${vital.color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
                          {vital.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'health-tips':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <svg className="w-8 h-8 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Personalized Health Tips
              </h2>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Get More Tips
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthTips.map((tip) => (
                <Card key={tip.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                  <div className="relative p-6">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-3xl flex items-center justify-center">
                      {tip.icon === 'water' && <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>}
                      {tip.icon === 'fitness' && <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                      {tip.icon === 'nutrition' && <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>}
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tip.category === 'Wellness' ? 'bg-blue-100 text-blue-800' :
                          tip.category === 'Fitness' ? 'bg-green-100 text-green-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {tip.category}
                        </span>
                        <span className="text-xs text-gray-500">{tip.readTime}</span>
                      </div>
                      <h4 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {tip.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{tip.content}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 group-hover:border-blue-300 transition-all duration-300">
                      <span className="mr-2">📖</span>
                      Read More
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Doctor Chat</h2>
              <div className="text-sm text-gray-500">
                Last active: {currentTime.toLocaleTimeString()}
              </div>
            </div>
            
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg h-96">
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        <div>{message.text}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.time.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <div>Start a conversation with your healthcare provider</div>
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
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button 
                    onClick={sendChatMessage}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return (
          <Card title={`${sidebarItems.find(item => item.id === activeTab)?.label || 'Feature'}`}>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Patient Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-lg">H+</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HealthcarePlus
                </h1>
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
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <p className="text-xs text-gray-500">{unreadCount} unread notifications</p>
                      )}
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              notification.type === 'appointment' ? 'bg-blue-500' :
                              notification.type === 'results' ? 'bg-green-500' :
                              notification.type === 'medication' ? 'bg-orange-500' : 'bg-purple-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                {notification.unread && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center">
                        View All Notifications
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
                      {(user?.firstName || user?.name || 'P')[0]}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName || user?.name}
                    </div>
                    <div className="text-xs text-gray-500">ID: #P{user?.id || '12345'}</div>
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
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
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
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-200" />
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
          min-h-screen bg-gradient-to-br from-gray-50/50 via-blue-50/30 to-purple-50/50
        `}>
          <div className={`p-4 sm:p-6 lg:p-8 ${isMobile ? 'pb-20' : 'pb-4'}`}>
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* AI Symptom Checker Modal */}
      <Modal
        isOpen={showSymptomChecker}
        onClose={() => setShowSymptomChecker(false)}
        title="AI Symptom Checker"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your symptoms:
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="E.g., I have a headache, fever, and sore throat..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🤖 AI Analysis:</h4>
            <p className="text-blue-800 text-sm">
              Based on your symptoms, you might have a viral infection (85% confidence). 
              Recommended: Rest, stay hydrated, and consult with a general physician if symptoms persist.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => setActiveTab('appointments')}>Book Appointment</Button>
            <Button variant="outline" onClick={() => setShowSymptomChecker(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Smart Chatbot Modal */}
      <Modal
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        title="Health Assistant Chatbot"
        size="lg"
      >
        <div className="space-y-4">
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex">
                <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs">
                  Hello! I'm your health assistant. How can I help you today?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-gray-200 p-2 rounded-lg max-w-xs">
                  I have questions about my medication
                </div>
              </div>
              <div className="flex">
                <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs">
                  I'd be happy to help with medication questions. What specific information do you need?
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <Button>Send</Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-40 lg:hidden">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {sidebarItems.slice(0, 5).map((item) => {
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
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`text-xs font-medium truncate ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className={`
          fixed w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 
          text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 
          flex items-center justify-center transform hover:scale-110 hover:rotate-12 
          ${isMobile ? 'bottom-20 right-4' : 'bottom-8 right-8'}
          z-50
        `}
      >
        <ChatBubbleLeftIcon className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Appointment Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 bg-gradient-to-r ${selectedDoctor.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book Appointment</h3>
              <p className="text-gray-600">Schedule your visit with {selectedDoctor.name}</p>
              <p className="text-sm text-gray-500">{selectedDoctor.specialty}</p>
            </div>
            
            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date</label>
                <input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                <select
                  value={appointmentData.time}
                  onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select time</option>
                  {selectedDoctor && selectedDoctor.availability && selectedDoctor.availability.dailySchedule 
                    ? generateTimeSlots(selectedDoctor.availability.dailySchedule).map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))
                    : (
                      // Fallback options if no schedule data available
                      <>
                        <option value="09:00">09:00 - 09:30 AM</option>
                        <option value="09:30">09:30 - 10:00 AM</option>
                        <option value="10:00">10:00 - 10:30 AM</option>
                        <option value="10:30">10:30 - 11:00 AM</option>
                        <option value="11:00">11:00 - 11:30 AM</option>
                        <option value="11:30">11:30 - 12:00 PM</option>
                        <option value="14:00">02:00 - 02:30 PM</option>
                        <option value="14:30">02:30 - 03:00 PM</option>
                        <option value="15:00">03:00 - 03:30 PM</option>
                        <option value="15:30">03:30 - 04:00 PM</option>
                        <option value="16:00">04:00 - 04:30 PM</option>
                        <option value="16:30">04:30 - 05:00 PM</option>
                      </>
                    )
                  }
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <select
                  value={appointmentData.type}
                  onChange={(e) => setAppointmentData({...appointmentData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="consultation">General Consultation</option>
                  <option value="follow-up">Follow-up Visit</option>
                  <option value="checkup">Regular Checkup</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                <textarea
                  value={appointmentData.reason}
                  onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowBookingModal(false)}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={submitAppointmentBooking}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                Book Appointment
              </Button>
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

export default PatientDashboard;