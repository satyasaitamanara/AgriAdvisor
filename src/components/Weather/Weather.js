import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, WiHumidity, WiStrongWind, WiDayCloudy } from 'weather-icons-react';
import { 
  Search,
  MapPin,
  ThermometerSun,
  Droplets,
  Wind,
  Calendar,
  CloudRain,
  Sun,
  Cloud,
  Zap,
  Eye
} from 'lucide-react';

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [searchInput, setSearchInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  // Background images for different weather conditions
  const backgroundImages = {
    sunny: '/static/images/warm-sun.jpg',
    rainy: '/static/images/rain.jpg',
    cloudy: '/static/images/cloudy.jpg',
    snowy: '/static/images/cold-snow.jpg',
    stormy: '/static/images/stormy.jpg',
    default: '/static/images/default.jpg'
  };

  // Get weather icon based on conditions
  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      return <WiDaySunny size={80} color="#FFD700" className="drop-shadow-lg" />;
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
      return <WiRain size={80} color="#3B82F6" className="drop-shadow-lg" />;
    } else if (conditionLower.includes('cloud')) {
      return <WiCloudy size={80} color="#94A3B8" className="drop-shadow-lg" />;
    } else if (conditionLower.includes('snow') || conditionLower.includes('flurr')) {
      return <WiSnow size={80} color="#E2E8F0" className="drop-shadow-lg" />;
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
      return <WiThunderstorm size={80} color="#7C3AED" className="drop-shadow-lg" />;
    } else if (conditionLower.includes('partly')) {
      return <WiDayCloudy size={80} color="#94A3B8" className="drop-shadow-lg" />;
    } else {
      return <WiDaySunny size={80} color="#FFD700" className="drop-shadow-lg" />;
    }
  };

  // Set background image based on weather conditions
  const setWeatherBackground = (condition) => {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
      setBackgroundImage(backgroundImages.sunny);
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      setBackgroundImage(backgroundImages.rainy);
    } else if (conditionLower.includes('cloud')) {
      setBackgroundImage(backgroundImages.cloudy);
    } else if (conditionLower.includes('snow') || conditionLower.includes('flurr')) {
      setBackgroundImage(backgroundImages.snowy);
    } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
      setBackgroundImage(backgroundImages.stormy);
    } else {
      setBackgroundImage(backgroundImages.default);
    }
  };

  // Convert temperature based on selected unit
  const convertTemperature = (temp) => {
    if (temperatureUnit === 'fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  // Fetch user info from profile
  const fetchUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view weather data');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUserInfo(response.data);
      
      if (response.data.district) {
        fetchWeatherByDistrict(response.data.district);
      } else {
        setError('District information not available. Please update your profile.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError('Failed to fetch user information');
      setLoading(false);
    }
  }, [API_BASE]);

  // Fetch weather data by district from your backend
  const fetchWeatherByDistrict = async (district) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/weather?district=${encodeURIComponent(district)}`);
      
      if (response.data && response.data.temperature) {
        setWeather(response.data);
        setWeatherBackground(response.data.conditions);
        setError(null);
      } else {
        throw new Error('Invalid weather data received');
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data from API');
      
      // Set demo data for development with district-specific variations
      const demoData = generateDemoWeatherData(district);
      setWeather(demoData);
      setWeatherBackground(demoData.conditions);
    } finally {
      setLoading(false);
    }
  };

  // Handle search for weather
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeatherByDistrict(searchInput);
      setShowSearch(false);
    }
  };

  // Generate demo weather data based on district (fallback)
  const generateDemoWeatherData = (district) => {
    const simpleHash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };
    
    const hash = simpleHash(district);
    const baseTemp = 25 + (hash % 10);
    const humidity = 50 + (hash % 30);
    
    const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Thunderstorms"];
    const condition = conditions[hash % conditions.length];
    
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      const dayTemp = baseTemp + (Math.random() * 4 - 2);
      const dayCondition = conditions[(hash + i) % conditions.length];
      const rain = dayCondition.includes('Rain') ? Math.floor(Math.random() * 50 + 30) : Math.floor(Math.random() * 20);
      const wind = Math.floor(Math.random() * 15 + 5);
      
      forecast.push({
        day: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `Day ${i+1}`,
        temp: dayTemp,
        condition: dayCondition,
        rain: rain,
        wind: wind
      });
    }
    
    let irrigation_advice = "Moderate irrigation recommended";
    if (condition.includes('Rain') || humidity > 70) {
      irrigation_advice = "Reduce irrigation, sufficient moisture available";
    } else if (condition.includes('Sunny') && baseTemp > 30) {
      irrigation_advice = "Increase irrigation due to high temperature";
    }
    
    return {
      temperature: baseTemp,
      humidity: humidity,
      conditions: condition,
      district: district,
      forecast: forecast,
      irrigation_advice: irrigation_advice
    };
  };

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${backgroundImages.default})` }}
      >
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <WiDaySunny size={32} color="#3B82F6" />
              <h1 className="ml-2 text-xl font-bold text-green-700">AgriWeather</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 font-semibold">
                  {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-green-800 text-lg">Loading weather data for your farm...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed transition-all duration-1000"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <WiDaySunny size={32} color="#3B82F6" />
              <h1 className="ml-2 text-xl font-bold text-green-700">AgriWeather</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-full hover:bg-green-50 transition-colors"
              >
                <Search className="h-5 w-5 text-green-600" />
              </button>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium text-sm">
                  {userInfo?.district || 'Set Location'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Search Bar */}
          {showSearch && (
            <div className="mt-4">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for your district..."
                  className="flex-grow px-4 py-2 border border-green-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow p-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Weather Overview Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-green-800 mb-2">Farm Weather Forecast</h1>
                <div className="flex items-center text-green-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{userInfo?.district} {userInfo?.village && `, ${userInfo.village}`}</span>
                </div>
              </div>
              
              {/* Temperature Unit Toggle */}
              <div className="flex items-center bg-green-50 rounded-full p-1 mt-4 lg:mt-0">
                <button
                  onClick={() => setTemperatureUnit('celsius')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    temperatureUnit === 'celsius' 
                      ? 'bg-green-600 text-white' 
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTemperatureUnit('fahrenheit')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    temperatureUnit === 'fahrenheit' 
                      ? 'bg-green-600 text-white' 
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>

            {/* Current Weather Highlight */}
            {weather && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Main Weather Card */}
                <div className="lg:col-span-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="mr-6">
                        {getWeatherIcon(weather.conditions)}
                      </div>
                      <div>
                        <p className="text-6xl font-bold">{convertTemperature(weather.temperature)}°</p>
                        <p className="text-xl font-semibold">{weather.conditions}</p>
                        <p className="text-green-100 mt-1">Feels like {convertTemperature(weather.temperature + 2)}°</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Droplets className="mr-2 text-blue-200" size={24} />
                        <div>
                          <p className="text-sm">Humidity</p>
                          <p className="font-semibold text-lg">{weather.humidity}%</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Wind className="mr-2 text-blue-200" size={24} />
                        <div>
                          <p className="text-sm">Wind</p>
                          <p className="font-semibold text-lg">
                            {(weather.forecast && weather.forecast[0]?.wind) || 10} km/h
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Farming Advice Card */}
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                    <Eye className="mr-2 text-amber-600" size={20} />
                    Farming Advisory
                  </h3>
                  <p className="text-amber-700 mb-4">{weather.irrigation_advice}</p>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <p className="text-sm text-amber-800">
      {weather.conditions.includes('Rain') 
        ? "Perfect time for natural irrigation. Reduce artificial watering."
        : weather.conditions.includes('Sunny')
        ? "Ideal conditions for harvesting and drying crops."
        : "Good day for general farm maintenance activities."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex border-b border-green-200 mb-6">
              <button
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === 'current' 
                    ? 'border-green-500 text-green-700' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('current')}
              >
                Current Details
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === 'forecast' 
                    ? 'border-green-500 text-green-700' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('forecast')}
              >
                5-Day Forecast
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === 'farming' 
                    ? 'border-green-500 text-green-700' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('farming')}
              >
                Farming Tips
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'current' && weather && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <ThermometerSun className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="text-sm text-blue-600">Temperature</p>
                  <p className="text-2xl font-bold text-blue-800">{convertTemperature(weather.temperature)}°</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <Droplets className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-green-600">Humidity</p>
                  <p className="text-2xl font-bold text-green-800">{weather.humidity}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <Wind className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="text-sm text-purple-600">Wind Speed</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {(weather.forecast && weather.forecast[0]?.wind) || 10} km/h
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <CloudRain className="h-8 w-8 text-amber-600 mb-2" />
                  <p className="text-sm text-amber-600">Rain Chance</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {weather.forecast && weather.forecast[0]?.rain}%
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'forecast' && weather && weather.forecast && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {weather.forecast.map((day, index) => (
                    <div
                      key={index}
                      className={`bg-white border rounded-2xl p-4 text-center transition-all cursor-pointer ${
                        selectedDay === index
                          ? 'border-green-500 shadow-lg scale-105'
                          : 'border-gray-200 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedDay(index)}
                    >
                      <p className="font-semibold text-green-700 mb-2">{day.day}</p>
                      <div className="my-3">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <p className="text-2xl font-bold text-gray-800 my-1">
                        {convertTemperature(day.temp)}°
                      </p>
                      <p className="text-gray-600 text-sm mb-2">{day.condition}</p>
                      <div className="flex justify-center space-x-3 text-xs">
                        <span className="text-blue-500">💧 {day.rain}%</span>
                        <span className="text-gray-500">🌬️ {day.wind} km/h</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'farming' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                    <Sun className="mr-2 text-green-600" size={20} />
                    Crop Suggestions
                  </h3>
                  <ul className="text-green-700 space-y-2">
                    <li className="flex items-center">✅ Ideal for planting leafy vegetables</li>
                    <li className="flex items-center">✅ Good conditions for rice cultivation</li>
                    <li className="flex items-center">✅ Consider drought-resistant crops</li>
                    <li className="flex items-center">✅ Perfect for orchard maintenance</li>
                  </ul>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                    <Zap className="mr-2 text-amber-600" size={20} />
                    Precautions & Tips
                  </h3>
                  <ul className="text-amber-700 space-y-2">
                    <li className="flex items-center">⚠️ Monitor soil moisture levels</li>
                    <li className="flex items-center">⚠️ Protect crops from potential storms</li>
                    <li className="flex items-center">⚠️ Schedule irrigation during cooler hours</li>
                    <li className="flex items-center">⚠️ Check for pest activity</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Additional Weather Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Calendar className="mr-2 text-green-600" size={20} />
                Weekly Outlook
              </h3>
              <p className="text-gray-700">
                The weather pattern suggests stable conditions for the upcoming week, 
                ideal for planned farming activities. Monitor daily updates for any changes.
              </p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <Cloud className="mr-2 text-green-600" size={20} />
                Seasonal Advice
              </h3>
              <p className="text-gray-700">
                Current conditions are favorable for seasonal crops. Consider planting 
                crops that thrive in this temperature range and rainfall pattern.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-800/90 backdrop-blur-sm text-white py-6 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-green-200">
            © {new Date().getFullYear()} AgriWeather - Your Farming Weather Companion
          </p>
          <p className="text-green-300 text-sm mt-1">
            Real-time weather data for smart farming decisions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Weather;