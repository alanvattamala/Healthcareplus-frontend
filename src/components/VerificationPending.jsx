import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerificationPending = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (!user || !token) {
      navigate('/signin');
      return;
    }

    // Only show this page for doctors with pending status
    if (user.userType !== 'doctor' || user.verificationStatus === 'verified') {
      navigate('/doctor-dashboard');
      return;
    }

    if (user.verificationStatus === 'rejected') {
      toast.error('Your verification request has been rejected. Please contact support.');
    }

    setUserInfo(user);
    setIsLoading(false);
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleContactSupport = () => {
    // Open email client or show contact modal
    window.location.href = 'mailto:admin@healthcareplus.com?subject=Doctor Verification Support&body=Hello, I need assistance with my doctor verification process.';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
      </div>

      <div className="relative max-w-2xl w-full">
        <div className="group">
          {/* Floating background elements */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-700 animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur-lg opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
          
          <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8 md:p-12">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl">⏳</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Verification Pending
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Your doctor account is currently under review by our administration team.
              </p>
            </div>

            {/* User Information */}
            {userInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3 text-2xl">👨‍⚕️</span>
                  Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium">Full Name</div>
                    <div className="text-lg font-semibold text-blue-800">
                      Dr. {userInfo.firstName} {userInfo.lastName}
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium">Email</div>
                    <div className="text-lg font-semibold text-purple-800">{userInfo.email}</div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Specialization</div>
                    <div className="text-lg font-semibold text-green-800">
                      {userInfo.specialization || 'Not specified'}
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-medium">Status</div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        userInfo.verificationStatus === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : userInfo.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userInfo.verificationStatus?.charAt(0).toUpperCase() + userInfo.verificationStatus?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Information */}
            <div className="space-y-6 mb-8">
              {userInfo?.verificationStatus === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                        Under Review
                      </h3>
                      <p className="text-yellow-700 mb-4">
                        Our admin team is currently reviewing your credentials and documentation. 
                        This process typically takes 2-5 business days.
                      </p>
                      <div className="space-y-2 text-sm text-yellow-600">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          <span>Medical license verification</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          <span>Professional credentials review</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          <span>Background verification</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {userInfo?.verificationStatus === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">❌</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Verification Declined
                      </h3>
                      <p className="text-red-700 mb-4">
                        Unfortunately, your verification request has been declined. 
                        Please contact our support team for more information and guidance on resubmission.
                      </p>
                      <div className="space-y-2 text-sm text-red-600">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          <span>Review our verification requirements</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          <span>Contact support for detailed feedback</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          <span>Resubmit with corrected documentation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-3 text-2xl">📋</span>
                What happens next?
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <span>Our team reviews your submitted credentials and documentation</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <span>We verify your medical license and professional qualifications</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <span>You'll receive an email notification with the verification results</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
                  <span>Once approved, you'll gain full access to your doctor dashboard</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleContactSupport}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>📧</span>
                  <span>Contact Support</span>
                </span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🚪</span>
                  <span>Sign Out</span>
                </span>
              </button>
              
              <Link
                to="/"
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🏠</span>
                  <span>Go Home</span>
                </span>
              </Link>
            </div>

            {/* Additional Information */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p className="mb-2">
                For urgent matters, please contact us at:
              </p>
              <div className="space-y-1">
                <p>📞 Support: +1 (555) 123-4567</p>
                <p>📧 Email: admin@healthcareplus.com</p>
                <p>🕒 Business Hours: Monday - Friday, 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
