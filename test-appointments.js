// Test script for appointment booking functionality
// Run this in the browser console to test the API endpoints

const testAppointmentBooking = async () => {
  const token = localStorage.getItem('token');
  
  console.log('🧪 Testing Appointment Booking API...');
  
  // Test 1: Book an appointment
  try {
    const response = await fetch('http://localhost:3001/api/appointments/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || 'demo-token'}`
      },
      body: JSON.stringify({
        doctorId: '60f7b1234567890123456789', // Replace with actual doctor ID
        date: '2024-10-15',
        time: '10:00',
        reason: 'Regular checkup',
        type: 'consultation'
      })
    });
    
    const data = await response.json();
    console.log('✅ Booking Response:', data);
  } catch (error) {
    console.error('❌ Booking Error:', error);
  }
  
  // Test 2: Get patient appointments
  try {
    const response = await fetch('http://localhost:3001/api/appointments/my-appointments?upcoming=true', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || 'demo-token'}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('✅ My Appointments Response:', data);
  } catch (error) {
    console.error('❌ Get Appointments Error:', error);
  }
};

// Test health endpoint
const testHealth = async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('🏥 Server Health:', data);
  } catch (error) {
    console.error('❌ Health Check Error:', error);
  }
};

console.log('📋 Appointment API Test Script Loaded');
console.log('Run testHealth() to check server status');
console.log('Run testAppointmentBooking() to test appointment functionality');

// Auto-run health check
testHealth();