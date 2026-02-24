import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  LogOut, 
  CloudRain, 
  Droplets,
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
  MapPin,
  Download,
  Filter,
  Eye,
  Trash2,
  FileText,
  TrendingUp,
  Droplet,
  CloudSun,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Save,
  Wifi,
  Database,
  BellRing,
  Search,
  Menu,
  X,
  Upload
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const API_BASE = process.env.REACT_APP_API_BASE || 'https://agriadvisor-l9g9.onrender.com';

  // Mock reports data
  const mockReports = [
    {
      id: 1,
      type: 'soil',
      title: 'Soil Analysis Report - Field A',
      date: '2024-01-15',
      summary: 'Soil pH: 6.5, Nitrogen: Medium, Phosphorus: High, Potassium: Low',
      recommendations: ['Add potassium-based fertilizer', 'Maintain current irrigation schedule'],
      icon: <Sprout className="text-amber-600" />
    },
    {
      id: 2,
      type: 'crop',
      title: 'Crop Recommendation - Rabi Season',
      date: '2024-01-10',
      summary: 'Wheat, Mustard, and Peas recommended based on soil and weather conditions',
      recommendations: ['Start wheat sowing by Jan 25', 'Use certified seeds for better yield'],
      icon: <Leaf className="text-green-600" />
    },
    {
      id: 3,
      type: 'pest',
      title: 'Pest Detection - Tomato Field',
      date: '2024-01-05',
      summary: 'Early blight detected with 85% confidence',
      recommendations: ['Apply copper-based fungicide', 'Remove infected leaves immediately'],
      icon: <Bug className="text-red-600" />
    },
    {
      id: 4,
      type: 'weather',
      title: 'Weather Impact Analysis',
      date: '2024-01-01',
      summary: 'Heavy rainfall predicted for next week affecting irrigation schedule',
      recommendations: ['Delay irrigation by 3 days', 'Prepare drainage systems'],
      icon: <CloudRain className="text-blue-600" />
    },
    {
      id: 5,
      type: 'market',
      title: 'Market Price Trends - December',
      date: '2023-12-28',
      summary: 'Wheat prices increased by 15%, Potato prices stable',
      recommendations: ['Consider selling wheat stocks', 'Hold potato stocks for better prices'],
      icon: <TrendingUp className="text-purple-600" />
    },
    {
      id: 6,
      type: 'irrigation',
      title: 'Irrigation Schedule - January',
      date: '2023-12-20',
      summary: 'Optimal irrigation times: 6-8 AM and 5-7 PM',
      recommendations: ['Install drip irrigation for efficiency', 'Monitor soil moisture daily'],
      icon: <Droplets className="text-cyan-600" />
    }
  ];

  // Mock settings
  const mockSettings = {
    farmName: 'TAMANARA SATYA SAI',
    location: 'Rajahmundry , India',
    area: '5 acres',
    soilType: 'Loamy',
    units: 'metric',
    language: 'English',
    notifications: {
      weatherAlerts: true,
      priceUpdates: true,
      pestWarnings: true,
      irrigationReminders: true,
      marketTrends: true
    },
    autoSync: true,
    dataSharing: true,
    theme: 'light'
  };

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const userResponse = await axios.get(
        `${API_BASE}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(userResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [API_BASE]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  const renderDashboardContent = () => (
    <>
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-green-800 mb-2">Welcome back, {user?.name}!</h2>
        <p className="text-green-600">Here's your farming overview for today</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { to: "/recommend", title: "Crop Recommendation", desc: "Get AI-powered crop suggestions based on your soil", icon: <Leaf size={24} />, bg: cardBackgrounds.crop, colors: "from-green-500 to-teal-500" },
          { to: "/soil", title: "Soil Advisory", desc: "Get fertilizer recommendations for your soil", icon: <Sprout size={24} />, bg: cardBackgrounds.soil, colors: "from-amber-500 to-orange-500" },
          { to: "/pest", title: "Pest Detection", desc: "Identify plant diseases from images", icon: <Bug size={24} />, bg: cardBackgrounds.pest, colors: "from-red-500 to-pink-500" },
          { to: "/weather", title: "Weather", desc: "Check weather forecast and irrigation advice", icon: <CloudRain size={24} />, bg: cardBackgrounds.weather, colors: "from-blue-500 to-cyan-500" },
          { to: "/market", title: "Market Prices", desc: "Check current market prices for crops", icon: <BarChart3 size={24} />, bg: cardBackgrounds.market, colors: "from-purple-500 to-indigo-500" },
          { to: "/history", title: "History & Reports", desc: "View your past recommendations and reports", icon: <History size={24} />, bg: cardBackgrounds.history, colors: "from-gray-600 to-gray-700" },
        ].map((card, index) => (
          <Link 
            key={index} 
            to={card.to} 
            className={`bg-gradient-to-br ${card.colors} text-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1`}
            style={{ backgroundImage: `url(${card.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                {card.icon}
              </div>
              <ChevronRight size={20} className="opacity-70" />
            </div>
            <h3 className="font-bold text-lg mb-2">{card.title}</h3>
            <p className="opacity-90 text-sm">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-12 border border-green-200">
        <h2 className="text-xl font-semibold mb-6 text-green-700">Your Farm Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center hover:bg-green-100 transition-colors cursor-pointer">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Leaf className="text-green-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-green-700">5</p>
            <p className="text-sm text-green-600">Active Crops</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center hover:bg-blue-100 transition-colors cursor-pointer">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Droplets className="text-blue-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-blue-700">12h</p>
            <p className="text-sm text-blue-600">Irrigation Needed</p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center hover:bg-amber-100 transition-colors cursor-pointer">
            <div className="bg-amber-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Calendar className="text-amber-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-amber-700">7</p>
            <p className="text-sm text-amber-600">Tasks This Week</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center hover:bg-purple-100 transition-colors cursor-pointer">
            <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="text-purple-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-purple-700">3</p>
            <p className="text-sm text-purple-600">Market Alerts</p>
          </div>
        </div>
      </div>
    </>
  );

  const renderReportsContent = () => (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Reports & History</h2>
            <p className="text-green-100 opacity-90">View all your farming reports, analyses, and historical data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center">
              <Download size={16} className="mr-2" />
              Export All
            </button>
            <button className="bg-green-700 border border-green-300 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center">
              <Filter size={16} className="mr-2" />
              Filter Reports
            </button>
          </div>
        </div>
      </div>

      {/* Reports Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: '24', icon: <FileText className="text-green-600" />, color: 'bg-green-50', border: 'border-green-200' },
          { label: 'This Month', value: '6', icon: <Calendar className="text-blue-600" />, color: 'bg-blue-50', border: 'border-blue-200' },
          { label: 'Pending Actions', value: '3', icon: <AlertCircle className="text-amber-600" />, color: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Completed Tasks', value: '18', icon: <CheckCircle className="text-purple-600" />, color: 'bg-purple-50', border: 'border-purple-200' },
        ].map((stat, index) => (
          <div key={index} className={`${stat.color} ${stat.border} border rounded-xl p-4 hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white rounded-lg">
                {stat.icon}
              </div>
              <span className="text-xs text-gray-500">Last 30 days</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-semibold text-gray-800">Recent Reports</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search reports..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {mockReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{report.title}</h4>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.summary}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={14} className="mr-1" />
                      Generated on {report.date}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {report.recommendations.map((rec, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Download size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">Showing 6 of 24 reports</span>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity Timeline</h3>
        <div className="space-y-4">
          {[
            { action: 'Soil test report generated', time: '2 hours ago', type: 'analysis', icon: <CheckCircle className="text-green-500" /> },
            { action: 'New pest alert in your region', time: '1 day ago', type: 'alert', icon: <AlertCircle className="text-red-500" /> },
            { action: 'Weather forecast updated', time: '2 days ago', type: 'update', icon: <CloudSun className="text-blue-500" /> },
            { action: 'Irrigation schedule optimized', time: '3 days ago', type: 'optimization', icon: <Droplet className="text-cyan-500" /> },
            { action: 'Market prices synced', time: '4 days ago', type: 'sync', icon: <TrendingUp className="text-purple-500" /> },
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                {activity.icon}
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{activity.action}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{activity.time}</span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">{activity.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-green-100 opacity-90">Manage your farm profile and application preferences</p>
          </div>
          <Settings size={32} className="opacity-80" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Farm Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Farm Information</h3>
              <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg">
                <Edit size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
                <input 
                  type="text" 
                  defaultValue={mockSettings.farmName}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex">
                  <input 
                    type="text" 
                    defaultValue={mockSettings.location}
                    className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                  />
                  <button className="px-4 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200">
                    <MapPin size={18} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Area</label>
                <input 
                  type="text" 
                  defaultValue={mockSettings.area}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50">
                  <option>Loamy</option>
                  <option>Clay</option>
                  <option>Sandy</option>
                  <option>Silt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <BellRing className="mr-2" />
              Notification Preferences
            </h3>
            <div className="space-y-4">
              {Object.entries(mockSettings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm text-gray-600">Receive alerts for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked={value}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - System Settings */}
        <div className="space-y-6">
          {/* System Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">System Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Units</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option>Metric (°C, mm, km)</option>
                  <option>Imperial (°F, in, mi)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option>English</option>
                  <option>हिंदी</option>
                  <option>தமிழ்</option>
                  <option>తెలుగు</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Data Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <Wifi className="mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">Auto-sync</p>
                    <p className="text-sm text-gray-600">Sync data automatically</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <Database className="mr-3 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">Data Sharing</p>
                    <p className="text-sm text-gray-600">Improve recommendations</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                <Save className="mr-2" />
                Save All Changes
              </button>
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Upload className="mr-2" />
                Export Settings
              </button>
              <button className="w-full px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`transition-colors px-3 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-green-700 text-amber-300 font-bold' : 'hover:text-amber-200 hover:bg-green-700'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`transition-colors px-3 py-2 rounded-lg ${activeTab === 'reports' ? 'bg-green-700 text-amber-300 font-bold' : 'hover:text-amber-200 hover:bg-green-700'}`}
            >
              Reports 
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`transition-colors px-3 py-2 rounded-lg ${activeTab === 'settings' ? 'bg-green-700 text-amber-300 font-bold' : 'hover:text-amber-200 hover:bg-green-700'}`}
            >
              Settings
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center bg-green-700 px-3 py-1 rounded-full">
              <User size={16} className="mr-2" />
              <span className="text-sm">{user?.name}</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-green-700 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <button 
              onClick={handleLogout}
              className="hidden md:flex bg-white text-green-700 px-4 py-2 rounded-lg items-center hover:bg-green-50 transition-colors"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-green-700 border-t border-green-800">
            <div className="container mx-auto px-4 py-3 space-y-2">
              <button 
                onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                className={`block w-full text-left py-3 px-4 rounded-lg ${activeTab === 'dashboard' ? 'bg-green-800 text-amber-300 font-bold' : 'hover:bg-green-800'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
                className={`block w-full text-left py-3 px-4 rounded-lg ${activeTab === 'reports' ? 'bg-green-800 text-amber-300 font-bold' : 'hover:bg-green-800'}`}
              >
                Reports
              </button>
              <button 
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`block w-full text-left py-3 px-4 rounded-lg ${activeTab === 'settings' ? 'bg-green-800 text-amber-300 font-bold' : 'hover:bg-green-800'}`}
              >
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="block w-full text-left py-3 px-4 rounded-lg hover:bg-green-800 border-t border-green-600 pt-4"
              >
                <LogOut size={16} className="inline mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && renderDashboardContent()}
          {activeTab === 'reports' && renderReportsContent()}
          {activeTab === 'settings' && renderSettingsContent()}
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
              <Link to='/' className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Facebook size={18} />
              </Link>
              <Link to='/' className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Twitter size={18} />
              </Link>
              <Link to='/' className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Instagram size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Quick Links</h3>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('dashboard')} className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Dashboard</button></li>
              <li><button onClick={() => setActiveTab('reports')} className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Reports & History</button></li>
              <li><button onClick={() => setActiveTab('settings')} className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Settings</button></li>
              <li><Link to="/market" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Market Prices</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Resources</h3>
            <ul className="space-y-2">
              <li><Link to='/' className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Farming Guides</Link></li>
              <li><Link to='/' className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> FAQ</Link></li>
              <li><Link to='/' className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Support</Link></li>
              <li><Link to='/' className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Community</Link></li>
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
