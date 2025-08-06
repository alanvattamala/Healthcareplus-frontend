import React, { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

const GoogleSignIn = ({ onSuccess, onError, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [clientId, setClientId] = useState(null);
  const googleButtonRef = useRef(null);

  const handleCredentialResponse = useCallback(async (response) => {
    setIsLoading(true);
    try {
      const result = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await result.json();

      if (result.ok) {
        onSuccess(data);
      } else {
        onError(data.message || 'Google sign-in failed');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      onError('Network error during Google sign-in');
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Fetch client ID from backend
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const configResponse = await fetch('http://localhost:3001/api/auth/google/config');
        const configData = await configResponse.json();
        
        if (configData.status === 'success' && configData.data.clientId) {
          setClientId(configData.data.clientId);
        } else {
          console.error('Invalid config response:', configData);
          toast.error('Google Sign-In configuration error');
        }
      } catch (error) {
        console.error('Error fetching Google config:', error);
        toast.error('Failed to load Google Sign-In configuration');
      }
    };

    fetchClientId();
  }, []);

  useEffect(() => {
    // Check if Google script is already loaded
    if (window.google && window.google.accounts) {
      setIsGoogleLoaded(true);
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google GSI script loaded');
      setIsGoogleLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load Google GSI script');
      toast.error('Failed to load Google Sign-In. Please check your internet connection.');
    };

    document.head.appendChild(script);

    return () => {
      // Only remove if we added it
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize and render Google button when both script and client ID are ready
  useEffect(() => {
    if (isGoogleLoaded && clientId && window.google && window.google.accounts && googleButtonRef.current) {
      try {
        console.log('Initializing Google Sign-In with client ID:', clientId);
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        console.log('Rendering Google Sign-In button...');
        
        // Clear any existing content
        googleButtonRef.current.innerHTML = '';
        
        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          logo_alignment: 'left',
          width: '250',
        });

      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        toast.error('Failed to initialize Google Sign-In: ' + error.message);
      }
    }
  }, [isGoogleLoaded, clientId, handleCredentialResponse]);

  const handleFallbackSignIn = async () => {
    if (!isGoogleLoaded || !window.google || !window.google.accounts || !clientId) {
      toast.error('Google Sign-In is not ready yet. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Using fallback Google Sign-In method...');
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Trigger the sign-in prompt as fallback
      window.google.accounts.id.prompt((notification) => {
        console.log('Google Sign-In notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google Sign-In prompt was not displayed or skipped');
          toast.info('Please allow popups for this site and try again.');
        }
      });
    } catch (error) {
      console.error('Error with fallback Google Sign-In:', error);
      toast.error('Failed to initialize Google Sign-In: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Google's official button (preferred) */}
      <div
        ref={googleButtonRef}
        style={{ 
          opacity: (isGoogleLoaded && clientId) ? 1 : 0,
          pointerEvents: (isGoogleLoaded && clientId) ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Custom fallback button */}
      <button
        type="button"
        onClick={handleFallbackSignIn}
        disabled={disabled || isLoading || !isGoogleLoaded || !clientId}
        className="group relative flex items-center justify-center px-6 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        title={!isGoogleLoaded || !clientId ? "Loading Google Sign-In..." : "Continue with Google (Fallback)"}
        style={{ 
          display: (isGoogleLoaded && clientId) ? 'none' : 'flex'
        }}
      >
        {isLoading ? (
          <>
            <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium text-gray-700">Signing in...</span>
          </>
        ) : !isGoogleLoaded || !clientId ? (
          <>
            <svg className="w-5 h-5 mr-3 animate-pulse" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            </svg>
            <span className="font-medium text-gray-500">Loading Google...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleSignIn;
