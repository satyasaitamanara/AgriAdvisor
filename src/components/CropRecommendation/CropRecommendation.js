import React, { useState } from 'react';
import axios from 'axios';
import {
  Leaf,
  Thermometer,
  Droplets,
  CloudRain,
  Compass,
  BarChart3,
  Calendar,
  Zap,
  Clock,
  TrendingUp,
  Shield,
  Sprout,
  Calculator,
  Save,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CropRecommendation = () => {
  const [formData, setFormData] = useState({
    n: '',
    p: '',
    k: '',
    ph: '',
    temperature: '',
    humidity: '',
    rainfall: '',
    land_size: '',
    season: 'kharif'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');
  const [validationErrors, setValidationErrors] = useState({});
  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const validateForm = () => {
    const errors = {};
    const ranges = {
      n: { min: 0, max: 140 },
      p: { min: 5, max: 145 },
      k: { min: 5, max: 205 },
      ph: { min: 3, max: 10 },
      temperature: { min: 0, max: 50 },
      humidity: { min: 0, max: 100 },
      rainfall: { min: 0, max: 300 },
      land_size: { min: 0.1, max: 100 }
    };

    Object.keys(formData).forEach(key => {
      if (formData[key] === '' && key !== 'land_size') {
        errors[key] = 'This field is required';
      } else if (formData[key] !== '') {
        const value = parseFloat(formData[key]);
        if (ranges[key] && (value < ranges[key].min || value > ranges[key].max)) {
          errors[key] = `Value must be between ${ranges[key].min} and ${ranges[key].max}`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/recommend/crop`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(response.data);
      setActiveTab('results');
    } catch (error) {
      console.error('Error getting recommendation:', error);
      alert('Error getting recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const reportData = {
      date: new Date().toLocaleDateString(),
      input: formData,
      recommendations: result
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `crop_recommendation_${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const seasonInfo = {
    kharif: { name: "Kharif", period: "June - October", crops: "Rice, Cotton, Maize" },
    rabi: { name: "Rabi", period: "November - April", crops: "Wheat, Barley, Mustard" },
    zaid: { name: "Zaid", period: "March - June", crops: "Watermelon, Cucumber, Muskmelon" }
  };

  const inputFields = [
    { id: 'n', label: 'Nitrogen (N) ppm', icon: <Zap className="h-4 w-4 text-amber-500" />, min: 80, max: 140, step: 1, desc: 'Essential for leaf growth' },
    { id: 'p', label: 'Phosphorus (P) ppm', icon: <Leaf className="h-4 w-4 text-green-500" />, min: 40, max: 145, step: 1, desc: 'Promotes root development' },
    { id: 'k', label: 'Potassium (K) ppm', icon: <Shield className="h-4 w-4 text-purple-500" />, min: 30, max: 205, step: 1, desc: 'Improves overall plant health' },
    { id: 'ph', label: 'pH Level', icon: <BarChart3 className="h-4 w-4 text-blue-500" />, min: 3, max: 10, step: 0.1, desc: 'Soil acidity/alkalinity (0-14 scale)' },
    { id: 'temperature', label: 'Temperature (°C)', icon: <Thermometer className="h-4 w-4 text-red-500" />, min: 20, max: 50, step: 0.1, desc: 'Average temperature' },
    { id: 'humidity', label: 'Humidity (%)', icon: <Droplets className="h-4 w-4 text-cyan-500" />, min: 70, max: 100, step: 1, desc: 'Relative humidity percentage' },
    { id: 'rainfall', label: 'Rainfall (mm)', icon: <CloudRain className="h-4 w-4 text-blue-400" />, min: 90, max: 300, step: 1, desc: 'Annual rainfall in millimeters' },
    { id: 'land_size', label: 'Land Size (acres)', icon: <Compass className="h-4 w-4 text-amber-700" />, min: 0.5, max: 100, step: 0.1, desc: 'Size of your farmland', required: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center my-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Crop Recommendation</h1>
          <p className="text-green-600 max-w-2xl mx-auto">
            Enter your soil parameters and environmental conditions to get AI-powered crop recommendations tailored to your farm
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-green-200 mb-6">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-6 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'input'
                ? 'border-green-500 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Input Parameters
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!result}
            className={`px-6 py-3 font-medium text-sm border-b-2 ${
              activeTab === 'results'
                ? 'border-green-500 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            } ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Results
          </button>
        </div>

        {activeTab === 'input' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center">
              <Calculator className="mr-2 text-green-500" />
              Enter Soil & Environmental Parameters
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inputFields.map(field => (
                <div key={field.id} className="relative">
                  <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                    {field.icon}
                    <span className="ml-1">{field.label}</span>
                    {field.required !== false && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="number"
                    name={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      validationErrors[field.id] ? 'border-red-300' : 'border-green-200'
                    }`}
                    placeholder={`e.g., ${field.id === 'ph' ? '6.5' : field.min}`}
                    required={field.required !== false}
                  />
                  {validationErrors[field.id] && (
                    <div className="flex items-center mt-1 text-red-500 text-xs">
                      <AlertCircle size={12} className="mr-1" />
                      {validationErrors[field.id]}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{field.desc}</div>
                </div>
              ))}
              
              {/* Season */}
              <div className="relative">
                <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-teal-500" />
                  Season
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="kharif">Kharif (June - October)</option>
                  <option value="rabi">Rabi (November - April)</option>
                  <option value="zaid">Zaid (March - June)</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Common crops: {seasonInfo[formData.season].crops}
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-md flex items-center justify-center text-lg font-medium disabled:opacity-75"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing Soil Data...
                    </>
                  ) : (
                    <>
                      <Sprout className="mr-2" />
                      Get Crop Recommendations
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'results' && result && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold text-green-700 flex items-center">
                <Leaf className="mr-2 text-green-500" />
                Recommended Crops
              </h2>
              <button
                onClick={downloadReport}
                className="flex items-center bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Download size={16} className="mr-1" />
                Download Report
              </button>
            </div>
            
            {/* Main Recommendation */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <span className="text-2xl">{result.crop_details?.image || '🌾'}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-800 capitalize">{result.recommended_crop}</h3>
                  <p className="text-green-600">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{result.crop_details?.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Season</p>
                  <p className="font-semibold">{result.crop_details?.season}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Water Needs</p>
                  <p className="font-semibold">{result.crop_details?.water_requirements}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Soil Type</p>
                  <p className="font-semibold">{result.crop_details?.soil_type}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Growth Period</p>
                  <p className="font-semibold">{result.crop_details?.growth_period}</p>
                </div>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                  <TrendingUp className="mr-2 text-amber-600" size={18} />
                  Estimated Yield
                </h3>
                <p className="text-2xl font-bold text-amber-800">{result.estimated_yield}</p>
                <p className="text-sm text-amber-600 mt-1">Based on your soil parameters</p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <TrendingUp className="mr-2 text-blue-600" size={18} />
                  Estimated Profit
                </h3>
                <p className="text-2xl font-bold text-blue-800">{result.estimated_profit}</p>
                <p className="text-sm text-blue-600 mt-1">Potential earnings</p>
              </div>
              
              <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                <h3 className="font-medium text-teal-800 mb-2 flex items-center">
                  <Shield className="mr-2 text-teal-600" size={18} />
                  Sustainability Score
                </h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-teal-500 h-2.5 rounded-full" 
                      style={{ width: result.sustainability_score }}
                    ></div>
                  </div>
                  <span className="text-teal-800 font-bold">{result.sustainability_score}</span>
                </div>
                <p className="text-sm text-teal-600 mt-1">Environmental impact rating</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center bg-green-600 text-white py-3 px-5 rounded-lg hover:bg-green-700 transition-colors">
                <Save size={18} className="mr-2" />
                Save Plan
              </button>
              <button className="flex items-center bg-amber-600 text-white py-3 px-5 rounded-lg hover:bg-amber-700 transition-colors">
                <TrendingUp size={18} className="mr-2" />
                View Market Prices
              </button>
              <button className="flex items-center bg-teal-600 text-white py-3 px-5 rounded-lg hover:bg-teal-700 transition-colors">
                <Clock size={18} className="mr-2" />
                Create Planting Schedule
              </button>
            </div>
            
            {/* Additional Advice */}
            <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <CheckCircle className="mr-2 text-blue-600" size={18} />
                Farming Advice
              </h3>
              <p className="text-blue-700">
                Based on your soil parameters, we recommend adding organic matter to improve soil structure. 
                Consider using drip irrigation for water efficiency during the {formData.season} season.
              </p>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Understanding Soil Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <Zap className="mr-2 text-amber-500" size={18} />
                Nitrogen (N)
              </h3>
              <p className="text-sm text-green-600">
                Essential for leaf growth and green color. Plants with insufficient nitrogen may have yellowing leaves.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <Leaf className="mr-2 text-green-500" size={18} />
                Phosphorus (P)
              </h3>
              <p className="text-sm text-green-600">
                Important for root development and flower and fruit production. Helps plants use and store energy.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <Shield className="mr-2 text-purple-500" size={18} />
                Potassium (K)
              </h3>
              <p className="text-sm text-green-600">
                Helps plants resist diseases and contributes to overall plant vigor and hardiness.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <BarChart3 className="mr-2 text-blue-500" size={18} />
                pH Level
              </h3>
              <p className="text-sm text-green-600">
                Affects nutrient availability. Most crops prefer slightly acidic to neutral soil (pH 6.0-7.0).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;