import React, { useState } from 'react';
import {
  FlaskConical,   // ✅ replaced Flask
  Droplets,
  Zap,
  Leaf,
  Shield,
  BarChart3,
  Download,
  Volume2,
  Calendar,
  Sprout,
  TestTube,
  Clock,
  CheckCircle,
  AlertCircle,
  Sun,
  Calculator,
  Salad,          // ✅ replaced LeafyGreen
  CloudRain,
  Thermometer,
  Compass
} from 'lucide-react';


const SoilAdvisory = () => {
  const [formData, setFormData] = useState({
    ph: '',
    n: '',
    p: '',
    k: '',
    crop: '',
    soil_type: 'loamy',
    region: '',
    season: 'kharif'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate recommendations based on input values
      const recommendations = generateRecommendations(formData);
      setResult(recommendations);
      setLoading(false);
      setActiveTab('results');
    }, 1500);
  };

  const generateRecommendations = (data) => {
    const ph = parseFloat(data.ph);
    const n = parseFloat(data.n);
    const p = parseFloat(data.p);
    const k = parseFloat(data.k);
    
    // pH-based recommendations
    let phCorrection = '';
    if (ph < 5.5) {
      phCorrection = 'Apply agricultural lime at 2-4 tons per acre to raise pH. Consider dolomitic lime if magnesium is also low.';
    } else if (ph > 7.5) {
      phCorrection = 'Apply elemental sulfur at 500-1000 kg per acre to lower pH. Organic matter like compost can also help.';
    } else {
      phCorrection = 'Soil pH is in optimal range. Maintain with regular organic matter additions.';
    }
    
    // Nutrient-based recommendations
    let fertilizer = '';
    let dosage = '';
    
    if (n < 50) {
      fertilizer += 'Urea, ';
      dosage += '100-150 kg/acre of urea, ';
    } else if (n < 100) {
      fertilizer += 'Urea, ';
      dosage += '50-100 kg/acre of urea, ';
    }
    
    if (p < 20) {
      fertilizer += 'DAP, ';
      dosage += '100-150 kg/acre of DAP, ';
    } else if (p < 40) {
      fertilizer += 'DAP, ';
      dosage += '50-100 kg/acre of DAP, ';
    }
    
    if (k < 150) {
      fertilizer += 'MOP, ';
      dosage += '50-100 kg/acre of MOP, ';
    } else if (k < 200) {
      fertilizer += 'MOP, ';
      dosage += '25-50 kg/acre of MOP, ';
    }
    
    // Remove trailing commas
    fertilizer = fertilizer.replace(/,\s*$/, "");
    dosage = dosage.replace(/,\s*$/, "");
    
    if (!fertilizer) {
      fertilizer = 'Balanced NPK (10:10:10)';
      dosage = '50 kg/acre for maintenance';
    }
    
    // Organic options based on deficiencies
    let organicOptions = '';
    if (n < 50 || p < 20 || k < 150) {
      organicOptions = 'Apply well-decomposed farmyard manure (10-15 tons/acre) or vermicompost (2-3 tons/acre). ';
      
      if (n < 50) organicOptions += 'Green manure crops like sunn hemp or dhaincha can fix nitrogen. ';
      if (p < 20) organicOptions += 'Rock phosphate or bone meal can supplement phosphorus. ';
      if (k < 150) organicOptions += 'Wood ash or potassium sulfate from natural sources can help.';
    } else {
      organicOptions = 'Maintain soil health with regular additions of compost (2-3 tons/acre) and cover cropping.';
    }
    
    // Additional advice based on soil type
    let soilAdvice = '';
    switch(data.soil_type) {
      case 'sandy':
        soilAdvice = 'Sandy soils require more frequent fertilizer applications in smaller quantities. Use organic matter to improve water retention.';
        break;
      case 'clayey':
        soilAdvice = 'Clay soils benefit from split applications of fertilizers. Ensure proper drainage and use gypsum if needed.';
        break;
      case 'loamy':
        soilAdvice = 'Loamy soils have good nutrient retention. Maintain organic matter content for sustained productivity.';
        break;
      default:
        soilAdvice = 'Maintain soil organic matter through regular additions of compost or green manure.';
    }
    
    // Crop-specific advice if provided
    let cropAdvice = '';
    if (data.crop) {
      cropAdvice = `For ${data.crop}, consider split application of nutrients - 50% basal, 25% during vegetative stage, and 25% during reproductive stage.`;
    }
    
    return {
      fertilizer,
      dosage,
      ph_correction: phCorrection,
      organic_options: organicOptions,
      soil_advice: soilAdvice,
      crop_advice: cropAdvice,
      schedule: [
        { stage: 'Pre-planting', action: 'Apply basal dose of fertilizers and organic manure' },
        { stage: '20-25 days after sowing', action: 'First top dressing with nitrogen-rich fertilizers' },
        { stage: '45-50 days after sowing', action: 'Second top dressing if required' },
        { stage: 'Post-harvest', action: 'Soil testing and green manuring' }
      ]
    };
  };

  const downloadPDF = () => {
    // In a real app, this would generate a PDF report
    alert('PDF report download would start here. This is a mock implementation.');
  };

  const speakAdvice = () => {
    // In a real app, this would use text-to-speech API
    alert('Audio advice would play here. This is a mock implementation.');
  };

  const soilTypes = [
    { value: 'sandy', label: 'Sandy' },
    { value: 'clayey', label: 'Clayey' },
    { value: 'loamy', label: 'Loamy' },
    { value: 'silt', label: 'Silt' },
    { value: 'peaty', label: 'Peaty' },
    { value: 'chalky', label: 'Chalky' }
  ];

  const seasons = [
    { value: 'kharif', label: 'Kharif (June - October)' },
    { value: 'rabi', label: 'Rabi (November - April)' },
    { value: 'zaid', label: 'Zaid (March - June)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center my-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Soil & Fertilizer Advisory</h1>
          <p className="text-green-600 max-w-2xl mx-auto">
            Get personalized soil management advice and fertilizer recommendations based on your soil test results
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
            Soil Test Input
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
            Recommendations
          </button>
        </div>

        {activeTab === 'input' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-6 flex items-center">
              <TestTube className="mr-2 text-green-500" />
              Enter Soil Test Results
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* pH Level */}
              <div className="relative">
                <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                  <BarChart3 className="mr-1 h-4 w-4 text-blue-500" />
                  pH Level
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  min="3"
                  max="10"
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 6.5"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Soil acidity/alkalinity (0-14 scale)</div>
              </div>
              
              {/* Nitrogen */}
              <div className="relative">
                <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                  <Zap className="mr-1 h-4 w-4 text-amber-500" />
                  Nitrogen (N) ppm
                </label>
                <input
                  type="number"
                  name="n"
                  value={formData.n}
                  onChange={handleChange}
                  min="0"
                  max="140"
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 80"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Essential for leaf growth</div>
              </div>
              
              {/* Phosphorus */}
              <div className="relative">
                <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                  <Leaf className="mr-1 h-4 w-4 text-green-500" />
                  Phosphorus (P) ppm
                </label>
                <input
                  type="number"
                  name="p"
                  value={formData.p}
                  onChange={handleChange}
                  min="5"
                  max="145"
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 40"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Promotes root development</div>
              </div>
              
              {/* Potassium */}
              <div className="relative">
                <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                  <Shield className="mr-1 h-4 w-4 text-purple-500" />
                  Potassium (K) ppm
                </label>
                <input
                  type="number"
                  name="k"
                  value={formData.k}
                  onChange={handleChange}
                  min="5"
                  max="205"
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 30"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">Improves overall plant health</div>
              </div>
              
              {/* Soil Type */}
              <div className="relative">
                <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                  <Sprout className="mr-1 h-4 w-4 text-green-600" />
                  Soil Type
                </label>
                <select
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {soilTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">Primary soil composition</div>
              </div>
              
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
                  {seasons.map(season => (
                    <option key={season.value} value={season.value}>{season.label}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">Current growing season</div>
              </div>
              
              {/* Crop */}
              <div className="relative md:col-span-2">
                <label className="block text-sm font-medium text-green-700 mb-2 flex items-center">
                  <Sun className="mr-1 h-4 w-4 text-amber-500" />
                  Crop (Optional)
                </label>
                <input
                  type="text"
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Wheat, Rice, Cotton"
                />
                <div className="text-xs text-gray-500 mt-1">For crop-specific recommendations</div>
              </div>
              
              <div className="md:col-span-2 pt-4">
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
                      <FlaskConical className="mr-2" />
                      Get Soil Recommendations
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
                <FlaskConical className="mr-2 text-green-500" />
                Soil Management Recommendations
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={speakAdvice}
                  className="flex items-center bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Volume2 size={16} className="mr-1" />
                  Listen
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center bg-green-100 text-green-700 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Download size={16} className="mr-1" />
                  Download PDF
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Fertilizer Recommendation */}
              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <Zap className="mr-2 text-green-600" size={18} />
                  Fertilizer Recommendation
                </h3>
                <div className="mb-4">
                  <p className="text-lg font-bold text-green-700">{result.fertilizer}</p>
                  <p className="text-green-600">{result.dosage}</p>
                </div>
                {result.crop_advice && (
                  <div className="bg-green-100 p-3 rounded-lg">
                    <p className="text-sm text-green-700">{result.crop_advice}</p>
                  </div>
                )}
              </div>
              
              {/* pH Correction */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <BarChart3 className="mr-2 text-blue-600" size={18} />
                  pH Management
                </h3>
                <p className="text-blue-700">{result.ph_correction}</p>
              </div>
              
              {/* Organic Options */}
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <Leaf className="mr-2 text-amber-600" size={18} />
                  Organic Options
                </h3>
                <p className="text-amber-700">{result.organic_options}</p>
              </div>
              
              {/* Soil Advice */}
              <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                <h3 className="font-semibold text-teal-800 mb-3 flex items-center">
                  <Sprout className="mr-2 text-teal-600" size={18} />
                  Soil Management
                </h3>
                <p className="text-teal-700">{result.soil_advice}</p>
              </div>
            </div>
            
            {/* Application Schedule */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="mr-2 text-gray-600" size={18} />
                Recommended Application Schedule
              </h3>
              <div className="space-y-3">
                {result.schedule.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.stage}</p>
                      <p className="text-sm text-gray-600">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Important Notes */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                <AlertCircle className="mr-2 text-yellow-600" size={18} />
                Important Notes
              </h3>
              <ul className="text-yellow-700 text-sm list-disc pl-5 space-y-1">
                <li>Always conduct a soil test before applying fertilizers</li>
                <li>Consider local conditions and weather forecasts before application</li>
                <li>Split applications are more efficient than single large doses</li>
                <li>Irrigate after fertilizer application for better nutrient uptake</li>
              </ul>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-green-700 mb-4">Understanding Soil Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <BarChart3 className="mr-2 text-blue-500" size={18} />
                Optimal pH Range
              </h3>
              <p className="text-sm text-green-600">
                Most crops thrive in slightly acidic to neutral soil (pH 6.0-7.0). Outside this range, nutrient availability decreases.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <Zap className="mr-2 text-amber-500" size={18} />
                Nitrogen Deficiency
              </h3>
              <p className="text-sm text-green-600">
                Signs include yellowing of older leaves and stunted growth. Fix with organic matter or nitrogen fertilizers.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <Leaf className="mr-2 text-green-500" size={18} />
                Phosphorus Deficiency
              </h3>
              <p className="text-sm text-green-600">
                Purple or reddish discoloration of leaves. Improves with rock phosphate or bone meal applications.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-700 mb-2 flex items-center">
                <Shield className="mr-2 text-purple-500" size={18} />
                Potassium Deficiency
              </h3>
              <p className="text-sm text-green-600">
                Browning of leaf margins and reduced disease resistance. Wood ash or potassium sulfate can help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoilAdvisory;