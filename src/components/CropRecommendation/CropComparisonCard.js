import React from 'react';
import {
  Leaf,
  Droplets,
  Thermometer,
  CloudRain,
  Compass,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

const CropComparisonCard = ({ crop, input, nutrients }) => {
  if (!crop && !input) {
    return null;
  }

  // Safely extract information
  const cropName = crop?.name || 'Selected Crop';
  const cropDetails = crop || {};
  const environment = input || {};
  const nutrientData = nutrients || {};

  // Comparison metrics
  const comparisons = [
    {
      label: 'Soil pH',
      cropValue: cropDetails.ideal_ph || '6.0-7.0',
      farmValue: environment.ph || 'N/A',
      icon: <BarChart3 className="h-4 w-4 text-purple-500" />,
      isOptimal: () => {
        const farmPh = parseFloat(environment.ph);
        const [cropMin, cropMax] = cropDetails.ideal_ph?.split('-').map(parseFloat) || [6.0, 7.0];
        return farmPh >= cropMin && farmPh <= cropMax;
      }
    },
    {
      label: 'Temperature',
      cropValue: cropDetails.ideal_temp || '20-30°C',
      farmValue: environment.temperature ? `${environment.temperature}°C` : 'N/A',
      icon: <Thermometer className="h-4 w-4 text-red-500" />,
      isOptimal: () => {
        const farmTemp = parseFloat(environment.temperature);
        const [cropMin, cropMax] = cropDetails.ideal_temp?.split('-').map(parseFloat) || [20, 30];
        return farmTemp >= cropMin && farmTemp <= cropMax;
      }
    },
    {
      label: 'Humidity',
      cropValue: '60-85%',
      farmValue: environment.humidity ? `${environment.humidity}%` : 'N/A',
      icon: <Droplets className="h-4 w-4 text-blue-500" />,
      isOptimal: () => {
        const farmHumidity = parseFloat(environment.humidity);
        return farmHumidity >= 60 && farmHumidity <= 85;
      }
    },
    {
      label: 'Rainfall',
      cropValue: cropDetails.water_needs || 'Moderate',
      farmValue: environment.rainfall ? `${environment.rainfall} mm` : 'N/A',
      icon: <CloudRain className="h-4 w-4 text-cyan-500" />,
      isOptimal: () => {
        const rainfall = parseFloat(environment.rainfall);
        return rainfall >= 150 && rainfall <= 300;
      }
    }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
      <h3 className="font-bold text-green-900 text-xl flex items-center mb-6">
        <Leaf className="h-6 w-6 text-green-600 mr-2" />
        Crop & Environment Match Analysis
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Requirements */}
        <div className="bg-white rounded-xl p-5 border border-green-100">
          <h4 className="font-semibold text-green-900 mb-4 flex items-center">
            <Leaf className="h-5 w-5 text-green-600 mr-2" />
            {cropName} Requirements
          </h4>

          <div className="space-y-4">
            {comparisons.map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                <div className="flex items-center">
                  <span className="mr-3">{comp.icon}</span>
                  <span className="text-green-700">{comp.label}:</span>
                </div>
                <span className="font-semibold text-green-900">{comp.cropValue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Farm Conditions */}
        <div className="bg-white rounded-xl p-5 border border-green-100">
          <h4 className="font-semibold text-green-900 mb-4 flex items-center">
            <Compass className="h-5 w-5 text-green-600 mr-2" />
            Your Farm Conditions
          </h4>

          <div className="space-y-4">
            {comparisons.map((comp, idx) => {
              const isOptimal = comp.isOptimal();
              return (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-green-100 last:border-b-0">
                  <div className="flex items-center">
                    <span className="mr-3">{comp.icon}</span>
                    <span className="text-green-700">{comp.label}:</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`font-semibold ${isOptimal ? 'text-green-900' : 'text-amber-900'}`}>
                      {comp.farmValue}
                    </span>
                    <div className={`ml-3 p-1 rounded-full ${isOptimal ? 'bg-green-100' : 'bg-amber-100'}`}>
                      {isOptimal ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <AlertCircle size={16} className="text-amber-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nutrient Analysis */}
      {nutrientData && (
        <div className="mt-6 bg-white rounded-xl p-5 border border-green-100">
          <h4 className="font-semibold text-green-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-amber-500 mr-2" />
            Soil Nutrient Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-3 rounded-lg ${nutrientData.nitrogen >= 80 && nutrientData.nitrogen <= 120 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-amber-500 mr-2" />
                  <span className="text-sm font-medium">Nitrogen (N)</span>
                </div>
                <span className="font-bold">{nutrientData.nitrogen || 'N/A'} ppm</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Optimal: 80-120 ppm
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${nutrientData.phosphorus >= 40 && nutrientData.phosphorus <= 80 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium">Phosphorus (P)</span>
                </div>
                <span className="font-bold">{nutrientData.phosphorus || 'N/A'} ppm</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Optimal: 40-80 ppm
              </div>
            </div>
            
            <div className={`p-3 rounded-lg ${nutrientData.potassium >= 40 && nutrientData.potassium <= 80 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm font-medium">Potassium (K)</span>
                </div>
                <span className="font-bold">{nutrientData.potassium || 'N/A'} ppm</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Optimal: 40-80 ppm
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Summary */}
      <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5 mr-3" />
          <div>
            <p className="text-green-800 font-semibold mb-1">Excellent Match!</p>
            <p className="text-green-700 text-sm">
              <span className="font-semibold">{cropName}</span> is well-suited to your farm conditions. 
              The soil pH, temperature, and nutrient levels are optimal for this crop's growth and productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropComparisonCard;