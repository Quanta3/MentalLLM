"use client"

import { Heart, LogOut, History, Users, AlertTriangle, MapPin, X } from "lucide-react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { usePage } from "../context/PageContext"
import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"

// Types for our data
interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

interface ChatLog {
  _id: string;
  uuid: string;
  chatHistory: string[];
  ipAddress: string;
  suicideRiskPercent: number;
  riskLevel: "low" | "medium" | "high";
  location: Location;
  timestamp: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: ChatLog[];
}

export default function OperatorDashboard() {
  const { setPage } = usePage()
  const { setAuth } = useAuth()
  const [operatorEmail, setOperatorEmail] = useState<string>("")
  
  // State for our data
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginationOptions] = useState([5, 10, 25, 50])
  
  // Statistics derived from the data
  const statistics = {
    activeUsers: chatLogs.length || 0,
    criticalUsers: chatLogs.filter(log => log.riskLevel === "high").length || 0,
    totalDistricts: [...new Set(chatLogs.map(log => log.location?.city).filter(Boolean))].length || 0,
    avgResponseTime: "2.3s" // This could be calculated from response times if available
  }
  
  // Prepare chart data from logs
  const chartData = prepareChartData(chatLogs)
  
  // Fetch chat logs from server
  useEffect(() => {
    const fetchChatLogs = async () => {
      try {
        setLoading(true)
        const backendUrl = import.meta.env.VITE_BACKEND_URI || 'http://localhost:3000'
        const response = await fetch(`${backendUrl}/user/chatlogs`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch chat logs')
        }
        
        const data: ApiResponse = await response.json()
        
        if (data.success) {
          setChatLogs(data.data)
        } else {
          throw new Error('Failed to fetch chat logs')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchChatLogs()
  }, [])
  
  // Get the email from localStorage on component mount
  useEffect(() => {
    const email = localStorage.getItem('email')
    if (email) {
      setOperatorEmail(email)
    }
  }, [])
  
  // Function to handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    
    // Clear auth context
    setAuth(null, null)
    
    // Navigate to landing page
    setPage('landing')
  }
  
  // Helper function to prepare chart data
  function prepareChartData(logs: ChatLog[]) {
    // Group logs by date and count by risk level
    const groupedByDate = logs.reduce((acc, log) => {
      const date = new Date(log.timestamp).toISOString().split('T')[0]
      
      if (!acc[date]) {
        acc[date] = { date, activeUsers: 0, highRiskUsers: 0 }
      }
      
      acc[date].activeUsers++
      if (log.riskLevel === "high") {
        acc[date].highRiskUsers++
      }
      
      return acc
    }, {} as Record<string, { date: string; activeUsers: number; highRiskUsers: number }>)
    
    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date))
  }
  
  // Function to get status color based on risk level
  function getStatusColor(riskLevel: string) {
    switch(riskLevel) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  
  // Pagination functions
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = chatLogs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(chatLogs.length / itemsPerPage)
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  
  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1) // Reset to first page when changing items per page
  }
  
  // Function to handle showing chat history
  function handleShowHistory(chat: ChatLog) {
    setSelectedChat(chat)
    setShowHistoryModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-teal-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Heart className="h-8 w-8 text-teal-500" />
            </motion.div>
            <span className="font-bold text-xl text-teal-700">विश्वमित्र</span>
          </a>

          <div className="flex items-center gap-4">
            <span className="text-slate-600">{operatorEmail || "User"}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error state */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error: {error}. Please try refreshing the page.
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { title: "Active Users", value: statistics.activeUsers, icon: Users, color: "text-blue-500" },
                { title: "High Risk Users", value: statistics.criticalUsers, icon: AlertTriangle, color: "text-red-500" },
                { title: "Districts", value: statistics.totalDistricts, icon: MapPin, color: "text-green-500" },
                { title: "Avg Response Time", value: statistics.avgResponseTime, icon: History, color: "text-purple-500" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600">{stat.title}</span>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Chart */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-slate-800 mb-6">User Activity Overview</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="activeUsers" stroke="#0ea5e9" name="Active Users" />
                    <Line type="monotone" dataKey="highRiskUsers" stroke="#ef4444" name="High Risk Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Users List */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-slate-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Active Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">IP Address</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Risk Level</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Location</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentItems.length > 0 ? (
                      currentItems.map((chat) => (
                        <tr key={chat._id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-600">{chat.ipAddress}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(chat.riskLevel)}`}
                            >
                              {chat.riskLevel} risk
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {chat.location?.city || 'Unknown'} ({chat.location?.latitude.toFixed(2)}, {chat.location?.longitude.toFixed(2)})
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleShowHistory(chat)}
                              className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                            >
                              <History className="h-4 w-4" />
                              History
                            </motion.button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                          No active users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-slate-300 rounded-lg text-sm px-2 py-1"
                  >
                    {paginationOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => paginate(currentPage - 1)}
                    className={`px-3 py-1 rounded-lg text-sm ${currentPage === 1 ? 'text-slate-400' : 'text-teal-600 hover:text-teal-700'}`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => paginate(currentPage + 1)}
                    className={`px-3 py-1 rounded-lg text-sm ${currentPage === totalPages ? 'text-slate-400' : 'text-teal-600 hover:text-teal-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
      
      {/* Chat History Modal */}
      {showHistoryModal && selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Chat History</h3>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">IP Address:</span>
                <span className="text-sm text-slate-800">{selectedChat.ipAddress}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Risk Level:</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${getStatusColor(selectedChat.riskLevel)}`}>
                  {selectedChat.riskLevel} risk ({selectedChat.suicideRiskPercent}%)
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Location:</span>
                <span className="text-sm text-slate-800">
                  {selectedChat.location?.city || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-600">Time:</span>
                <span className="text-sm text-slate-800">
                  {new Date(selectedChat.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">Messages:</h4>
              {selectedChat.chatHistory.map((message, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-lg p-3">
                  <p className="text-slate-700 whitespace-pre-wrap">{message}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
