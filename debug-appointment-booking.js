// Quick debug script to test appointment booking issue
// Run this in browser console after logging in as a patient

const debugAppointmentBooking = async () => {
  const token = localStorage.getItem('token');
  console.log('🔑 Token exists:', !!token);
  
  if (!token) {
    console.error('❌ No authentication token found. Please log in first.');
    return;
  }

  // Test 1: Check if we can fetch doctors
  console.log('\n📋 Step 1: Testing doctor API...');
  try {
    const doctorsResponse = await fetch('http://localhost:3001/api/users/doctors/available-daily', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (doctorsResponse.ok) {
      const doctorsData = await doctorsResponse.json();
      console.log('✅ Doctors API Response:', doctorsData);
      
      const doctors = doctorsData.data?.doctors || [];
      if (doctors.length > 0) {
        const testDoctor = doctors[0];
        console.log('🩺 Test Doctor:', {
          id: testDoctor._id,
          name: `${testDoctor.firstName} ${testDoctor.lastName}`,
          userType: testDoctor.userType,
          email: testDoctor.email
        });
        
        // Test 2: Try booking with this doctor
        console.log('\n📅 Step 2: Testing appointment booking...');
        const bookingResponse = await fetch('http://localhost:3001/api/appointments/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            doctorId: testDoctor._id,
            date: '2024-10-15',
            time: '10:00',
            reason: 'Test appointment booking',
            type: 'consultation'
          })
        });
        
        const bookingData = await bookingResponse.json();
        console.log('📋 Booking Response:', bookingResponse.status, bookingData);
        
        if (!bookingResponse.ok) {
          console.error('❌ Booking Failed:', bookingData.message);
          
          // Additional debug: Check if doctor exists in database
          console.log('\n🔍 Step 3: Additional debugging...');
          console.log('Doctor ID being sent:', testDoctor._id);
          console.log('Doctor userType:', testDoctor.userType);
        } else {
          console.log('✅ Booking successful!');
        }
      }
    } else {
      console.error('❌ Failed to fetch doctors:', doctorsResponse.status);
    }
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
};

// Auto-run the debug
console.log('🧪 Appointment Booking Debug Script Loaded');
console.log('📞 Run debugAppointmentBooking() to test the booking flow');

// Check if we're in the right environment
if (typeof window !== 'undefined' && window.location) {
  console.log('🌐 Current URL:', window.location.href);
  console.log('🏥 Make sure you are logged in as a patient');
}