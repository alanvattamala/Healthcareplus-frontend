import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { Card, Button, Modal } from '../../components';
import { handleLogout, getCurrentUser, requireAuth } from '../../utils/auth';

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
  
  // Get user data using the utility function
  const userData = getCurrentUser() || {};

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  // Enhanced mock data with more details
  const upcomingAppointments = [
    { 
      id: 1, 
      doctor: 'Dr. Sarah Johnson', 
      specialty: 'Cardiology', 
      date: '2025-08-05', 
      time: '10:30 AM', 
      type: 'Video Call',
      avatar: '👩‍⚕️',
      rating: 4.9,
      status: 'confirmed'
    },
    { 
      id: 2, 
      doctor: 'Dr. Michael Chen', 
      specialty: 'General Medicine', 
      date: '2025-08-08', 
      time: '2:15 PM', 
      type: 'In-person',
      avatar: '👨‍⚕️',
      rating: 4.8,
      status: 'pending'
    }
  ];

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
      icon: '💧',
      readTime: '2 min read'
    },
    { 
      id: 2, 
      title: 'Regular Exercise', 
      content: '30 minutes of moderate exercise can improve your cardiovascular health significantly.',
      category: 'Fitness',
      icon: '🏃‍♂️',
      readTime: '3 min read'
    },
    { 
      id: 3, 
      title: 'Balanced Diet', 
      content: 'Include fruits, vegetables, and whole grains in your daily meals for better nutrition.',
      category: 'Nutrition',
      icon: '🥗',
      readTime: '4 min read'
    }
  ];

  const vitalsTrends = [
    { metric: 'Blood Pressure', value: '120/80', status: 'normal', trend: 'stable', color: 'green' },
    { metric: 'Heart Rate', value: '72 bpm', status: 'normal', trend: 'stable', color: 'blue' },
    { metric: 'Blood Sugar', value: '95 mg/dL', status: 'normal', trend: 'improving', color: 'green' },
    { metric: 'Temperature', value: '98.6°F', status: 'normal', trend: 'stable', color: 'blue' }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: '🏠', gradient: 'from-blue-500 to-blue-600' },
    { id: 'appointments', label: 'Appointments', icon: '📅', gradient: 'from-purple-500 to-purple-600' },
    { id: 'symptom-checker', label: 'AI Symptom Checker', icon: '🔍', gradient: 'from-green-500 to-green-600' },
    { id: 'consultations', label: 'Video Calls', icon: '💻', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊', gradient: 'from-pink-500 to-rose-600' },
    { id: 'medical-history', label: 'Medical History', icon: '📋', gradient: 'from-indigo-500 to-indigo-600' },
    { id: 'vitals', label: 'Vitals Tracker', icon: '📊', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'chat', label: 'Doctor Chat', icon: '💬', gradient: 'from-cyan-500 to-cyan-600' },
    { id: 'records', label: 'Upload Records', icon: '📤', gradient: 'from-orange-500 to-orange-600' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', gradient: 'from-red-500 to-red-600' },
    { id: 'health-tips', label: 'Health Tips', icon: '💡', gradient: 'from-yellow-500 to-yellow-600' },
    { id: 'reviews', label: 'Reviews', icon: '⭐', gradient: 'from-purple-500 to-pink-600' }
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
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">
                  Welcome back, {userData.firstName || 'Patient'}! 👋
                </h2>
                <p className="text-blue-100 text-lg">
                  Here's your health overview for today • {currentTime.toLocaleDateString()}
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{upcomingAppointments.length}</div>
                  <div className="text-blue-100 text-sm">Upcoming Appointments</div>
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Next: {upcomingAppointments[0]?.date}
                  </div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{recentPrescriptions.length}</div>
                  <div className="text-emerald-100 text-sm">Active Prescriptions</div>
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    All up to date ✓
                  </div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">12</div>
                  <div className="text-purple-100 text-sm">Medical Records</div>
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Updated
                  </div>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">98%</div>
                  <div className="text-orange-100 text-sm">Health Score</div>
                  <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                    Excellent ⭐
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3 text-2xl">⚡</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setShowSymptomChecker(true)}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 text-emerald-800 hover:text-emerald-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <span className="text-3xl mb-3 animate-pulse">🔍</span>
                  <span className="text-sm font-semibold">AI Symptom Checker</span>
                  <span className="text-xs text-emerald-600 mt-1">Smart Analysis</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('appointments')}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-800 hover:text-blue-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <span className="text-3xl mb-3">📅</span>
                  <span className="text-sm font-semibold">Book Appointment</span>
                  <span className="text-xs text-blue-600 mt-1">Available Today</span>
                </Button>
                <Button 
                  onClick={() => setShowChatbot(true)}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-800 hover:text-purple-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <span className="text-3xl mb-3 animate-bounce">🤖</span>
                  <span className="text-sm font-semibold">AI Health Assistant</span>
                  <span className="text-xs text-purple-600 mt-1">24/7 Support</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('vitals')}
                  className="flex flex-col items-center p-6 h-auto bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 text-orange-800 hover:text-orange-900 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  variant="outline"
                >
                  <span className="text-3xl mb-3">📊</span>
                  <span className="text-sm font-semibold">Track Vitals</span>
                  <span className="text-xs text-orange-600 mt-1">Health Monitoring</span>
                </Button>
              </div>
            </Card>

            {/* Upcoming Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2 text-xl">🗓️</span>
                    Upcoming Appointments
                  </h3>
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 p-4 border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                              {appointment.avatar}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{appointment.doctor}</div>
                              <div className="text-sm text-gray-600">{appointment.specialty}</div>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="text-yellow-400">⭐</span>
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
                    <span className="mr-2 text-xl">💊</span>
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3 text-3xl">📅</span>
                Appointments
              </h2>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <span className="mr-2">➕</span>
                Book New Appointment
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-2 text-xl">👨‍⚕️</span>
                    Available Doctors
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', rating: 4.9, nextAvailable: 'Tomorrow 10:00 AM', avatar: '👩‍⚕️', color: 'from-pink-500 to-rose-500' },
                      { name: 'Dr. Michael Chen', specialty: 'General Medicine', rating: 4.8, nextAvailable: 'Today 3:30 PM', avatar: '👨‍⚕️', color: 'from-blue-500 to-indigo-500' },
                      { name: 'Dr. Emily Davis', specialty: 'Dermatology', rating: 4.7, nextAvailable: 'Aug 6, 9:00 AM', avatar: '👩‍⚕️', color: 'from-purple-500 to-violet-500' }
                    ].map((doctor, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 bg-gradient-to-r ${doctor.color} rounded-full flex items-center justify-center text-white text-2xl shadow-lg`}>
                              {doctor.avatar}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-gray-900">{doctor.name}</div>
                              <div className="text-sm text-gray-600 font-medium">{doctor.specialty}</div>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="text-yellow-400 text-lg">⭐</span>
                                <span className="text-sm font-semibold text-gray-700">{doctor.rating}</span>
                                <span className="text-xs text-gray-500">(125+ reviews)</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-2 font-medium">Next available:</div>
                            <div className="text-sm font-bold text-gray-800 mb-3">{doctor.nextAvailable}</div>
                            <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300">
                              <span className="mr-1">📞</span>
                              Book Now
                            </Button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2 text-xl">📆</span>
                    Calendar View
                  </h3>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4 animate-pulse">📅</div>
                    <div className="text-gray-600 font-medium mb-4">Interactive Calendar</div>
                    <div className="text-sm text-gray-500 mb-6">View your schedule at a glance</div>
                    <Button variant="outline" className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300">
                      <span className="mr-2">👁️</span>
                      View Full Calendar
                    </Button>
                  </div>
                </div>
              </Card>
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
                    <div className="text-xs text-gray-500">
                      Trend: {vital.trend === 'improving' ? '📈' : '📊'} {vital.trend}
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
                      <div className="text-4xl mb-2">📊</div>
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
                <span className="mr-3 text-3xl">💡</span>
                Personalized Health Tips
              </h2>
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300">
                <span className="mr-2">✨</span>
                Get More Tips
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthTips.map((tip) => (
                <Card key={tip.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                  <div className="relative p-6">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-bl-3xl flex items-center justify-center">
                      <span className="text-2xl">{tip.icon}</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
              
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white font-bold text-xl">H+</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  HealthcarePlus
                </h1>
                <p className="text-sm text-gray-500 font-medium">Patient Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {userData.firstName} {userData.lastName}
                </div>
                <div className="text-xs text-gray-500">Patient ID: #P{userData.id || '12345'}</div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <span className="text-white font-bold text-sm sm:text-lg">
                  {(userData.firstName || 'P')[0]}
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

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center transform hover:scale-110 hover:rotate-12 animate-pulse"
      >
        <span className="text-2xl">🤖</span>
      </button>
      
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
