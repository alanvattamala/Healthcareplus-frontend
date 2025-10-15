// APPOINTMENT BOOKING FIX VERIFICATION
// ====================================

// 🎯 The Issue: "Doctor is not available on this day"
// ✅ The Fix: Updated appointment controller to:
//    1. Use correct Schedule model structure (doctorId + date)
//    2. Handle time slot format correctly ("14:00-14:18" -> "14:00")
//    3. Mark slots as booked when appointment is created
//    4. Add proper error logging

// 📋 Testing the Fix
// ------------------

const testBookingFix = async () => {
  console.log('🧪 Testing Appointment Booking Fix...\n');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Please login first');
    return;
  }

  try {
    // Step 1: Get available doctors for Oct 7, 2025
    console.log('📅 Fetching doctors for Oct 7, 2025...');
    const today = '2025-10-07'; // Oct 7, 2025
    
    const doctorsResponse = await fetch(`http://localhost:3001/api/users/doctors/available-for-date?date=${today}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (doctorsResponse.ok) {
      const doctorsData = await doctorsResponse.json();
      console.log('✅ Available doctors:', doctorsData.results);
      
      if (doctorsData.data && doctorsData.data.length > 0) {
        const testDoctor = doctorsData.data[0];
        console.log('🩺 Testing with Dr.', testDoctor.name);
        console.log('📋 Available times:', testDoctor.availableTimes);
        
        if (testDoctor.availableTimes && testDoctor.availableTimes.length > 0) {
          // Step 2: Try booking with the first available time slot
          const timeSlot = testDoctor.availableTimes[0];
          console.log('\n📅 Attempting to book time slot:', timeSlot);
          
          const bookingData = {
            doctorId: testDoctor.id,
            date: today,
            time: timeSlot,
            reason: 'Test booking for Oct 7 fix verification',
            type: 'consultation'
          };
          
          console.log('📤 Booking request:', bookingData);
          
          const bookingResponse = await fetch('http://localhost:3001/api/appointments/book', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
          });
          
          const bookingResult = await bookingResponse.json();
          
          if (bookingResponse.ok) {
            console.log('✅ BOOKING SUCCESSFUL!');
            console.log('📋 Appointment Details:', bookingResult.data);
            alert('✅ Fix verified! Appointment booking is now working correctly.');
          } else {
            console.error('❌ Booking still failed:', bookingResult);
            alert(`❌ Issue persists: ${bookingResult.message}`);
          }
        } else {
          console.log('⚠️ No available time slots for testing');
        }
      } else {
        console.log('⚠️ No doctors available for Oct 7');
      }
    } else {
      console.error('❌ Failed to fetch doctors:', doctorsResponse.status);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// 🔧 Key Changes Made:
console.log(`
🔧 APPOINTMENT BOOKING FIXES APPLIED:

1. ✅ Schedule Query Fix:
   - Changed from weekly availability pattern to specific date lookup
   - Now searches: { doctorId: doctorId, date: appointmentDate }

2. ✅ Time Format Handling:
   - Extracts start time from "14:00-14:18" format
   - Matches against slot.startTime in database

3. ✅ Slot Booking Logic:
   - Marks time slot as booked when appointment created
   - Updates patientId and bookingTime fields
   - Prevents double booking

4. ✅ Enhanced Error Logging:
   - Added debug logs for schedule search
   - Shows available slots for troubleshooting

📋 Manual Test Steps:
1. Navigate to Appointments tab
2. Select Oct 7 from calendar
3. Click "Book" on Dr. Parvathy Panikar
4. Select any available time slot (14:00-14:18, etc.)
5. Fill reason and click "Book Appointment"
6. Should now save successfully to database!

🧪 Automated Test: Run testBookingFix() in console
`);

// Export for use
window.testBookingFix = testBookingFix;