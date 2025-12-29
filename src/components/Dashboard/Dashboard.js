import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  LogOut, 
  Sun, 
  CloudRain, 
  Cloud, 
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  BarChart3,
  Leaf,
  Bug,
  Sprout,
  ShoppingCart,
  History,
  Settings,
  HelpCircle,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  ChevronRight,
  CloudDrizzle,
  CloudSnow,
  CloudLightning
} from 'lucide-react';
  const cardBackgrounds = {
    crop: '/images/crop2.webp',
    soil: '/images/soil.jpg',
    pest: '/images/pest.jpg',
    weather: '/images/weather1.jpg',
    market: '/images/market1.jpg',
    history: '/images/history.jpg'
  };


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userResponse = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(userResponse.data);
        
        // Mock weather data (in a real app, this would come from an API)
        const mockWeather = {
          temperature: 28,
          conditions: "Partly Cloudy",
          humidity: 65,
          wind: 12,
          precipitation: 10,
          irrigation_advice: "Light irrigation recommended in the evening",
          forecast: [
            { day: "Today", temp: 28, condition: "Partly Cloudy", icon: <Cloud className="text-blue-400" /> },
            { day: "Tomorrow", temp: 30, condition: "Sunny", icon: <Sun className="text-yellow-400" /> },
            { day: "Wed", temp: 26, condition: "Light Rain", icon: <CloudRain className="text-blue-500" /> }
          ]
        };
        setWeather(mockWeather);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getWeatherIcon = (condition) => {
    switch(condition.toLowerCase()) {
      case 'sunny': return <Sun className="text-yellow-400" size={24} />;
      case 'partly cloudy': return <Cloud className="text-blue-300" size={24} />;
      case 'cloudy': return <Cloud className="text-gray-400" size={24} />;
      case 'rain': return <CloudRain className="text-blue-500" size={24} />;
      case 'light rain': return <CloudDrizzle className="text-blue-400" size={24} />;
      case 'storm': return <CloudLightning className="text-purple-500" size={24} />;
      case 'snow': return <CloudSnow className="text-blue-200" size={24} />;
      default: return <Sun className="text-yellow-400" size={24} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <div className="text-lg text-green-700">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">AgriAdvisor</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors ${activeTab === 'dashboard' ? 'text-amber-300 font-bold' : 'hover:text-amber-200'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`transition-colors ${activeTab === 'reports' ? 'text-amber-300 font-bold' : 'hover:text-amber-200'}`}
            >
              Reports
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`transition-colors ${activeTab === 'settings' ? 'text-amber-300 font-bold' : 'hover:text-amber-200'}`}
            >
              Settings
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-green-700 px-3 py-1 rounded-full">
              <User size={16} className="mr-2" />
              <span className="text-sm">{user?.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-white text-green-700 px-4 py-2 rounded-lg flex items-center hover:bg-green-50 transition-colors"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-green-800 mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-green-600">Here's your farming overview for today</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Crop Recommendation Card */}
            <Link to="/recommend" className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl shadow-md p-6 hover:from-green-600 hover:to-teal-600 transition-all transform hover:-translate-y-1"
            style={{ backgroundImage: `url(${cardBackgrounds.crop})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Leaf size={24} />
                </div>
                <ChevronRight size={20} className="opacity-70" />
              </div>
              <h3 className="font-bold text-lg mb-2">Crop Recommendation</h3>
              <p className="opacity-90 text-sm">Get AI-powered crop suggestions based on your soil</p>
            </Link>

            {/* Soil Advisory Card */}
            <Link to="/soil" className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl shadow-md p-6 hover:from-amber-600 hover:to-orange-600 transition-all transform hover:-translate-y-1"
            style={{ backgroundImage: `url(${cardBackgrounds.soil})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Sprout size={24} />
                </div>
                <ChevronRight size={20} className="opacity-70" />
              </div>
              <h3 className="font-bold text-lg mb-2">Soil Advisory</h3>
              <p className="opacity-90 text-sm">Get fertilizer recommendations for your soil</p>
            </Link>

            {/* Pest Detection Card */}
            <Link to="/pest" className="bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-2xl shadow-md p-6 hover:from-red-600 hover:to-pink-600 transition-all transform hover:-translate-y-1"
            style={{ backgroundImage: `url(${cardBackgrounds.pest})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Bug size={24} />
                </div>
                <ChevronRight size={20} className="opacity-70" />
              </div>
              <h3 className="font-bold text-lg mb-2">Pest Detection</h3>
              <p className="opacity-90 text-sm">Identify plant diseases from images</p>
            </Link>

            {/* Weather Card */}
            <Link to="/weather" className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl shadow-md p-6 hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:-translate-y-1"
            style={{ backgroundImage: `url(${cardBackgrounds.weather})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <CloudRain size={24} />
                </div>
                <ChevronRight size={20} className="opacity-70" />
              </div>
              <h3 className="font-bold text-lg mb-2">Weather</h3>
              <p className="opacity-90 text-sm">Check weather forecast and irrigation advice</p>
            </Link>

            {/* Market Prices Card */}
            <Link to="/market" className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-2xl shadow-md p-6 hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:-translate-y-1"
            style={{ backgroundImage: `url(${cardBackgrounds.market})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <BarChart3 size={24} />
                </div>
                <ChevronRight size={20} className="opacity-70" />
              </div>
              <h3 className="font-bold text-lg mb-2">Market Prices</h3>
              <p className="opacity-90 text-sm">Check current market prices for crops</p>
            </Link>

            {/* History Card */}
            <Link to="/history" className="bg-gradient-to-br from-gray-600 to-gray-700 text-white rounded-2xl shadow-md p-6 hover:from-gray-700 hover:to-gray-800 transition-all transform hover:-translate-y-1"
            style={{ backgroundImage: `url(${cardBackgrounds.history})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <History size={24} />
                </div>
                <ChevronRight size={20} className="opacity-70" />
              </div>
              <h3 className="font-bold text-lg mb-2">History & Reports</h3>
              <p className="opacity-90 text-sm">View your past recommendations and reports</p>
            </Link>
          </div>

          {/* Quick Stats Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-12 border border-green-200">
            <h2 className="text-xl font-semibold mb-6 text-green-700">Your Farm Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Leaf className="text-green-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-green-700">5</p>
                <p className="text-sm text-green-600">Active Crops</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Droplets className="text-blue-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-blue-700">12h</p>
                <p className="text-sm text-blue-600">Irrigation Needed</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                <div className="bg-amber-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="text-amber-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-amber-700">7</p>
                <p className="text-sm text-amber-600">Tasks This Week</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="text-purple-600" size={20} />
                </div>
                <p className="text-2xl font-bold text-purple-700">3</p>
                <p className="text-sm text-purple-600">Market Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-700 to-teal-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Leaf className="h-8 w-8 mr-2 text-amber-300" />
              <h2 className="text-2xl font-bold">AgriAdvisor</h2>
            </div>
            <p className="text-green-100 mb-4">
              AI-powered agricultural recommendations to help farmers maximize yield and profits.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Dashboard</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Crop Advice</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Weather</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Market Prices</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Farming Guides</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> FAQ</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Support</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Community</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center text-green-100">
                <Mail size={16} className="mr-2 text-amber-200" />
                support@agriadvisor.com
              </div>
              <div className="flex items-center text-green-100">
                <Phone size={16} className="mr-2 text-amber-200" />
                +91 9876543210
              </div>
              <div className="flex items-center text-green-100">
                <HelpCircle size={16} className="mr-2 text-amber-200" />
                24/7 Farmer Support
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-green-600 mt-8 pt-6 text-center text-green-200">
          <p>© {new Date().getFullYear()} AgriAdvisor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;