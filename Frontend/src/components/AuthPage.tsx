"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, ArrowRight, Mail, Lock, MapPin, AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { usePage } from "../context/PageContext"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    district: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    isStrong: false,
    message: "",
  })

  const { setAuth } = useAuth()
  const { setPage } = usePage()

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    
    if (password.length < minLength) {
      return {
        isStrong: false,
        message: "Password must be at least 8 characters long",
      }
    }
    
    const criteria = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars]
    const metCriteria = criteria.filter(Boolean).length
    
    if (metCriteria < 3) {
      return {
        isStrong: false,
        message: "Password must contain at least 3 of: uppercase, lowercase, numbers, special characters",
      }
    }
    
    return { isStrong: true, message: "Password is strong" }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Check password strength when password field changes
    if (name === "password" && !isLogin) {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URI

      // For registration, check password strength
      if (!isLogin && !passwordStrength.isStrong) {
        setError(passwordStrength.message)
        setLoading(false)
        return
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const payload = isLogin 
        ? { 
            email: formData.email, 
            password: formData.password 
          }
        : {
            email: formData.email,
            password: formData.password,
            city: formData.district
          }

      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      if (isLogin) {
        // Save token to localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('email', formData.email)
        
        // Update auth context
        setAuth(data.token, formData.email)
        
        // Navigate to dashboard (operator page)
        setPage('operator')
      } else {
        // Show success message and switch to login
        setError(`Registration successful! Please sign in.`)
        setIsLogin(true)
        setFormData((prev) => ({
          ...prev,
          district: "",
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div
            className="inline-block"
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Heart className="h-12 w-12 text-teal-500 mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-800 mt-4">
            Welcome to विश्वमित्र
          </h1>
          <p className="text-slate-600 mt-2">
            {isLogin
              ? "Sign in to continue"
              : "Create an account to get started"}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {error && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${error.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>
                {!isLogin && formData.password && (
                  <p className={`mt-1 text-sm ${passwordStrength.isStrong ? 'text-green-600' : 'text-amber-600'}`}>
                    {passwordStrength.message}
                  </p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    District
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your district"
                      required={!isLogin}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading || (!isLogin && !passwordStrength.isStrong && formData.password.length > 0)}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setFormData({
                  email: "",
                  password: "",
                  district: "",
                })
                setPasswordStrength({ isStrong: false, message: "" })
              }}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              disabled={loading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
