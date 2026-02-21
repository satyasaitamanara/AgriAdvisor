import React, { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

const REACT_APP_API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMsg("Please enter your registered email address");
      setIsSuccess(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg("Please enter a valid email address");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${REACT_APP_API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMsg(data.message || "Reset link sent successfully!");
        setIsSuccess(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setEmail("");
        }, 3000);
      } else {
        setMsg(data.message || "Failed to send reset link. Please try again.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMsg("Network error. Please check your connection and try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Login Button */}
        <Link 
          to="/login"
          className="absolute -top-16 left-0 flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Login</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-green-100">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white">
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Sprout size={28} className="text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-full">
                  <Mail size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Reset Your Password</h1>
                  <p className="text-green-100 text-sm mt-1">
                    Enter your registered email to receive a reset link
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle size={16} className="text-green-300" />
                  <span className="font-medium">Secure & Encrypted</span>
                </div>
                <p className="text-xs text-green-100 mt-1">
                  Your information is protected with industry-standard encryption
                </p>
              </div>
            </div>
            
            {/* Decorative Corner */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-tl-full"></div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Success Message Banner */}
              {isSuccess && msg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium">Success!</p>
                      <p className="text-green-700 text-sm mt-1">{msg}</p>
                      <p className="text-green-600 text-xs mt-2">
                        Check your inbox and follow the instructions in the email.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message Banner */}
              {!isSuccess && msg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-medium">Attention Required</p>
                      <p className="text-red-700 text-sm mt-1">{msg}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (msg) setMsg(""); // Clear message when user starts typing
                      }}
                      placeholder="Enter your registered email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 placeholder-gray-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll send a password reset link to this email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                    isLoading
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {/* Additional Information */}
              <div className="pt-6 border-t border-gray-100">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Important Information
                  </h3>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                      The reset link will expire in 1 hour for security
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                      Check your spam folder if you don't see the email
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                      Contact support if you continue having issues
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  Back to Login
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                © {new Date().getFullYear()} AgriCommunity. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section - Desktop Only */}
        <div className="hidden lg:block mt-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-green-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Secure Process</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-green-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Quick Recovery</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-green-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89-5.26a2 2 0 012.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Email Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}