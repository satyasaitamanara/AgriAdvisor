import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff,
  Leaf,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, formData);
      
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userPhone', formData.phone);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userPhone');
        }
        
        navigate('/dashboard');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Login failed. Please check your credentials.');
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if remember me was previously set
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const savedPhone = localStorage.getItem('userPhone');
    
    if (remembered === 'true' && savedPhone) {
      setRememberMe(true);
      setFormData(prev => ({ ...prev, phone: savedPhone }));
    }
  }, []);

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
              <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
              <p className="mb-6 opacity-90">
                Access your personalized farming dashboard with AI-powered insights and recommendations.
              </p>
              <ul className="space-y-3 text-left">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>View your crop health analysis</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>Check market prices</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>Get personalized recommendations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-amber-300" />
                  <span>Connect with farming experts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="md:w-3/5 py-10 px-6 sm:px-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-green-800">
                Login to Your Account
              </h2>
              <p className="mt-2 text-sm text-green-600">
                Access your personalized farming recommendations
              </p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Phone Field */}
                <div className="relative">
                  <label htmlFor="phone" className="block text-sm font-medium text-green-700 mb-1">Phone Number</label>
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
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-green-700 mb-1">Password</label>
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-green-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-green-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-green-600 hover:text-green-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-green-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-medium text-green-700 hover:text-green-800 transition-colors">
                    Sign up here
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

export default Login;