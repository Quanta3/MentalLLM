import { useState, useEffect, useRef } from "react"
import { Mic, Phone, MessageCircle, Sparkles, Menu, X, Heart, Clock, UserPlus } from "lucide-react"
import { motion } from "framer-motion"

interface LocationData {
  latitude: string;
  longitude: string;
  city: string;
  ipAddress: string;
}

interface Message {
  text: string;
  isUser: boolean;
  isVoice?: boolean;
}

export default function Chat() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [contextId, setContextId] = useState<string | null>(null)
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const visualizerBars = Array(12).fill(0)

  // Audio playback state
  const audioCtx = useRef<AudioContext | null>(null)
  const bufferStore = useRef<Record<number, string>>({})
  const expectedIndex = useRef<number>(1)
  const playbackPromise = useRef<Promise<void>>(Promise.resolve())
  
  // Audio recording state
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  useEffect(() => {
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    return () => {
      audioCtx.current?.close()
    }
  }, [])

  const tryPlaying = () => {
    while (bufferStore.current[expectedIndex.current]) {
      const base64 = bufferStore.current[expectedIndex.current]
      delete bufferStore.current[expectedIndex.current]

      playbackPromise.current = playbackPromise.current.then(() => {
        return new Promise((resolve, reject) => {
          setIsPlaying(true)
          const binStr = atob(base64)
          const bytes = new Uint8Array(binStr.length)
          for (let i = 0; i < binStr.length; i++) {
            bytes[i] = binStr.charCodeAt(i)
          }
          
          audioCtx.current?.decodeAudioData(bytes.buffer)
            .then(buffer => {
              const src = audioCtx.current?.createBufferSource()
              if (src && audioCtx.current) {
                src.buffer = buffer
                src.connect(audioCtx.current.destination)
                src.onended = () => {
                  resolve()
                  if (!bufferStore.current[expectedIndex.current]) {
                    setIsPlaying(false)
                  }
                }
                src.start()
              }
            })
            .catch(reject)
        })
      })

      expectedIndex.current++
    }
  }

  useEffect(() => {
    // Restore contextId from localStorage if exists
    const savedContextId = localStorage.getItem('contextId');
    if (savedContextId) {
      setContextId(savedContextId);
    }
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

  const sendMessage = async () => {
    if (!inputText.trim() || !contextId) return;

    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Reset audio state if in voice mode
      if (isVoiceMode) {
        bufferStore.current = {}
        expectedIndex.current = 1
        playbackPromise.current = Promise.resolve()
      }

      const endpoint = isVoiceMode ? 'voice' : 'text'
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/user/query/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: contextId,
          userQuery: inputText
        })
      });

      if (isVoiceMode) {
        const botMessage = { text: "Voice message", isUser: false, isVoice: true }
        setMessages(prev => [...prev, botMessage])

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let sseBuffer = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            sseBuffer += decoder.decode(value, { stream: true })
            const parts = sseBuffer.split('\n\n')
            sseBuffer = parts.pop() || ''

            for (const block of parts) {
              let eventType = '', dataLine = ''
              for (const line of block.split('\n')) {
                if (line.startsWith('event:')) eventType = line.slice(6).trim()
                if (line.startsWith('data:')) dataLine += line.slice(5).trim()
              }
              if (eventType === 'audio') {
                try {
                  const { index, audio } = JSON.parse(dataLine)
                  bufferStore.current[index] = audio
                  tryPlaying()
                } catch (e) {
                  console.error('Invalid JSON chunk', e)
                }
              }
            }
          }
          await playbackPromise.current
        }
      } else {
        const data = await response.json()
        const botMessage = { text: data.response, isUser: false }
        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorder.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks.current = [];
        
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunks.current.push(e.data);
          }
        };
        
        recorder.onstop = async () => {
          // Convert audio chunks to base64
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            await sendAudioForTranscription(base64Audio);
            
            // Stop tracks
            stream.getTracks().forEach(track => track.stop());
          };
          
          reader.readAsDataURL(audioBlob);
        };
        
        mediaRecorder.current = recorder;
        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  const sendAudioForTranscription = async (base64Audio: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/user/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Audio
        })
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.transcription) {
        // Send the transcription to the voice query endpoint
        await sendVoiceQuery(data.transcription);
      }
    } catch (error) {
      console.error('Error with transcription:', error);
      setIsLoading(false);
    }
  };
  
  const sendVoiceQuery = async (transcription: string) => {
    try {
      // Add user message to chat
      const userMessage = { text: transcription, isUser: true };
      setMessages(prev => [...prev, userMessage]);
      
      // Reset audio state
      bufferStore.current = {};
      expectedIndex.current = 1;
      playbackPromise.current = Promise.resolve();
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URI}/user/query/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: contextId,
          userQuery: transcription
        })
      });
      
      // Add bot message
      const botMessage = { text: "Voice message", isUser: false, isVoice: true };
      setMessages(prev => [...prev, botMessage]);
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          sseBuffer += decoder.decode(value, { stream: true });
          const parts = sseBuffer.split('\n\n');
          sseBuffer = parts.pop() || '';
          
          for (const block of parts) {
            let eventType = '', dataLine = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('event:')) eventType = line.slice(6).trim();
              if (line.startsWith('data:')) dataLine += line.slice(5).trim();
            }
            if (eventType === 'audio') {
              try {
                const { index, audio } = JSON.parse(dataLine);
                bufferStore.current[index] = audio;
                tryPlaying();
              } catch (e) {
                console.error('Invalid JSON chunk', e);
              }
            }
          }
        }
        await playbackPromise.current;
        
        // After playback completes, switch back to text mode
        setIsVoiceMode(false);
      }
    } catch (error) {
      console.error('Error sending voice query:', error);
      // Also switch back to text mode on error
      setIsVoiceMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
          <div className="max-w-4xl mx-auto space-y-4 px-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-teal-600" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    message.isUser
                      ? 'bg-teal-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {message.isVoice ? (
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      {message.text}
                      {isPlaying && (
                        <div className="flex items-end gap-[2px] h-4">
                          {visualizerBars.map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-[2px] bg-current"
                              animate={{
                                height: isPlaying ? [4, 12, 4] : 4,
                              }}
                              transition={{
                                duration: 0.4,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start items-end gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-teal-600" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Chatbar at Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-teal-100 py-4">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isRecording) {
                // Stop recording
                toggleRecording();
              } else {
                // Start recording and enable voice mode if not already enabled
                if (!isVoiceMode) {
                  setIsVoiceMode(true);
                }
                toggleRecording();
              }
            }}
            className={`p-3 rounded-full transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse'
                : isVoiceMode 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Mic className="h-5 w-5" />
          </motion.button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isVoiceMode ? "Voice mode enabled..." : "आपले विचार शेअर करा..."}
            disabled={!contextId}
            className="flex-1 px-6 py-3 border border-slate-200 rounded-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!contextId || !inputText.trim()}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <MessageCircle className="h-5 w-5" />
            पाठवा
          </motion.button>
        </div>
      </div>
    </div>
  )
}
