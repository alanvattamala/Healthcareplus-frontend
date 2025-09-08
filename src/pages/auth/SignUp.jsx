import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { GoogleSignIn } from '../../components/ui';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'patient',
    agreeToTerms: false,
    // Patient specific fields
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    knownAllergies: '',
    // Doctor specific fields
    medicalLicenseNumber: '',
    specialization: '',
    otherSpecialization: '',
    experience: '',
    verificationDocument: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});
  
  // Email verification states
  const [isEmailVerificationStep, setIsEmailVerificationStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  const handleGoogleSuccess = (data) => {
    toast.success('Google Sign-Up successful! Redirecting to your dashboard...');
    
    // Store user data and token in localStorage
    localStorage.setItem('user', JSON.stringify(data.data.user));
    localStorage.setItem('token', data.token);
    localStorage.setItem('userType', data.data.user.userType);
    
    // Navigate based on user type after a short delay
    setTimeout(() => {
      const dashboardRoutes = {
        patient: '/patient-dashboard',
        doctor: '/doctor-dashboard',
        admin: '/admin-dashboard'
      };
      
      navigate(dashboardRoutes[data.data.user.userType] || '/patient-dashboard');
    }, 1500);
  };

  const handleGoogleError = (error) => {
    toast.error(error || 'Google Sign-Up failed. Please try again.');
  };

  // Email verification functions
  const sendOtp = async (email) => {
    try {
      setIsOtpLoading(true);
      
      const response = await fetch('http://localhost:3001/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP sent to your email successfully!');
        startOtpTimer();
        return true;
      } else {
        toast.error(data.message || 'Failed to send OTP. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Network error. Please check your connection and try again.');
      return false;
    } finally {
      setIsOtpLoading(false);
    }
  };

  const verifyOtp = async (email, otpCode) => {
    try {
      setIsOtpLoading(true);
      
      console.log('🔍 Verifying OTP:', { email, otp: otpCode });
      
      const response = await fetch('http://localhost:3001/api/auth/verify-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();
      
      console.log('📡 OTP verification response:', { 
        status: response.status, 
        ok: response.ok, 
        data 
      });

      if (response.ok) {
        toast.success('Email verified successfully!');
        console.log('✅ Email verification successful');
        return true;
      } else {
        console.log('❌ Email verification failed:', data.message);
        toast.error(data.message || 'Invalid OTP. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      toast.error('Network error. Please check your connection and try again.');
      return false;
    } finally {
      setIsOtpLoading(false);
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60); // 60 seconds countdown
    setResendDisabled(true);
    
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (!resendDisabled) {
      await sendOtp(formData.email);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    const isValid = await verifyOtp(formData.email, otp);
    if (isValid) {
      // Proceed with registration
      await completeRegistration();
    }
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting registration process with data:', {
        email: formData.email,
        userType: formData.userType,
        emailVerified: true
      });
      
      // Make API call to backend for final registration
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone,
          userType: formData.userType,
          // Patient specific fields
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          knownAllergies: formData.knownAllergies,
          // Doctor specific fields
          medicalLicenseNumber: formData.medicalLicenseNumber,
          specialization: formData.specialization === 'other' ? formData.otherSpecialization : formData.specialization,
          experience: formData.experience,
          emailVerified: true, // Mark as email verified
        }),
      });

      const data = await response.json();
      
      console.log('📡 Registration response:', { 
        status: response.status, 
        ok: response.ok, 
        data 
      });

      if (response.ok) {
        // Registration successful
        console.log('✅ Registration successful, storing user data');
        toast.success('Registration successful! Redirecting...');
        
        // Store user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.data.user.userType);
        
        console.log('💾 User data stored in localStorage');
        
        // Navigate based on user type and verification status
        setTimeout(() => {
          const userType = data.data.user.userType;
          
          if (userType === 'doctor') {
            // Check verification status for doctors
            if (data.data.user.verificationStatus === 'pending') {
              console.log('🧭 Redirecting doctor to verification pending page');
              navigate('/verification-pending');
            } else if (data.data.user.verificationStatus === 'verified') {
              console.log('🧭 Redirecting verified doctor to dashboard');
              navigate('/doctor-dashboard');
            } else {
              console.log('🧭 Doctor verification rejected, redirecting to pending page');
              navigate('/verification-pending');
            }
          } else {
            // For patients and admins, go directly to dashboard
            const dashboardRoutes = {
              patient: '/patient-dashboard',
              admin: '/admin-dashboard'
            };
            
            console.log('🧭 Navigating to dashboard:', dashboardRoutes[userType]);
            navigate(dashboardRoutes[userType] || '/patient-dashboard');
          }
        }, 1500);
        
      } else {
        // Registration failed
        const errorMessage = data.message || 'Registration failed. Please try again.';
        console.log('❌ Registration failed:', errorMessage);
        toast.error(errorMessage);
        // Go back to form if registration fails
        setIsEmailVerificationStep(false);
        setOtp('');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      toast.error('Network error. Please check your connection and try again.');
      // Go back to form if network error
      setIsEmailVerificationStep(false);
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  const validateName = (name) => {
    return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
  };

  const validateMedicalLicense = (license) => {
    return license.trim().length >= 5 && /^[A-Z0-9]+$/i.test(license.trim());
  };

  const validateExperience = (experience) => {
    // Valid experience options from the dropdown
    const validExperiences = ['0-1', '2-5', '6-10', '11-15', '16-20', '20+'];
    return validExperiences.includes(experience);
  };

  const validateDateOfBirth = (date) => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 0 && age <= 120;
  };

  // Check if field is valid
  const isFieldValid = (fieldName, value) => {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return value === formData.password && value.length > 0;
      case 'phone':
        return validatePhone(value);
      case 'dateOfBirth':
        return validateDateOfBirth(value);
      case 'gender':
        return value !== '';
      case 'bloodGroup':
        return formData.userType === 'patient' ? value !== '' : true;
      case 'medicalLicenseNumber':
        return formData.userType === 'doctor' ? validateMedicalLicense(value) : true;
      case 'specialization':
        return formData.userType === 'doctor' ? value !== '' && value !== 'select' : true;
      case 'otherSpecialization':
        return formData.userType === 'doctor' && formData.specialization === 'other' ? value.trim().length >= 2 : true;
      case 'experience':
        return formData.userType === 'doctor' ? validateExperience(value) : true;
      case 'verificationDocument':
        return true; // Optional during registration, can be uploaded later
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    });
  };

  const handleBlur = (fieldName) => {
    setTouched({
      ...touched,
      [fieldName]: true
    });
  };

  // Validation Icon Component
  const ValidationIcon = ({ fieldName, value }) => {
    const shouldShow = touched[fieldName] && value;
    const isValid = isFieldValid(fieldName, value);
    
    if (!shouldShow) return null;
    
    return (
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
        {isValid ? (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-scale-in">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions!');
      return;
    }

    // Validate required fields based on user type
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'phone'];
    
    if (formData.userType === 'patient') {
      requiredFields.push('dateOfBirth', 'gender', 'bloodGroup');
    } else if (formData.userType === 'doctor') {
      requiredFields.push('medicalLicenseNumber', 'specialization', 'experience');
      if (formData.specialization === 'other') {
        requiredFields.push('otherSpecialization');
      }
    }

    // Check if all required fields are filled
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
        return;
      }
    }

    // Validate email format
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Send OTP to email and proceed to verification step
    const otpSent = await sendOtp(formData.email);
    if (otpSent) {
      setIsEmailVerificationStep(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative max-w-2xl w-full space-y-8">
        <div className="group">
          {/* Floating background elements */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-700 animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-lg opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
          
          <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8 lg:p-10">
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 blur-sm animate-gradient-x"></div>
            <div className="absolute inset-[2px] bg-white/95 rounded-3xl z-0"></div>
            
            <div className="relative z-10">
              {/* Close/Back to Home X Button */}
              <div className="absolute -top-2 -right-2 z-20">
                <Link 
                  to="/" 
                  className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white bg-white/80 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-full border border-gray-200 hover:border-transparent transition-all duration-300 backdrop-blur-sm group/close shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  <svg className="w-4 h-4 group-hover/close:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-xl mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Join HealthcarePlus</h2>
                <p className="text-gray-600 text-lg">Create your account and start your healthcare journey</p>
              </div>

              {/* Email Verification Step */}
              {isEmailVerificationStep ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl shadow-xl mb-6">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                    <p className="text-gray-600 mb-4">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="text-blue-600 font-semibold text-lg mb-6">
                      {formData.email}
                    </p>
                  </div>

                  <form onSubmit={handleOtpVerification} className="space-y-6">
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Verification Code
                      </label>
                      <input
                        type="text"
                        name="otp"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                        }}
                        placeholder="Enter 6-digit code"
                        maxLength="6"
                        className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                        required
                      />
                    </div>

                    <div className="flex flex-col space-y-4">
                      <button
                        type="submit"
                        disabled={isOtpLoading || otp.length !== 6}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isOtpLoading ? (
                          <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                          </div>
                        ) : (
                          'Verify Email & Complete Registration'
                        )}
                      </button>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Didn't receive the code?
                        </p>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendDisabled || isOtpLoading}
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {resendDisabled ? (
                            `Resend in ${otpTimer}s`
                          ) : (
                            'Resend Code'
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsEmailVerificationStep(false);
                          setOtp('');
                          setOtpTimer(0);
                          setResendDisabled(false);
                        }}
                        className="w-full py-2 px-4 border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                      >
                        ← Back to Form
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Sign Up Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type Selection */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                    <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    I want to sign up as
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                      formData.userType === 'patient' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 bg-white/70 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="patient"
                        checked={formData.userType === 'patient'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${
                          formData.userType === 'patient' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className={`font-medium transition-colors duration-300 ${
                          formData.userType === 'patient' 
                            ? 'text-emerald-700' 
                            : 'text-gray-700 group-hover:text-emerald-700'
                        }`}>
                          Patient
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          Book appointments & manage health
                        </span>
                      </div>
                      {formData.userType === 'patient' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </label>

                    <label className={`relative flex items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${
                      formData.userType === 'doctor' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white/70 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}>
                      <input
                        type="radio"
                        name="userType"
                        value="doctor"
                        checked={formData.userType === 'doctor'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${
                          formData.userType === 'doctor' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <span className={`font-medium transition-colors duration-300 ${
                          formData.userType === 'doctor' 
                            ? 'text-blue-700' 
                            : 'text-gray-700 group-hover:text-blue-700'
                        }`}>
                          Doctor
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          Manage patients & consultations
                        </span>
                      </div>
                      {formData.userType === 'doctor' && (
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      First Name
                    </label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('firstName')}
                        className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                          touched.firstName && formData.firstName
                            ? isFieldValid('firstName', formData.firstName)
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-100 group-hover/input:border-green-400'
                              : 'border-red-300 focus:border-red-500 focus:ring-red-100 group-hover/input:border-red-400'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100 group-hover/input:border-blue-300'
                        } group-hover/input:bg-white/90`}
                        placeholder="John"
                      />
                      <ValidationIcon fieldName="firstName" value={formData.firstName} />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {touched.firstName && formData.firstName && !isFieldValid('firstName', formData.firstName) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        First name must be at least 2 characters and contain only letters
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Last Name
                    </label>
                    <div className="relative group/input">
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('lastName')}
                        className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                          touched.lastName && formData.lastName
                            ? isFieldValid('lastName', formData.lastName)
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-100 group-hover/input:border-green-400'
                              : 'border-red-300 focus:border-red-500 focus:ring-red-100 group-hover/input:border-red-400'
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100 group-hover/input:border-purple-300'
                        } group-hover/input:bg-white/90`}
                        placeholder="Doe"
                      />
                      <ValidationIcon fieldName="lastName" value={formData.lastName} />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {touched.lastName && formData.lastName && !isFieldValid('lastName', formData.lastName) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Last name must be at least 2 characters and contain only letters
                      </p>
                    )}
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        onBlur={() => handleBlur('email')}
                        className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                          touched.email && formData.email
                            ? isFieldValid('email', formData.email)
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-100 group-hover/input:border-green-400'
                              : 'border-red-300 focus:border-red-500 focus:ring-red-100 group-hover/input:border-red-400'
                            : 'border-gray-200 focus:border-pink-500 focus:ring-pink-100 group-hover/input:border-pink-300'
                        } group-hover/input:bg-white/90`}
                        placeholder="john@example.com"
                      />
                      <ValidationIcon fieldName="email" value={formData.email} />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 to-blue-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {touched.email && formData.email && !isFieldValid('email', formData.email) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Please enter a valid email address
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Phone Number
                    </label>
                    <div className="relative group/input">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={() => handleBlur('phone')}
                        className={`w-full px-4 py-4 pr-12 border-2 rounded-2xl focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                          touched.phone && formData.phone
                            ? isFieldValid('phone', formData.phone)
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-100 group-hover/input:border-green-400'
                              : 'border-red-300 focus:border-red-500 focus:ring-red-100 group-hover/input:border-red-400'
                            : 'border-gray-200 focus:border-cyan-500 focus:ring-cyan-100 group-hover/input:border-cyan-300'
                        } group-hover/input:bg-white/90`}
                        placeholder="+1 (555) 123-4567"
                      />
                      <ValidationIcon fieldName="phone" value={formData.phone} />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {touched.phone && formData.phone && !isFieldValid('phone', formData.phone) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Please enter a valid phone number
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password
                    </label>
                    <div className="relative group/input">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        className={`w-full px-4 py-4 pr-20 border-2 rounded-2xl focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                          touched.password && formData.password
                            ? isFieldValid('password', formData.password)
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-100 group-hover/input:border-green-400'
                              : 'border-red-300 focus:border-red-500 focus:ring-red-100 group-hover/input:border-red-400'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100 group-hover/input:border-indigo-300'
                        } group-hover/input:bg-white/90`}
                        placeholder="Create password"
                      />
                      <ValidationIcon fieldName="password" value={formData.password} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 z-10"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {touched.password && formData.password && !isFieldValid('password', formData.password) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Password must be at least 8 characters with uppercase, lowercase, and number
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                      <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Confirm Password
                    </label>
                    <div className="relative group/input">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full px-4 py-4 pr-20 border-2 rounded-2xl focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 ${
                          touched.confirmPassword && formData.confirmPassword
                            ? isFieldValid('confirmPassword', formData.confirmPassword)
                              ? 'border-green-300 focus:border-green-500 focus:ring-green-100 group-hover/input:border-green-400'
                              : 'border-red-300 focus:border-red-500 focus:ring-red-100 group-hover/input:border-red-400'
                            : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100 group-hover/input:border-emerald-300'
                        } group-hover/input:bg-white/90`}
                        placeholder="Confirm password"
                      />
                      <ValidationIcon fieldName="confirmPassword" value={formData.confirmPassword} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-600 transition-colors duration-200 z-10"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    {touched.confirmPassword && formData.confirmPassword && !isFieldValid('confirmPassword', formData.confirmPassword) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>

                {/* Conditional Fields Based on User Type */}
                {formData.userType === 'patient' && (
                  <div className="space-y-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Patient Information
                    </h3>
                    
                    {/* Date of Birth and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="dateOfBirth" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a3 3 0 01-3-3V9a3 3 0 016 0v3a3 3 0 01-3 3z" />
                          </svg>
                          Date of Birth
                        </label>
                        <div className="relative group/input">
                          <input
                            type="date"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            required
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-emerald-300 group-hover/input:bg-white/90 text-gray-900"
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="gender" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Gender
                        </label>
                        <div className="relative group/input">
                          <select
                            id="gender"
                            name="gender"
                            required
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-blue-300 group-hover/input:bg-white/90 text-gray-900"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                          </select>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    </div>

                    {/* Blood Group and Allergies */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="bloodGroup" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Blood Group
                        </label>
                        <div className="relative group/input">
                          <select
                            id="bloodGroup"
                            name="bloodGroup"
                            required
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-red-300 group-hover/input:bg-white/90 text-gray-900"
                          >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="knownAllergies" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Known Allergies
                        </label>
                        <div className="relative group/input">
                          <textarea
                            id="knownAllergies"
                            name="knownAllergies"
                            value={formData.knownAllergies}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-orange-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500 resize-none"
                            placeholder="List any known allergies or medications to avoid..."
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-yellow-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.userType === 'doctor' && (
                  <div className="space-y-6 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      Professional Information
                    </h3>
                    
                    {/* Medical License and Specialization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="medicalLicenseNumber" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Medical License Number
                        </label>
                        <div className="relative group/input">
                          <input
                            type="text"
                            id="medicalLicenseNumber"
                            name="medicalLicenseNumber"
                            required
                            value={formData.medicalLicenseNumber}
                            onChange={handleChange}
                            onBlur={() => setTouched(prev => ({ ...prev, medicalLicenseNumber: true }))}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-blue-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                            placeholder="e.g., MD123456789"
                          />
                          <ValidationIcon fieldName="medicalLicenseNumber" value={formData.medicalLicenseNumber} />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="specialization" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Specialization
                        </label>
                        <div className="relative group/input">
                          <select
                            id="specialization"
                            name="specialization"
                            required
                            value={formData.specialization}
                            onChange={handleChange}
                            onBlur={() => setTouched(prev => ({ ...prev, specialization: true }))}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-purple-300 group-hover/input:bg-white/90 text-gray-900"
                          >
                            <option value="">Select Specialization</option>
                            <option value="general-medicine">General Medicine</option>
                            <option value="cardiology">Cardiology</option>
                            <option value="dermatology">Dermatology</option>
                            <option value="pediatrics">Pediatrics</option>
                            <option value="orthopedics">Orthopedics</option>
                            <option value="neurology">Neurology</option>
                            <option value="gynecology">Gynecology</option>
                            <option value="psychiatry">Psychiatry</option>
                            <option value="oncology">Oncology</option>
                            <option value="radiology">Radiology</option>
                            <option value="anesthesiology">Anesthesiology</option>
                            <option value="emergency-medicine">Emergency Medicine</option>
                            <option value="other">Other</option>
                          </select>
                          <ValidationIcon fieldName="specialization" value={formData.specialization} />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    </div>

                    {/* Conditional Other Specialization Field */}
                    {formData.specialization === 'other' && (
                      <div className="space-y-2">
                        <label htmlFor="otherSpecialization" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Please specify your department/specialization
                        </label>
                        <div className="relative group/input">
                          <input
                            type="text"
                            id="otherSpecialization"
                            name="otherSpecialization"
                            required
                            value={formData.otherSpecialization}
                            onChange={handleChange}
                            onBlur={() => setTouched(prev => ({ ...prev, otherSpecialization: true }))}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-pink-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                            placeholder="e.g., Sports Medicine, Pain Management, etc."
                          />
                          <ValidationIcon fieldName="otherSpecialization" value={formData.otherSpecialization} />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    )}

                    {/* Experience and Verification Document */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="experience" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Years of Experience
                        </label>
                        <div className="relative group/input">
                          <select
                            id="experience"
                            name="experience"
                            required
                            value={formData.experience}
                            onChange={handleChange}
                            onBlur={() => setTouched(prev => ({ ...prev, experience: true }))}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-green-300 group-hover/input:bg-white/90 text-gray-900"
                          >
                            <option value="">Select Experience</option>
                            <option value="0-1">0-1 years</option>
                            <option value="2-5">2-5 years</option>
                            <option value="6-10">6-10 years</option>
                            <option value="11-15">11-15 years</option>
                            <option value="16-20">16-20 years</option>
                            <option value="20+">20+ years</option>
                          </select>
                          <ValidationIcon fieldName="experience" value={formData.experience} />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="verificationDocument" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Verification Document (Optional)
                        </label>
                        <div className="relative group/input">
                          <input
                            type="file"
                            id="verificationDocument"
                            name="verificationDocument"
                            onChange={handleChange}
                            onBlur={() => setTouched(prev => ({ ...prev, verificationDocument: true }))}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-indigo-300 group-hover/input:bg-white/90 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                          <ValidationIcon fieldName="verificationDocument" value={formData.verificationDocument?.name || ''} />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload medical degree, license, or certification (PDF, DOC, or Image files) - Optional, can be uploaded later
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Sign Up Button */}
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-3 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Create Account
                        <svg className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with</span>
                  </div>
                </div>

                {/* Social Sign Up Options */}
                <div className="flex justify-center">
                  <GoogleSignIn
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    disabled={isLoading}
                  />
                </div>

                {/* Sign In Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
              )}
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

export default SignUp;
