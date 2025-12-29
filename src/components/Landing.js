import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  BarChart3, 
  Bug, 
  Calendar, 
  Users, 
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
  Sun,
  Camera,
  Mic,
  Shield,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: <Leaf className="text-green-500" size={36} />,
      title: "Crop Recommendation",
      description: "AI-powered suggestions based on your soil and weather conditions"
    },
    {
      icon: <Bug className="text-amber-500" size={36} />,
      title: "Pest Detection",
      description: "Upload plant images to identify diseases and get treatment advice"
    },
    {
      icon: <BarChart3 className="text-blue-500" size={36} />,
      title: "Market Insights",
      description: "Real-time market prices and trends for your crops"
    },
    {
      icon: <Calendar className="text-teal-500" size={36} />,
      title: "Seasonal Planning",
      description: "Optimal planting and harvesting schedules for your region"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Farmer from Andhra Pradesh",
      content: "AgriAdvisor helped me increase my yield by 30% with their precise crop recommendations."
    },
    {
      name: "Priya Singh",
      role: "Organic Farmer",
      content: "The pest detection feature saved my tomato crop from complete destruction. Highly recommended!"
    },
    {
      name: "Vikram Patel",
      role: "Agricultural Entrepreneur",
      content: "The market insights helped me get better prices for my produce. This app is a game-changer."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you! We'll send updates to ${email}`);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">AgriAdvisor</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="hover:text-amber-200 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-amber-200 transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-amber-200 transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-amber-200 transition-colors">Contact</a>
          </nav>
          
          <div className="flex space-x-4">
            <Link to="/login" className="px-4 py-2 rounded-lg border border-white hover:bg-white hover:text-green-700 transition-colors">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-lg bg-white text-green-700 font-medium hover:bg-opacity-90 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-green-800">
            AI-Based Crop Recommendations for Farmers
          </h2>
          <p className="text-xl mb-10 text-green-600">
            Get personalized crop recommendations, soil health advice, pest detection, and market insights to maximize your yield and profits.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link to="/signup" className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg px-8 py-4 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-md">
              Get Started Free
            </Link>
            <button className="px-8 py-4 border border-green-500 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-colors">
              Watch Demo
            </button>
          </div>

          {/* Animated Icons */}
          <div className="flex justify-center mt-8">
            <div className="animate-bounce mx-2"><Sparkles className="text-yellow-400" /></div>
            <div className="animate-bounce mx-2 delay-150"><Zap className="text-amber-400" /></div>
            <div className="animate-bounce mx-2 delay-300"><CloudRain className="text-blue-400" /></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-700">Our Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`p-6 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer ${
                  activeFeature === index 
                    ? 'border-green-500 bg-green-50 transform -translate-y-2' 
                    : 'border-white hover:border-green-300'
                }`}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 text-center text-green-700">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gradient-to-r from-green-50 to-teal-50 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-700">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-green-200">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Camera className="text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-700">1. Upload Image</h3>
              <p className="text-gray-600">Take a photo of your crop or plant</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-green-200">
              <div className="bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-700">2. AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes the image for diseases</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-2xl shadow-md border border-green-200">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-green-700">3. Get Recommendations</h3>
              <p className="text-gray-600">Receive customized treatment advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-700">What Farmers Say</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-md border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white p-2 rounded-full mr-4">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-700">{testimonial.name}</h3>
                    <p className="text-sm text-green-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with AgriAdvisor</h2>
          <p className="mb-8">Get the latest farming tips, market trends, and exclusive offers</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-r from-green-700 to-teal-700 text-white py-12 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Leaf className="h-8 w-8 mr-2 text-amber-300" />
              <h2 className="text-2xl font-bold">AgriAdvisor</h2>
            </div>
            <p className="text-green-100 mb-4">
              AI-powered agricultural recommendations to help farmers maximize yield and profits.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="bg-green-600 p-2 rounded-full hover:bg-green-500 transition-colors">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Home</a></li>
              <li><a href="#features" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Features</a></li>
              <li><a href="#how-it-works" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> How It Works</a></li>
              <li><a href="#testimonials" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Testimonials</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Blog</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Farming Guides</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> FAQ</a></li>
              <li><a href="#" className="flex items-center text-green-100 hover:text-amber-200 transition-colors"><ChevronRight size={14} className="mr-1" /> Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-amber-300">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center text-green-100">
                <Mail size={16} className="mr-2 text-amber-200" />
                support@agriadvisor.com
              </div>
              <div className="flex items-center text-green-100">
                <Phone size={16} className="mr-2 text-amber-200" />
                +91 9876543210
              </div>
              <div className="flex items-center text-green-100">
                <BookOpen size={16} className="mr-2 text-amber-200" />
                Hyderabad, India
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto border-t border-green-600 mt-8 pt-6 text-center text-green-200">
          <p>© {new Date().getFullYear()} AgriAdvisor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;