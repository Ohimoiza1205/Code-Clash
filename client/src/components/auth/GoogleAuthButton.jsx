import React, { useEffect, useState } from 'react';
import authService from '../../services/api/authService';

const GoogleAuthButton = ({ onSuccess, onError, disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services loaded');
      setGoogleLoaded(true);
      initializeGoogleSignIn();
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google) {
      console.error('Google Identity Services not loaded');
      return;
    }

    try {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      console.log('Google Sign-In initialized with client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      onError('Failed to initialize Google Sign-In');
    }
  };

  const handleGoogleResponse = async (response) => {
    console.log('=== Google Response Received ===');
    console.log('Response:', response);
    
    if (!response.credential) {
      console.error('No credential received from Google');
      onError('No credential received from Google');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending token to backend...');
      console.log('Token:', response.credential);
      console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:3001');

      // Call your backend with the Google token
      const result = await authService.googleAuth(response.credential);
      
      console.log('Backend response:', result);

      if (result.success) {
        console.log('Authentication successful!');
        onSuccess(result.user);
      } else {
        console.error('Authentication failed:', result.error);
        onError(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      onError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!googleLoaded || !window.google) {
      console.error('Google Services not loaded');
      onError('Google Services not loaded. Please refresh and try again.');
      return;
    }

    try {
      console.log('Prompting Google Sign-In...');
      window.google.accounts.id.prompt((notification) => {
        console.log('Google prompt notification:', notification);
        if (notification.isNotDisplayed()) {
          console.log('Prompt not displayed, trying renderButton method...');
          // Fallback: trigger sign-in directly
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-fallback'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%'
            }
          );
        }
      });
    } catch (error) {
      console.error('Error prompting Google Sign-In:', error);
      onError('Failed to start Google Sign-In');
    }
  };

  return (
    <div className="w-full">
      {/* Main Google Sign-In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={disabled || isLoading || !googleLoaded}
        className="w-full bg-white text-gray-700 border border-gray-300 rounded-xl py-4 px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Hidden fallback button for Google's renderButton method */}
      <div id="google-signin-fallback" className="hidden"></div>

      {/* Status indicators */}
      {!googleLoaded && (
        <p className="text-sm text-gray-400 mt-2 text-center">
          Loading Google Services...
        </p>
      )}
    </div>
  );
};

export default GoogleAuthButton;