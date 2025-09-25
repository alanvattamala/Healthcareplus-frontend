import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Calendar = ({ 
  selectedDates = [], 
  onDateSelect, 
  minDate = new Date(),
  maxDate = null,
  multiSelect = false,
  disabledDates = [],
  existingSchedules = {},
  completedSchedules = {}
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper function to format date as YYYY-MM-DD without timezone issues
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get first day of the month and number of days in month
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Create calendar grid
  const calendarDays = [];
  
  // Previous month's trailing days
  const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isPreviousMonth: true,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthLastDay - i)
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isPreviousMonth: false,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    });
  }
  
  // Next month's leading days
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isPreviousMonth: false,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day)
    });
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const isDateSelected = (date) => {
    const dateStr = formatDateString(date);
    return selectedDates.some(selectedDate => {
      const selectedStr = typeof selectedDate === 'string' ? selectedDate : formatDateString(new Date(selectedDate));
      return selectedStr === dateStr;
    });
  };

  const isDateDisabled = (date) => {
    // Check if date is before minDate
    if (minDate && date < minDate) return true;
    
    // Check if date is after maxDate
    if (maxDate && date > maxDate) return true;
    
    // Check if date is in disabledDates array
    const dateStr = formatDateString(date);
    return disabledDates.includes(dateStr);
  };

  const hasExistingSchedule = (date) => {
    const dateStr = formatDateString(date);
    return existingSchedules[dateStr];
  };

  const hasCompletedSchedule = (date) => {
    const dateStr = formatDateString(date);
    return completedSchedules[dateStr];
  };

  const handleDateClick = (date, dayInfo) => {
    if (!dayInfo.isCurrentMonth || isDateDisabled(date)) return;
    
    if (onDateSelect) {
      onDateSelect(date, isDateSelected(date));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {daysOfWeek.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayInfo, index) => {
          const isSelected = isDateSelected(dayInfo.date);
          const isDisabled = isDateDisabled(dayInfo.date);
          const hasSchedule = hasExistingSchedule(dayInfo.date);
          const hasCompleted = hasCompletedSchedule(dayInfo.date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(dayInfo.date, dayInfo)}
              disabled={isDisabled || !dayInfo.isCurrentMonth}
              className={`
                relative p-3 text-sm border-r border-b border-gray-100 aspect-square
                transition-colors duration-200 hover:bg-gray-50
                ${!dayInfo.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-900'}
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${isDisabled && dayInfo.isCurrentMonth ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : ''}
                ${hasSchedule && !isSelected ? 'bg-green-50 text-green-700 border-green-200' : ''}
                ${hasCompleted && !isSelected && !hasSchedule ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
              `}
            >
              <span className="flex items-center justify-center h-full">
                {dayInfo.day}
              </span>
              
              {/* Existing schedule indicator */}
              {hasSchedule && !isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              
              {/* Completed schedule indicator */}
              {hasCompleted && !isSelected && !hasSchedule && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
              )}
              
              {/* Selected date indicator */}
              {isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-gray-600">Has Schedule</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <span className="text-gray-600">Disabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;