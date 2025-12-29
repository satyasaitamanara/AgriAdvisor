import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar,
  Download,
  FileText,
  Sprout,
  Bug,
  Eye,
  BarChart3,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Trash2
} from 'lucide-react';

const History = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [pestReports, setPestReports] = useState([]);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total_recommendations: 0,
    total_pest_reports: 0,
    avg_recommendation_confidence: '0%',
    avg_pest_confidence: '0%'
  });
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your history');
        setLoading(false);
        return;
      }

      const [recResponse, pestResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/history/recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/api/history/pest-reports`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (recResponse.data.success) {
        setRecommendations(recResponse.data.recommendations || []);
      } else {
        setError('Failed to load recommendations');
      }
      
      if (pestResponse.data.success) {
        setPestReports(pestResponse.data.pest_reports || []);
      } else {
        setError('Failed to load pest reports');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load data. Please check your connection and try again.');
      setRecommendations([]);
      setPestReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE}/api/history/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const deleteRecommendation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recommendation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/history/recommendations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecommendations(prev => prev.filter(rec => rec.id !== id));
      fetchStats();
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      alert('Failed to delete recommendation');
    }
  };

  const deletePestReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pest report?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/history/pest-reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPestReports(prev => prev.filter(report => report.id !== id));
      fetchStats();
    } catch (error) {
      console.error('Error deleting pest report:', error);
      alert('Failed to delete pest report');
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedData = () => {
    let data = activeTab === 'recommendations' ? [...recommendations] : [...pestReports];
    
    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => 
        activeTab === 'recommendations' 
          ? item.crops && item.crops.some(crop => 
              crop.toLowerCase().includes(searchTerm.toLowerCase()))
          : item.pest && item.pest.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      data = data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= filterDate;
      });
    }
    
    // Apply sorting
    data.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortBy === 'confidence') {
        aValue = parseFloat(a.confidence) || 0;
        bValue = parseFloat(b.confidence) || 0;
      } else if (sortBy === 'yield' && activeTab === 'recommendations') {
        aValue = parseFloat(a.yield) || 0;
        bValue = parseFloat(b.yield) || 0;
      } else if (sortBy === 'profit' && activeTab === 'recommendations') {
        aValue = parseFloat(a.profit?.replace(/[^\d.]/g, '')) || 0;
        bValue = parseFloat(b.profit?.replace(/[^\d.]/g, '')) || 0;
      } else if (sortBy === 'severity' && activeTab === 'pestReports') {
        const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = severityOrder[a.severity] || 1;
        bValue = severityOrder[b.severity] || 1;
      } else {
        return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return data;
  };

  const exportToCSV = () => {
    alert('CSV export functionality would be implemented here');
  };

  const generatePDF = () => {
    alert('PDF generation functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-green-800">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center my-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">History & Reports</h1>
          <p className="text-green-600">Review your past crop recommendations and pest detection reports</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="border-b border-green-100">
            <nav className="flex">
              <button
                className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${activeTab === 'recommendations' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('recommendations')}
              >
                <Sprout size={20} />
                Crop Recommendations
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {stats.total_recommendations}
                </span>
              </button>
              <button
                className={`flex-1 py-4 font-medium flex items-center justify-center gap-2 ${activeTab === 'pestReports' ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('pestReports')}
              >
                <Bug size={20} />
                Pest Reports
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {stats.total_pest_reports}
                </span>
              </button>
            </nav>
          </div>
          
          {/* Filters and Search */}
          <div className="p-4 border-b border-green-100 bg-green-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'recommendations' ? 'crops...' : 'pests...'}`}
                  className="w-full pl-10 pr-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    className="pl-10 pr-8 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="week">Past Week</option>
                    <option value="month">Past Month</option>
                    <option value="quarter">Past 3 Months</option>
                  </select>
                </div>
                
                <div className="relative">
                  <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    className="pl-10 pr-8 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="confidence">Sort by Confidence</option>
                    {activeTab === 'recommendations' ? (
                      <>
                        <option value="yield">Sort by Yield</option>
                        <option value="profit">Sort by Profit</option>
                      </>
                    ) : (
                      <option value="severity">Sort by Severity</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-6">
            {activeTab === 'recommendations' ? (
              <div>
                <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <Sprout className="mr-2 text-green-600" />
                  Past Crop Recommendations
                </h2>
                
                {filteredAndSortedData().length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                      <Sprout className="text-green-600" size={24} />
                    </div>
                    <p className="text-gray-500">
                      {recommendations.length === 0 ? 'No recommendations found.' : 'No recommendations match your filters.'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {recommendations.length === 0 ? 'Get started by creating your first crop recommendation.' : 'Try adjusting your filters or search term.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedData().map((item) => (
                      <div key={item.id} className="border border-green-100 rounded-xl overflow-hidden">
                        <div 
                          className="bg-green-50 p-4 flex justify-between items-center cursor-pointer"
                          onClick={() => toggleExpand(item.id)}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-800 flex items-center">
                              <Calendar size={16} className="mr-2 text-green-600" />
                              {item.date}
                            </h3>
                            <p className="text-green-600 mt-1">
                              Recommended: {item.crops?.join(', ') || 'No crops specified'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                              {item.confidence || 'N/A'} confidence
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRecommendation(item.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                              title="Delete recommendation"
                            >
                              <Trash2 size={16} />
                            </button>
                            {expandedItems[item.id] ? (
                              <ChevronUp className="text-green-600" />
                            ) : (
                              <ChevronDown className="text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        {expandedItems[item.id] && (
                          <div className="p-4 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="bg-amber-50 p-3 rounded-lg">
                                <p className="text-sm text-amber-600">Estimated Yield</p>
                                <p className="font-semibold text-amber-800">{item.yield || 'N/A'}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-green-600">Estimated Profit</p>
                                <p className="font-semibold text-green-800">{item.profit || 'N/A'}</p>
                              </div>
                              <div className="bg-teal-50 p-3 rounded-lg">
                                <p className="text-sm text-teal-600">Sustainability Score</p>
                                <p className="font-semibold text-teal-800">{item.sustainability || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <h4 className="font-medium text-gray-700 mb-2">Soil Parameters:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">N:</span>
                                <span className="font-medium">{item.parameters?.n || 0} ppm</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">P:</span>
                                <span className="font-medium">{item.parameters?.p || 0} ppm</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">K:</span>
                                <span className="font-medium">{item.parameters?.k || 0} ppm</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">pH:</span>
                                <span className="font-medium">{item.parameters?.ph || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Temp:</span>
                                <span className="font-medium">{item.parameters?.temperature || 0}°C</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Humidity:</span>
                                <span className="font-medium">{item.parameters?.humidity || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Rainfall:</span>
                                <span className="font-medium">{item.parameters?.rainfall || 0}mm</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex justify-end">
                              <button className="flex items-center text-green-600 hover:text-green-800">
                                <Eye size={16} className="mr-1" />
                                View Detailed Analysis
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                  <Bug className="mr-2 text-green-600" />
                  Pest Detection History
                </h2>
                
                {filteredAndSortedData().length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                      <Bug className="text-green-600" size={24} />
                    </div>
                    <p className="text-gray-500">
                      {pestReports.length === 0 ? 'No pest reports found.' : 'No pest reports match your filters.'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {pestReports.length === 0 ? 'Get started by uploading your first pest image for detection.' : 'Try adjusting your filters or search term.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedData().map((item) => (
                      <div key={item.id} className="border border-green-100 rounded-xl overflow-hidden">
                        <div 
                          className="bg-green-50 p-4 flex justify-between items-center cursor-pointer"
                          onClick={() => toggleExpand(item.id)}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-800 flex items-center">
                              <Calendar size={16} className="mr-2 text-green-600" />
                              {item.date}
                            </h3>
                            <p className="text-green-600 mt-1">
                              Detected: {item.pest || 'Unknown Pest'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              item.severity === 'High' ? 'bg-red-100 text-red-800' :
                              item.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {item.severity || 'Unknown'} severity
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePestReport(item.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                              title="Delete pest report"
                            >
                              <Trash2 size={16} />
                            </button>
                            {expandedItems[item.id] ? (
                              <ChevronUp className="text-green-600" />
                            ) : (
                              <ChevronDown className="text-green-600" />
                            )}
                          </div>
                        </div>
                        
                        {expandedItems[item.id] && (
                          <div className="p-4 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Affected Crop</p>
                                <p className="font-medium">{item.affectedCrop || 'Multiple crops'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Confidence Level</p>
                                <p className="font-medium">{item.confidence || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <div className="flex items-center">
                                  {item.status === 'Resolved' ? (
                                    <CheckCircle size={16} className="text-green-500 mr-1" />
                                  ) : (
                                    <Shield size={16} className="text-amber-500 mr-1" />
                                  )}
                                  <span className={item.status === 'Resolved' ? 'text-green-600' : 'text-amber-600'}>
                                    {item.status || 'Monitoring'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Recommended Treatment</p>
                                <p className="font-medium">{item.treatment || 'No treatment advice available'}</p>
                              </div>
                            </div>
                            
                            {item.images && item.images.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">Detection Images:</p>
                                <div className="flex gap-2">
                                  {item.images.map((img, index) => (
                                    <img 
                                      key={index}
                                      src={`${API_BASE}${img}`} 
                                      alt={`Pest detection ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded border"
                                      onError={(e) => {
                                        console.error(`Failed to load image: ${API_BASE}${img}`);
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-4 flex justify-end">
                              <button className="flex items-center text-green-600 hover:text-green-800">
                                <Eye size={16} className="mr-1" />
                                View Full Report
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} className="mr-2" />
            Export to CSV
          </button>
          <button 
            onClick={generatePDF}
            className="flex items-center justify-center bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors"
          >
            <FileText size={18} className="mr-2" />
            Generate PDF Report
          </button>
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Sprout className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Recommendations</p>
                <p className="text-2xl font-bold text-green-800">{stats.total_recommendations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <Bug className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pest Detections</p>
                <p className="text-2xl font-bold text-amber-800">{stats.total_pest_reports}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Confidence</p>
                <p className="text-2xl font-bold text-blue-800">
                  {activeTab === 'recommendations' ? stats.avg_recommendation_confidence : stats.avg_pest_confidence}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;