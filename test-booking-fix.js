// Temporary fix for testing appointment booking
// Add this to PatientDashboard.jsx temporarily for testing

const testAppointmentBookingWithHardcodedDoctor = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // First, let's get a real doctor ID from the database
    const doctorsResponse = await fetch('http://localhost:3001/api/users/doctors/available-daily', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (doctorsResponse.ok) {
      const doctorsData = await doctorsResponse.json();
      const doctors = doctorsData.data?.doctors || [];
      
      if (doctors.length > 0) {
        const realDoctorId = doctors[0]._id;
        console.log('Using real doctor ID:', realDoctorId);
        
        // Test booking with real doctor ID
        const response = await fetch('http://localhost:3001/api/appointments/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            doctorId: realDoctorId,
            date: '2024-10-15',
            time: '10:00',
            reason: 'Test appointment',
            type: 'consultation'
          })
        });
        
        const data = await response.json();
        console.log('Test booking result:', data);
        
        if (response.ok) {
          alert('✅ Test booking successful! The issue is fixed.');
        } else {
          alert(`❌ Test booking failed: ${data.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Test booking error:', error);
    alert(`❌ Test booking error: ${error.message}`);
  }
};

// Run this in console to test
console.log('🧪 Test function loaded. Run testAppointmentBookingWithHardcodedDoctor() to test.');