import React, { useState } from 'react';
import Swal from 'sweetalert2';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userType: 'patient'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    Swal.fire({
      title: 'Thank you!',
      text: "Thank you for your message! We'll get back to you soon.",
      icon: 'success',
      confirmButtonColor: '#10B981',
      confirmButtonText: 'OK'
    });
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Call Us",
      details: [
        "+1 (555) 123-4567",
        "+1 (555) 987-6543",
        "24/7 Emergency: +1 (555) 911-HELP"
      ]
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Support Hours",
      details: [
        "Monday - Friday: 8:00 AM - 8:00 PM",
        "Saturday: 9:00 AM - 6:00 PM",
        "Sunday: 10:00 AM - 4:00 PM"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Simply sign up for an account, browse our verified doctors, and select an available time slot that works for you. You'll receive confirmation via email and SMS."
    },
    {
      question: "Is my health data secure?",
      answer: "Absolutely. We use end-to-end encryption and are fully HIPAA compliant. Your health information is protected with the highest security standards."
    },
    {
      question: "Can I get prescriptions through video consultations?",
      answer: "Yes, our licensed doctors can prescribe medications during video consultations. E-prescriptions are sent directly to your preferred pharmacy."
    },
    {
      question: "What if I need emergency care?",
      answer: "For medical emergencies, please call 911 immediately. Our platform is designed for non-emergency consultations and routine healthcare needs."
    },
    {
      question: "Do you accept insurance?",
      answer: "We work with most major insurance providers. You can check your coverage during the registration process or contact our support team for assistance."
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">Contact Us</h2>
          <p className="mt-2 text-4xl leading-8 font-bold tracking-tight text-gray-900 sm:text-5xl">
            Get in 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
              Touch
            </span>
          </p>
          <p className="mt-6 max-w-2xl text-xl text-gray-600 lg:mx-auto leading-relaxed">
            Have questions about our platform? Need support? We're here to help you on your healthcare journey.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Contact Form */}
          <div className="mb-12 lg:mb-0 animate-fadeInLeft">
            <div className="relative group">
              {/* Floating background elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-all duration-700 animate-pulse"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-lg opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
              
              <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 blur-sm animate-gradient-x"></div>
                <div className="absolute inset-[2px] bg-white/95 rounded-3xl z-0"></div>
                
                <div className="relative z-10 p-8 lg:p-10">
                  {/* Enhanced Header */}
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl shadow-xl mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Let's Connect</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Share your thoughts and we'll get back to you promptly</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Enhanced User Type Selection */}
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-gray-800 mb-4 block tracking-wide uppercase">Who are you?</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'patient', icon: '👤', label: 'Patient' },
                          { value: 'doctor', icon: '⚕️', label: 'Doctor' },
                          { value: 'other', icon: '💼', label: 'Other' }
                        ].map((type) => (
                          <label key={type.value} className="group/radio cursor-pointer">
                            <input
                              type="radio"
                              name="userType"
                              value={type.value}
                              checked={formData.userType === type.value}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                              formData.userType === type.value 
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-blue-700 shadow-lg scale-105' 
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:scale-102'
                            }`}>
                              <div className="text-2xl mb-2">{type.icon}</div>
                              <div className="font-medium text-sm">{type.label}</div>
                              {formData.userType === type.value && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Name and Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Full Name *
                        </label>
                        <div className="relative group/input">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-blue-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                            placeholder="John Doe"
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                          <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Address *
                        </label>
                        <div className="relative group/input">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-purple-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                            placeholder="john@example.com"
                          />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                        <svg className="w-4 h-4 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Subject *
                      </label>
                      <div className="relative group/input">
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 bg-white/70 backdrop-blur-sm group-hover/input:border-pink-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                          placeholder="How can we help you today?"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 to-blue-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="flex items-center text-sm font-semibold text-gray-800 tracking-wide">
                        <svg className="w-4 h-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Your Message *
                      </label>
                      <div className="relative group/input">
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 transition-all duration-300 resize-none bg-white/70 backdrop-blur-sm group-hover/input:border-cyan-300 group-hover/input:bg-white/90 text-gray-900 placeholder-gray-500"
                          placeholder="Tell us more about your inquiry, concerns, or how we can assist you with your healthcare needs..."
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-focus-within/input:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Enhanced Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-5 font-bold text-white shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 focus:scale-95 active:scale-95"
                      >
                        <span className="relative z-10 flex items-center justify-center text-lg">
                          <svg className="w-5 h-5 mr-3 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Message
                          <svg className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
                      </button>
                      <p className="text-center text-sm text-gray-500 mt-4">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8 animate-fadeInRight">
            {/* Contact Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {contactInfo.map((info, index) => (
                <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/20 relative overflow-hidden">
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <div className="group-hover:rotate-12 transition-transform duration-500">
                          {info.icon}
                        </div>
                      </div>
                      <h4 className="ml-4 text-lg font-semibold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">{info.title}</h4>
                    </div>
                    <div className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">{detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-5 -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full opacity-5 translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h4>
                </div>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <details key={index} className="group bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                      <summary className="flex justify-between items-center cursor-pointer list-none p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{faq.question}</span>
                        <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 group-hover:text-purple-600 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed bg-gradient-to-r from-gray-50 to-blue-50">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
