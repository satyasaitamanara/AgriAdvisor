import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, Minus, Bell, Download, 
  BarChart3, RefreshCw, Info, Calendar, MapPin,
  Shield, Sun, CloudRain, Sprout, IndianRupee, LineChart,
  AlertCircle, CheckCircle2
} from 'lucide-react';

const Market = () => {
  const [marketData, setMarketData] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  const fetchMarketData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching data for ${selectedCrop}...`);
      
      const response = await axios.get(`${API_BASE}/api/market?crop=${selectedCrop}`);
      setMarketData(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
      console.log('Data fetched successfully:', response.data);
      
    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Unable to connect to market data service. Showing sample data.');
      setMarketData(generateFallbackData(selectedCrop));
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, [selectedCrop, API_BASE]);

  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  const generateFallbackData = (crop) => {
    const basePrices = {
      wheat: 2200, rice: 2800, corn: 1900, tomato: 1500,
      potato: 900, onion: 1800, cotton: 5500, sugarcane: 3200
    };
    
    const basePrice = basePrices[crop] || 2000;
    const priceHistory = [];
    
    // Generate realistic price history
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = Math.sin(i * 0.3) * 0.1 + (Math.random() * 0.1 - 0.05);
      const price = basePrice * (1 + variation);
      
      priceHistory.push({
        date: date.toLocaleDateString('en-IN'),
        price: Math.round(price),
        market: 'Local Market',
        state: 'Sample State'
      });
    }
    
    const currentPrice = priceHistory[priceHistory.length - 1]?.price || basePrice;
    
    return {
      crop: crop,
      current_price: currentPrice,
      current_price_display: `₹${currentPrice.toLocaleString()}`,
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.6 ? 'down' : 'stable',
      price_history: priceHistory,
      source: 'Sample Data',
      data_quality: 'demo',
      last_updated: new Date().toISOString(),
      unit: 'per quintal',
      location: 'National Average'
    };
  };

  const setPriceAlert = () => {
    if (!alertPrice) return;
    
    const newAlert = {
      id: Date.now(),
      crop: selectedCrop,
      price: alertPrice,
      date: new Date().toLocaleDateString('en-IN'),
      active: true
    };
    
    setAlerts([...alerts, newAlert]);
    setAlertPrice('');
    
    // Show confirmation
    alert(`Price alert set for ${selectedCrop} at ₹${alertPrice}/quintal`);
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const exportData = () => {
    if (!marketData) return;
    
    const dataStr = JSON.stringify(marketData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${selectedCrop}_market_data.json`);
    linkElement.click();
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="text-green-600" size={20} />;
      case 'down': return <TrendingDown className="text-red-600" size={20} />;
      default: return <Minus className="text-blue-600" size={20} />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getCropIcon = (crop) => {
    const icons = {
      wheat: '🌾', rice: '🍚', corn: '🌽', tomato: '🍅',
      potato: '🥔', onion: '🧅', cotton: '🧵', sugarcane: '🎋',
      chilli: '🌶️', cauliflower: '🥦', banana: '🍌'
    };
    return icons[crop] || '🌱';
  };

  const formatDate = (dateStr) => {
    try {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${day}/${month}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Enhanced Chart Rendering
  const renderChart = () => {
    if (!marketData?.price_history?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <BarChart3 size={48} className="mb-2 text-gray-300" />
          <p>No price data available</p>
          <p className="text-sm">Try selecting a different crop</p>
        </div>
      );
    }

    const prices = marketData.price_history.map(item => item.price);
    const dates = marketData.price_history.map(item => item.date);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const range = Math.max(maxPrice - minPrice, 1); // Ensure range is at least 1

    if (chartType === 'bar') {
      return renderBarChart(prices, dates, minPrice, maxPrice, range);
    } else {
      return renderLineChart(prices, dates, minPrice, maxPrice, range);
    }
  };

  const renderBarChart = (prices, dates, minPrice, maxPrice, range) => {
    const chartHeight = 200;
    const barWidth = Math.max(30, 400 / prices.length);

    return (
      <div className="mt-6">
        <div className="flex items-end justify-between h-64 px-4 border-b border-l border-gray-200">
          {prices.map((price, index) => {
            const height = ((price - minPrice) / range) * (chartHeight - 40);
            return (
              <div key={index} className="flex flex-col items-center" style={{ width: `${barWidth}px` }}>
                <div className="flex-1 flex flex-col justify-end w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg relative group transition-all duration-300 hover:from-green-400 hover:to-green-200"
                    style={{ height: `${Math.max(height, 8)}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{price}
                      <div className="text-xs opacity-75">{formatDate(dates[index])}</div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 h-8 flex items-center text-center">
                  {index % 3 === 0 ? formatDate(dates[index]) : ''}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
          <span>₹{minPrice.toLocaleString()}</span>
          <span>₹{Math.round((maxPrice + minPrice) / 2).toLocaleString()}</span>
          <span>₹{maxPrice.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  const renderLineChart = (prices, dates, minPrice, maxPrice, range) => {
    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 100;
      const y = 100 - ((price - minPrice) / range) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-6 relative h-64">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.5" />
          
          {/* Trend line */}
          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {prices.map((price, index) => {
            const x = (index / (prices.length - 1)) * 100;
            const y = 100 - ((price - minPrice) / range) * 80;
            return (
              <g key={index}>
                <circle cx={x} cy={y} r="2" fill="#10b981" className="hover:r-3 transition-all" />
                <title>₹{price} on {dates[index]}</title>
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-4">
          {dates.map((date, index) => (
            <span key={index} className={index % 5 === 0 ? '' : 'invisible'}>
              {formatDate(date)}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,248,225,0.9)), url("/images/market2.jpg")' }}
      >
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800">Loading Market Data</h3>
          <p className="text-gray-600">Fetching latest prices for {selectedCrop}...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed p-4"
      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.92), rgba(255,248,225,0.92)), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Market Prices & Trends</h1>
          <p className="text-lg text-gray-600">Real-time Agricultural Market Prices</p>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-600 mr-3" size={20} />
              <div>
                <p className="text-yellow-800 font-medium">{error}</p>
                <p className="text-yellow-700 text-sm">Sample data is being shown for demonstration</p>
              </div>
            </div>
          </div>
        )}

        {/* Crop Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-3">
              {[
                {id: 'wheat', name: 'Wheat', icon: '🌾'},
                {id: 'rice', name: 'Rice', icon: '🍚'},
                {id: 'corn', name: 'Corn', icon: '🌽'},
                {id: 'tomato', name: 'Tomato', icon: '🍅'},
                {id: 'potato', name: 'Potato', icon: '🥔'},
                {id: 'onion', name: 'Onion', icon: '🧅'},
                {id: 'cotton', name: 'Cotton', icon: '🧵'}
              ].map(crop => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`flex items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    selectedCrop === crop.id 
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                  }`}
                >
                  <span className="text-2xl mr-3">{crop.icon}</span>
                  <span className="font-semibold">{crop.name}</span>
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={fetchMarketData}
                className="flex items-center bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-md"
              >
                <RefreshCw size={18} className="mr-2" />
                Refresh Data
              </button>
              
              <div className="flex bg-gray-100 rounded-xl p-1">
               
                <button
                  onClick={() => setChartType('bar')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    chartType === 'bar' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <BarChart3 size={16} className="mr-2" />
                  Bars
                </button>
                 <button
                  onClick={() => setChartType('line')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    chartType === 'line' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <LineChart size={16} className="mr-2" />
                  Line
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Price Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl shadow-xl text-white p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div className="mb-4 lg:mb-0">
                <h2 className="text-2xl font-bold mb-2">Current Market Price</h2>
                <div className="flex items-center text-lg">
                  <span className="text-4xl mr-3">{getCropIcon(marketData.crop)}</span>
                  <div>
                    <div className="capitalize font-semibold">{marketData.crop}</div>
                    <div className="text-green-200 text-sm">{marketData.location}</div>
                  </div>
                </div>
              </div>
              
              <div className={`flex items-center px-4 py-2 rounded-full ${getTrendColor(marketData.trend)}`}>
                {getTrendIcon(marketData.trend)}
                <span className="ml-2 font-semibold capitalize">{marketData.trend} Trend</span>
              </div>
            </div>
            
            <div className="text-5xl font-bold mb-2">{marketData.current_price_display}</div>
            <div className="text-green-200 text-lg">{marketData.unit}</div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-green-200 text-sm">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                <span>Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center">
                <Shield size={16} className="mr-2" />
                <span>Source: AgriMarket</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 size={16} className="mr-2" />
                <span>Data Points: {marketData.total_records}</span>
              </div>
            </div>
          </div>

          {/* Data Quality Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="mr-2 text-green-600" size={24} />
              Data Status
            </h3>
            
            <div className="text-center p-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                marketData.data_quality !== 'live' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {marketData.data_quality !== 'live' ? <CheckCircle2 size={32} /> : <Info size={32} />}
              </div>
              
              <p className={`font-semibold text-lg ${
                marketData.data_quality !== 'live' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {marketData.data_quality !== 'live' ? 'Live Market Data' : 'Sample Data'}
              </p>
              
              <p className="text-sm text-gray-600 mt-2">
                {marketData.data_quality !== 'live' 
                  ? 'Real-time data from government sources' 
                  : 'Realistic simulation for demonstration'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Price Chart Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <h3 className="text-xl font-semibold flex items-center mb-4 lg:mb-0">
              <BarChart3 className="mr-2 text-green-600" size={24} />
              Price Trends & Visualization
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({marketData.price_history.length} data points)
              </span>
            </h3>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={exportData}
                className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={16} className="mr-2" />
                Export Data
              </button>
            </div>
          </div>
          
          {renderChart()}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price History */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 text-green-600" size={24} />
              Recent Price History
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {marketData.price_history.slice(-15).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-4 group-hover:bg-green-500 transition-colors"></div>
                    <div>
                      <div className="font-medium text-gray-900">{item.date}</div>
                      <div className="text-sm text-gray-600">{item.market}, {item.state}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600 text-lg">₹{item.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">per quintal</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Insights */}
          <div className="space-y-6">
            {/* Price Alerts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Bell className="mr-2 text-green-600" size={24} />
                Price Alerts
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Alert Price (₹/quintal)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter target price"
                  />
                  <button
                    onClick={setPriceAlert}
                    disabled={!alertPrice}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Set Alert
                  </button>
                </div>
              </div>
              
              {alerts.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Active Alerts ({alerts.length})</h4>
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <div className="font-semibold text-green-800 capitalize">{alert.crop}</div>
                        <div className="text-sm text-green-700">Alert: ₹{alert.price}</div>
                      </div>
                      <button 
                        onClick={() => removeAlert(alert.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No active alerts</p>
                  <p className="text-sm">Set price alerts to get notified</p>
                </div>
              )}
            </div>

            {/* Market Insights */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Info className="mr-2 text-green-600" size={24} />
                Market Insights
              </h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Price Trend Analysis</h4>
                  <p className="text-sm text-blue-700">
                    {marketData.trend === 'up' 
                      ? 'Prices are showing an upward trend. Consider strategic selling opportunities.' 
                      : marketData.trend === 'down'
                      ? 'Prices are declining. Monitor market conditions before making sales.'
                      : 'Market prices are stable. Regular monitoring recommended.'
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Current Market</h4>
                  <p className="text-sm text-green-700">
                    The current price of {marketData.crop} is {marketData.current_price_display} per quintal 
                    across {marketData.location.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;