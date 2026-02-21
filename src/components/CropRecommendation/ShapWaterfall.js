import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Thermometer,
  Droplets,
  CloudRain,
  Zap,
  Leaf,
  Shield,
  Gauge
} from 'lucide-react';

const ShapWaterfall = ({ data, cropName }) => {
  const [showAll, setShowAll] = useState(false);

  // If no data, show fallback
  if (!data || !data.bars || data.bars.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-yellow-800">AI Explanation Unavailable</h3>
        <p className="text-yellow-700">
          We couldn't generate the detailed explanation, but the recommendation is still valid.
        </p>
      </div>
    );
  }

  const { bars } = data;

  // Sort bars by impact (highest absolute first)
  const sortedBars = [...bars].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  // Icon mapping
  const getIcon = (iconName) => {
    switch(iconName) {
      case '⚗️': return <Zap className="h-5 w-5 text-amber-600" />;
      case '🌿': return <Leaf className="h-5 w-5 text-green-600" />;
      case '🛡️': return <Shield className="h-5 w-5 text-purple-600" />;
      case '🌡️': return <Thermometer className="h-5 w-5 text-red-600" />;
      case '💧': return <Droplets className="h-5 w-5 text-blue-600" />;
      case '🌧️': return <CloudRain className="h-5 w-5 text-cyan-600" />;
      default: return <Gauge className="h-5 w-5 text-gray-600" />;
    }
  };

  const visibleBars = showAll ? sortedBars : sortedBars.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-2">Why we recommend {cropName}</h2>
        <p className="text-green-100">Here's how each factor influenced our decision</p>
      </div>

      {/* Main impact list */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Gauge className="h-6 w-6 text-green-600 mr-2" />
          Key Factors
        </h3>

        <div className="space-y-4">
          {visibleBars.map((factor, idx) => {
            const impact = factor.shap_value;
            const isPositive = impact > 0;
            const impactPercent = Math.round(Math.abs(impact) * 100);
            
            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(factor.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">
                      {factor.name} <span className="text-sm text-gray-500">({factor.feature_value}{factor.unit})</span>
                    </span>
                    <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : '–'}{Math.abs(impact).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(impactPercent, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {isPositive
                      ? `✓ This level helps ${cropName} grow better.`
                      : `⚠️ This level may limit ${cropName} productivity.`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {sortedBars.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 text-green-600 hover:text-green-800 font-medium text-sm flex items-center"
          >
            {showAll ? 'Show less' : `Show all ${sortedBars.length} factors`}
          </button>
        )}
      </div>

      {/* Simple explanation sentences
      {explanations && explanations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <Info className="h-5 w-5 text-green-600 mr-2" />
            In simple words
          </h3>
          <ul className="space-y-2">
            {explanations.slice(0, 3).map((exp, idx) => {
              // Remove HTML tags and keep plain text
              const clean = exp.replace(/<[^>]*>/g, '');
              return (
                <li key={idx} className="flex items-start text-gray-700">
                  <span className="text-green-600 mr-2">•</span>
                  {clean}
                </li>
              );
            })}
          </ul>
        </div>
      )} */}

      {/* Quick summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
          <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">{data.positive_count || 0}</div>
          <div className="text-sm text-green-600">Supporting factors</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
          <ThumbsDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-700">{data.negative_count || 0}</div>
          <div className="text-sm text-red-600">Limiting factors</div>
        </div>
      </div>
    </div>
  );
};

export default ShapWaterfall;
