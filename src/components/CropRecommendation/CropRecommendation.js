import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";
import {
  // Icons for visualization
  Leaf,
  Thermometer,
  Droplets,
  CloudRain,
  Compass,
  BarChart3,
  Calendar,
  Zap,
  TrendingUp,
  Shield,
  Calculator,
  AlertCircle,
  CheckCircle,
  Info,
  Globe,
  RefreshCw,
  MapPin,
  Droplet,
  WindIcon,
  Sunrise,
  Sunset,
  Target,
  Wifi,
  CloudSun,
  DollarSign,
  Package,
  Clock,
  // Sprout,
  ThermometerIcon,
  Droplet as DropletIcon,
  Layers,
  Sprout as SproutIcon,
  XCircle,
} from "lucide-react";

import ShapGraphicalView from "./ShapGraphicalView";
import CropComparisonCard from "./CropComparisonCard";

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    n: "90",
    p: "42",
    k: "43",
    ph: "6.5",
    temperature: "25",
    humidity: "82",
    rainfall: "202",
    land_size: "1",
    season: "kharif",
    latitude: "",
    longitude: "",
    use_live_weather: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  const [weatherData, setWeatherData] = useState(null);

  const API_BASE = process.env.REACT_APP_API_BASE || "https://agriadvisor-l9g9.onrender.com";

  // Get user location

  const fetchWeatherData = useCallback(
    async (lat, lng) => {
      setFetchingWeather(true);

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE}/api/weather/current?lat=${lat}&lon=${lng}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data?.current?.temperature) {
          setWeatherData(data);

          setFormData((prev) => ({
            ...prev,
            temperature: Math.round(data.current.temperature),
            humidity: data.current.humidity || prev.humidity,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingWeather(false);
      }
    },
    [API_BASE],
  );

  useEffect(() => {
    if (!formData.use_live_weather) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const lat = coords.latitude;
          const lng = coords.longitude;

          setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }));

          fetchWeatherData(lat, lng);
        },
        (error) => console.error(error),
      );
    }
  }, [formData.use_live_weather, fetchWeatherData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = { ...formData };

      const response = await axios.post(
        `${API_BASE}/api/recommend/crop`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setResult(response.data);
      setActiveTab("results");
    } catch (error) {
      console.error("Error:", error);
      alert("Error getting recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced WeatherCard component
  const WeatherCard = ({ weather }) => {
    if (!weather || !weather.current) return null;

    const current = weather.current;

    return (
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <CloudSun className="mr-2" />
              {weather.location || "Current Location"}
            </h3>
            <p className="text-blue-100">Live Weather Data</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{current.temperature}°C</div>
            <p className="text-blue-100">{current.weather || "No data"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <Droplet size={16} className="mr-2" />
              <span>Humidity</span>
            </div>
            <div className="text-xl font-bold mt-1">
              {current.humidity || "N/A"}%
            </div>
          </div>

          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <WindIcon size={16} className="mr-2" />
              <span>Wind</span>
            </div>
            <div className="text-xl font-bold mt-1">
              {current.wind_speed || "N/A"} m/s
            </div>
          </div>

          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <Sunrise size={16} className="mr-2" />
              <span>Sunrise</span>
            </div>
            <div className="text-xl font-bold mt-1">
              {current.sunrise || "N/A"}
            </div>
          </div>

          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <Sunset size={16} className="mr-2" />
              <span>Sunset</span>
            </div>
            <div className="text-xl font-bold mt-1">
              {current.sunset || "N/A"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced SustainabilityRadar component
  const SustainabilityRadar = ({ scores }) => {
    const metrics = [
      {
        key: "ph",
        label: "Soil pH",
        color: "bg-green-500",
        icon: "🧪",
        description: "Soil acidity/alkalinity balance",
      },
      {
        key: "nitrogen",
        label: "Nitrogen",
        color: "bg-blue-500",
        icon: "⚗️",
        description: "Plant growth nutrient",
      },
      {
        key: "rainfall",
        label: "Rainfall",
        color: "bg-cyan-500",
        icon: "🌧️",
        description: "Water availability",
      },
      {
        key: "temperature",
        label: "Temperature",
        color: "bg-orange-500",
        icon: "🌡️",
        description: "Climate suitability",
      },
    ];

    return (
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200 mb-6">
        <h3 className="text-xl font-bold text-teal-800 mb-6 flex items-center">
          <Shield className="mr-2" />
          Farm Sustainability Score
        </h3>

        <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
          <div className="relative">
            <div className="w-48 h-48 rounded-full border-8 border-teal-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-700">
                  {scores.overall}
                </div>
                <div className="text-teal-600">/100</div>
                <div className="text-sm text-teal-700 mt-2">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-4">
              {metrics.map((metric, idx) => {
                const score = scores[metric.key]?.score || 0;
                const status = scores[metric.key]?.status || "Neutral";
                const percentage = (score / 25) * 100;

                return (
                  <div key={idx} className="bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{metric.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-700">
                            {metric.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {metric.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            score >= 20
                              ? "text-green-600"
                              : score >= 10
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {score}/25
                        </div>
                        <div
                          className={`text-sm ${
                            status === "Optimal"
                              ? "text-green-700"
                              : status === "Acceptable"
                                ? "text-amber-700"
                                : "text-red-700"
                          }`}
                        >
                          {status}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${metric.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200">
          <h4 className="font-semibold text-teal-700 mb-3">Recommendations:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scores.ph?.score < 20 && (
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Consider adding lime (to raise pH) or sulfur (to lower pH) to
                  optimize soil acidity.
                </span>
              </div>
            )}
            {scores.nitrogen?.score < 20 && (
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Add organic compost or nitrogen-rich fertilizer to improve
                  soil fertility.
                </span>
              </div>
            )}
            {scores.temperature?.score < 20 && (
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Consider shade nets for heat protection or greenhouse
                  cultivation for temperature control.
                </span>
              </div>
            )}
            {scores.overall >= 80 && (
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  Excellent farming conditions! Your farm is well-suited for
                  sustainable agriculture.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced InteractiveInputPanel with better UI
  const InteractiveInputPanel = () => (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-800 flex items-center">
          <Calculator className="mr-2 text-green-600" />
          Farm Data Input
        </h2>
        <div className="flex items-center space-x-2">
          <Wifi size={20} className="text-green-600" />
          <span className="text-sm text-green-700">AI Powered</span>
        </div>
      </div>

      {/* Live Weather Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Globe className="mr-3 text-blue-600" />
            <div>
              <h3 className="font-bold text-blue-800">
                Live Weather Integration
              </h3>
              <p className="text-sm text-blue-600">
                Get real-time weather data for accurate predictions
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.use_live_weather}
              onChange={(e) =>
                setFormData({ ...formData, use_live_weather: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500"></div>
          </label>
        </div>

        {formData.use_live_weather && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="mr-2 text-blue-500" size={16} />
                  Latitude
                </label>
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  step="0.000001"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 17.385044"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="mr-2 text-blue-500" size={16} />
                  Longitude
                </label>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  step="0.000001"
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 78.486671"
                />
              </div>
            </div>

            <button
              onClick={() =>
                fetchWeatherData(formData.latitude, formData.longitude)
              }
              disabled={
                fetchingWeather || !formData.latitude || !formData.longitude
              }
              className="flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
            >
              {fetchingWeather ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Fetching Weather Data...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2" />
                  Fetch Live Weather
                </>
              )}
            </button>

            {weatherData && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-700">
                  <CloudSun className="mr-2" size={18} />
                  <span className="font-medium">
                    Current: {weatherData?.current?.temperature || "N/A"}°C,{" "}
                    {weatherData?.current?.weather || "No data"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Soil Parameters - Visual Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          {
            id: "n",
            label: "Nitrogen (N)",
            icon: <Zap className="text-amber-500" />,
            min: 0,
            max: 140,
            unit: "ppm",
            optimal: [80, 120],
          },
          {
            id: "p",
            label: "Phosphorus (P)",
            icon: <Leaf className="text-green-500" />,
            min: 5,
            max: 145,
            unit: "ppm",
            optimal: [40, 80],
          },
          {
            id: "k",
            label: "Potassium (K)",
            icon: <Shield className="text-purple-500" />,
            min: 5,
            max: 205,
            unit: "ppm",
            optimal: [40, 80],
          },
          {
            id: "ph",
            label: "Soil pH",
            icon: <BarChart3 className="text-blue-500" />,
            min: 3,
            max: 10,
            unit: "",
            step: 0.1,
            optimal: [6.0, 7.0],
          },
          {
            id: "temperature",
            label: "Temperature",
            icon: <Thermometer className="text-red-500" />,
            min: -20,
            max: 50,
            unit: "°C",
            optimal: [20, 30],
          },
          {
            id: "humidity",
            label: "Humidity",
            icon: <Droplets className="text-cyan-500" />,
            min: 0,
            max: 100,
            unit: "%",
            optimal: [60, 85],
          },
          {
            id: "rainfall",
            label: "Rainfall",
            icon: <CloudRain className="text-blue-400" />,
            min: 0,
            max: 1000,
            unit: "mm",
            optimal: [150, 300],
          },
          {
            id: "land_size",
            label: "Land Size",
            icon: <Compass className="text-amber-700" />,
            min: 0.1,
            max: 100,
            unit: "acres",
            optimal: [1, 10],
          },
        ].map((field) => (
          <div
            key={field.id}
            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {field.icon}
                <span className="ml-2 font-medium text-gray-700">
                  {field.label}
                </span>
              </div>
              <div className="text-lg font-bold text-green-700">
                {formData[field.id]}
                {field.unit}
              </div>
            </div>

            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              value={formData[field.id]}
              onChange={(e) =>
                setFormData({ ...formData, [field.id]: e.target.value })
              }
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${((formData[field.id] - field.min) / (field.max - field.min)) * 100}%, #d1d5db ${((formData[field.id] - field.min) / (field.max - field.min)) * 100}%, #d1d5db 100%)`,
              }}
            />

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>
                {field.min}
                {field.unit}
              </span>
              <span className="font-medium text-green-600">
                Optimal: {field.optimal?.[0]}-{field.optimal?.[1]}
                {field.unit}
              </span>
              <span>
                {field.max}
                {field.unit}
              </span>
            </div>

            {/* Visual indicator for optimal range */}
            <div className="relative h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="absolute h-full bg-green-300 rounded"
                style={{
                  left: `${((field.optimal?.[0] - field.min) / (field.max - field.min)) * 100}%`,
                  width: `${((field.optimal?.[1] - field.optimal?.[0]) / (field.max - field.min)) * 100}%`,
                }}
              ></div>
              {/* Current value marker */}
              <div
                className="absolute w-3 h-4 -mt-1 bg-blue-600 rounded-full"
                style={{
                  left: `${((formData[field.id] - field.min) / (field.max - field.min)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl text-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-75"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            Analyzing with AI...
          </>
        ) : (
          <>
            <Target className="mr-3" />
            Get AI Recommendation with Visual Insights
          </>
        )}
      </button>
    </div>
  );

  // Enhanced Crop Details Display
  const CropDetailsDisplay = ({ crop }) => {
    if (!crop) return null;

    const getCropIcon = (cropName) => {
      const lowerCrop = cropName?.toLowerCase() || "";
      if (lowerCrop.includes("rice")) return "🌾";
      if (lowerCrop.includes("wheat")) return "🌾";
      if (lowerCrop.includes("maize") || lowerCrop.includes("corn"))
        return "🌽";
      if (lowerCrop.includes("cotton")) return "🧵";
      if (lowerCrop.includes("jute")) return "🎋";
      if (lowerCrop.includes("chickpea") || lowerCrop.includes("bean"))
        return "🫘";
      if (lowerCrop.includes("pomegranate")) return "🍅";
      if (lowerCrop.includes("banana")) return "🍌";
      if (lowerCrop.includes("mango")) return "🥭";
      if (lowerCrop.includes("grape")) return "🍇";
      if (lowerCrop.includes("watermelon") || lowerCrop.includes("melon"))
        return "🍈";
      if (lowerCrop.includes("apple")) return "🍎";
      if (lowerCrop.includes("orange")) return "🍊";
      if (lowerCrop.includes("coconut")) return "🥥";
      if (lowerCrop.includes("coffee")) return "☕";
      return "🌱";
    };

    return (
      <div className="bg-white rounded-2xl p-6 border border-green-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="text-5xl mr-4">{getCropIcon(crop.name)}</div>
            <div>
              <h2 className="text-2xl font-bold text-green-800 capitalize">
                {crop.name}
              </h2>
              <p className="text-green-600">
                {crop.description || "Suitable crop for your conditions"}
              </p>
            </div>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold">
            Recommended Crop
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center mb-2">
              <ThermometerIcon className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-700">
                Ideal Temperature
              </h3>
            </div>
            <p className="text-2xl font-bold text-green-800">
              {crop.ideal_temp || "20-30°C"}
            </p>
            <p className="text-green-600 text-sm">Optimal range</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center mb-2">
              <DropletIcon className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-700">Water Requirement</h3>
            </div>
            <p className="text-2xl font-bold text-blue-800">
              {crop.water_needs || "Moderate"}
            </p>
            <p className="text-blue-600 text-sm">Per growing season</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-amber-600 mr-2" />
              <h3 className="font-semibold text-amber-700">Growth Period</h3>
            </div>
            <p className="text-2xl font-bold text-amber-800">
              {crop.growth_period || "90-120 days"}
            </p>
            <p className="text-amber-600 text-sm">From sowing to harvest</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center mb-2">
              <Layers className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-purple-700">Soil pH Range</h3>
            </div>
            <p className="text-2xl font-bold text-purple-800">
              {crop.ideal_ph || "6.0-7.0"}
            </p>
            <p className="text-purple-600 text-sm">Optimal acidity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Season
            </h4>
            <p className="text-gray-800">{crop.season || "Kharif/Rabi"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Market Price
            </h4>
            <p className="text-gray-800">
              {crop.market_price || "₹1500-2500/quintal"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
              <SproutIcon className="h-4 w-4 mr-2" />
              Soil Type
            </h4>
            <p className="text-gray-800">
              {crop.soil_type || "Well-drained loamy soil"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Results Display
  const ResultsDisplay = () => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        {/* Weather Card */}
        {result.weather && <WeatherCard weather={result.weather} />}

        {/* Crop Details */}
        <CropDetailsDisplay crop={result.crop_details} />

        {result.top_crops && result.top_crops.length > 1 && (
          <div className="bg-white rounded-xl p-5 border border-gray-200 mt-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Other suitable crops
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.top_crops.slice(1).map((crop, idx) => (
                <div
                  key={idx}
                  className="bg-green-50 p-3 rounded-lg border border-green-100"
                >
                  <div className="font-medium text-green-800 capitalize">
                    {crop.crop}
                  </div>
                  <div className="text-sm text-green-600">
                    {crop.confidence}% match
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Economic Analysis */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <DollarSign className="mr-3" />
            Economic Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Estimated Yield</h3>
              <p className="text-3xl font-bold">
                {result.yield_analysis?.estimated_yield || "2.0"}
                <span className="text-lg"> tons/acre</span>
              </p>
              <p className="text-green-100 text-sm mt-1">
                Based on {result.input_summary?.land_size || "1"} acre land
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Estimated Profit</h3>
              <p className="text-3xl font-bold">
                {result.yield_analysis?.profit_currency || "₹"}
                {result.yield_analysis?.estimated_profit?.toLocaleString(
                  "en-IN",
                ) || "4,000"}
              </p>
              <p className="text-green-100 text-sm mt-1">
                Market price:{" "}
                {result.crop_details?.market_price || "₹2000/quintal"}
              </p>
            </div>

            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <h3 className="font-semibold mb-2">AI Confidence</h3>
              <p className="text-3xl font-bold">
                {result.confidence_percent || "85"}%
              </p>
              <div className="w-full bg-white/30 rounded-full h-3 mt-2">
                <div
                  className="bg-yellow-400 h-3 rounded-full"
                  style={{ width: `${result.confidence_percent || 85}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-700">
              {result.input_summary?.nutrients?.nitrogen || "90"}
            </div>
            <div className="text-sm text-gray-600">Nitrogen (ppm)</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-700">
              {result.input_summary?.environment?.ph || "6.5"}
            </div>
            <div className="text-sm text-gray-600">Soil pH</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-700">
              {result.input_summary?.environment?.temperature || "25"}°C
            </div>
            <div className="text-sm text-gray-600">Temperature</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-700">
              {result.input_summary?.environment?.rainfall || "202"} mm
            </div>
            <div className="text-sm text-gray-600">Rainfall</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("ai-explain")}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            <div className="flex items-center justify-center">
              <BarChart3 className="mr-2" />
              View AI Explanation
            </div>
          </button>

          <button
            onClick={() => setActiveTab("sustainability")}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all"
          >
            <div className="flex items-center justify-center">
              <Shield className="mr-2" />
              Sustainability Score
            </div>
          </button>
        </div>

        {/* Tips Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
            <Info className="h-5 w-5 text-yellow-600 mr-2" />
            Farming Tips for {result.recommended_crop}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Test soil nutrients every season before planting
                </span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Maintain proper irrigation schedule based on growth stage
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Use organic compost to improve soil health
                </span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Monitor for pests regularly and use integrated pest management
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center my-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            AI Crop Advisor with Visual Insights
          </h1>
          <p className="text-green-600 max-w-3xl mx-auto text-lg">
            Interactive AI system that explains decisions visually for better
            understanding
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-green-200 mb-6">
          {["input", "results", "ai-explain", "sustainability"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab !== "input" && !result}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
                activeTab === tab
                  ? "border-green-500 text-green-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              } ${tab !== "input" && !result ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tab === "input" && "🌱 Farm Input"}
              {tab === "results" && "📊 Results"}
              {tab === "ai-explain" && "🤖 AI Explanation"}
              {tab === "sustainability" && "♻️ Sustainability"}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "input" && <InteractiveInputPanel />}

        {activeTab === "results" && result && <ResultsDisplay />}

        {activeTab === "ai-explain" && result && (
          <div className="space-y-6">
            {/* <div className="bg-gradient-to-r from-green-700 to-emerald-700 text-white rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Sprout className="h-8 w-8 mr-3" />
                Your Farm Analysis
              </h2>
              <p className="text-green-100">
                See why {result.recommended_crop} is recommended for your farm
              </p>
            </div> */}

            {result.shap_visualization && (
              <ShapGraphicalView
                data={result.shap_visualization}
                cropName={result.recommended_crop}
              />
            )}

            {result.input_summary && result.crop_details && (
              <CropComparisonCard
                crop={result.crop_details}
                input={result.input_summary.environment}
                nutrients={result.input_summary.nutrients}
              />
            )}
          </div>
        )}

        {activeTab === "sustainability" && result && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-2">
                Farm Sustainability Analysis
              </h2>
              <p className="text-teal-100">
                Environmental impact assessment of your farm conditions
              </p>
            </div>

            {result.sustainability && (
              <SustainabilityRadar scores={result.sustainability} />
            )}

            {/* Sustainability Explanations */}
            {result.sustainability_explanations && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Detailed Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sustainability_explanations.map((exp, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg ${
                        exp.includes("✅") || exp.includes("🌟")
                          ? "bg-green-50 border border-green-200"
                          : exp.includes("⚠️")
                            ? "bg-yellow-50 border border-yellow-200"
                            : exp.includes("❌")
                              ? "bg-red-50 border border-red-200"
                              : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start">
                        {exp.includes("✅") || exp.includes("🌟") ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        ) : exp.includes("⚠️") ? (
                          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        ) : exp.includes("❌") ? (
                          <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-500 mr-2 mt=0.5 flex-shrink-0" />
                        )}
                        <p className="text-gray-700">
                          {exp.replace(/[✅🌟⚠️❌]/g, "").trim()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;
