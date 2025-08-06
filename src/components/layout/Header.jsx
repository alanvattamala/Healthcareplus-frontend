import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on an auth page
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          {/* Logo */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link to="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">HealthCare+</span>
            </Link>
          </div>

          {/* Auth Page Navigation */}
          {isAuthPage ? (
            <div className="flex items-center space-x-4">
              {/* Desktop Back to Home */}
              <Link to="/" className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
                </svg>
                Back to Home
              </Link>
              
              {/* Mobile menu button for auth pages */}
              <div className="md:hidden">
                <button
                  type="button"
                  className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile menu button */}
              <div className="-mr-2 -my-2 md:hidden">
                <button
                  type="button"
                  className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-10">
                <Link to="/" className="relative text-base font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <a href="#features" className="relative text-base font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 group">
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a href="#about" className="relative text-base font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 group">
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </a>
                <a href="#contact" className="relative text-base font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </nav>

              {/* Desktop CTA */}
              <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
                <Link to="/signin" className="whitespace-nowrap text-base font-medium text-gray-600 hover:text-gray-900 transition-colors duration-300">
                  Sign in
                </Link>
                <Link to="/signin" className="group relative whitespace-nowrap bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu for landing page */}
        {isMenuOpen && !isAuthPage && (
          <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
              <div className="pt-5 pb-6 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">H</span>
                    </div>
                    <span className="ml-2 text-xl font-bold text-gray-900">HealthCare+</span>
                  </div>
                  <div className="-mr-2">
                    <button
                      type="button"
                      className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-8">
                    <Link to="/" className="text-base font-medium text-gray-900 hover:text-gray-700" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <a href="#features" className="text-base font-medium text-gray-900 hover:text-gray-700" onClick={() => setIsMenuOpen(false)}>Features</a>
                    <a href="#about" className="text-base font-medium text-gray-900 hover:text-gray-700" onClick={() => setIsMenuOpen(false)}>About</a>
                    <a href="#contact" className="text-base font-medium text-gray-900 hover:text-gray-700" onClick={() => setIsMenuOpen(false)}>Contact</a>
                  </nav>
                </div>
              </div>
              <div className="py-6 px-5 space-y-6">
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <Link to="/signin" className="text-base font-medium text-gray-900 hover:text-gray-700">Sign in</Link>
                </div>
                <div>
                  <Link to="/signin" className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu for auth pages */}
        {isMenuOpen && isAuthPage && (
          <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
              <div className="pt-5 pb-6 px-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">H</span>
                    </div>
                    <span className="ml-2 text-xl font-bold text-gray-900">HealthCare+</span>
                  </div>
                  <div className="-mr-2">
                    <button
                      type="button"
                      className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-8">
                    <Link 
                      to="/" 
                      className="flex items-center text-base font-medium text-gray-900 hover:text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
                      </svg>
                      Back to Home
                    </Link>
                    <Link 
                      to={location.pathname === '/signin' ? '/signup' : '/signin'} 
                      className="flex items-center text-base font-medium text-gray-900 hover:text-gray-700 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {location.pathname === '/signin' ? 'Create Account' : 'Sign In'}
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
