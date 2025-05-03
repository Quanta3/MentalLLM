"use client"
import { useState } from "react"
import { Mic, MessageCircle, Sparkles, Menu, X, Heart } from "lucide-react"
import { motion } from "framer-motion"

export default function Chat() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  const activities = [
    { title: "New Conversation", icon: <MessageCircle className="h-10 w-10 text-teal-500" /> },
    { title: "Voice Chat", icon: <Mic className="h-10 w-10 text-teal-500" /> },
    { title: "Discover Topics", icon: <Sparkles className="h-10 w-10 text-teal-500" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white text-slate-800 flex flex-col">
      {/* Fixed Titlebar */}
      <motion.nav
        className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-teal-100"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Heart className="h-8 w-8 text-teal-500" />
            </motion.div>
            <span className="font-bold text-xl text-teal-700">Chat Demo</span>
          </a>
          <button className="md:hidden text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>
      
      {/* Chat Content Area */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {activities.map((act, i) => (
                <motion.div
                  key={i}
                  className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow border border-slate-100 flex flex-col items-center justify-center"
                  whileHover={{ y: -5 }}
                >
                  <div className="mb-4 p-3 inline-block rounded-lg bg-white shadow-sm">
                    {act.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{act.title}</h3>
                </motion.div>
              ))}
            </div>
            <p className="text-slate-600">Start a conversation by typing below or using voice mode.</p>
          </div>
        ) : (
          // ...existing code for chat messages...
          <div>// messages list</div>
        )}
      </div>

      {/* Fixed Chatbar at Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-teal-100 py-4">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none"
          />
          <button className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-full transition-colors">
            <Mic className="h-5 w-5" />
            Voice
          </button>
        </div>
      </div>
    </div>
  )
}
