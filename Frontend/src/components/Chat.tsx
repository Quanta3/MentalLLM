import { useState, useEffect } from "react"
import { Mic, Phone, MessageCircle, Sparkles, Menu, X, Heart, Clock, UserPlus } from "lucide-react"
import { motion } from "framer-motion"

interface LocationData {
  latitude: string;
  longitude: string;
  city: string;
  ipAddress: string;
}

export default function Chat() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [contextId, setContextId] = useState<string | null>(null)

  useEffect(() => {
    const initializeUserContext = async () => {
      try {
        // Get IP Address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ipAddress = ipData.ip;

        // Try to get GPS location
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // Get city name from coordinates using Nominatim
              const geocodeResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
              );
              const geocodeData = await geocodeResponse.json();
              
              const locationData: LocationData = {
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString(),
                city: geocodeData.address.city || geocodeData.address.town || geocodeData.address.village || 'Unknown',
                ipAddress: ipAddress
              };
              await sendLocationData(locationData);
            },
            async (error) => {
              // Error: Fallback to IP-based location
              await fallbackToIpLocation(ipAddress);
            }
          );
        } else {
          // No geolocation: Fallback to IP-based location
          await fallbackToIpLocation(ipAddress);
        }
      } catch (error) {
        console.error('Error initializing user context:', error);
      }
    };

    const fallbackToIpLocation = async (ipAddress: string) => {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        const geoData = await geoResponse.json();
        
        const locationData: LocationData = {
          latitude: geoData.latitude.toString(),
          longitude: geoData.longitude.toString(),
          city: geoData.city,
          ipAddress: ipAddress
        };
        
        await sendLocationData(locationData);
      } catch (error) {
        console.error('Error getting location from IP:', error);
      }
    };

    const sendLocationData = async (locationData: LocationData) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/user/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationData)
        });

        const data = await response.json();
        if (data.contextId) {
          localStorage.setItem('contextId', data.contextId);
          setContextId(data.contextId);
        }
      } catch (error) {
        console.error('Error sending location data:', error);
      }
    };

    initializeUserContext();
  }, []);

  const activities = [
    { 
      title: "चिकित्सक से बात करें", 
      description: "तज्ञ सल्लागारांशी संवाद साधा",
      icon: <UserPlus className="h-10 w-10 text-teal-500" /> 
    },
    { 
      title: "हेल्पलाइन", 
      description: "तात्काळ मदतीसाठी कॉल करा",
      icon: <Phone className="h-10 w-10 text-red-500" /> 
    },
    { 
      title: "AI सहाय्यक", 
      description: "24/7 सहाय्यक उपलब्ध",
      icon: <Sparkles className="h-10 w-10 text-purple-500" /> 
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white text-slate-800 flex flex-col">
      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-teal-100"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 10 }} 
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart className="h-8 w-8 text-teal-500" />
            </motion.div>
            <span className="font-bold text-xl text-teal-700">विश्वमित्र</span>
          </a>

          <div className="hidden md:flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-full border-2 border-red-200 hover:bg-red-50 transition-colors"
            >
              <Phone className="h-5 w-5" />
              आपत्कालीन हेल्पलाइन
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-slate-600 hover:text-teal-600 px-4 py-2 rounded-full border-2 border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Clock className="h-5 w-5" />
              सत्र शेड्यूल करा
            </motion.button>
          </div>

          <button 
            className="md:hidden text-slate-700" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>
      
      {/* Chat Content Area */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4 mb-8"
            >
              <h2 className="text-3xl font-bold text-slate-800">तुमच्या मानसिक आरोग्यासाठी मदत</h2>
              <p className="text-slate-600 max-w-2xl">कोणत्याही समस्येसाठी आम्ही तुमच्यासोबत आहोत. खालील पर्यायांमधून निवडा.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
              {activities.map((act, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow border border-slate-100 flex flex-col items-center text-center"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="mb-4 p-3 inline-block rounded-lg bg-slate-50 shadow-sm">
                    {act.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{act.title}</h3>
                  <p className="text-slate-600 text-sm">{act.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div>// messages list</div>
        )}
      </div>

      {/* Fixed Chatbar at Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-teal-100 py-4">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="आपले विचार शेअर करा..."
            className="flex-1 px-6 py-3 border border-slate-200 rounded-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full transition-colors"
          >
            <Mic className="h-5 w-5" />
            व्हॉइस
          </motion.button>
        </div>
      </div>
    </div>
  )
}
