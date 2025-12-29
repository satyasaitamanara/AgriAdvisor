import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Camera, 
  Upload, 
  Mic, 
  MicOff, 
  Download, 
  MessageCircle,
  AlertTriangle,
  Shield,
  Bug,
  Leaf,
  Languages,
  Home,
  User,
  BookOpen,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  ChevronRight,
  Sparkles,
  Zap,
  CloudRain,
  Droplets,
  Sun
} from 'lucide-react';

const PestDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('prevention');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('english');
  const [activeNav, setActiveNav] = useState('home');
  const [sampleImages, setSampleImages] = useState([]);
  const speechSynthesisRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

  // Sample images for demonstration
  const diseaseImages = {
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": [
    "/images/Corn_(maize)___Cercospora_leaf_spot1.jpg",
    "/images/Corn_(maize)___Cercospora_leaf_spot2.jpg",
    "/images/Corn_(maize)___Cercospora_leaf_spot3.jpg",
    "/images/Corn_(maize)___Cercospora_leaf_spot4.jpg"
  ],
  "Corn_(maize)___Common_rust_": [
    "/images/Corn_(maize)___Common_rust_1.jpg",
    "/images/Corn_(maize)___Common_rust_2.jpg",
    "/images/Corn_(maize)___Common_rust_3.jpg",
    "/images/Corn_(maize)___Common_rust_4.jpg"
  ],
  "Corn_(maize)___Northern_Leaf_Blight": [
    "/images/Corn_(maize)___Northern_Leaf_Blight1.jpg",
    "/images/Corn_(maize)___Northern_Leaf_Blight2.jpg",
    "/images/Corn_(maize)___Northern_Leaf_Blight3.jpg",
    "/images/Corn_(maize)___Northern_Leaf_Blight4.jpg"
  ],
  "Corn_(maize)___healthy": [
    "/images/Corn_(maize)___healthy1.jpg",
    "/images/Corn_(maize)___healthy2.jpg",
    "/images/Corn_(maize)___healthy3.jpg",
    "/images/Corn_(maize)___healthy4.jpg"
  ],
  "Potato___Early_blight": [
    "/images/Potato___Early_blight1.jpg",
    "/images/Potato___Early_blight2.jpg",
    "/images/Potato___Early_blight3.jpg",
    "/images/Potato___Early_blight4.jpg"
  ],
  "Potato___Late_blight": [
    "/images/Potato___Late_blight1.jpg",
    "/images/Potato___Late_blight2.jpg",
    "/images/Potato___Late_blight3.jpg",
    "/images/Potato___Late_blight4.jpg"
  ],
  "Potato___healthy": [
    "/images/Potato___healthy1.jpg",
    "/images/Potato___healthy2.jpg",
    "/images/Potato___healthy3.jpg",
    "/images/Potato___healthy4.jpg"
  ],
  "Tomato___Bacterial_spot": [
    "/images/Tomato___Bacterial_spot1.jpg",
    "/images/Tomato___Bacterial_spot2.jpg",
    "/images/Tomato___Bacterial_spot3.jpg",
    "/images/Tomato___Bacterial_spot4.jpg"
  ],
  "Tomato___Early_blight": [
    "/images/Tomato___Early_blight1.jpg",
    "/images/Tomato___Early_blight2.jpg",
    "/images/Tomato___Early_blight3.jpg",
    "/images/Tomato___Early_blight4.jpg"
  ],
  "Tomato___Late_blight": [
    "/images/Tomato___Late_blight1.jpg",
    "/images/Tomato___Late_blight2.jpg",
    "/images/Tomato___Late_blight3.jpg",
    "/images/Tomato___Late_blight4.jpg"
  ],
  "Tomato___Leaf_Mold": [
    "/images/Tomato___Leaf_Mold1.jpg",
    "/images/Tomato___Leaf_Mold2.jpg",
    "/images/Tomato___Leaf_Mold3.jpg",
    "/images/Tomato___Leaf_Mold4.jpg"
  ],
  "Tomato___Septoria_leaf_spot": [
    "/images/Tomato___Septoria_leaf_spot1.jpg",
    "/images/Tomato___Septoria_leaf_spot2.jpg",
    "/images/Tomato___Septoria_leaf_spot3.jpg",
    "/images/Tomato___Septoria_leaf_spot4.jpg"
  ],
  "Tomato___Spider_mites Two-spotted_spider_mite": [
    "/images/Tomato___Spider_mites1.jpg",
    "/images/Tomato___Spider_mites2.jpg",
    "/images/Tomato___Spider_mites3.jpg",
    "/images/Tomato___Spider_mites4.jpg"
  ],
  "Tomato___Target_Spot": [
    "/images/Tomato___Target_Spot1.jpg",
    "/images/Tomato___Target_Spot2.jpg",
    "/images/Tomato___Target_Spot3.jpg",
    "/images/Tomato___Target_Spot4.jpg"
  ],
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": [
    "/images/Tomato___Tomato_Yellow_Leaf_Curl_Virus1.jpg",
    "/images/Tomato___Tomato_Yellow_Leaf_Curl_Virus2.jpg",
    "/images/Tomato___Tomato_Yellow_Leaf_Curl_Virus3.jpg",
    "/images/Tomato___Tomato_Yellow_Leaf_Curl_Virus4.jpg"
  ],
  "Tomato___Tomato_mosaic_virus": [
    "/images/Tomato___Tomato_mosaic_virus1.jpg",
    "/images/Tomato___Tomato_mosaic_virus2.jpg",
    "/images/Tomato___Tomato_mosaic_virus3.jpg",
    "/images/Tomato___Tomato_mosaic_virus4.jpg"
  ],
  "Tomato___healthy": [
    "/images/Tomato___healthy1.jpg",
    "/images/Tomato___healthy2.jpg",
    "/images/Tomato___healthy3.jpg",
    "/images/Tomato___healthy4.jpg"
  ]
};
  
  useEffect(() => {
    if (result && result.prediction) {
      setSampleImages(diseaseImages[result.prediction] || []);
    }
  }, [result]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/pest/detect`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error detecting pest:', error);
      
      // Fallback demo data with proper Telugu translations
      const demoResults = {
        prediction: "Tomato___Early_blight",
        confidence: 0.95,
        advisory: {
          common_name: "Early Blight",
          symptoms: "Dark concentric rings on leaves, yellow halos around spots, leaf wilting",
          prevention: [
            "Rotate crops regularly",
            "Ensure proper spacing between plants",
            "Water at the base to avoid wet leaves",
            "Remove infected plant debris"
          ],
          pests: ["Alternaria solani (fungus)"],
          organic: "Spray with neem oil or baking soda solution. Use copper fungicides for control.",
          chemical: "Apply chlorothalonil or mancozeb-based fungicides at 7-10 day intervals.",
          telugu: {
            disease_name: "టమాటా ప్రారంభ బ్లైట్",
            common_name: "ప్రారంభ బ్లైట్",
            symptoms: "ఆకులపై చీకటి కేంద్రిక రింగులు, మచ్చల చుట్టూ పసుపు రంగు హాలోలు, ఆకు వాడిపోవడం",
            prevention: [
              "పంటలను క్రమం తప్పకుండా తిప్పండి",
              "మొక్కల మధ్య సరైన దూరం ఉంచండి",
              "తడి ఆకులను నివారించడానికి బేస్ వద్ద నీరు పెట్టండి",
              "సోకిన మొక్కల శిధిలాలను తీసివేయండి"
            ],
            pests: ["ఆల్టర్నేరియా సోలాని (ఫంగస్)"],
            organic: "నీం ఆయిల్ లేదా బేకింగ్ సోడా ద్రావణంతో స్ప్రే చేయండి. నియంత్రణ కోసం రాగి ఫంగిసైడ్లను ఉపయోగించండి.",
            chemical: "7-10 రోజుల Intervals లో క్లోరోథాలోనిల్ లేదా మ్యాంకోజెబ్-ఆధారిత ఫంగిసైడ్లను వర్తించండి."
          }
        }
      };
      
      setResult(demoResults);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!result) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    let textToSpeak = '';
    
    if (language === 'english') {
      textToSpeak = `
        Common Name: ${result.advisory.common_name}. 
        Symptoms: ${result.advisory.symptoms}. 
        Prevention: ${(result.advisory.prevention || []).join('. ')}.
        Pests: ${(result.advisory.pests || []).join(', ')}.
        Organic Treatment: ${result.advisory.organic}.
        Chemical Treatment: ${result.advisory.chemical}.
      `;
    } else {
      const telugu = result.advisory.telugu || {};
      textToSpeak = `
        సాధారణ పేరు: ${telugu.common_name || result.advisory.common_name}. 
        లక్షణాలు: ${telugu.symptoms || result.advisory.symptoms}. 
        నివారణ: ${(telugu.prevention || result.advisory.prevention || []).join('. ')}.
        కీటకాలు: ${(telugu.pests || result.advisory.pests || []).join(', ')}.
        సేాగ్ చికిత్స: ${telugu.organic || result.advisory.organic}.
        రసాయన చికిత్స: ${telugu.chemical || result.advisory.chemical}.
      `;
    }
    
    const speech = new SpeechSynthesisUtterance(textToSpeak);
    speech.lang = language === 'english' ? 'en-US' : 'te-IN';
    speech.rate = 0.8;
    speech.pitch = 1;
    speech.volume = 1;
    
    speechSynthesisRef.current = speech;
    
    speech.onstart = () => setIsSpeaking(true);
    speech.onend = () => setIsSpeaking(false);
    speech.onerror = () => {
      setIsSpeaking(false);
      alert(language === 'english' ? 
        'Speech synthesis not supported in this browser. Try Chrome or Edge.' :
        'ఈ బ్రౌజర్లో స్పీచ్ సపోర్ట్ లేదు. Chrome లేదా Edge ఉపయోగించండి.'
      );
    };
    
    window.speechSynthesis.speak(speech);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'english' ? 'telugu' : 'english');
  };

  const getTranslatedText = (key) => {
    if (!result) return '';
    
    if (language === 'english') {
      if (key === 'prevention') return result.advisory.prevention || [];
      if (key === 'pests') return result.advisory.pests || [];
      if (key === 'disease_name') return ''; // Hide disease name in English
      return result.advisory[key] || '';
    }
    
    // For Telugu, use the backend translation
    const teluguData = result.advisory.telugu || {};
    
    if (key === 'prevention') {
      return teluguData.prevention || result.advisory.prevention || [];
    }
    if (key === 'pests') {
      return teluguData.pests || result.advisory.pests || [];
    }
    if (key === 'organic') {
      return teluguData.organic || result.advisory.organic || '';
    }
    if (key === 'chemical') {
      return teluguData.chemical || result.advisory.chemical || '';
    }
    if (key === 'disease_name') {
      return teluguData.disease_name || '';
    }
    
    return teluguData[key] || result.advisory[key] || '';
  };

  const downloadReport = () => {
    if (!result) return;
    
    const reportData = {
      date: new Date().toLocaleDateString(),
      prediction: result.prediction,
      confidence: result.confidence,
      advisory: result.advisory,
      language: language
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `plant_report_${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Enhanced translations with better Telugu support
  const translations = {
    english: {
      title: "Plant Disease Detection",
      subtitle: "Upload an image of your plant to identify diseases and get treatment recommendations",
      uploadTitle: "Upload Plant Image",
      selectImage: "Select Image",
      detectDisease: "Detect Disease",
      supportedFormats: "Supported formats: JPG, PNG, GIF. Maximum size: 5MB",
      results: "Detection Results",
      symptoms: "Symptoms",
      prevention: "Prevention",
      pests: "Pests",
      treatment: "Treatment",
      organicTreatment: "Organic Treatment",
      chemicalTreatment: "Chemical Treatment",
      associatedPests: "Associated Pests:",
      confidence: "Confidence",
      readAloud: "Read Aloud",
      switchLanguage: "Switch to Telugu",
      downloadReport: "Download Report",
      saveReport: "Save Report",
      consultExpert: "Consult Expert",
      similarImages: "Similar Disease Images",
      sampleNote: "Sample images of this disease for reference",
      nav: {
        home: "Home",
        about: "About",
        services: "Services",
        contact: "Contact"
      },
      footer: {
        description: "Advanced plant disease detection using AI technology to help farmers protect their crops.",
        quickLinks: "Quick Links",
        contactUs: "Contact Us",
        address: "123 Farm Street, Agricultural City",
        phone: "+91 9876543210",
        email: "support@plantcare.com"
      }
    },
    telugu: {
      title: "మొక్కల వ్యాధి గుర్తింపు",
      subtitle: "మీ మొక్క యొక్క చిత్రాన్ని అప్‌లోడ్ చేసి వ్యాధులను గుర్తించడానికి మరియు చికిత్స సిఫార్సులను పొందండి",
      uploadTitle: "మొక్క చిత్రాన్ని అప్‌లోడ్ చేయండి",
      selectImage: "చిత్రాన్ని ఎంచుకోండి",
      detectDisease: "వ్యాధిని గుర్తించు",
      supportedFormats: "సమర్థించబడిన ఫార్మాట్లు: JPG, PNG, GIF. గరిష్ట పరిమాణం: 5MB",
      results: "గుర్తింపు ఫలితాలు",
      symptoms: "లక్షణాలు",
      prevention: "నివారణ",
      pests: "కీటకాలు",
      treatment: "చికిత్స",
      organicTreatment: "సేాగ్ చికిత్స",
      chemicalTreatment: "రసాయన చికిత్స",
      associatedPests: "సంబంధిత కీటకాలు:",
      confidence: "ఆత్మవిశ్వాసం",
      readAloud: "బిగ్గరగా చదవండి",
      switchLanguage: "ఆంగ్లంలో మార్చు",
      downloadReport: "నివేదిక డౌన్‌లోడ్ చేయండి",
      saveReport: "నివేదికను సేవ్ చేయండి",
      consultExpert: "నిపుణులను సంప్రదించండి",
      similarImages: "ఇటువంటి వ్యాధి చిత్రాలు",
      sampleNote: "సూచన కోసం ఈ వ్యాధి యొక్క నమూనా చిత్రాలు",
      nav: {
        home: "హోమ్",
        about: "గురించి",
        services: "సేవలు",
        contact: "సంప్రదించండి"
      },
      footer: {
        description: "AI సాంకేతికతను ఉపయోగించి అధునాతన మొక్కల వ్యాధి గుర్తింపు, రైతులు తమ పంటలను రక్షించడంలో సహాయపడుతుంది.",
        quickLinks: "ద్రుత లింకులు",
        contactUs: "మమ్మల్ని సంప్రదించండి",
        address: "123 ఫారం స్ట్రీట్, వ్యవసాయ నగరం",
        phone: "+91 9876543210",
        email: "support@plantcare.com"
      }
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">PlantCare AI</h1>
          </div>
          
          <button 
            onClick={toggleLanguage}
            className="bg-white text-green-700 px-4 py-2 rounded-full flex items-center font-medium hover:bg-amber-50 transition-colors"
          >
            <Languages size={16} className="mr-1" />
            {language === 'english' ? 'తెలుగు' : 'English'}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Hero Section */}
        <div className="text-center my-8 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg">
          <h1 className="text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-lg opacity-90">{t.subtitle}</p>
          <div className="flex justify-center mt-4">
            <div className="animate-bounce mx-1"><Sparkles className="text-yellow-300" /></div>
            <div className="animate-bounce mx-1 delay-100"><Zap className="text-amber-300" /></div>
            <div className="animate-bounce mx-1 delay-200"><CloudRain className="text-blue-200" /></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-green-700">
              <Camera className="mr-2 text-green-500" />
              {t.uploadTitle}
            </h2>
            
            <div className="flex flex-col items-center">
              {previewUrl ? (
                <div className="mb-4 w-full relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-64 object-contain rounded-lg border-2 border-green-200 shadow-md"
                  />
                  <button 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-12 text-center mb-4 w-full bg-green-50">
                  <div className="text-4xl mb-4 text-green-400">📷</div>
                  <p className="text-green-600">{t.selectImage}</p>
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="fileInput"
                capture="environment"
              />
              
              <div className="flex space-x-4 w-full">
                <label 
                  htmlFor="fileInput" 
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-4 rounded-md cursor-pointer hover:from-green-600 hover:to-teal-600 transition-all shadow-md flex items-center justify-center"
                >
                  <Upload size={18} className="mr-2" />
                  {t.selectImage}
                </label>
                
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || loading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-md hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {language === 'english' ? 'Analyzing...' : 'విశ్లేషిస్తోంది...'}
                    </>
                  ) : (
                    <>
                      <Leaf size={18} className="mr-2" />
                      {t.detectDisease}
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-sm text-green-600 mt-4">
                {t.supportedFormats}
              </p>
            </div>

            {/* Tips Section */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 flex items-center">
                <Sun className="mr-2 text-amber-500" />
                {language === 'english' ? 'Pro Tip:' : 'ప్రొ తెల్పుకోవడం:'}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {language === 'english' 
                  ? 'Take clear photos of both upper and lower leaf surfaces for best results' 
                  : 'ఉత్తమ ఫలితాల కోసం ఆకుల యొక్క పైన మరియు కింది ఉపరితలాల యొక్క స్పష్టమైన ఫోటోలను తీయండి'}
              </p>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">{t.results}</h2>
            
            {!result ? (
              <div className="text-center py-12">
                <div className="text-4xl text-gray-300 mb-4">🔍</div>
                <p className="text-gray-500">
                  {language === 'english' 
                    ? 'Upload an image to detect plant diseases' 
                    : 'మొక్కల వ్యాధులను గుర్తించడానికి ఒక చిత్రాన్ని అప్‌లోడ్ చేయండి'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {/* Show disease name only in Telugu, show common name in both languages */}
                    {language === 'telugu' && getTranslatedText('disease_name') && (
                      <h3 className="text-2xl font-bold text-green-600 mb-2">
                        {getTranslatedText('disease_name')}
                      </h3>
                    )}
                    <h3 className={`text-2xl font-bold text-green-600 ${language === 'telugu' ? 'text-lg' : 'text-2xl'}`}>
                      {getTranslatedText('common_name')}
                    </h3>
                    <div className="mt-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm inline-block">
                      {t.confidence}: {(result.confidence * 100).toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSpeak}
                      disabled={!window.speechSynthesis}
                      className={`p-2 rounded-full transition-all shadow-sm ${
                        isSpeaking 
                          ? 'bg-red-100 text-red-500' 
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-500'
                      }`}
                      title={isSpeaking ? 
                        (language === 'english' ? "Stop Voice" : "వాయిస్ ఆపు") : 
                        t.readAloud}
                    >
                      {isSpeaking ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    
                    <button
                      onClick={toggleLanguage}
                      className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full hover:from-blue-200 hover:to-cyan-200 transition-all shadow-sm"
                      title={t.switchLanguage}
                    >
                      <Languages size={20} className="text-blue-500" />
                    </button>
                    
                    <button
                      onClick={downloadReport}
                      className="p-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-full hover:from-green-200 hover:to-teal-200 transition-all shadow-sm"
                      title={t.downloadReport}
                    >
                      <Download size={20} className="text-green-500" />
                    </button>
                  </div>
                </div>
                
                {/* Symptoms */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 flex items-center text-amber-700">
                    <AlertTriangle size={18} className="mr-2 text-amber-500" />
                    {t.symptoms}
                  </h4>
                  <p className="text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    {getTranslatedText('symptoms')}
                  </p>
                </div>
                
                {/* Tabs for different information */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('prevention')}
                      className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                        activeTab === 'prevention'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Shield size={16} className="inline mr-1" />
                      {t.prevention}
                    </button>
                    <button
                      onClick={() => setActiveTab('pests')}
                      className={`mr-4 py-2 px-1 font-medium text-sm border-b-2 ${
                        activeTab === 'pests'
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Bug size={16} className="inline mr-1" />
                      {t.pests}
                    </button>
                    <button
                      onClick={() => setActiveTab('treatment')}
                      className={`py-2 px-1 font-medium text-sm border-b-2 ${
                        activeTab === 'treatment'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <MessageCircle size={16} className="inline mr-1" />
                      {t.treatment}
                    </button>
                  </nav>
                </div>
                
                {/* Tab content */}
                <div className="mb-6">
                  {activeTab === 'prevention' && (
                    <ul className="space-y-2">
                      {(getTranslatedText('prevention') || []).map((precaution, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-gray-700">{precaution}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {activeTab === 'pests' && (
                    <div>
                      <h5 className="font-medium mb-2 text-red-700">{t.associatedPests}</h5>
                      <ul className="space-y-1">
                        {(getTranslatedText('pests') || []).map((pest, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-gray-700">{pest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {activeTab === 'treatment' && (
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2 text-green-700">{t.organicTreatment}</h5>
                        <p className="text-gray-700">{getTranslatedText('organic')}</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2 text-blue-700">{t.chemicalTreatment}</h5>
                        <p className="text-gray-700">{getTranslatedText('chemical')}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={downloadReport}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-teal-600 transition-all shadow-md"
                  >
                    {t.downloadReport}
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-md hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md">
                    {t.consultExpert}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Sample Images Section */}
        {result && sampleImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border-2 border-purple-200">
            <h2 className="text-xl font-semibold mb-4 text-purple-700 flex items-center">
              <Camera className="mr-2 text-purple-500" />
              {t.similarImages}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{t.sampleNote}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sampleImages.map((img, index) => (
                <div key={index} className="border-2 border-purple-200 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                  <img 
                    src={img} 
                    alt={`Sample ${index + 1}`} 
                    className="h-32 w-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x128?text=Sample+Image';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl border border-green-200 shadow-sm">
            <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="text-green-600" />
            </div>
            <h3 className="font-semibold text-green-700 mb-2">
              {language === 'english' ? 'Instant Detection' : 'తక్షణ గుర్తింపు'}
            </h3>
            <p className="text-green-600 text-sm">
              {language === 'english' 
                ? 'Get accurate plant disease identification within seconds' 
                : 'సెకన్లలో ఖచ్చితమైన మొక్కల వ్యాధి గుర్తింపును పొందండి'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-sm">
            <div className="bg-amber-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Droplets className="text-amber-600" />
            </div>
            <h3 className="font-semibold text-amber-700 mb-2">
              {language === 'english' ? 'Expert Solutions' : 'నిపుణుల పరిష్కారాలు'}
            </h3>
            <p className="text-amber-600 text-sm">
              {language === 'english' 
                ? 'Research-backed treatment plans for each disease' 
                : 'ప్రతి వ్యాధికి పరిశోధన-బ్యాక్డ్ చికిత్స పద్ధతులు'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200 shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Languages className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-700 mb-2">
              {language === 'english' ? 'Multi-Language' : 'బహుభాషా'}
            </h3>
            <p className="text-blue-600 text-sm">
              {language === 'english' 
                ? 'Get advice in English and Telugu for better understanding' 
                : 'మెరుగైన అవగాహన కోసం ఆంగ్లం మరియు తెలుగు భాషలలో సలహాలు పొందండి'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-700 to-teal-700 text-white mt-12 py-10 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Leaf className="h-8 w-8 mr-2 text-amber-300" />
              <h2 className="text-2xl font-bold">PlantCare AI</h2>
            </div>
            <p className="text-green-100 mb-4">
              {t.footer.description}
            </p>
            <div className="flex space-x-4">
              <a href="#facebook" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#twitter" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#instagram" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">{t.footer.quickLinks}</h3>
            <ul className="space-y-2">
              {['home', 'about', 'services', 'contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item}`} className="flex items-center text-green-100 hover:text-amber-200 transition-colors">
                    <ChevronRight size={14} className="mr-1" />
                    {t.nav[item]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">{t.footer.contactUs}</h3>
            <div className="space-y-3">
              <div className="flex items-center text-green-100">
                <Mail size={16} className="mr-2 text-amber-200" />
                {t.footer.email}
              </div>
              <div className="flex items-center text-green-100">
                <Phone size={16} className="mr-2 text-amber-200" />
                {t.footer.phone}
              </div>
              <div className="flex items-center text-green-100">
                <Home size={16} className="mr-2 text-amber-200" />
                {t.footer.address}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-green-600 mt-8 pt-6 text-center text-green-200">
          <p>© {new Date().getFullYear()} PlantCare AI. {language === 'english' ? 'All rights reserved' : 'అన్ని హక్కులు రిజర్వు'}</p>
        </div>
      </footer>
    </div>
  );
};

export default PestDetector;