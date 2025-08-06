import React, { useState } from 'react';

const ModulesSection = () => {
  const [activeTab, setActiveTab] = useState('patient');

  const modules = {
    patient: {
      title: "Patient Module",
      subtitle: "For users seeking healthcare services",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      features: [
        { name: "User Registration & Login", description: "OTP or email-based secure authentication" },
        { name: "AI Symptom Checker", description: "Predict conditions with confidence percentages" },
        { name: "Smart Chatbot", description: "24/7 health guidance and FAQs" },
        { name: "Book Appointments", description: "Real-time doctor availability" },
        { name: "Video Consultation", description: "WebRTC integration for remote consultations" },
        { name: "E-Prescription Access", description: "View and download prescriptions" },
        { name: "Medical History Dashboard", description: "Track past visits and reports" },
        { name: "Vitals Tracker", description: "Log BP, sugar levels with AI alerts" },
        { name: "Health Tips & Articles", description: "AI-personalized health content" }
      ],
      color: "from-blue-500 to-blue-600"
    },
    doctor: {
      title: "Doctor Module",
      subtitle: "For registered healthcare professionals",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      features: [
        { name: "Doctor Registration & Profile", description: "Setup specialization and availability" },
        { name: "Doctor Dashboard", description: "View upcoming appointments and patient info" },
        { name: "AI Diagnosis Support", description: "Receive AI suggestions for diagnosis" },
        { name: "E-Prescription Generator", description: "Auto-filled fields with medicine database" },
        { name: "Patient Profile Viewer", description: "Access complete health records" },
        { name: "Live Chat with Patients", description: "Pre and post consultation communication" },
        { name: "Appointment Management", description: "Mark status as completed/cancelled" },
        { name: "Patient Vitals Trends", description: "AI-powered health tracking graphs" },
        { name: "Availability Management", description: "Calendar and time slot control" }
      ],
      color: "from-green-500 to-green-600"
    },
    admin: {
      title: "Admin Module",
      subtitle: "For system administrators",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      features: [
        { name: "User Management", description: "View, edit, and manage user accounts" },
        { name: "Doctor Verification", description: "Approve or reject doctor profiles" },
        { name: "Appointment Analytics", description: "Track appointments by department and date" },
        { name: "System Dashboard", description: "Monitor users, doctors, and revenue" },
        { name: "Broadcast Notifications", description: "System-wide announcements" },
        { name: "Manage Specializations", description: "Control departments and categories" },
        { name: "Issue & Feedback Tracking", description: "Handle user support requests" },
        { name: "Reports Generation", description: "Export daily/weekly/monthly reports" },
        { name: "Revenue Analytics", description: "Track financial performance" }
      ],
      color: "from-purple-500 to-purple-600"
    }
  };

  const tabs = [
    { key: 'patient', label: 'Patient' },
    { key: 'doctor', label: 'Doctor' },
    { key: 'admin', label: 'Admin' }
  ];

  return (
    <section id="modules" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Modules</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Comprehensive Healthcare Solutions
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Three specialized modules designed to serve patients, healthcare professionals, 
            and administrators with tailored features and capabilities.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Module Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            {/* Left - Module Info */}
            <div className="lg:col-span-5">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${modules[activeTab].color} text-white shadow-lg mb-6`}>
                {modules[activeTab].icon}
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {modules[activeTab].title}
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                {modules[activeTab].subtitle}
              </p>

              {/* Mini project vs Main project badges */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Mini Project Ready
                </div>
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  AI-Powered Full Version
                </div>
              </div>

              <a 
                href="#" 
                className={`inline-flex items-center px-6 py-3 rounded-lg text-white bg-gradient-to-r ${modules[activeTab].color} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
              >
                Learn More
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>

            {/* Right - Features List */}
            <div className="mt-12 lg:mt-0 lg:col-span-7">
              <div className="grid grid-cols-1 gap-4">
                {modules[activeTab].features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className={`flex-shrink-0 w-2 h-2 bg-gradient-to-r ${modules[activeTab].color} rounded-full mt-3 mr-4`}></div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Project Comparison */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mini Project */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Mini Project</h3>
                <p className="text-gray-600">Simplified Version</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Basic patient-doctor interaction
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Essential features only
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Quick development cycle
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                MERN Stack + Bootstrap
              </li>
            </ul>
          </div>

          {/* Main Project */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-200">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Main Project</h3>
                <p className="text-gray-600">Full-Scale AI-Powered</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-powered healthcare ecosystem
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced analytics & automation
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Video consultations & ML integration
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                MERN + AI/ML + WebRTC
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
