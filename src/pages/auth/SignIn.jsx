import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { GoogleSignIn } from '../../components/ui';
import { authenticateUser, getDashboardRoute } from '../../utils/auth';
import 'react-toastify/dist/ReactToastify.css';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = (data) => {
    toast.success('Google Sign-In successful! Redirecting to your dashboard...');
    
    // Authenticate user with role-based routing
    const userData = {
      ...data.data.user,
      role: data.data.user.userType || data.data.user.role
    };
    
    authenticateUser(userData, data.token);
    
    // Navigate to appropriate dashboard after a short delay
    setTimeout(() => {
      navigate(getDashboardRoute());
    }, 1500);
  };

  const handleGoogleError = (error) => {
    toast.error(error || 'Google Sign-In failed. Please try again.');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Make API call to backend
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - prepare user data with role
        const userData = {
          ...data.data.user,
          role: data.data.user.userType || data.data.user.role
        };
        
        // Authenticate user with role-based routing
        authenticateUser(userData, data.token);
        
        // Navigate to appropriate dashboard after a short delay
        setTimeout(() => {
          navigate(getDashboardRoute());
        }, 1500);
      } else {
        // Login failed
        const errorMessage = data.message || 'Invalid email or password. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, allow demo login with different roles
      toast.info('Demo mode: Using demo credentials');
      
      // Demo authentication - determine role based on email
      let role = 'patient'; // default
      let verificationStatus = undefined;
      
      if (formData.email.includes('admin')) {
        role = 'admin';
      } else if (formData.email.includes('doctor') || formData.email.includes('dr')) {
        role = 'doctor';
        // For demo purposes, set different verification statuses based on email
        if (formData.email.includes('pending')) {
          verificationStatus = 'pending';
        } else if (formData.email.includes('rejected')) {
          verificationStatus = 'rejected';
        } else {
          verificationStatus = 'verified'; // Default for demo doctors
        }
      }
      
      const demoUser = {
        id: `demo-${role}-001`,
        email: formData.email,
        name: role === 'admin' ? 'Admin User' : role === 'doctor' ? 'Dr. Demo User' : 'Demo Patient',
        firstName: role === 'admin' ? 'Admin' : role === 'doctor' ? 'Dr. Demo' : 'Demo',
        lastName: 'User',
        role: role,
        userType: role,
        verificationStatus: verificationStatus,
        specialization: role === 'doctor' ? 'General Medicine' : undefined
      };
      
      authenticateUser(demoUser, `demo-${role}-token-123`);
      
      setTimeout(() => {
        navigate(getDashboardRoute());
      }, 1500);
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="group">
          {/* Floating background elements */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-700 animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-lg opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
          
          <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-lg">Sign in to your HealthcarePlus account</p>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
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
                      placeholder="Enter your email"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-purple-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors duration-200"
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
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
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
                        Signing In...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign In
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
                    <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                {/* Social Sign In Options */}
                <div className="flex justify-center">
                  <GoogleSignIn
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    disabled={isLoading}
                  />
                </div>

                {/* Sign Up Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                      Create Account
                    </Link>
                  </p>
                </div>

                {/* Demo Credentials */}
              </form>
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

export default SignIn;
