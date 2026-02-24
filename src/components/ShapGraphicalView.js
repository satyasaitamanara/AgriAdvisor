import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Thermometer,
  Droplets,
  CloudRain,
  Zap,
  Leaf,
  Shield,
  Gauge,
  Sprout,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  BarChart3,
  PieChart,
  Sun
} from 'lucide-react';

const ShapGraphicalView = ({ data, cropName }) => {
  const [selectedView, setSelectedView] = useState('bars');
  const [showHelp, setShowHelp] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  // Process the SHAP data when it changes
  useEffect(() => {
    if (data && data.bars && data.bars.length > 0) {
      // Find the maximum absolute SHAP value for scaling
      const maxShapValue = Math.max(...data.bars.map(bar => Math.abs(bar.shap_value)));
      
      // Process each bar to add percentage and scaling
      const processedBars = data.bars.map(bar => {
        // Calculate impact percentage (0-100) based on relative contribution
        const impactPercent = Math.min(95, (Math.abs(bar.shap_value) / maxShapValue) * 100);
        
        return {
          ...bar,
          impactPercent: Math.round(impactPercent)
        };
      });

      // Sort by absolute impact
      processedBars.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

      setProcessedData({
        ...data,
        bars: processedBars
      });
    }
  }, [data]);

  if (!data || !data.bars || data.bars.length === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 text-center">
        <Sprout className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-amber-800 mb-2">Understanding Your Recommendation</h3>
        <p className="text-amber-700 max-w-md mx-auto">
          Our AI has analyzed your farm conditions and recommends <span className="font-bold">{cropName}</span> as the best crop for your current situation.
        </p>
      </div>
    );
  }

  // Use processed data if available, otherwise use raw data
  const displayData = processedData || data;
  const { bars, positive_count = 0, negative_count = 0 } = displayData;

  // Sort bars by absolute impact
  const sortedBars = [...bars].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  
  // Get top 3 positive and negative factors
  const topPositive = sortedBars.filter(b => b.is_positive).slice(0, 3);
  const topNegative = sortedBars.filter(b => !b.is_positive).slice(0, 3);

  // Calculate confidence score from SHAP values
  const confidenceScore = Math.min(100, Math.round((positive_count / (positive_count + negative_count || 1)) * 100));

  // Icon mapping with agricultural theme
  const getIcon = (iconType, size = 5) => {
    const iconProps = { className: `h-${size} w-${size}` };
    
    switch(iconType) {
      case '⚗️': return <Zap {...iconProps} className={`text-amber-600 h-${size} w-${size}`} />;
      case '🌿': return <Leaf {...iconProps} className={`text-green-600 h-${size} w-${size}`} />;
      case '🛡️': return <Shield {...iconProps} className={`text-purple-600 h-${size} w-${size}`} />;
      case '🌡️': return <Thermometer {...iconProps} className={`text-red-600 h-${size} w-${size}`} />;
      case '💧': return <Droplets {...iconProps} className={`text-blue-600 h-${size} w-${size}`} />;
      case '🌧️': return <CloudRain {...iconProps} className={`text-cyan-600 h-${size} w-${size}`} />;
      default: return <Gauge {...iconProps} className={`text-gray-600 h-${size} w-${size}`} />;
    }
  };

  // Get background color based on value optimality
  const getValueStatus = (feature, value) => {
    if (!value && value !== 0) return { color: 'bg-gray-100', text: 'text-gray-700', label: 'Unknown' };
    
    if (feature === 'ph' || feature === 'Soil pH') {
      if (value >= 6.0 && value <= 7.0) return { color: 'bg-green-100', text: 'text-green-700', label: 'Optimal' };
      if (value >= 5.5 && value <= 7.5) return { color: 'bg-amber-100', text: 'text-amber-700', label: 'Acceptable' };
      return { color: 'bg-red-100', text: 'text-red-700', label: 'Needs Adjustment' };
    }
    if (feature === 'temperature' || feature === 'Temperature') {
      if (value >= 20 && value <= 30) return { color: 'bg-green-100', text: 'text-green-700', label: 'Optimal' };
      if (value >= 15 && value <= 35) return { color: 'bg-amber-100', text: 'text-amber-700', label: 'Acceptable' };
      return { color: 'bg-red-100', text: 'text-red-700', label: 'Needs Adjustment' };
    }
    if (feature === 'Nitrogen' || feature === 'N') {
      if (value >= 80 && value <= 120) return { color: 'bg-green-100', text: 'text-green-700', label: 'Optimal' };
      if (value >= 60 && value <= 140) return { color: 'bg-amber-100', text: 'text-amber-700', label: 'Acceptable' };
      return { color: 'bg-red-100', text: 'text-red-700', label: 'Needs Adjustment' };
    }
    if (feature === 'Phosphorus' || feature === 'P') {
      if (value >= 40 && value <= 80) return { color: 'bg-green-100', text: 'text-green-700', label: 'Optimal' };
      if (value >= 20 && value <= 100) return { color: 'bg-amber-100', text: 'text-amber-700', label: 'Acceptable' };
      return { color: 'bg-red-100', text: 'text-red-700', label: 'Needs Adjustment' };
    }
    if (feature === 'Potassium' || feature === 'K') {
      if (value >= 40 && value <= 80) return { color: 'bg-green-100', text: 'text-green-700', label: 'Optimal' };
      if (value >= 20 && value <= 100) return { color: 'bg-amber-100', text: 'text-amber-700', label: 'Acceptable' };
      return { color: 'bg-red-100', text: 'text-red-700', label: 'Needs Adjustment' };
    }
    if (feature === 'Rainfall') {
      if (value >= 150 && value <= 250) return { color: 'bg-green-100', text: 'text-green-700', label: 'Optimal' };
      if (value >= 100 && value <= 300) return { color: 'bg-amber-100', text: 'text-amber-700', label: 'Acceptable' };
      return { color: 'bg-red-100', text: 'text-red-700', label: 'Needs Adjustment' };
    }
    return { color: 'bg-gray-100', text: 'text-gray-700', label: 'Current Value' };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Farm Theme */}
      <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 opacity-10">
          <Sprout className="h-32 w-32" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-10">
          <Sun className="h-24 w-24" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center">
                <Sprout className="h-8 w-8 mr-3" />
                Why {cropName}?
              </h2>
              <p className="text-green-100 text-lg">Your Farm Analysis Results</p>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
            >
              <HelpCircle className="h-6 w-6" />
            </button>
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="font-medium mb-2">📊 Understanding Your Farm Analysis:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  <span>Green = Supports crop growth</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                  <span>Red = May limit crop growth</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                  <span>Bar length = Impact strength</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <span>Higher bar = Greater influence</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Cards - Using Real Data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-700">{positive_count}</div>
          <div className="text-xs text-green-600 mt-1">Supporting Factors</div>
          <ThumbsUp className="h-4 w-4 text-green-500 mx-auto mt-2" />
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
          <div className="text-2xl font-bold text-red-700">{negative_count}</div>
          <div className="text-xs text-red-600 mt-1">Limiting Factors</div>
          <ThumbsDown className="h-4 w-4 text-red-500 mx-auto mt-2" />
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
          <div className="text-2xl font-bold text-amber-700">{sortedBars.length}</div>
          <div className="text-xs text-amber-600 mt-1">Total Factors</div>
          <BarChart3 className="h-4 w-4 text-amber-500 mx-auto mt-2" />
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-700">{confidenceScore}%</div>
          <div className="text-xs text-blue-600 mt-1">Confidence Score</div>
          <Gauge className="h-4 w-4 text-blue-500 mx-auto mt-2" />
        </div>
      </div>

      {/* View Selector */}
      <div className="flex bg-gray-100 rounded-lg p-1 max-w-xs mx-auto">
        <button
          onClick={() => setSelectedView('bars')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedView === 'bars' ? 'bg-white shadow text-green-700' : 'text-gray-600'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-1" />
          Impact Chart
        </button>
        <button
          onClick={() => setSelectedView('pie')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedView === 'pie' ? 'bg-white shadow text-green-700' : 'text-gray-600'
          }`}
        >
          <PieChart className="h-4 w-4 inline mr-1" />
          Summary
        </button>
      </div>

      {/* Main Visualization Area - Using Real Data */}
      {selectedView === 'bars' ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-3">
            <h3 className="text-white font-semibold flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Factor Impact Analysis
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {sortedBars.slice(0, 7).map((bar, idx) => {
              // Use the impact percent from processed data or calculate it
              const impactPercent = bar.impactPercent || Math.min(95, Math.abs(bar.shap_value) * 40);
              const status = getValueStatus(bar.name || bar.display_name, bar.feature_value);
              
              return (
                <div 
                  key={idx}
                  className="relative"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getIcon(bar.icon, 4)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-gray-800">{bar.name || bar.display_name}</span>
                          <span className={`ml-2 text-sm px-2 py-0.5 rounded-full ${status.color} ${status.text}`}>
                            {bar.feature_value}{bar.unit || ''}
                          </span>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          bar.is_positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {bar.is_positive ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {bar.is_positive ? '+' : '−'}{Math.abs(bar.shap_value).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Bar - Dynamically sized based on actual SHAP value */}
                  <div className="relative h-8 ml-11">
                    <div className="absolute inset-0 bg-gray-100 rounded-lg"></div>
                    <div
                      className={`absolute h-full rounded-lg transition-all duration-500 ${
                        bar.is_positive ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${impactPercent}%`,
                        opacity: hoveredBar === idx ? 0.9 : 0.7
                      }}
                    >
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-bold">
                        {Math.round(Math.abs(bar.shap_value) * 100) / 100}
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Description - Dynamic based on actual value */}
                  <p className="text-sm text-gray-600 mt-1 ml-11">
                    {bar.is_positive 
                      ? `✓ Your ${(bar.name || bar.display_name).toLowerCase()} (${bar.feature_value}${bar.unit || ''}) supports ${cropName} growth`
                      : `⚠️ Your ${(bar.name || bar.display_name).toLowerCase()} (${bar.feature_value}${bar.unit || ''}) may limit ${cropName} growth`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Summary View - Using Real Data */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Factors Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-4 flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2" />
              What's Working Well
            </h3>
            <div className="space-y-3">
              {topPositive.length > 0 ? topPositive.map((factor, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getIcon(factor.icon, 4)}
                      <span className="ml-2 font-medium text-gray-800">{factor.name || factor.display_name}</span>
                    </div>
                    <span className="text-green-600 font-bold">+{Math.abs(factor.shap_value).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current: {factor.feature_value}{factor.unit || ''}</span>
                    <span className="text-green-600">✓ Good Range</span>
                  </div>
                </div>
              )) : (
                <p className="text-gray-600 text-center py-4">No strongly positive factors</p>
              )}
            </div>
          </div>

          {/* Negative Factors Card */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-4 flex items-center">
              <ThumbsDown className="h-5 w-5 mr-2" />
              Areas to Monitor
            </h3>
            <div className="space-y-3">
              {topNegative.length > 0 ? topNegative.map((factor, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getIcon(factor.icon, 4)}
                      <span className="ml-2 font-medium text-gray-800">{factor.name || factor.display_name}</span>
                    </div>
                    <span className="text-red-600 font-bold">-{Math.abs(factor.shap_value).toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current: {factor.feature_value}{factor.unit || ''}</span>
                    <span className="text-amber-600">⚠️ Needs Attention</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Consider adjusting this factor to improve crop yield
                  </p>
                </div>
              )) : (
                <p className="text-gray-600 text-center py-4">No significant limiting factors</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actionable Recommendations - Dynamic based on actual limiting factors */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-4 flex items-center">
          <Sprout className="h-5 w-5 mr-2" />
          Farming Tips for {cropName}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tips based on negative factors - using actual data */}
          {topNegative.slice(0, 2).map((factor, idx) => {
            const factorName = (factor.name || factor.display_name).toLowerCase();
            return (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800 mb-1">
                      {factor.name || factor.display_name}: {factor.feature_value}{factor.unit || ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {factorName.includes('ph') && 'Consider adding lime (to raise pH) or sulfur (to lower pH) to optimize soil acidity.'}
                      {factorName.includes('nitrogen') && 'Add organic compost or nitrogen-rich fertilizer to improve soil fertility.'}
                      {factorName.includes('temperature') && 'Consider using shade nets or greenhouses to manage temperature.'}
                      {factorName.includes('rainfall') && 'Plan irrigation schedule based on rainfall patterns.'}
                      {factorName.includes('phosphorus') && 'Add phosphorus-rich fertilizer like bone meal or rock phosphate.'}
                      {factorName.includes('potassium') && 'Add potash fertilizer or wood ash to increase potassium levels.'}
                      {!['ph', 'nitrogen', 'temperature', 'rainfall', 'phosphorus', 'potassium'].some(term => factorName.includes(term)) && 
                        `Monitor ${factorName} and adjust farming practices accordingly.`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* General tip */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800 mb-1">Best Practices</p>
                <p className="text-sm text-gray-600">
                  {cropName} grows best with regular monitoring and timely interventions.
                  Consider crop rotation to maintain soil health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Legend */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Supports growth</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Limits growth</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Strong influence</span>
          </div>
          <div className="flex items-center">
            <Sprout className="h-4 w-4 text-green-600 mr-2" />
            <span>Optimal for crop</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapGraphicalView;
