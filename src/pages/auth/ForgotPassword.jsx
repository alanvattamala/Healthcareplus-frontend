import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    resetToken: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  // Format timer to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start countdown timer
  const startTimer = () => {
    setTimerActive(true);
    setOtpTimer(600);
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent successfully! Please check your email.');
        setStep(2);
        startTimer();
      } else {
        toast.error(data.message || 'Error sending OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP verified successfully!');
        setFormData({ ...formData, resetToken: data.resetToken });
        setStep(3);
        setTimerActive(false);
      } else {
        toast.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long!');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, and one number!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resetToken: formData.resetToken,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        toast.error(data.message || 'Error resetting password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timerActive) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New OTP sent successfully!');
        startTimer();
      } else {
        toast.error(data.message || 'Error resending OTP. Please try again.');
      }
    } catch (error) {
      console.log('Resend error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-700 animate-pulse"></div>
          
          <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8">
            {/* Close/Back Button */}
            <div className="absolute top-5 right-6 z-20">
              <Link 
                to="/signin" 
                className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white bg-white/80 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-full border border-gray-200 hover:border-transparent transition-all duration-300 backdrop-blur-sm group/close shadow-lg hover:shadow-xl transform hover:scale-110"
              >
                <svg className="w-4 h-4 group-hover/close:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-xl mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {step === 1 && 'Forgot Password'}
                  {step === 2 && 'Verify OTP'}
                  {step === 3 && 'Reset Password'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {step === 1 && 'Enter your email to receive a reset OTP'}
                  {step === 2 && 'Enter the 6-digit code sent to your email'}
                  {step === 3 && 'Enter your new password'}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3].map((stepNum) => (
                    <React.Fragment key={stepNum}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        step >= stepNum 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {stepNum}
                      </div>
                      {stepNum < 3 && (
                        <div className={`w-8 h-1 rounded transition-all duration-300 ${
                          step > stepNum ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step 1: Email Input */}
              {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Address
                    </label>
                    <div className="relative group/input">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-blue-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                        placeholder="Enter your registered email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 focus:scale-95 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center text-lg">
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send OTP
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="otp" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Enter OTP Code
                    </label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        required
                        maxLength="6"
                        value={formData.otp}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-purple-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  {/* Timer and Resend */}
                  <div className="text-center">
                    {timerActive ? (
                      <p className="text-sm text-gray-600">
                        OTP expires in: <span className="font-mono font-bold text-red-600">{formatTime(otpTimer)}</span>
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-red-600">OTP has expired</p>
                        <button
                          type="button"
                          onClick={resendOTP}
                          disabled={isLoading}
                          className="text-blue-600 hover:text-blue-500 font-medium text-sm underline"
                        >
                          Resend OTP
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !timerActive}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 focus:scale-95 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center text-lg">
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verify OTP
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      New Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 focus:scale-95 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center text-lg">
                      {isLoading ? (
                        <>
                          <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Reset Password
                        </>
                      )}
                    </span>
                  </button>
                </form>
              )}

              {/* Back to Sign In Link */}
              <div className="text-center pt-6">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Back to Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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

export default ForgotPassword;
