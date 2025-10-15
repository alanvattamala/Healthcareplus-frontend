// APPOINTMENT BOOKING TEST GUIDE
// =================================

// 🎯 TESTING APPOINTMENT BOOKING FROM APPOINTMENTS PAGE

// STEP 1: Verify Server is Running
// ---------------------------------
// Start your server: cd "d:\S9-Mini Project\project-dev\server" && npm run dev
// Check health: http://localhost:3001/health

// STEP 2: Test in Browser Console
// --------------------------------
// Navigate to Patient Dashboard → Appointments Tab
// Open browser console and run:

const testAppointmentFlow = async () => {
  console.log('🧪 Testing Appointment Booking Flow...\n');
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Not logged in. Please login first.');
    return;
  }
  console.log('✅ User is authenticated');
  
  // Test 1: Check if we can fetch doctors
  try {
    const response = await fetch('http://localhost:3001/api/users/doctors/available-daily', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Doctors API working:', data.results, 'doctors found');
      
      if (data.data.doctors.length > 0) {
        const testDoctor = data.data.doctors[0];
        console.log('📋 Test Doctor:', {
          id: testDoctor._id,
          name: `${testDoctor.firstName} ${testDoctor.lastName}`,
          userType: testDoctor.userType
        });
        
        // Test 2: Try booking appointment
        console.log('\n📅 Testing appointment booking...');
        const bookingData = {
          doctorId: testDoctor._id,
          date: new Date().toISOString().split('T')[0], // Today's date
          time: '10:00',
          reason: 'Test booking from appointments page',
          type: 'consultation'
        };
        
        console.log('📤 Sending booking request:', bookingData);
        
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
          console.log('✅ BOOKING SUCCESSFUL!', bookingResult);
          
          // Test 3: Verify appointment was saved
          const myAppointmentsResponse = await fetch('http://localhost:3001/api/appointments/my-appointments', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (myAppointmentsResponse.ok) {
            const myAppointments = await myAppointmentsResponse.json();
            console.log('✅ Appointments retrieved:', myAppointments.count, 'appointments');
            console.log('📋 Latest appointment:', myAppointments.data[myAppointments.data.length - 1]);
          }
          
        } else {
          console.error('❌ Booking failed:', bookingResult);
          
          // Detailed error analysis
          if (bookingResult.message === 'Doctor not found') {
            console.log('🔍 Debug: Doctor ID format issue');
            console.log('Doctor ID sent:', testDoctor._id);
            console.log('Doctor userType:', testDoctor.userType);
          }
        }
      } else {
        console.error('❌ No doctors available for testing');
      }
    } else {
      console.error('❌ Failed to fetch doctors:', response.status);
    }
  } catch (error) {
    console.error('❌ Error during test:', error);
  }
};

// STEP 3: Manual Testing Steps
// ----------------------------
console.log(`
🧪 APPOINTMENT BOOKING TEST READY

📋 Manual Testing Steps:
1. Navigate to Appointments tab
2. Select a date from the calendar
3. Click on a doctor's "Book" button
4. Fill in the modal form:
   - Select a time slot
   - Enter reason for visit
   - Choose appointment type
5. Click "Book Appointment"
6. Check if appointment appears in "Your Upcoming Appointments"

🔧 If booking fails, run: testAppointmentFlow()
`);

// Auto-run if you want immediate testing
// testAppointmentFlow();