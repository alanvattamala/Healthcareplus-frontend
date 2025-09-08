import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerificationPending = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Check if user is logged in and get their info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = localStorage.getItem('userType');
    
    if (!user.email || userType !== 'doctor') {
      // Redirect to signin if not a doctor or not logged in
      navigate('/signin');
      return;
    }

    setUserInfo(user);
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    toast.success('Signed out successfully');
    navigate('/');
  };

  const checkVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.user.verificationStatus === 'approved') {
          toast.success('Your account has been verified! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/doctor-dashboard');
          }, 2000);
        } else if (data.data.user.verificationStatus === 'rejected') {
          toast.error('Your account verification was rejected. Please contact support.');
        } else {
          toast.info('Your account is still pending verification.');
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      toast.error('Error checking verification status');
    }
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 rounded-2xl shadow-xl mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Pending</h2>
            <p className="text-gray-600 text-lg">Your account is under review</p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Account Under Review</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    Thank you for registering as a doctor with HealthcarePlus. Your account and credentials are currently being reviewed by our admin team.
                  </p>
                  <div className="text-sm text-yellow-700">
                    <p className="mb-2"><strong>What happens next?</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Admin team reviews your medical license</li>
                      <li>Verification of your credentials</li>
                      <li>Background check completion</li>
                      <li>Account approval notification</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Your Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-blue-700">Name:</span> {userInfo.firstName} {userInfo.lastName}</p>
                <p><span className="font-medium text-blue-700">Email:</span> {userInfo.email}</p>
                <p><span className="font-medium text-blue-700">Specialization:</span> {userInfo.specialization}</p>
                <p><span className="font-medium text-blue-700">License Number:</span> {userInfo.medicalLicenseNumber}</p>
                <p><span className="font-medium text-blue-700">Status:</span> 
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                    Pending Verification
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={checkVerificationStatus}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Check Verification Status
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                >
                  Sign Out
                </button>
                <Link
                  to="/"
                  className="flex-1 py-2 px-4 border border-blue-300 rounded-2xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 text-center"
                >
                  Go Home
                </Link>
              </div>
            </div>

            {/* Contact Support */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Need help or have questions?</p>
              <a
                href="mailto:support@healthcareplus.com"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
