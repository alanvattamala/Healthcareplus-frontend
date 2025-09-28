import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, User, MapPin, Plus, X, Users, FileText, Settings, LogOut } from 'lucide-react';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [doctorsForDate, setDoctorsForDate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const quickActionsRef = useRef(null);

  useEffect(() => {
    fetchScheduledAppointments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowQuickActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const fetchScheduledAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments/upcoming');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsForDate = async (date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/doctors/availability-for-date?date=${dateStr}`);
      if (response.ok) {
        const data = await response.json();
        setDoctorsForDate(data);
      }
    } catch (error) {
      console.error('Error fetching doctors for date:', error);
      setDoctorsForDate([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    fetchDoctorsForDate(date);
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];
    
    // Previous month's days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - firstDayOfWeek + i);
      days.push(
        <button
          key={`prev-${i}`}
          className="w-10 h-10 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => handleDateClick(date)}
        >
          {date.getDate()}
        </button>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();
      const hasAppointments = appointments.some(apt => 
        new Date(apt.date).toDateString() === date.toDateString()
      );

      days.push(
        <button
          key={day}
          className={`w-10 h-10 rounded-lg transition-all duration-200 relative ${
            isSelected 
              ? 'bg-blue-600 text-white shadow-md' 
              : isToday
              ? 'bg-blue-100 text-blue-600 font-semibold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => handleDateClick(date)}
        >
          {day}
          {hasAppointments && (
            <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
              isSelected ? 'bg-white' : 'bg-blue-500'
            }`}></div>
          )}
        </button>
      );
    }

    return days;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const quickActionItems = [
    { icon: Users, label: 'Book Appointment', color: 'text-blue-600' },
    { icon: Calendar, label: 'View Schedule', color: 'text-green-600' },
    { icon: FileText, label: 'Medical Records', color: 'text-purple-600' },
    { icon: Settings, label: 'Settings', color: 'text-gray-600' },
    { icon: LogOut, label: 'Logout', color: 'text-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your healthcare appointments and schedule</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="mr-2 text-blue-600" size={24} />
                  Calendar
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <span className="font-medium text-gray-900 min-w-[160px] text-center">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>

              {selectedDate && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Selected Date: {formatDate(selectedDate)}
                  </h3>
                  {loading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : doctorsForDate.length > 0 ? (
                    <div>
                      <p className="text-blue-700 mb-3">Available doctors for this date:</p>
                      <div className="space-y-2">
                        {doctorsForDate.map((doctor, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User size={16} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doctor.name}</p>
                                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{doctor.availableSlots} slots</p>
                              <p className="text-xs text-green-600">Available</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-blue-700">No doctors available for this date</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2 text-blue-600" size={24} />
                Upcoming Appointments
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 4).map((appointment) => (
                    <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                          <p className="text-gray-600 text-sm mb-2">{appointment.specialty}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {new Date(appointment.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock size={14} className="mr-1" />
                              {appointment.time}
                            </span>
                          </div>
                          {appointment.location && (
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <MapPin size={14} className="mr-1" />
                              {appointment.location}
                            </div>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No upcoming appointments</p>
                  <p className="text-sm text-gray-500 mt-1">Book an appointment to get started</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                  <div className="text-sm text-blue-700">Total Appointments</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(apt => apt.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-green-700">Confirmed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Actions Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative" ref={quickActionsRef}>
            {/* Backdrop */}
            {showQuickActions && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm -z-10"
                onClick={() => setShowQuickActions(false)}
              />
            )}
            
            {/* Quick Actions Menu */}
            {showQuickActions && (
              <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 min-w-[200px] animate-fadeIn">
                {quickActionItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={index}
                      className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      onClick={() => {
                        // Handle action here
                        setShowQuickActions(false);
                        console.log(`Clicked: ${item.label}`);
                      }}
                    >
                      <IconComponent size={20} className={`mr-3 ${item.color}`} />
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Floating Button */}
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-once ${
                showQuickActions ? 'rotate-45' : ''
              }`}
              title="Quick Actions"
              aria-label="Quick Actions Menu"
              aria-expanded={showQuickActions}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounceOnce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-bounce-once {
          animation: bounceOnce 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PatientDashboard;
