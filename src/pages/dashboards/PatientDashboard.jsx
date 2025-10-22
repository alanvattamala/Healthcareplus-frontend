import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Card, Button, Modal } from '../../components';
import { handleLogout, getCurrentUser, requireRole, checkAuthAndRedirect } from '../../utils/auth';
import VideoCallManager from '../../utils/videoCallManager';
import paymentService from '../../services/paymentService';
import {
  BellIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon as CogIcon,
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
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon
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
  const [processingSlot, setProcessingSlot] = useState(null); // Track which slot is being processed
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
  const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
  const [selectedDateDoctors, setSelectedDateDoctors] = useState([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isLoadingDateDoctors, setIsLoadingDateDoctors] = useState(false);
  const [isLoadingDateAppointments, setIsLoadingDateAppointments] = useState(false);
  const [dateDoctorsError, setDateDoctorsError] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedSlotDetails, setSelectedSlotDetails] = useState(null);
  const [showSlotDetails, setShowSlotDetails] = useState(false);
  const [expandedSlots, setExpandedSlots] = useState({}); // Track which doctors have expanded slots shown
  
  // Filter and search state for selected date doctors
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, specialty, slots
  
  // Filter and search state for My Schedules page
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [scheduleSort, setScheduleSort] = useState('date-asc');
  const [scheduleSearch, setScheduleSearch] = useState('');

  // Video call states
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'ringing', 'connected'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [availableCall, setAvailableCall] = useState(null); // Stores doctor's call info when call is initiated
  const [currentAppointment, setCurrentAppointment] = useState(null);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const quickActionsRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const callTimerRef = useRef(null);
  const videoCallManagerRef = useRef(null);

  // Helper functions for date and time validation
  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() < today.getTime();
  };

  const isScheduleTimeExpired = (doctor) => {
    if (!selectedDate) return false;
    
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    
    // Only check time expiry for today's date
    if (selectedDateObj.toDateString() !== today.toDateString()) {
      return false;
    }
    
    // Check if current time is past the doctor's schedule end time
    if (doctor.scheduleDetails?.endTime) {
      const [endHour, endMinute] = doctor.scheduleDetails.endTime.split(':').map(Number);
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;
      const endTotalMinutes = endHour * 60 + endMinute;
      
      return currentTotalMinutes >= endTotalMinutes;
    }
    
    return false;
  };

  // Notifications data - will be populated from API calls
  const notifications = [];

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

  // Helper function to handle slot selection
  const handleSlotSelection = (doctor, timeSlot, slotIndex = null) => {
    const slotDetails = {
      doctor: doctor,
      timeSlot: timeSlot,
      slotIndex: slotIndex,
      slotDuration: doctor.slotDuration || 30,
      date: selectedDate,
      isTimeRange: timeSlot.includes('-')
    };
    
    setSelectedSlotDetails(slotDetails);
    setSelectedDoctor(doctor);
    setAppointmentData(prev => ({ 
      ...prev, 
      time: timeSlot,
      date: formatDateString(selectedDate)
    }));
    setShowBookingModal(true);
  };

  // Helper function to toggle expanded slots for a specific doctor
  const toggleExpandedSlots = (doctorId) => {
    setExpandedSlots(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
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

  // Video call functions
  const acceptCall = async () => {
    try {
      if (videoCallManagerRef.current && incomingCallData) {
        await videoCallManagerRef.current.acceptCall(incomingCallData.appointmentId);
        Swal.close(); // Close the incoming call dialog
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      
      // Check if it's a permission error and offer alternatives
      if (error.message && (error.message.includes('denied') || error.message.includes('permission'))) {
        Swal.fire({
          title: 'Camera/Microphone Access Required',
          html: `
            <div class="text-left">
              <p class="mb-4">${error.message}</p>
              <p class="mb-4"><strong>To join the video call, please:</strong></p>
              <ol class="list-decimal list-inside space-y-2 mb-4">
                <li>Click the camera/microphone icon in your browser's address bar</li>
                <li>Select "Allow" for camera and microphone access</li>
                <li>Refresh the page and try joining the call again</li>
              </ol>
              <p class="text-sm text-gray-600">Would you like to try joining with audio only?</p>
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Try Audio Only',
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280'
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              // Try to accept call with audio only
              await videoCallManagerRef.current.acceptCallAudioOnly(incomingCallData.appointmentId);
              Swal.close();
            } catch (audioError) {
              console.error('Error accepting audio-only call:', audioError);
              Swal.fire({
                title: 'Error',
                text: 'Failed to join call. Please check your microphone permissions and try again.',
                icon: 'error',
                confirmButtonColor: '#ef4444'
              });
              setCallStatus('idle');
              setShowIncomingCall(false);
              setAvailableCall(null);
            }
          } else {
            setCallStatus('idle');
            setShowIncomingCall(false);
            setAvailableCall(null);
          }
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to accept call. Please check your camera and microphone permissions.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
        setCallStatus('idle');
        setShowIncomingCall(false);
        setAvailableCall(null);
      }
    }
  };

  const declineCall = () => {
    if (videoCallManagerRef.current && incomingCallData) {
      videoCallManagerRef.current.declineCall(incomingCallData.appointmentId);
      setShowIncomingCall(false);
      setIncomingCallData(null);
      setAvailableCall(null);
      setCallStatus('idle');
      Swal.close(); // Close the incoming call dialog
    }
  };

  const checkMediaPermissions = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }
      
      // Check permissions if available
      if (navigator.permissions) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' });
        const micPermission = await navigator.permissions.query({ name: 'microphone' });
        
        console.log('📹 Camera permission:', cameraPermission.state);
        console.log('🎤 Microphone permission:', micPermission.state);
        
        if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
          return {
            granted: false,
            message: 'Camera or microphone access is blocked. Please enable permissions in your browser settings.'
          };
        }
      }
      
      return { granted: true };
    } catch (error) {
      console.log('Permission check not available:', error);
      return { granted: true }; // Assume permissions are OK if we can't check
    }
  };

  const joinCall = async () => {
    if (availableCall) {
      // Check permissions first
      const permissionCheck = await checkMediaPermissions();
      
      if (!permissionCheck.granted) {
        Swal.fire({
          title: 'Permissions Required',
          text: permissionCheck.message,
          icon: 'warning',
          confirmButtonText: 'Continue Anyway',
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#3b82f6'
        }).then((result) => {
          if (result.isConfirmed) {
            acceptCall();
          }
        });
      } else {
        acceptCall();
      }
    }
  };

  const endCall = () => {
    if (videoCallManagerRef.current) {
      videoCallManagerRef.current.endCall();
    }
    
    // Stop call timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    setCallStatus('idle');
    setShowVideoCallModal(false);
    setShowIncomingCall(false);
    setAvailableCall(null);
  };

  const toggleVideo = () => {
    if (videoCallManagerRef.current) {
      const enabled = videoCallManagerRef.current.toggleVideo();
      setIsVideoEnabled(enabled);
    }
  };

  const toggleAudio = () => {
    if (videoCallManagerRef.current) {
      const enabled = videoCallManagerRef.current.toggleAudio();
      setIsAudioEnabled(enabled);
    }
  };

  // Format call duration
  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch scheduled appointments from database
  const fetchScheduledAppointments = async () => {
    setIsLoadingSchedules(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        setUpcomingAppointments([]);
        setScheduledDates([]);
        return;
      }

      const response = await fetch('http://localhost:3001/api/appointments/my-appointments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Raw API Response:', data);
        const appointments = data.data || [];
        console.log('📋 All appointments from API:', appointments);
        
        // Filter for upcoming appointments on the frontend (including today)
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        console.log('📅 Start of today:', startOfToday);
        
        const upcomingAppointments = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          console.log(`🔍 Checking appointment ${appointment._id}: ${appointmentDate} >= ${startOfToday} = ${appointmentDate >= startOfToday}`);
          return appointmentDate >= startOfToday;
        });
        
        console.log('⬆️ Filtered upcoming appointments:', upcomingAppointments);
        
        // Log first appointment to see structure
        if (upcomingAppointments.length > 0) {
          console.log('🔍 First upcoming appointment structure:', upcomingAppointments[0]);
          console.log('👨‍⚕️ Doctor data in first upcoming appointment:', upcomingAppointments[0].doctor);
        }
        
        // Format appointments for the UI
        const formattedAppointments = upcomingAppointments.map(appointment => {
          console.log('🔄 Processing appointment:', appointment._id, 'Doctor:', appointment.doctor);
          return {
            _id: appointment._id,
            id: appointment._id,
            doctor: appointment.doctor 
              ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
              : 'Unknown Doctor',
            doctorId: appointment.doctor || {},
            specialty: appointment.doctor?.specialization || appointment.doctor?.specialty || 'General Practice',
            date: new Date(appointment.date).toLocaleDateString('en-CA'), // YYYY-MM-DD format
            time: appointment.timeSlot || appointment.time || 'Time not specified',
            timeSlot: appointment.timeSlot || appointment.time || 'Time not specified',
            type: appointment.type === 'consultation' ? 'Consultation' : 
                  appointment.type === 'follow-up' ? 'Follow-up' :
                  appointment.type === 'checkup' ? 'Check-up' : 'Consultation',
            avatar: null,
            rating: 4.8, // Default rating - could be enhanced
            status: appointment.status || 'scheduled',
            reason: appointment.reason || 'No reason specified',
            appointmentId: appointment._id,
            duration: appointment.duration || 20,
            slotId: appointment.slotId,
            scheduleId: appointment.scheduleId,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt,
            formattedDate: new Date(appointment.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            // Add experience from doctor data if available
            experience: appointment.doctor?.experience || 'N/A'
          };
        });

        console.log('✨ Formatted appointments:', formattedAppointments);
        setUpcomingAppointments(formattedAppointments);

        // Format scheduled dates for calendar
        const scheduledDates = formattedAppointments.map(appt => ({
          date: appt.date,
          hasSchedule: true,
          doctorId: appt.doctorId,
          doctorName: appt.doctor,
          time: appt.time,
          times: [appt.time],
          status: appt.status,
          appointmentId: appt.appointmentId
        }));

        setScheduledDates(scheduledDates);
        console.log('Successfully loaded appointments:', formattedAppointments);
      } else {
        throw new Error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Fallback to placeholder data on error
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
          availableTimes: scheduleInfo.rawSlots ? 
            scheduleInfo.rawSlots
              .filter(slot => slot.status === 'available')
              .map(slot => slot.timeSlot || `${slot.startTime}-${slot.endTime}`) 
            : [],
          allTimeSlots: scheduleInfo.allTimeSlots || [], // All slots for display
          slotsWithStatus: scheduleInfo.rawSlots || [], // Detailed slot status with timeSlot format
          totalSlots: scheduleInfo.totalSlots || 0,
          availableSlotsCount: scheduleInfo.availableSlotsCount || 0,
          bookedSlotsCount: scheduleInfo.bookedSlotsCount || 0,
          expiredSlotsCount: scheduleInfo.expiredSlotsCount || 0,
          slotDuration: scheduleInfo.slotDuration || 30,
          rawSlots: scheduleInfo.rawSlots || [],
          isAvailableOnDate: doctor.isAvailableOnDate || false,
          isActive: doctor.isActive, // Doctor's online/offline status
          scheduleStatus: scheduleInfo.scheduleStatus || 'available', // 'available', 'ended', 'no_slots'
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
          status: data.isToday && scheduleInfo.scheduleStatus === 'ended' ? 'Schedule ended for today' :
                  data.isToday && scheduleInfo.scheduleStatus === 'available' ? 'Available today' :
                  data.isToday && scheduleInfo.scheduleStatus === 'no_slots' ? 'No slots scheduled' :
                  data.isToday && scheduleInfo.expiredSlotsCount > 0 && scheduleInfo.availableSlotsCount === 0 ? 'All slots have passed' :
                  'Available on selected date'
        };
      });

      setSelectedDateDoctors(formattedDoctors);
      setExpandedSlots({}); // Reset expanded slots when new doctors are loaded
      console.log(`Found ${formattedDoctors.length} doctors available for ${dateString}`);
    } catch (error) {
      console.error('Error fetching doctors for date:', error);
      setDateDoctorsError(error.message || 'Failed to load doctors for this date');
      setSelectedDateDoctors([]);
      setExpandedSlots({}); // Reset expanded slots on error
    } finally {
      setIsLoadingDateDoctors(false);
    }
  };

  // Fetch appointments for a specific date
  const fetchAppointmentsForDate = async (dateString) => {
    setIsLoadingDateAppointments(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot fetch appointments');
        setSelectedDateAppointments([]);
        return;
      }

      console.log(`Fetching appointments for date: ${dateString}`);
      
      const response = await fetch(`http://localhost:3001/api/appointments/my-appointments?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Appointments for date response:', data);

      const appointments = data.data || [];
      const formattedAppointments = appointments.map(appointment => ({
        id: appointment._id,
        doctor: `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
        specialty: appointment.doctor.specialization || 'General Practice',
        date: new Date(appointment.date).toLocaleDateString('en-CA'),
        time: appointment.time,
        type: appointment.type === 'consultation' ? 'In-person' : 
              appointment.type === 'follow-up' ? 'Follow-up' :
              appointment.type === 'checkup' ? 'Check-up' : 'In-person',
        status: appointment.status,
        reason: appointment.reason,
        appointmentId: appointment._id,
        doctorId: appointment.doctor._id,
        doctorEmail: appointment.doctor.email,
        doctorPhone: appointment.doctor.phone,
        rating: 4.8,
        color: ['from-pink-500 to-rose-500', 'from-blue-500 to-indigo-500', 'from-green-500 to-emerald-500', 'from-purple-500 to-violet-500'][appointments.indexOf(appointment) % 4]
      }));

      setSelectedDateAppointments(formattedAppointments);
      console.log(`Found ${formattedAppointments.length} appointments for ${dateString}`);
    } catch (error) {
      console.error('Error fetching appointments for date:', error);
      setSelectedDateAppointments([]);
    } finally {
      setIsLoadingDateAppointments(false);
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

        // Check if user has proper patient role
        if (!userData.role || userData.role !== 'patient') {
          console.error('User is not a patient or role is missing');
          navigate('/auth/signin');
          return;
        }
        
        setUser(userData);
        
        // Make test function available globally for debugging
        window.testAppointmentAPI = async () => {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('❌ No token found');
            return;
          }
          
          try {
            console.log('🧪 Testing appointment API...');
            const response = await fetch('http://localhost:3001/api/appointments/my-appointments', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ API Test Response:', data);
              if (data.data && data.data.length > 0) {
                console.log('👨‍⚕️ First appointment doctor data:', data.data[0].doctor);
                console.log('🆔 Patient ID in appointment:', data.data[0].patient);
                console.log('🆔 Current user ID:', patientData?._id);
                console.log('📅 Appointment date:', data.data[0].date);
                console.log('⏰ Appointment time:', data.data[0].time || data.data[0].timeSlot);
              } else {
                console.log('📝 No appointments found in response');
              }
            } else {
              console.log('❌ API Test Failed:', response.status, response.statusText);
              const errorText = await response.text();
              console.log('Error details:', errorText);
            }
          } catch (error) {
            console.log('❌ API Test Error:', error);
          }
        };
        
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

  // Initialize video call manager
  useEffect(() => {
    if (user && user.userType === 'patient') {
      videoCallManagerRef.current = new VideoCallManager();
      
      // Debug: Log user details
      console.log('👤 Patient registering for video calls:', user);
      console.log('👤 Patient ID:', user.id);
      console.log('👤 Patient Type:', user.userType);
      
      // Connect to video call server
      videoCallManagerRef.current.connect(user.id, 'patient');
      
      // Set up callbacks
      videoCallManagerRef.current.setCallbacks({
        onLocalStreamReceived: (stream) => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        },
        onRemoteStreamReceived: (stream) => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        },
        onCallEnded: () => {
          setCallStatus('idle');
          setShowVideoCallModal(false);
          setShowIncomingCall(false);
          setAvailableCall(null);
          setLocalStream(null);
          setRemoteStream(null);
          if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
          }
          Swal.fire({
            title: 'Call Ended',
            text: 'The video call has been ended.',
            icon: 'info',
            confirmButtonColor: '#10b981'
          });
        },
        onIncomingCall: (callData) => {
          console.log('📞 Incoming call from doctor:', callData);
          setIncomingCallData(callData);
          setAvailableCall(callData);
          setShowIncomingCall(true);
          setCallStatus('ringing');
          
          // Show incoming call notification
          Swal.fire({
            title: 'Incoming Video Call',
            text: `Dr. ${callData.doctorName} is calling for consultation`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Accept',
            cancelButtonText: 'Decline',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 30000, // Auto-decline after 30 seconds
            timerProgressBar: true
          }).then((result) => {
            if (result.isConfirmed) {
              acceptCall();
            } else {
              declineCall();
            }
          });
        },
        onCallAccepted: ({ appointmentId }) => {
          setCallStatus('connected');
          setShowVideoCallModal(true);
          setShowIncomingCall(false);
          
          callStartTimeRef.current = Date.now();
          
          // Start call timer
          callTimerRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
            setCallDuration(elapsed);
          }, 1000);
          
          Swal.close(); // Close any open alerts
        },
        onCallDeclined: () => {
          setCallStatus('idle');
          setShowIncomingCall(false);
          setAvailableCall(null);
          Swal.close();
        },
        onCallFailed: ({ reason }) => {
          setCallStatus('idle');
          setShowIncomingCall(false);
          setAvailableCall(null);
          Swal.fire({
            title: 'Call Failed',
            text: reason || 'Failed to join video call.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      });
      
      return () => {
        if (videoCallManagerRef.current) {
          videoCallManagerRef.current.disconnect();
        }
      };
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

  // WebSocket connection setup for video consultation
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        socketRef.current = new WebSocket('ws://localhost:3002');
        
        socketRef.current.onopen = () => {
          console.log('📱 Patient WebSocket connected');
          // Register as patient
          const token = localStorage.getItem('token');
          if (token) {
            socketRef.current.send(JSON.stringify({
              type: 'register',
              token: token,
              userType: 'patient'
            }));
          }
        };

        socketRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('📱 Patient received message:', data);
          
          switch (data.type) {
            case 'call-accepted':
              handleCallAccepted(data);
              break;
            case 'call-declined':
              handleCallDeclined(data);
              break;
            case 'call-ended':
              handleCallEnded(data);
              break;
            case 'webrtc-offer':
            case 'webrtc-answer':
            case 'webrtc-ice-candidate':
              handleWebRTCMessage(data);
              break;
            default:
              break;
          }
        };

        socketRef.current.onclose = () => {
          console.log('📱 Patient WebSocket disconnected');
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };

        socketRef.current.onerror = (error) => {
          console.error('📱 Patient WebSocket error:', error);
        };
      } catch (error) {
        console.error('📱 Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
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
    
    // Fetch appointments for the selected date
    const dateString = selectedDate.toISOString().split('T')[0];
    fetchAppointmentsForDate(dateString);
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

  // Data arrays - will be populated from API calls
  const recentPrescriptions = [];
  const healthTips = [];
  const vitalsTrends = [];

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

  // Function to immediately update local state after successful booking
  const updateLocalStateAfterBooking = (bookedTimeSlot, doctorId) => {
    try {
      console.log('🔄 Updating local state after booking:', { bookedTimeSlot, doctorId });

      // Update availableDoctors state
      setAvailableDoctors(prevDoctors => 
        prevDoctors.map(doctor => {
          if (doctor.id === doctorId || doctor._id === doctorId) {
            // Remove the booked slot from available times
            const updatedAvailableTimes = doctor.availableTimes.filter(slot => slot !== bookedTimeSlot);
            
            // Update slotsWithStatus to mark the booked slot
            const updatedSlotsWithStatus = doctor.slotsWithStatus.map(slot => {
              if (slot.timeSlot === bookedTimeSlot) {
                return { ...slot, status: 'booked' };
              }
              return slot;
            });

            // Update slot counts
            const newAvailableSlotsCount = Math.max(0, (doctor.availableSlotsCount || 0) - 1);
            const newBookedSlotsCount = (doctor.bookedSlotsCount || 0) + 1;

            console.log('📊 Updated doctor state:', {
              doctorName: doctor.name,
              oldAvailableCount: doctor.availableSlotsCount,
              newAvailableCount: newAvailableSlotsCount,
              oldBookedCount: doctor.bookedSlotsCount,
              newBookedCount: newBookedSlotsCount
            });

            return {
              ...doctor,
              availableTimes: updatedAvailableTimes,
              slotsWithStatus: updatedSlotsWithStatus,
              rawSlots: updatedSlotsWithStatus,
              availableSlotsCount: newAvailableSlotsCount,
              bookedSlotsCount: newBookedSlotsCount
            };
          }
          return doctor;
        })
      );

      // Update selectedDoctor if it matches
      if (selectedDoctor && (selectedDoctor.id === doctorId || selectedDoctor._id === doctorId)) {
        setSelectedDoctor(prevSelected => {
          if (!prevSelected) return prevSelected;
          
          const updatedAvailableTimes = prevSelected.availableTimes.filter(slot => slot !== bookedTimeSlot);
          const updatedSlotsWithStatus = prevSelected.slotsWithStatus.map(slot => {
            if (slot.timeSlot === bookedTimeSlot) {
              return { ...slot, status: 'booked' };
            }
            return slot;
          });

          return {
            ...prevSelected,
            availableTimes: updatedAvailableTimes,
            slotsWithStatus: updatedSlotsWithStatus,
            rawSlots: updatedSlotsWithStatus,
            availableSlotsCount: Math.max(0, (prevSelected.availableSlotsCount || 0) - 1),
            bookedSlotsCount: (prevSelected.bookedSlotsCount || 0) + 1
          };
        });
      }

      console.log('✅ Local state updated successfully');
    } catch (error) {
      console.error('❌ Error updating local state:', error);
    }
  };

  // Function to submit appointment booking with payment
  const submitAppointmentBooking = async () => {
    if (!selectedDoctor || !appointmentData.time || !appointmentData.reason.trim()) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please select a time slot and provide a reason for your visit.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b'
      });
      return;
    }

    try {
      // Get current user info
      const currentUser = getCurrentUser();
      const consultationFee = selectedDoctor.consultationFee || 50;

      // Format the date properly without timezone conversion
      const formatDateForServer = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const appointmentDate = formatDateForServer(selectedDate);
      const timeSlot = appointmentData.time;
      const startTime = timeSlot.includes('-') ? timeSlot.split('-')[0] : timeSlot;

      // Prepare payment data
      const paymentData = {
        amount: consultationFee,
        doctorId: selectedDoctor._id || selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientId: currentUser?.id || '',
        patientName: currentUser?.name || '',
        patientEmail: currentUser?.email || '',
        patientPhone: currentUser?.phone || '',
        appointmentData: {
          date: appointmentDate,
          time: startTime,
          timeSlot: timeSlot,
          reason: appointmentData.reason,
          type: appointmentData.type
        }
      };

      console.log('Initiating payment for appointment:', paymentData);

      // Show payment confirmation dialog
      const paymentConfirm = await Swal.fire({
        title: 'Confirm Payment',
        html: `
          <div class="text-left space-y-3">
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 class="font-semibold text-blue-800 mb-3">Appointment Details:</h4>
              <div class="space-y-2 text-sm text-blue-700">
                <div><strong>Doctor:</strong> ${selectedDoctor.name}</div>
                <div><strong>Date:</strong> ${selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
                <div><strong>Time:</strong> ${timeSlot.includes('-') ? timeSlot.replace('-', ' to ') : timeSlot}</div>
                <div><strong>Duration:</strong> ${selectedDoctor.slotDuration || 30} minutes</div>
                <div><strong>Reason:</strong> ${appointmentData.reason}</div>
              </div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
              <div class="flex justify-between items-center">
                <span class="text-green-800 font-semibold">Consultation Fee:</span>
                <span class="text-green-800 font-bold text-lg">₹${consultationFee}</span>
              </div>
            </div>
            <p class="text-sm text-gray-600 mt-3">
              Click "Proceed to Payment" to complete your appointment booking with secure Razorpay payment.
            </p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Proceed to Payment',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280'
      });

      if (!paymentConfirm.isConfirmed) {
        return;
      }

      // Show loading state for the selected slot
      console.log('💳 Initiating payment process...');
      setProcessingSlot(timeSlot);

      // Initiate Razorpay payment
      await paymentService.initiatePayment(
        paymentData,
        // Success callback
        async (verificationResult) => {
          console.log('Payment successful:', verificationResult);
          
          // Clear processing state
          setProcessingSlot(null);
          
          // Immediately update local state to remove booked slot
          updateLocalStateAfterBooking(timeSlot, selectedDoctor._id || selectedDoctor.id);
          
          // Close booking modal
          setShowBookingModal(false);
          setAppointmentData({
            date: '',
            time: '',
            reason: '',
            type: 'consultation'
          });

          // Show success message
          await Swal.fire({
            title: 'Payment Successful!',
            html: `
              <div class="text-left space-y-3">
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 class="font-semibold text-green-800 mb-3">Appointment Booked Successfully!</h4>
                  <div class="space-y-2 text-sm text-green-700">
                    <div><strong>Appointment ID:</strong> ${verificationResult.appointment.id}</div>
                    <div><strong>Payment ID:</strong> ${verificationResult.appointment.paymentId}</div>
                    <div><strong>Status:</strong> Confirmed & Paid</div>
                  </div>
                </div>
                <div class="text-sm text-gray-600">
                  <strong>Next Steps:</strong>
                  <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>You'll receive a confirmation notification</li>
                    <li>Arrive 10 minutes early for your appointment</li>
                    <li>Bring any relevant medical documents</li>
                    <li>Payment receipt has been sent to your email</li>
                  </ul>
                </div>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Got it!'
          });

          // Refresh appointments and doctors
          await fetchScheduledAppointments();
          await loadAvailableDoctors();
          await fetchDoctorsForDate(appointmentDate);
          await fetchAppointmentsForDate(appointmentDate);
        },
        // Failure callback
        async (error) => {
          console.error('Payment failed:', error);
          
          // Clear processing state
          setProcessingSlot(null);
          
          await Swal.fire({
            title: 'Payment Failed',
            text: error.message || 'Payment was unsuccessful. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      );

    } catch (error) {
      console.error('Error initiating payment:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to initiate payment. Please try again.',
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

  // Refresh appointments data for My Schedules page
  const refreshMySchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      await fetchScheduledAppointments();
      
      Swal.fire({
        title: 'Success!',
        text: 'Your appointments have been refreshed',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        icon: 'success'
      });
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to refresh appointments. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoadingSchedules(false);
    }
  };

  // WebRTC and Video Call Helper Functions
  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    peerConnectionRef.current = new RTCPeerConnection(configuration);

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      console.log('📱 Patient received remote stream');
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'webrtc-ice-candidate',
          candidate: event.candidate,
          appointmentId: currentAppointment?._id
        }));
      }
    };

    return peerConnectionRef.current;
  };

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('📱 Error accessing media devices:', error);
      Swal.fire({
        title: 'Camera/Microphone Access Required',
        text: 'Please allow access to your camera and microphone to join the video call.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      throw error;
    }
  };

  const handleCallAccepted = async (data) => {
    console.log('📱 Patient: Call accepted by doctor');
    setCallStatus('connected');
    setShowVideoCallModal(true);
    
    // Start call timer
    callStartTimeRef.current = Date.now();
    callTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      setCallDuration(elapsed);
    }, 1000);

    try {
      // Get user media
      const stream = await getUserMedia();
      
      // Initialize peer connection
      const peerConnection = initializePeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      Swal.fire({
        title: 'Call Connected!',
        text: 'Your video consultation has started.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('📱 Error setting up video call:', error);
      setCallStatus('idle');
      setShowVideoCallModal(false);
    }
  };

  const handleCallDeclined = (data) => {
    console.log('📱 Patient: Call declined by doctor');
    setCallStatus('idle');
    Swal.fire({
      title: 'Call Declined',
      text: 'The doctor is not available for the video call right now. Please try again later.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  const handleCallEnded = (data) => {
    console.log('📱 Patient: Call ended');
    endCall();
  };

  const handleWebRTCMessage = async (data) => {
    if (!peerConnectionRef.current) return;

    try {
      switch (data.type) {
        case 'webrtc-offer':
          await peerConnectionRef.current.setRemoteDescription(data.offer);
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          if (socketRef.current) {
            socketRef.current.send(JSON.stringify({
              type: 'webrtc-answer',
              answer: answer,
              appointmentId: currentAppointment?._id
            }));
          }
          break;

        case 'webrtc-answer':
          await peerConnectionRef.current.setRemoteDescription(data.answer);
          break;

        case 'webrtc-ice-candidate':
          await peerConnectionRef.current.addIceCandidate(data.candidate);
          break;
      }
    } catch (error) {
      console.error('📱 Error handling WebRTC message:', error);
    }
  };



  // Appointment action handlers for "Your Upcoming Appointments" section
  const handleJoinCall = async (appointment) => {
    // This function is kept for compatibility but now uses the new video call system
    if (availableCall && availableCall.appointmentId === appointment.id) {
      joinCall();
    } else {
      Swal.fire({
        title: 'Call Not Ready',
        text: 'Please wait for the doctor to start the video call first.',
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const handleRescheduleAppointment = async (appointment) => {
    const { value: newDate } = await Swal.fire({
      title: 'Reschedule Appointment',
      html: `
        <div class="text-left">
          <p class="mb-4">Current appointment: <strong>${appointment.doctor}</strong></p>
          <p class="mb-4">Current date: <strong>${appointment.formattedDate}</strong></p>
          <p class="mb-4">Current time: <strong>${appointment.time}</strong></p>
          <label for="newDate" class="block text-sm font-medium text-gray-700 mb-2">Select new date:</label>
          <input type="date" id="newDate" class="w-full p-2 border border-gray-300 rounded-md" min="${new Date().toISOString().split('T')[0]}">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Reschedule',
      preConfirm: () => {
        const newDate = document.getElementById('newDate').value;
        if (!newDate) {
          Swal.showValidationMessage('Please select a new date');
          return false;
        }
        return newDate;
      }
    });

    if (newDate) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/appointments/${appointment._id}/reschedule`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            newDate: newDate,
            reason: 'Patient requested reschedule'
          })
        });

        if (response.ok) {
          await fetchScheduledAppointments(); // Refresh appointments
          Swal.fire({
            title: 'Success!',
            text: 'Your appointment has been rescheduled successfully.',
            icon: 'success'
          });
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Failed to reschedule appointment');
        }
      } catch (error) {
        console.error('Error rescheduling appointment:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to reschedule appointment. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  const handleViewDetails = async (appointment) => {
    Swal.fire({
      title: 'Appointment Details',
      html: `
        <div class="text-left space-y-3">
          <div class="border-b pb-3">
            <h4 class="font-semibold text-gray-900">${appointment.doctor}</h4>
            <p class="text-gray-600">${appointment.specialty}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Date</label>
              <p class="text-gray-900 font-medium">${appointment.formattedDate}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Time</label>
              <p class="text-gray-900 font-medium">${appointment.time}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
              <p class="text-gray-900">${appointment.type || 'In-Person'}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
              <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }">${appointment.status}</span>
            </div>
          </div>

          ${appointment.reason ? `
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Reason for Visit</label>
              <p class="text-gray-900">${appointment.reason}</p>
            </div>
          ` : ''}

          ${appointment.appointmentId ? `
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Appointment ID</label>
              <p class="text-gray-900 font-mono">${appointment.appointmentId}</p>
            </div>
          ` : ''}

          ${appointment.duration ? `
            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</label>
              <p class="text-gray-900">${appointment.duration} minutes</p>
            </div>
          ` : ''}
        </div>
      `,
      width: '500px',
      confirmButtonText: 'Close',
      confirmButtonColor: '#3b82f6'
    });
  };

  const handleCancelAppointment = async (appointment) => {
    const result = await Swal.fire({
      title: 'Cancel Appointment?',
      html: `
        <div class="text-left">
          <p class="mb-4">Are you sure you want to cancel your appointment with <strong>${appointment.doctor}</strong>?</p>
          <p class="mb-4">Date: <strong>${appointment.formattedDate}</strong> at <strong>${appointment.time}</strong></p>
          <label for="cancelReason" class="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation (optional):</label>
          <textarea id="cancelReason" rows="3" class="w-full p-2 border border-gray-300 rounded-md" placeholder="Please provide a reason for cancellation..."></textarea>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'Keep Appointment',
      preConfirm: () => {
        const reason = document.getElementById('cancelReason').value;
        return reason || 'No reason provided';
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/appointments/${appointment._id}/cancel`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: 'cancelled',
            cancellationReason: result.value,
            cancelledBy: 'patient'
          })
        });

        if (response.ok) {
          await fetchScheduledAppointments(); // Refresh appointments
          Swal.fire({
            title: 'Cancelled!',
            text: 'Your appointment has been cancelled successfully.',
            icon: 'success'
          });
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Failed to cancel appointment');
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        Swal.fire({
          title: 'Error',
          text: error.message || 'Failed to cancel appointment. Please try again.',
          icon: 'error'
        });
      }
    }
  };

  // Filter and sort appointments for My Schedules page
  const getFilteredAppointments = () => {
    let filtered = [...upcomingAppointments];

    // Apply search filter
    if (scheduleSearch) {
      const searchTerm = scheduleSearch.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.doctor?.toLowerCase().includes(searchTerm) ||
        appointment.specialty?.toLowerCase().includes(searchTerm) ||
        appointment.reason?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (scheduleFilter !== 'all') {
      const today = new Date();
      const todayString = today.toDateString();

      switch (scheduleFilter) {
        case 'upcoming':
          filtered = filtered.filter(apt => new Date(apt.date) > today);
          break;
        case 'today':
          filtered = filtered.filter(apt => new Date(apt.date).toDateString() === todayString);
          break;
        case 'week':
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          filtered = filtered.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= today && aptDate <= nextWeek;
          });
          break;
        case 'month':
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          filtered = filtered.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= today && aptDate <= nextMonth;
          });
          break;
        case 'completed':
          filtered = filtered.filter(apt => apt.status === 'completed');
          break;
        case 'cancelled':
          filtered = filtered.filter(apt => apt.status === 'cancelled');
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (scheduleSort) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'doctor':
          return a.doctor?.localeCompare(b.doctor || '');
        case 'specialty':
          return a.specialty?.localeCompare(b.specialty || '');
        case 'status':
          return a.status?.localeCompare(b.status || '');
        case 'created':
          return new Date(b.appointmentId) - new Date(a.appointmentId); // Assuming newer IDs are later
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Handle filter/sort changes
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'filter') {
      setScheduleFilter(value);
    } else if (filterType === 'sort') {
      setScheduleSort(value);
    } else if (filterType === 'search') {
      setScheduleSearch(value);
    }
  };

  const resetFilters = () => {
    setScheduleFilter('all');
    setScheduleSort('date-asc');
    setScheduleSearch('');
  };

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: HomeIcon, gradient: 'from-blue-500 to-blue-600' },
    { id: 'symptom-checker', label: 'Symptom Checker', icon: BeakerIcon, gradient: 'from-green-500 to-green-600' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDaysIcon, gradient: 'from-purple-500 to-purple-600' },
    { id: 'my-schedules', label: 'My Schedules', icon: ClockIcon, gradient: 'from-orange-500 to-orange-600' },
    { id: 'prescriptions', label: 'E-Prescriptions', icon: DocumentTextIcon, gradient: 'from-pink-500 to-rose-600' },
    { id: 'medical-history', label: 'Medical History', icon: ChartBarIcon, gradient: 'from-indigo-500 to-indigo-600' },
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <CalendarDaysIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Upcoming Appointments
                    </h3>
                    <Button 
                      onClick={() => setActiveTab('my-schedules')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg border border-blue-600 hover:border-blue-700 transition-all duration-200"
                    >
                      View All
                    </Button>
                  </div>
                  
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {upcomingAppointments.slice(0, 2).map((appointment, index) => {
                        const appointmentDate = new Date(appointment.date);
                        const isToday = appointmentDate.toDateString() === new Date().toDateString();
                        const isUpcoming = appointmentDate > new Date();
                        
                        return (
                          <div key={appointment._id || appointment.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                            {/* Header with doctor info */}
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="relative">
                                <img 
                                  src={appointment.doctorId?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'} 
                                  alt={appointment.doctor || 'Doctor'}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  appointment.status === 'confirmed' ? 'bg-green-500' : 
                                  appointment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{appointment.doctor || 'Unknown Doctor'}</h4>
                                <p className="text-gray-600 text-sm">{appointment.specialty || 'General Practice'}</p>
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                                  isToday ? 'bg-emerald-100 text-emerald-800' :
                                  isUpcoming ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {isToday ? 'Today' : isUpcoming ? 'Upcoming' : 'Past'}
                                </span>
                              </div>
                            </div>

                            {/* Appointment Details */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-700">
                                  <CalendarDaysIcon className="w-4 h-4 mr-2 text-blue-600" />
                                  <span className="font-medium">
                                    {appointmentDate.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                  <ClockIcon className="w-4 h-4 mr-2 text-blue-600" />
                                  <span className="font-medium">{appointment.timeSlot || appointment.time}</span>
                                </div>
                                <div className={`text-sm font-medium ${
                                  appointment.status === 'confirmed' ? 'text-emerald-600' :
                                  appointment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                                </div>
                              </div>
                            </div>

                            {/* Video Call Ready Notification */}
                            {availableCall && availableCall.appointmentId === appointment.id && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center text-green-800">
                                  <svg className="w-5 h-5 mr-2 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  <div className="text-sm">
                                    <p className="font-medium">Doctor is ready for your video call!</p>
                                    <p className="text-xs mt-1">Click "Join Call Now" and allow camera/microphone access when prompted.</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                              {isUpcoming && (
                                <Button 
                                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                    availableCall && availableCall.appointmentId === appointment.id
                                      ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                  onClick={() => joinCall()}
                                  disabled={!availableCall || availableCall.appointmentId !== appointment.id}
                                >
                                  <VideoCameraIcon className="w-4 h-4 mr-1" />
                                  {availableCall && availableCall.appointmentId === appointment.id 
                                    ? 'Join Call Now!' 
                                    : 'Join Call'
                                  }
                                </Button>
                              )}
                              
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                                onClick={() => handleViewDetails(appointment)}
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                              
                              {isUpcoming && (
                                <Button 
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                                  onClick={() => handleCancelAppointment(appointment)}
                                >
                                  <XMarkIcon className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Scheduled</h4>
                      <p className="text-gray-500 mb-4">Book your first appointment to get started.</p>
                      <Button 
                        onClick={() => setActiveTab('appointments')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </div>
                  )}
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

      case 'my-schedules':
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <ClockIcon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Schedules</h1>
                    <p className="text-gray-600 mt-1">Manage and track all your healthcare appointments</p>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Quick Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="bg-emerald-100 p-3 rounded-xl mb-3">
                        <CalendarDaysIcon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{upcomingAppointments.length}</div>
                      <div className="text-gray-600 text-sm font-medium">Total Appointments</div>
                    </div>
                    <div className="text-emerald-600 text-right">
                      <div className="text-xs text-gray-500 mb-1">This Month</div>
                      <div className="text-lg font-semibold">+12%</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="bg-blue-100 p-3 rounded-xl mb-3">
                        <ClockIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {upcomingAppointments.filter(apt => {
                          const appointmentDate = new Date(apt.date);
                          const today = new Date();
                          return appointmentDate.toDateString() === today.toDateString();
                        }).length}
                      </div>
                      <div className="text-gray-600 text-sm font-medium">Today's Appointments</div>
                    </div>
                    <div className="text-blue-600 text-right">
                      <div className="text-xs text-gray-500 mb-1">Next 3 Hours</div>
                      <div className="text-lg font-semibold">Ready</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="bg-purple-100 p-3 rounded-xl mb-3">
                        <UserIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {upcomingAppointments.filter(apt => {
                          const appointmentDate = new Date(apt.date);
                          const nextWeek = new Date();
                          nextWeek.setDate(nextWeek.getDate() + 7);
                          return appointmentDate <= nextWeek;
                        }).length}
                      </div>
                      <div className="text-gray-600 text-sm font-medium">Next 7 Days</div>
                    </div>
                    <div className="text-purple-600 text-right">
                      <div className="text-xs text-gray-500 mb-1">Upcoming</div>
                      <div className="text-lg font-semibold">Planned</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Enhanced Filter and Sort Controls */}
            <div className="bg-white border-0 shadow-lg rounded-xl p-6">
              <div className="flex flex-col space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2.5 rounded-xl">
                      <AdjustmentsHorizontalIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Manage Appointments</h3>
                      <p className="text-sm text-gray-600">Filter, sort, and organize your appointments</p>
                    </div>
                  </div>
                </div>

                {/* Controls Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Search Bar */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <MagnifyingGlassIcon className="w-4 h-4 mr-1.5 text-orange-600" />
                      Search Appointments
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search by doctor name, specialty, or appointment notes..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                        value={scheduleSearch}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filter Options */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <FunnelIcon className="w-4 h-4 mr-1.5 text-orange-600" />
                      Filter by Status
                    </label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      value={scheduleFilter}
                      onChange={(e) => handleFilterChange('filter', e.target.value)}
                    >
                      <option value="all">All Appointments</option>
                      <option value="upcoming">Upcoming Only</option>
                      <option value="today">Today's Appointments</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Sort Options */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <ChartBarIcon className="w-4 h-4 mr-1.5 text-orange-600" />
                      Sort by
                    </label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      value={scheduleSort}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                    >
                      <option value="date-asc">Date (Earliest First)</option>
                      <option value="date-desc">Date (Latest First)</option>
                      <option value="doctor">Doctor Name</option>
                      <option value="specialty">Specialty</option>
                      <option value="status">Status</option>
                      <option value="created">Date Created</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Appointments List */}
            <Card className="bg-white border-0 shadow-lg rounded-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <CalendarDaysIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Upcoming Appointments</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isLoadingSchedules && (
                      <div className="flex items-center text-sm text-gray-500">
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </div>
                    )}
                    <Button 
                      className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-sm ${
                        isLoadingSchedules ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                      onClick={refreshMySchedules}
                      disabled={isLoadingSchedules}
                    >
                      <ArrowPathIcon className={`w-4 h-4 mr-1 ${isLoadingSchedules ? 'animate-spin' : ''}`} />
                      {isLoadingSchedules ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </div>
                </div>
                
                {isLoadingSchedules ? (
                  <div className="text-center py-16">
                    <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <ArrowPathIcon className="w-10 h-10 text-blue-600 animate-spin" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Loading Appointments</h4>
                    <p className="text-gray-500">Please wait while we fetch your latest appointments...</p>
                  </div>
                ) : getFilteredAppointments().length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <CalendarDaysIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    {upcomingAppointments.length === 0 ? (
                      <>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Scheduled</h4>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">You don't have any upcoming appointments. Book your first appointment to get started with your healthcare journey.</p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Match Your Filters</h4>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your search terms or filters to see more appointments.</p>
                      </>
                    )}
                    <Button 
                      onClick={() => upcomingAppointments.length === 0 ? setActiveTab('appointments') : resetFilters()}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      {upcomingAppointments.length === 0 ? 'Book Your First Appointment' : 'Clear Filters'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getFilteredAppointments().map((appointment, index) => {
                      const appointmentDate = new Date(appointment.date);
                      const isToday = appointmentDate.toDateString() === new Date().toDateString();
                      const isUpcoming = appointmentDate > new Date();
                      
                      return (
                        <div key={appointment._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-orange-200">
                          <div className="p-4">
                            {/* Compact Header with Doctor Info */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={appointment.doctorId?.profileImage || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'} 
                                  alt={appointment.doctor || 'Doctor'}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"
                                />
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {appointment.doctor || 'Unknown Doctor'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {appointment.specialty || 'General Practice'} • {appointment.experience || 'N/A'} years exp.
                                  </p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                isToday ? 'bg-emerald-500 text-white' :
                                isUpcoming ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                              }`}>
                                {isToday ? 'TODAY' : isUpcoming ? 'UPCOMING' : 'PAST'}
                              </span>
                            </div>

                            {/* Compact Date & Time Info */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-gray-700">
                                  <CalendarDaysIcon className="w-4 h-4 mr-2 text-orange-600" />
                                  <span className="font-medium">
                                    {appointmentDate.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                  <ClockIcon className="w-4 h-4 mr-2 text-orange-600" />
                                  <span className="font-medium">{appointment.timeSlot}</span>
                                </div>
                                <div className={`text-sm font-medium ${
                                  appointment.status === 'confirmed' ? 'text-emerald-600' :
                                  appointment.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                                </div>
                              </div>
                            </div>

                            {/* Compact Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                  availableCall && availableCall.appointmentId === appointment.id
                                    ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                onClick={() => joinCall()}
                                disabled={!availableCall || availableCall.appointmentId !== appointment.id}
                              >
                                <VideoCameraIcon className="w-4 h-4 mr-1" />
                                {availableCall && availableCall.appointmentId === appointment.id 
                                  ? 'Join Call Now!' 
                                  : 'Join Call'
                                }
                              </Button>
                              
                              <Button 
                                className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                                onClick={() => handleViewDetails(appointment)}
                              >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                Details
                              </Button>
                              
                              {isUpcoming && (
                                <Button 
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                                  onClick={() => handleCancelAppointment(appointment)}
                                >
                                  <XMarkIcon className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            
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
                              <div key={index} className={`bg-white rounded-lg p-3 border transition-colors ${
                                doctor.scheduleStatus === 'ended' ? 'border-red-200 bg-red-50' :
                                doctor.scheduleStatus === 'no_slots' ? 'border-yellow-200 bg-yellow-50' :
                                'border-green-200 hover:border-green-300'
                              }`}>
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
                                      {/* Online/Offline Status */}
                                      <div className={`text-xs px-2 py-1 rounded-full mt-1 inline-flex items-center ${
                                        doctor.isActive 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        <div className={`w-2 h-2 rounded-full mr-1 ${
                                          doctor.isActive ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                        {doctor.isActive ? 'Online' : 'Offline'}
                                      </div>
                                      
                                      {/* Schedule Status Badge */}
                                      {doctor.scheduleStatus === 'ended' && (
                                        <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full mt-1 inline-flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          {doctor.expiredSlotsCount > 0 && doctor.availableSlotsCount === 0 ? 
                                            'All slots have passed' : 'Schedule ended for today'
                                          }
                                        </div>
                                      )}
                                      {doctor.scheduleStatus === 'no_slots' && (
                                        <div className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mt-1 inline-flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          No slots scheduled
                                        </div>
                                      )}
                                      
                                      {/* Offline Future Booking Notice */}
                                      {!doctor.isActive && selectedDate && new Date(selectedDate) > new Date() && (
                                        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-1 inline-flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Available for future booking
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className={`px-2 py-1 text-xs ${
                                      doctor.scheduleStatus === 'ended' || 
                                      doctor.scheduleStatus === 'no_slots' ||
                                      isDateInPast(selectedDate) ||
                                      isScheduleTimeExpired(doctor) ||
                                      (!doctor.isActive && selectedDate && new Date(selectedDate) <= new Date())
                                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                    onClick={() => {
                                      const canBook = !isDateInPast(selectedDate) && 
                                                     !isScheduleTimeExpired(doctor) &&
                                                     (doctor.scheduleStatus === 'available' || 
                                                     (!doctor.isActive && selectedDate && new Date(selectedDate) > new Date()));
                                      if (canBook) handleBookAppointment(doctor);
                                    }}
                                    disabled={doctor.scheduleStatus === 'ended' || 
                                             doctor.scheduleStatus === 'no_slots' ||
                                             isDateInPast(selectedDate) ||
                                             isScheduleTimeExpired(doctor) ||
                                             (!doctor.isActive && selectedDate && new Date(selectedDate) <= new Date())}
                                  >
                                    {isDateInPast(selectedDate) ? 'Past Date' :
                                     isScheduleTimeExpired(doctor) ? 'Not Available' :
                                     doctor.scheduleStatus === 'ended' ? 'Ended' :
                                     doctor.scheduleStatus === 'no_slots' ? 'No Slots' :
                                     !doctor.isActive && selectedDate && new Date(selectedDate) <= new Date() ? 'Offline' :
                                     'Book'}
                                  </Button>
                                </div>
                                {/* Show all time slots with status-based styling - only if not past date and schedule not expired */}
                                {doctor.slotsWithStatus && 
                                 doctor.slotsWithStatus.length > 0 && 
                                 !isDateInPast(selectedDate) && 
                                 !isScheduleTimeExpired(doctor) && (
                                  <div className="mt-2 pt-2 border-t border-green-100">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="text-xs text-green-600">
                                        Available Time Slots ({doctor.availableSlotsCount} of {doctor.totalSlots})
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        <span className="ml-1">{doctor.slotDuration || 30} min each</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {(expandedSlots[doctor.id] 
                                        ? doctor.slotsWithStatus 
                                        : doctor.slotsWithStatus.slice(0, 6)
                                      ).map((slot, timeIndex) => {
                                        const displayTime = slot.timeSlot || `${slot.startTime}-${slot.endTime}`;
                                        
                                        // Determine styling based on slot status
                                        let slotClassName, statusIcon, isClickable;
                                        
                                        switch (slot.status) {
                                          case 'available':
                                            slotClassName = "text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 cursor-pointer hover:bg-green-200 transition-colors";
                                            statusIcon = <ClockIcon className="h-2 w-2" />;
                                            isClickable = true;
                                            break;
                                          case 'expired':
                                            slotClassName = "text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded flex items-center gap-1 cursor-not-allowed opacity-60";
                                            statusIcon = <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                            isClickable = false;
                                            break;
                                          case 'booked':
                                            slotClassName = "text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center gap-1 cursor-not-allowed";
                                            statusIcon = <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
                                            isClickable = false;
                                            break;
                                          default:
                                            slotClassName = "text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1";
                                            statusIcon = <ClockIcon className="h-2 w-2" />;
                                            isClickable = false;
                                        }
                                        
                                        return (
                                          <span 
                                            key={timeIndex} 
                                            className={slotClassName}
                                            title={slot.status === 'expired' ? 'Time has passed' : 
                                                   slot.status === 'booked' ? 'Already booked' : 
                                                   slot.status === 'available' ? 'Available for booking' : ''}
                                          >
                                            {statusIcon}
                                            {displayTime}
                                          </span>
                                        );
                                      })}
                                      {doctor.slotsWithStatus.length > 6 && !expandedSlots[doctor.id] && (
                                        <button
                                          onClick={() => toggleExpandedSlots(doctor.id)}
                                          className="text-xs text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded border border-green-200 hover:border-green-300 transition-colors cursor-pointer"
                                        >
                                          +{doctor.slotsWithStatus.length - 6} more
                                        </button>
                                      )}
                                      {expandedSlots[doctor.id] && doctor.slotsWithStatus.length > 6 && (
                                        <button
                                          onClick={() => toggleExpandedSlots(doctor.id)}
                                          className="text-xs text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded border border-green-200 hover:border-green-300 transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                          <XMarkIcon className="h-2 w-2" />
                                          less
                                        </button>
                                      )}
                                    </div>
                                    {/* Slot status legend */}
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                      {doctor.availableSlotsCount > 0 && (
                                        <div className="flex items-center gap-1">
                                          <span className="w-2 h-2 bg-green-500 rounded"></span>
                                          <span className="text-green-600">{doctor.availableSlotsCount} Available</span>
                                        </div>
                                      )}
                                      {doctor.bookedSlotsCount > 0 && (
                                        <div className="flex items-center gap-1">
                                          <span className="w-2 h-2 bg-red-500 rounded"></span>
                                          <span className="text-red-600">{doctor.bookedSlotsCount} Booked</span>
                                        </div>
                                      )}
                                      {doctor.expiredSlotsCount > 0 && (
                                        <div className="flex items-center gap-1">
                                          <span className="w-2 h-2 bg-gray-500 rounded"></span>
                                          <span className="text-gray-500">{doctor.expiredSlotsCount} Expired</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Show message when slots are hidden due to past date or expired schedule */}
                                {doctor.slotsWithStatus && 
                                 doctor.slotsWithStatus.length > 0 && 
                                 (isDateInPast(selectedDate) || isScheduleTimeExpired(doctor)) && (
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="text-xs text-gray-600 flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {isDateInPast(selectedDate) ? 
                                        'Appointment slots not available for past dates' :
                                        'Schedule time period has ended - not available for booking'
                                      }
                                    </div>
                                  </div>
                                )}
                                
                                {/* Show message for ended or no slots */}
                                {doctor.scheduleStatus === 'ended' && (
                                  <div className="mt-2 pt-2 border-t border-red-200">
                                    <div className="text-xs text-red-600 flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {doctor.expiredSlotsCount > 0 && doctor.availableSlotsCount === 0 ? 
                                        'All appointment slots have passed their scheduled time' :
                                        'All scheduled slots for today have passed'
                                      }
                                    </div>
                                    {doctor.totalSlots > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Total slots: {doctor.totalSlots} | 
                                        {doctor.bookedSlotsCount > 0 && ` Booked: ${doctor.bookedSlotsCount} |`}
                                        {doctor.expiredSlotsCount > 0 && ` Expired/Unused: ${doctor.expiredSlotsCount}`}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {doctor.scheduleStatus === 'no_slots' && (
                                  <div className="mt-2 pt-2 border-t border-yellow-200">
                                    <div className="text-xs text-yellow-600 flex items-center">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      No appointment slots scheduled for this date
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
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm py-2.5 font-semibold"
                          onClick={() => {
                            setShowQuickActions(false);
                            const availableDocs = availableDoctors.filter(doctor => !isScheduleTimeExpired(doctor));
                            if (availableDocs.length > 0) {
                              handleBookAppointment(availableDocs[0]);
                            } else {
                              Swal.fire({
                                title: 'No Doctors Available',
                                text: 'No doctors are currently available or all schedules have ended. Please check back later.',
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
                                <div className="text-xs text-purple-600 mb-1">
                                  {doctor.slotDuration || 30} min slots
                                </div>
                                <div className="text-sm font-medium mb-1">
                                  <span className="text-green-600">{doctor.availableSlotsCount || doctor.availableTimes.length}</span>
                                  <span className="text-purple-600">/{doctor.totalSlots || doctor.availableTimes.length}</span>
                                  <span className="text-gray-500 text-xs ml-1">available</span>
                                </div>
                                {doctor.bookedSlotsCount > 0 && (
                                  <div className="text-xs text-red-600 mb-1">
                                    {doctor.bookedSlotsCount} booked
                                  </div>
                                )}
                                <div className="text-lg font-bold text-purple-700">
                                  ₹{doctor.consultationFee || '50'}
                                </div>
                                <Button
                                  size="sm"
                                  disabled={isScheduleTimeExpired(doctor)}
                                  onClick={() => {
                                    if (!isScheduleTimeExpired(doctor)) {
                                      setSelectedDoctor(doctor);
                                      setShowBookingModal(true);
                                    }
                                  }}
                                  className={`mt-2 px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 ${
                                    isScheduleTimeExpired(doctor)
                                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
                                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:shadow-lg'
                                  }`}
                                >
                                  {isScheduleTimeExpired(doctor) ? 'Schedule Ended' : 'Book Now'}
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
                            {doctor.availableTimes.length > 0 && 
                             !isDateInPast(selectedDate) && 
                             !isScheduleTimeExpired(doctor) ? (
                              <div>
                                <h5 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                  <ClockIcon className="h-4 w-4" />
                                  Available Time Slots ({doctor.availableSlotsCount || doctor.availableTimes.length} of {doctor.totalSlots || doctor.availableTimes.length})
                                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                    {doctor.slotDuration || 30} min each
                                  </span>
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {(expandedSlots[doctor.id] 
                                    ? doctor.availableTimes 
                                    : doctor.availableTimes.slice(0, 8)
                                  ).map((time, index) => {
                                    // Check if this is a time range (contains '-') or single time
                                    const isTimeRange = time.includes('-');
                                    const displayTime = isTimeRange ? time : time;
                                    
                                    return (
                                      <button 
                                        key={index} 
                                        onClick={() => handleSlotSelection(doctor, displayTime, index)}
                                        className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-green-200 hover:border-green-300 hover:shadow-sm flex items-center gap-1"
                                        title={`Book appointment for ${displayTime} (${doctor.slotDuration || 30} minutes)`}
                                      >
                                        <ClockIcon className="h-3 w-3" />
                                        {displayTime}
                                      </button>
                                    );
                                  })}
                                  {doctor.availableTimes.length > 8 && !expandedSlots[doctor.id] && (
                                    <button 
                                      onClick={() => toggleExpandedSlots(doctor.id)}
                                      className="flex items-center text-purple-600 text-sm px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors cursor-pointer"
                                    >
                                      <PlusIcon className="h-3 w-3 mr-1" />
                                      {doctor.availableTimes.length - 8} more slots
                                    </button>
                                  )}
                                  {expandedSlots[doctor.id] && doctor.availableTimes.length > 8 && (
                                    <button 
                                      onClick={() => toggleExpandedSlots(doctor.id)}
                                      className="flex items-center text-purple-600 text-sm px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors cursor-pointer"
                                    >
                                      <XMarkIcon className="h-3 w-3 mr-1" />
                                      Show less
                                    </button>
                                  )}
                                </div>
                                
                                {/* Slot Summary */}
                                <div className="mt-3 flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-green-200 rounded border border-green-300"></div>
                                    <span className="text-green-700">{doctor.availableSlotsCount || doctor.availableTimes.length} Available</span>
                                  </div>
                                  {doctor.bookedSlotsCount > 0 && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-3 h-3 bg-red-200 rounded border border-red-300"></div>
                                      <span className="text-red-700">{doctor.bookedSlotsCount} Booked</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <ClockIcon className="h-3 w-3 text-purple-600" />
                                    <span className="text-purple-700">
                                      {doctor.scheduleDetails.startTime} - {doctor.scheduleDetails.endTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                <ClockIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">
                                  {isDateInPast(selectedDate) ? 'Date has passed' :
                                   isScheduleTimeExpired(doctor) ? 'Schedule time ended' :
                                   'No available slots'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {isDateInPast(selectedDate) ? 
                                    'Appointment slots are not available for past dates' :
                                   isScheduleTimeExpired(doctor) ?
                                    'The doctor\'s schedule time period has ended for today' :
                                   doctor.bookedSlotsCount > 0 ? 
                                    `All ${doctor.totalSlots || 0} slots are booked for this day` : 
                                    'Doctor has not set availability for this day'
                                  }
                                </p>
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
                <Card className="bg-white border border-gray-200 shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        <CalendarDaysIcon className="w-6 h-6 mr-3 text-blue-600" />
                        Your Upcoming Appointments
                      </h3>
                      <div className="flex items-center space-x-2">
                        {upcomingAppointments.length > 2 && (
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {upcomingAppointments.length} total
                          </span>
                        )}
                        {upcomingAppointments.length > 2 && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                            Scroll to see more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {upcomingAppointments.length > 0 ? (
                      <div className="relative">
                        {/* Scrollable container with exact height for 2 appointments */}
                        <div className="h-80 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                          {upcomingAppointments.map((appointment, index) => (
                            <div key={appointment.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
                              {/* Header with doctor info */}
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="relative">
                                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                                    <UserIcon className="w-6 h-6" />
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    appointment.status === 'confirmed' ? 'bg-green-500' : 
                                    appointment.status === 'pending' ? 'bg-yellow-500' : 
                                    appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                                  }`}></div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg mb-1">{appointment.doctor}</h4>
                                  <div className="flex items-center space-x-3">
                                    <p className="text-gray-600 text-sm">{appointment.specialty}</p>
                                    <div className="flex items-center">
                                      <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                      </svg>
                                      <span className="text-xs font-medium text-gray-700">{appointment.rating}</span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                      appointment.status === 'confirmed' 
                                        ? 'bg-green-100 text-green-800'
                                        : appointment.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : appointment.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {appointment.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Compact Date, Time and Type Info */}
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">Date</div>
                                      <div className="font-semibold text-gray-900 text-sm">
                                        {appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        }) : 'Date TBD'}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
                                      <div className="font-semibold text-blue-600 text-sm">
                                        {appointment.time || appointment.timeSlot || 'Time TBD'}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">Type</div>
                                      <div className={`inline-flex items-center px-2 py-1 text-xs rounded-md font-medium ${
                                        (appointment.type || appointment.appointmentType) === 'Video Call' || appointment.isOnline
                                          ? 'bg-blue-100 text-blue-700' 
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {(appointment.type || appointment.appointmentType) === 'Video Call' || appointment.isOnline ? 
                                          <VideoCameraIcon className="w-3 h-3 mr-1" /> : 
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                          </svg>
                                        }
                                        {appointment.type || appointment.appointmentType || (appointment.isOnline ? 'Video Call' : 'In-Person')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Compact Appointment Details */}
                              {appointment.reason && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                                  <div className="flex items-start space-x-2">
                                    <svg className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <div>
                                      <div className="text-xs text-blue-700 font-medium uppercase tracking-wide">Reason for Visit</div>
                                      <p className="text-blue-800 text-sm">"{appointment.reason}"</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => joinCall()}
                                    disabled={!availableCall || availableCall.appointmentId !== appointment.id}
                                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                      availableCall && availableCall.appointmentId === appointment.id
                                        ? 'bg-green-600 text-white hover:bg-green-700 animate-pulse'
                                        : callStatus === 'connected' && availableCall?.appointmentId === appointment.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                    title={
                                      availableCall && availableCall.appointmentId === appointment.id
                                        ? 'Doctor is calling - Click to join!'
                                        : callStatus === 'connected'
                                        ? 'Call in progress'
                                        : 'Waiting for doctor to start call'
                                    }
                                  >
                                    {callStatus === 'connected' && availableCall?.appointmentId === appointment.id ? (
                                      <PhoneIcon className="w-4 h-4 mr-1" />
                                    ) : (
                                      <VideoCameraIcon className="w-4 h-4 mr-1" />
                                    )}
                                    {availableCall && availableCall.appointmentId === appointment.id && callStatus !== 'connected' 
                                      ? 'Join Call Now!' 
                                      : callStatus === 'connected' && availableCall?.appointmentId === appointment.id
                                      ? 'In Call'
                                      : 'Join Call'
                                    }
                                  </button>
                                  <button 
                                    onClick={() => handleViewDetails(appointment)}
                                    className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                  >
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    Details
                                  </button>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button 
                                    onClick={() => handleCancelAppointment(appointment)}
                                    className="flex items-center px-2 py-1.5 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Scroll indicator at bottom */}
                        {upcomingAppointments.length > 2 && (
                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none flex items-center justify-center">
                            <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200">
                              ↓ Scroll for more
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CalendarDaysIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No upcoming appointments</h4>
                        <p className="text-gray-500 mb-6">Schedule your next appointment to maintain your health.</p>
                        <Button 
                          onClick={() => setActiveTab('appointments')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
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
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm">
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
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg">
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
              <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center font-medium px-4 py-2 rounded-lg">
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
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book Appointment</h3>
              <p className="text-gray-600">Schedule your visit with {selectedDoctor.name}</p>
              
              {/* Selected Date Display */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Appointment Date: {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                {/* {selectedSlotDetails && selectedSlotDetails.timeSlot && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <ClockIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Selected Time: {selectedSlotDetails.timeSlot} ({selectedSlotDetails.slotDuration} minutes)
                    </span>
                  </div>
                )} */}
              </div>
            </div>
            
            {/* Form */}
            <div className="space-y-4">
              
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                  <span className="text-xs text-gray-500 ml-2">
                    ({selectedDoctor.slotDuration || 30} min each)
                  </span>
                </label>
                
                {/* Current Selection Display */}
                {/* {appointmentData.time && (
                  <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Selected: {appointmentData.time}
                      </span>
                    </div>
                  </div>
                )} */}
                
                {/* Time Slot Buttons */}
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {selectedDoctor.availableTimes && selectedDoctor.availableTimes.length > 0 ? (
                    selectedDoctor.availableTimes.map((timeSlot, index) => {
                      // Parse the timeSlot to get start and end times
                      const [startTime, endTime] = timeSlot.includes('-') ? timeSlot.split('-') : [timeSlot, ''];
                      const displayTime = endTime ? `${startTime} - ${endTime}` : startTime;
                      
                      const isProcessing = processingSlot === timeSlot;
                      const isBooked = selectedDoctor.slotsWithStatus && 
                        selectedDoctor.slotsWithStatus.find(slot => slot.timeSlot === timeSlot && slot.status === 'booked');
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={isProcessing || isBooked}
                          onClick={() => setAppointmentData({...appointmentData, time: timeSlot})}
                          className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                            isProcessing 
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-300 cursor-not-allowed animate-pulse'
                              : isBooked
                              ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed opacity-50'
                              : appointmentData.time === timeSlot
                              ? 'bg-blue-500 text-white border-blue-500 shadow-md ring-2 ring-blue-200'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1">
                              {isProcessing ? (
                                <>
                                  <div className="h-3 w-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span className="font-medium">{startTime}</span>
                                </>
                              ) : isBooked ? (
                                <>
                                  <XMarkIcon className="h-3 w-3" />
                                  <span className="font-medium line-through">{startTime}</span>
                                </>
                              ) : (
                                <>
                                  <ClockIcon className="h-3 w-3" />
                                  <span className="font-medium">{startTime}</span>
                                </>
                              )}
                            </div>
                            {endTime && !isBooked && (
                              <span className="text-xs opacity-75">
                                {isProcessing ? 'Processing...' : `${selectedDoctor.slotDuration || 30} min`}
                              </span>
                            )}
                            {isBooked && (
                              <span className="text-xs opacity-75">Booked</span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-4">
                      <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No available time slots</p>
                      <p className="text-xs text-gray-400">Please select a different date</p>
                    </div>
                  )}
                </div>
                
                {selectedDoctor.availableTimes && selectedDoctor.availableTimes.length > 0 && (
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {selectedDoctor.availableSlotsCount || selectedDoctor.availableTimes.length} available slots
                    </span>
                    <span>
                      Total: {selectedDoctor.totalSlots || selectedDoctor.availableTimes.length} slots
                    </span>
                  </div>
                )}
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

              {/* Consultation Fee Display */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-green-800">Consultation Fee</h4>
                    <p className="text-xs text-green-600 mt-1">Secure payment via Razorpay</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">₹{selectedDoctor.consultationFee || 50}</div>
                    <div className="text-xs text-green-600">inclusive of taxes</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs text-green-700">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  100% secure payment • Instant confirmation • Refund available
                </div>
              </div>
            </div>
            
            
            
            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowBookingModal(false);
                  // Reset appointment data if needed
                  setAppointmentData({
                    date: '',
                    time: '',
                    reason: '',
                    type: 'consultation'
                  });
                }}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={submitAppointmentBooking}
                disabled={!appointmentData.time || !appointmentData.reason.trim()}
                className={`flex-1 transition-all duration-200 ${
                  !appointmentData.time || !appointmentData.reason.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-lg'
                }`}
              >
                {!appointmentData.time ? 'Select Time Slot' : 
                 !appointmentData.reason.trim() ? 'Add Reason' : 
                 `Pay ₹${selectedDoctor.consultationFee || 50} & Book`}
              </Button>
            </div>
            
            {/* Validation Message */}
            {(!appointmentData.time || !appointmentData.reason.trim()) && (
              <div className="mt-2 text-center">
                <p className="text-xs text-red-700">
                  {!appointmentData.time && 'Please select a time slot. '}
                  {!appointmentData.reason.trim() && 'Please provide a reason for your visit.'}
                </p>
              </div>
            )}
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

      {/* Video Call Modal */}
      {showVideoCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-4xl mx-4 my-4 overflow-hidden">
            {/* Video Call Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Video Consultation</h3>
                <p className="text-blue-100">
                  {callStatus === 'connected' ? `Duration: ${formatCallDuration(callDuration)}` : 'Connecting...'}
                </p>
              </div>
              <div className="text-blue-100 text-sm">
                Patient: {user?.firstName} {user?.lastName}
              </div>
            </div>

            {/* Video Container */}
            <div className="relative h-96 bg-gray-900">
              {/* Remote Video (Doctor) - Main view */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Local Video (Patient) - Picture in Picture */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoCameraSlashIcon className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Connection Status Overlay */}
              {callStatus !== 'connected' && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-lg">
                      {callStatus === 'ringing' ? 'Joining call...' : 'Connecting...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls */}
            <div className="bg-gray-50 p-4">
              <div className="flex justify-center space-x-4">
                {/* Video Toggle */}
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    isVideoEnabled
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } transition-colors`}
                  title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isVideoEnabled ? (
                    <VideoCameraIcon className="w-6 h-6" />
                  ) : (
                    <VideoCameraSlashIcon className="w-6 h-6" />
                  )}
                </button>

                {/* Audio Toggle */}
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${
                    isAudioEnabled
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  } transition-colors`}
                  title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isAudioEnabled ? (
                    <MicrophoneIcon className="w-6 h-6" />
                  ) : (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                  )}
                </button>

                {/* End Call */}
                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                  title="End call"
                >
                  <PhoneIcon className="w-6 h-6 transform rotate-135" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;