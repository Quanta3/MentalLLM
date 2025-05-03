"use client"

import { Heart, LogOut, History, Users, AlertTriangle, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { usePage } from "../context/PageContext"

// Mock data - can be replaced with real data later
const mockData = {
  statistics: {
    activeUsers: 234,
    criticalUsers: 12,
    totalDistricts: 8,
    avgResponseTime: "2.3s"
  },
  chartData: [
    { date: "2024-01-01", activeUsers: 150, criticalUsers: 8 },
    { date: "2024-01-02", activeUsers: 180, criticalUsers: 10 },
    { date: "2024-01-03", activeUsers: 190, criticalUsers: 12 },
    { date: "2024-01-04", activeUsers: 220, criticalUsers: 9 },
    { date: "2024-01-05", activeUsers: 234, criticalUsers: 12 },
  ],
  users: [
    { id: 1, ipAddress: "192.168.1.101", status: "critical", location: { lat: "18.5204° N", long: "73.8567° E" } },
    { id: 2, ipAddress: "192.168.1.102", status: "normal", location: { lat: "19.0760° N", long: "72.8777° E" } },
    { id: 3, ipAddress: "192.168.1.103", status: "critical", location: { lat: "18.9220° N", long: "72.8347° E" } },
    { id: 4, ipAddress: "192.168.1.104", status: "normal", location: { lat: "18.4529° N", long: "73.8652° E" } },
    { id: 5, ipAddress: "192.168.1.105", status: "normal", location: { lat: "18.6298° N", long: "73.7997° E" } },
  ]
}

export default function OperatorDashboard() {
  const { setPage } = usePage()
  const operatorEmail = "operator@vishwamitra.org" // Replace with actual operator email

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
            <span className="text-slate-600">{operatorEmail}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage('landing')}
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Active Users", value: mockData.statistics.activeUsers, icon: Users, color: "text-blue-500" },
            { title: "Critical Users", value: mockData.statistics.criticalUsers, icon: AlertTriangle, color: "text-red-500" },
            { title: "Districts", value: mockData.statistics.totalDistricts, icon: MapPin, color: "text-green-500" },
            { title: "Avg Response Time", value: mockData.statistics.avgResponseTime, icon: History, color: "text-purple-500" },
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
              <LineChart data={mockData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="activeUsers" stroke="#0ea5e9" name="Active Users" />
                <Line type="monotone" dataKey="criticalUsers" stroke="#ef4444" name="Critical Users" />
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockData.users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">{user.ipAddress}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "critical"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user.location.lat}, {user.location.long}
                    </td>
                    <td className="px-6 py-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                      >
                        <History className="h-4 w-4" />
                        History
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
