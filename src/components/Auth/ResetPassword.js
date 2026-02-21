import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft, Key, Shield, Sprout } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const validateForm = () => {
    if (!password.trim()) {
      setMsg("Please enter a new password");
      setIsSuccess(false);
      return false;
    }

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters long");
      setIsSuccess(false);
      return false;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match");
      setIsSuccess(false);
      return false;
    }

    return true;
  };

  const reset = async () => {
    if (!validateForm()) return;

    if (!token) {
      setMsg("Invalid or expired reset link. Please request a new one.");
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      setMsg(data.message);

      if (res.ok) {
        setIsSuccess(true);
        // Auto-redirect after success
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setIsSuccess(false);
      }
    } catch (err) {
      setMsg("Network error. Please check your connection and try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength) => {
    if (strength === 0) return "bg-gray-200";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-100 rounded-full opacity-10 blur-3xl"></div>
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
              <Key size={28} className="text-white" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-full">
                  <Shield size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Set New Password</h1>
                  <p className="text-green-100 text-sm mt-1">
                    Create a strong password to secure your account
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle size={16} className="text-green-300" />
                  <span className="font-medium">Secure Reset Process</span>
                </div>
                <p className="text-xs text-green-100 mt-1">
                  Your password will be encrypted and stored securely
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
                      <p className="text-green-800 font-medium">Password Reset Successful!</p>
                      <p className="text-green-700 text-sm mt-1">{msg}</p>
                      <p className="text-green-600 text-xs mt-2">
                        Redirecting to login page in 3 seconds...
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
                      <p className="text-red-800 font-medium">Unable to Reset Password</p>
                      <p className="text-red-700 text-sm mt-1">{msg}</p>
                    </div>
                  </div>
                </div>
              )}

              {!token && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-800 font-medium">Invalid Reset Link</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        This reset link appears to be invalid or expired. Please request a new password reset link.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-6">
                {/* New Password */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 placeholder-gray-400"
                      disabled={isLoading || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">Password Strength</span>
                        <span className={`text-xs font-bold ${
                          passwordStrength === 0 ? "text-gray-500" :
                          passwordStrength === 1 ? "text-red-500" :
                          passwordStrength === 2 ? "text-yellow-500" :
                          passwordStrength === 3 ? "text-blue-500" : "text-green-500"
                        }`}>
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className={`flex items-center ${password.length >= 8 ? "text-green-600" : ""}`}>
                          <span className={`w-4 h-4 mr-2 flex items-center justify-center ${password.length >= 8 ? "text-green-500" : "text-gray-300"}`}>
                            {password.length >= 8 ? "✓" : "○"}
                          </span>
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(password) ? "text-green-600" : ""}`}>
                          <span className={`w-4 h-4 mr-2 flex items-center justify-center ${/[A-Z]/.test(password) ? "text-green-500" : "text-gray-300"}`}>
                            {/[A-Z]/.test(password) ? "✓" : "○"}
                          </span>
                          One uppercase letter
                        </li>
                        <li className={`flex items-center ${/[0-9]/.test(password) ? "text-green-600" : ""}`}>
                          <span className={`w-4 h-4 mr-2 flex items-center justify-center ${/[0-9]/.test(password) ? "text-green-500" : "text-gray-300"}`}>
                            {/[0-9]/.test(password) ? "✓" : "○"}
                          </span>
                          One number
                        </li>
                        <li className={`flex items-center ${/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}`}>
                          <span className={`w-4 h-4 mr-2 flex items-center justify-center ${/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-300"}`}>
                            {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"}
                          </span>
                          One special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 placeholder-gray-400"
                      disabled={isLoading || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {password && confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center">
                      <CheckCircle size={12} className="mr-1" />
                      Passwords match
                    </p>
                  )}
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <button
                  onClick={reset}
                  disabled={isLoading || !token}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                    isLoading || !token
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>

              {/* Password Guidelines */}
              <div className="pt-6 border-t border-gray-100">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                    <Shield size={16} className="mr-2" />
                    Password Guidelines
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                      Use at least 8 characters with a mix of letters, numbers, and symbols
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                      Avoid using personal information or common words
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                      Consider using a passphrase that's easy to remember but hard to guess
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
              <p className="text-xs text-gray-500 mt-2 flex items-center justify-center">
                <Sprout size={12} className="mr-1" />
                Secured by AgriCommunity
              </p>
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