// Payment service for handling Razorpay integration
class PaymentService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api/payments';
  }

  // Create payment order
  async createOrder(appointmentData) {
    try {
      console.log('💳 Creating payment order with data:', appointmentData);
      
      const response = await fetch(`${this.baseURL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(appointmentData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      const responseData = await response.json();
      console.log('📋 Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}: Failed to create payment order`);
      }

      return responseData;
    } catch (error) {
      console.error('❌ Error creating payment order:', error);
      console.error('📋 Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(paymentData) {
    try {
      const response = await fetch(`${this.baseURL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Initialize Razorpay payment
  async initiatePayment(appointmentData, onSuccess, onFailure) {
    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await this.loadRazorpayScript();
      }

      // Create order
      const orderData = await this.createOrder(appointmentData);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      // Configure Razorpay options
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'HealthCare Plus',
        description: `Consultation with ${appointmentData.doctorName}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentData: orderData.appointmentData,
              doctorId: appointmentData.doctorId,
              patientId: appointmentData.patientId
            };

            const verificationResult = await this.verifyPayment(verificationData);

            if (verificationResult.success) {
              onSuccess(verificationResult);
            } else {
              onFailure(new Error(verificationResult.message || 'Payment verification failed'));
            }
          } catch (error) {
            onFailure(error);
          }
        },
        prefill: {
          name: appointmentData.patientName || '',
          email: appointmentData.patientEmail || '',
          contact: appointmentData.patientPhone || ''
        },
        notes: {
          appointment_date: appointmentData.date,
          appointment_time: appointmentData.time,
          doctor_id: appointmentData.doctorId
        },
        theme: {
          color: '#3b82f6'
        },
        modal: {
          ondismiss: () => {
            onFailure(new Error('Payment cancelled by user'));
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      onFailure(error);
    }
  }

  // Load Razorpay script dynamically
  loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Get payment details
  async getPaymentDetails(paymentId) {
    try {
      const response = await fetch(`${this.baseURL}/payment/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }
}

export default new PaymentService();
