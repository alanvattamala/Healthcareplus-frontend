import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-400 to-cyan-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="animate-fadeInUp">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                Your Health,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
                  Our Priority
                </span>
              </h1>
            </div>
            <div className="animate-fadeInUp animation-delay-300">
              <p className="mt-6 text-xl text-gray-500 max-w-3xl leading-relaxed">
                Experience the future of healthcare with our AI-powered platform. Connect with doctors, 
                track your health, and get personalized care - all in one place.
              </p>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-8 flex flex-wrap gap-4 text-sm animate-fadeInUp animation-delay-600">
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-2 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">AI Symptom Checker</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-2 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">24/7 Smart Chatbot</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-2 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">Video Consultations</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start animate-fadeInUp animation-delay-900">
              <div className="rounded-md shadow-2xl">
                <Link to="/signin" className="group relative w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl transform hover:scale-105 transition-all duration-500 md:py-4 md:text-lg md:px-10 overflow-hidden">
                  <span className="relative z-10">Get Started Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <a href="#features" className="group w-full flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-gray-400 shadow-lg hover:shadow-xl transition-all duration-300 md:py-4 md:text-lg md:px-10">
                  <span className="mr-2">Learn More</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 text-center animate-fadeInUp animation-delay-1200">
              <div className="group">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-sm text-gray-500 font-medium">Patients</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-sm text-gray-500 font-medium">Doctors</div>
              </div>
              <div className="group">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-600 group-hover:scale-110 transition-transform duration-300">50K+</div>
                <div className="text-sm text-gray-500 font-medium">Consultations</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image/Illustration */}
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center animate-fadeInRight">
            <div className="relative mx-auto w-full rounded-lg lg:max-w-md">
              {/* Enhanced mock mobile app interface */}
              <div className="relative bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-500">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-20 animate-pulse"></div>
                
                <div className="relative bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-sm backdrop-blur-sm border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm font-bold">Dr</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">Dr. Sarah Wilson</div>
                        <div className="text-xs text-gray-500">Cardiologist • Online</div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-ping absolute"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium mb-1">Next Appointment</div>
                      <div className="text-sm font-semibold text-gray-900">Today at 3:00 PM</div>
                      <div className="text-xs text-gray-500 mt-1">Video Consultation</div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        Join Video Call
                      </button>
                      <button className="flex-1 border-2 border-gray-200 text-gray-700 text-xs py-3 rounded-xl font-medium hover:border-gray-300 transition-colors duration-300">
                        Reschedule
                      </button>
                    </div>
                    
                    {/* Health metrics */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600 font-medium">Heart Rate</div>
                        <div className="text-lg font-bold text-green-700">72 BPM</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="text-xs text-blue-600 font-medium">Blood Pressure</div>
                        <div className="text-lg font-bold text-blue-700">120/80</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced floating elements */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 animate-float border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-gray-700">AI Health Check</span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 animate-float animation-delay-1000 border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center text-xs">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-gray-700">Medication Alert</span>
                  </div>
                </div>
                
                <div className="absolute top-1/2 -left-8 bg-white rounded-2xl shadow-xl p-3 animate-float animation-delay-2000 border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center text-xs">
                    <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-gray-700">Smart Tips</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
