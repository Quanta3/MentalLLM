"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Sparkles, Sun, Moon, MessageCircle, Calendar, ArrowRight, Menu, X } from "lucide-react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const testimonials = [
    {
      name: "Sarah J.",
      role: "Therapy Client",
      content:
        "This platform transformed my approach to mental wellness. The guided meditations helped me develop a daily practice that's been life-changing.",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Michael T.",
      role: "Anxiety Management",
      content:
        "After struggling with anxiety for years, the resources and support I found here gave me practical tools I use every day. Highly recommend!",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      name: "Priya K.",
      role: "Wellness Journey",
      content:
        "The therapist matching service connected me with someone who truly understands my needs. The entire experience has been seamless and supportive.",
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white text-slate-800">
      {/* Navigation */}
      <motion.nav
        className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-teal-100"
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Heart className="h-8 w-8 text-teal-500" />
            </motion.div>
            <span className="font-bold text-xl text-teal-700">Serene Mind</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
              Home
            </a>
            <a href="#services" className="text-slate-600 hover:text-teal-600 transition-colors">
              Services
            </a>
            <a href="#about" className="text-slate-600 hover:text-teal-600 transition-colors">
              About
            </a>
            <a href="#testimonials" className="text-slate-600 hover:text-teal-600 transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="text-slate-600 hover:text-teal-600 transition-colors">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-full transition-colors"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </motion.button>

            <button className="md:hidden text-slate-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col px-4 py-4 space-y-4 bg-white border-t border-teal-100">
                <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
                  Home
                </a>
                <a href="#services" className="text-slate-600 hover:text-teal-600 transition-colors">
                  Services
                </a>
                <a href="#about" className="text-slate-600 hover:text-teal-600 transition-colors">
                  About
                </a>
                <a href="#testimonials" className="text-slate-600 hover:text-teal-600 transition-colors">
                  Testimonials
                </a>
                <a href="#contact" className="text-slate-600 hover:text-teal-600 transition-colors">
                  Contact
                </a>
                <button className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-full transition-colors">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <motion.div
          className="absolute top-20 right-10 text-teal-200 opacity-30"
          animate={{
            y: [0, 20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Sparkles className="h-64 w-64" />
        </motion.div>
        <motion.div
          className="absolute top-40 left-10 text-purple-200 opacity-30"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Heart className="h-48 w-48" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-amber-200 opacity-30"
          animate={{
            y: [0, 15, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Sun className="h-56 w-56" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center gap-12">
            <motion.div
              className="space-y-6 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <motion.span
                className="inline-block px-4 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Your Journey to Wellness Begins Here
              </motion.span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-800">
                Find Your <span className="text-teal-600">Inner Peace</span> and Mental Clarity
              </h1>
              <p className="text-lg text-slate-600">
                Our platform provides personalized mental health resources, expert guidance, and a supportive community
                to help you thrive.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-full transition-colors"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 border border-slate-300 hover:border-teal-500 hover:text-teal-600 px-8 py-3 rounded-full transition-colors"
                >
                  Learn More
                </motion.button>
              </div>
              <div className="flex items-center justify-center gap-4 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=40&width=40`}
                        alt={`User ${i}`}
                        className="object-cover w-10 h-10 rounded-full border-2 border-white"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-bold text-teal-600">1,000+</span> people joined this month
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
              Our Services
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Comprehensive Mental Health Support</h2>
            <p className="text-lg text-slate-600">
              We offer a range of services designed to support your mental health journey, from therapy to self-guided
              resources.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <MessageCircle className="h-10 w-10 text-teal-500" />,
                title: "Online Therapy",
                description:
                  "Connect with licensed therapists through secure video sessions tailored to your schedule and needs.",
              },
              {
                icon: <Sparkles className="h-10 w-10 text-purple-500" />,
                title: "Guided Meditation",
                description:
                  "Access a library of guided meditations designed to reduce stress, improve focus, and promote better sleep.",
              },
              {
                icon: <Calendar className="h-10 w-10 text-blue-500" />,
                title: "Wellness Planning",
                description: "Create personalized wellness plans with goal tracking and regular progress assessments.",
              },
              {
                icon: <Heart className="h-10 w-10 text-red-500" />,
                title: "Support Groups",
                description:
                  "Join moderated support groups focused on specific challenges, connecting with others on similar journeys.",
              },
              {
                icon: <Sun className="h-10 w-10 text-amber-500" />,
                title: "Mood Tracking",
                description:
                  "Track your emotional patterns with our intuitive tools to identify triggers and measure progress.",
              },
              {
                icon: <Moon className="h-10 w-10 text-indigo-500" />,
                title: "Sleep Improvement",
                description:
                  "Discover techniques and programs specifically designed to enhance your sleep quality and patterns.",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow border border-slate-100"
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 p-3 inline-block rounded-lg bg-white shadow-sm">{service.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
                <p className="text-slate-600">{service.description}</p>
                <motion.a
                  href="#"
                  className="inline-flex items-center gap-1 text-teal-600 font-medium mt-4 hover:text-teal-700"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </motion.a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-white to-teal-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -top-6 -right-6 bg-purple-100 rounded-full w-24 h-24 z-0"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
                <motion.div
                  className="absolute -bottom-6 -left-6 bg-teal-100 rounded-full w-32 h-32 z-0"
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="/placeholder.svg?height=600&width=600"
                    alt="Our mission"
                    className="object-cover w-full h-auto rounded-2xl"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="lg:w-1/2 space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <span className="inline-block px-4 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                Making Mental Health Care Accessible to Everyone
              </h2>
              <p className="text-lg text-slate-600">
                We believe that everyone deserves access to quality mental health support. Our platform was created to
                break down barriers to care, whether they're financial, geographical, or stigma-related.
              </p>
              <p className="text-lg text-slate-600">
                Founded by a team of mental health professionals and technology experts, we combine clinical expertise
                with innovative digital solutions to create a supportive, effective mental wellness experience.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-teal-600">98%</div>
                  <p className="text-slate-600">User satisfaction rate</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-teal-600">50K+</div>
                  <p className="text-slate-600">Active monthly users</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-teal-600">200+</div>
                  <p className="text-slate-600">Licensed therapists</p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-teal-600">24/7</div>
                  <p className="text-slate-600">Support availability</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-teal-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Stories from Our Community</h2>
            <p className="text-lg text-slate-600">
              Hear from people who have transformed their mental wellness journey with our platform.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white p-3 rounded-full">
                <MessageCircle className="h-6 w-6" />
              </div>

              <div className="h-[200px] md:h-[180px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-lg md:text-xl text-slate-700 italic mb-6">
                      "{testimonials[activeTestimonial].content}"
                    </p>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                        <img
                          src={testimonials[activeTestimonial].avatar || "/placeholder.svg"}
                          alt={testimonials[activeTestimonial].name}
                          className="object-cover w-16 h-16 rounded-full"
                        />
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-slate-800">{testimonials[activeTestimonial].name}</h4>
                        <p className="text-sm text-slate-500">{testimonials[activeTestimonial].role}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      activeTestimonial === index ? "bg-teal-500" : "bg-slate-200"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-teal-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 md:p-12 text-white shadow-xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-2/3 space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Begin Your Wellness Journey Today</h2>
                <p className="text-teal-100">
                  Take the first step toward better mental health. Sign up now and get a free wellness assessment.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 bg-white text-teal-600 hover:bg-teal-50 px-8 py-3 rounded-full transition-colors font-medium"
                  >
                    Get Started Now
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 border border-white text-white hover:bg-white/10 px-8 py-3 rounded-full transition-colors"
                  >
                    Schedule a Demo
                  </motion.button>
                </div>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                >
                  <Heart className="h-32 w-32 text-white opacity-80" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-teal-500" />
                <span className="font-bold text-xl text-teal-700">Serene Mind</span>
              </div>
              <p className="text-slate-600 mb-4">
                Empowering you on your journey to mental wellness through accessible, personalized support.
              </p>
              <div className="flex gap-4">
                {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-teal-100 hover:text-teal-600 transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-4">Services</h3>
              <ul className="space-y-3">
                {["Online Therapy", "Guided Meditation", "Wellness Planning", "Support Groups", "Mood Tracking"].map(
                  (item) => (
                    <li key={item}>
                      <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
                        {item}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-4">Company</h3>
              <ul className="space-y-3">
                {["About Us", "Our Team", "Careers", "Press", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-4">Resources</h3>
              <ul className="space-y-3">
                {["Blog", "Guides", "FAQ", "Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-600 hover:text-teal-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-12 pt-8 text-center text-slate-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Serene Mind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
