import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Phone, 
  Lock, 
  MapPin, 
  Navigation, 
  Crop, 
  Droplets, 
  Eye, 
  EyeOff,
  CheckCircle,
  Leaf
} from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    village: '',
    district: '',
    state: '',
    lat: '',
    lng: '',
    land_size: '',
    soil_type: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.name || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/auth/signup`, formData);
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'Signup failed');
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setLocationDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationDetecting(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to detect location. Please enter manually.');
          setLocationDetecting(false);
        },
        { timeout: 10000 }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLocationDetecting(false);
    }
  };

  const soilTypes = [
    { value: 'sandy', label: 'Sandy' },
    { value: 'clay', label: 'Clay' },
    { value: 'loamy', label: 'Loamy' },
    { value: 'silty', label: 'Silty' },
    { value: 'peaty', label: 'Peaty' },
    { value: 'chalky', label: 'Chalky' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Left side - Illustration/Info */}
          <div className="md:w-2/5 bg-gradient-to-br from-green-500 to-teal-600 text-white p-8 hidden md:flex flex-col justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Leaf className="h-12 w-12 text-amber-300" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Join AgriCommunity</h2>
              <p className="mb-6 opacity-90">
                Connect with thousands of farmers using AI technology to improve crop yields and maximize profits.
              </p>
              <ul className="space-y-3 text-left">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>Personalized crop recommendations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>AI-powered pest detection</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>Market insights and trends</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>Expert farming advice</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="md:w-3/5 py-10 px-6 sm:px-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-green-800">
                Create Farmer Account
              </h2>
              <p className="mt-2 text-sm text-green-600">
                Join thousands of farmers using AI to improve their yield
              </p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {success}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Field */}
                <div className="relative">
                  <label htmlFor="name" className="block text-sm font-medium text-green-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div className="relative">
                  <label htmlFor="phone" className="block text-sm font-medium text-green-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="relative md:col-span-2">
                  <label htmlFor="password" className="block text-sm font-medium text-green-700 mb-1">Password *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="pl-10 pr-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-green-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-green-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Village Field */}
                <div className="relative">
                  <label htmlFor="village" className="block text-sm font-medium text-green-700 mb-1">Village</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      id="village"
                      name="village"
                      type="text"
                      className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Village"
                      value={formData.village}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* District Field */}
                <div className="relative">
                  <label htmlFor="district" className="block text-sm font-medium text-green-700 mb-1">District</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      id="district"
                      name="district"
                      type="text"
                      className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="District"
                      value={formData.district}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* State Field */}
                <div className="relative">
                  <label htmlFor="state" className="block text-sm font-medium text-green-700 mb-1">State</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Location Fields */}
                <div className="relative md:col-span-2">
                  <label className="block text-sm font-medium text-green-700 mb-1">Location Coordinates</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Navigation className="h-5 w-5 text-green-500 transform -rotate-45" />
                      </div>
                      <input
                        name="lat"
                        type="number"
                        step="any"
                        className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Latitude"
                        value={formData.lat}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Navigation className="h-5 w-5 text-green-500" />
                      </div>
                      <input
                        name="lng"
                        type="number"
                        step="any"
                        className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Longitude"
                        value={formData.lng}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={locationDetecting}
                    className="mt-2 w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {locationDetecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Detect My Location
                      </>
                    )}
                  </button>
                </div>

                {/* Land Size Field */}
                <div className="relative">
                  <label htmlFor="land_size" className="block text-sm font-medium text-green-700 mb-1">Land Size (acres)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Crop className="h-5 w-5 text-green-500" />
                    </div>
                    <input
                      id="land_size"
                      name="land_size"
                      type="number"
                      step="any"
                      className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 placeholder-green-400 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Land Size (acres)"
                      value={formData.land_size}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Soil Type Field */}
                <div className="relative">
                  <label htmlFor="soil_type" className="block text-sm font-medium text-green-700 mb-1">Soil Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Droplets className="h-5 w-5 text-green-500" />
                    </div>
                    <select
                      id="soil_type"
                      name="soil_type"
                      className="pl-10 appearance-none relative block w-full px-3 py-3 border border-green-300 text-green-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={formData.soil_type}
                      onChange={handleChange}
                    >
                      <option value="">Select Soil Type</option>
                      {soilTypes.map((soil) => (
                        <option key={soil.value} value={soil.value}>
                          {soil.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-green-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-green-700 hover:text-green-800 transition-colors">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;