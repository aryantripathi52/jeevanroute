'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Activity, 
  ArrowRight, 
  Compass, 
  ShieldAlert, 
  Heart, 
  Siren, 
  Brain, 
  Navigation, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Building2, 
  Cpu, 
  ChevronDown, 
  Phone, 
  Mail, 
  MapPin,
  Menu,
  X
} from 'lucide-react'

export default function LandingPage() {
  const [eta, setEta] = useState(258) // 4 minutes 18 seconds in seconds
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Countdown simulation for ETA
    const timer = setInterval(() => {
      setEta((prev) => (prev > 10 ? prev - 1 : 258))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatEta = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`
  }

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      id: 'faq-security',
      question: 'How does JeevanRoute guarantee patient data security?',
      answer: 'All patient telemetry, vital logs, and routing data are encrypted end-to-end using AES-256. We comply with global HIPAA standards and India\'s DISHA (Digital Information Security in Healthcare Act) guidelines, ensuring patient medical files are only accessible to the dispatch team and the confirmed receiving hospital.',
    },
    {
      id: 'faq-connectivity',
      question: 'What happens in rural zones with weak network connectivity?',
      answer: 'Our mobile client features an offline-first telemetry engine. In low-bandwidth areas (like edge 2G), the system compresses vitals and GPS coordinates into lightweight, secure SMS-based telemetry packets which are resolved on our gateway server, maintaining real-time routing even under extreme signal loss.',
    },
    {
      id: 'faq-integration',
      question: 'Can private hospital chains and municipal fleets integrate with this?',
      answer: 'Yes. JeevanRoute provides plug-and-play APIs and SDKs that easily connect with pre-existing telemetry hardware in modern ambulance fleets. Hospital ER dashboards operate as standalone web apps requiring zero local installation, or they can integrate into existing HMIS (Hospital Management Information Systems).',
    },
    {
      id: 'faq-failover',
      question: 'How fast is the auto-failover process during emergencies?',
      answer: 'If the initial receiving hospital does not confirm capacity within 60 seconds, our AI immediately triggers the routing cascade. The platform checks nearby alternatives in less than 500ms, pushes the vitals to the next best match, and triggers audible dashboard alerts for the new ER team.',
    },
  ]

  const stats = [
    {
      id: 'stat-response',
      value: '30% Faster',
      label: 'Response Time',
      description: 'Dynamic traffic rerouting and active green-corridor prompts save critical minutes when they matter most.',
      icon: Zap,
      accent: 'text-brand-red bg-brand-red/10 border-brand-red/20',
    },
    {
      id: 'stat-hospitals',
      value: '1,000+',
      label: 'Verified Hospitals',
      description: 'Integrated live telemetry feed linked directly with ICU, OT, and cardiac care departments nationwide.',
      icon: Building2,
      accent: 'text-medical-emerald bg-medical-emerald/10 border-medical-emerald/20',
    },
    {
      id: 'stat-triage',
      value: 'AI Triage',
      label: 'Real-time Routing',
      description: 'Patient vitals parsed en-route to automatically secure specific specialty unit allocations before arrival.',
      icon: Cpu,
      accent: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
  ]

  return (
    <div className="relative min-h-screen bg-brand-navy-dark text-gray-100 flex flex-col justify-between selection:bg-brand-red selection:text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-brand-navy-dark/80 backdrop-blur-md border-b border-white/5 py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-brand-red/10 border border-brand-red/30">
                <div className="absolute inset-0 rounded-lg bg-brand-red/20 blur-sm animate-pulse"></div>
                <Activity className="h-5.5 w-5.5 text-brand-red relative z-10" />
              </div>
              <span className="font-sans font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                JR <span className="text-gray-300 font-light">JeevanRoute</span>
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                About
              </a>
              <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                FAQ
              </a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="relative group overflow-hidden rounded-md bg-white text-brand-navy-dark font-medium text-xs px-4 py-2 transition-all duration-200 hover:bg-gray-100 active:scale-95 border border-white/10 cursor-pointer">
                Login / Register
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-brand-navy-dark/95 border-b border-white/5 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
              >
                Features
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
              >
                About
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
              >
                FAQ
              </a>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium bg-brand-red text-white text-center"
              >
                Login / Register
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen pt-32 pb-20 flex items-center justify-center overflow-hidden tech-grid" id="about">
          {/* Background glow points */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-red/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-red/5 blur-3xl pointer-events-none"></div>
          <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-medical-emerald/5 blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Text Column */}
              <div className="lg:col-span-7 text-left space-y-8">
                {/* Tagline Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold uppercase tracking-wider animate-pulse-soft">
                  <Siren className="h-3.5 w-3.5" />
                  Real-time Emergency Response System
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
                    Every Second Counts.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-brand-red">
                      Get to the Right Hospital.
                    </span>
                  </h1>
                  <p className="text-lg text-gray-400 max-w-xl font-light leading-relaxed">
                    AI-powered real-time routing for ambulances across India. Smart triage, live traffic optimization, and automated hospital alerts.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-red px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-red/20 hover:bg-brand-red/90 hover:shadow-brand-red/40 active:scale-98 transition-all duration-200"
                  >
                    Emergency Dispatch Portal
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:text-white transition-all duration-200"
                  >
                    Register Hospital
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="pt-6 border-t border-white/5 flex items-center gap-6">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border border-brand-navy bg-brand-navy-light flex items-center justify-center text-[10px] text-brand-red font-bold">1</div>
                    <div className="w-8 h-8 rounded-full border border-brand-navy bg-brand-navy-light flex items-center justify-center text-[10px] text-brand-red font-bold">2</div>
                    <div className="w-8 h-8 rounded-full border border-brand-navy bg-brand-navy-light flex items-center justify-center text-[10px] text-brand-red font-bold">3</div>
                  </div>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Trusted by 50+ municipal corporations, private hospitals, and government ambulance networks.
                  </p>
                </div>
              </div>

              {/* Right Dashboard Column */}
              <div className="lg:col-span-5 relative w-full max-w-[500px] lg:max-w-none mx-auto">
                {/* Visual Frame */}
                <div className="relative rounded-2xl border border-white/10 bg-brand-navy-dark/90 p-4 shadow-2xl overflow-hidden backdrop-blur-md">
                  {/* Scan Line effect */}
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-red/20 to-transparent animate-scan-line pointer-events-none"></div>

                  {/* Map Header Panel */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                      <span className="font-mono text-gray-300 font-medium">DISPATCH SYSTEM ACTV</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono">SYS STATUS: OK</span>
                      <Compass className="h-3.5 w-3.5 text-gray-500 animate-spin-slow" />
                    </div>
                  </div>

                  {/* SVG Graphic Map */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-brand-navy-dark border border-white/5">
                    <svg className="w-full h-full text-white" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Grid Lines */}
                      <g stroke="rgba(255,255,255,0.02)" strokeWidth="1">
                        {[...Array(12)].map((_, i) => (
                          <line key={`v-${i}`} x1={i * 35} y1="0" x2={i * 35} y2="300" />
                        ))}
                        {[...Array(9)].map((_, i) => (
                          <line key={`h-${i}`} x1="0" y1={i * 35} x2="400" y2={i * 35} />
                        ))}
                      </g>

                      {/* Route Paths (Roads) */}
                      <path d="M20,150 Q100,50 200,150 T380,150" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />
                      <path d="M50,280 C150,250 220,120 300,50" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />
                      <path d="M120,20 Q240,240 370,120" stroke="rgba(255,255,255,0.05)" strokeWidth="4" strokeLinecap="round" />

                      {/* Congested Route sections */}
                      <path d="M200,150 Q245,175 290,150" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />

                      {/* AI Optimized Route (Emergency Red Route Line) */}
                      <path d="M50,280 C150,250 208,142 225,123 L280,68" stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" className="animate-route-flow" id="route-line" />

                      {/* Radar Pulse / Hospital coverage */}
                      <circle cx="280" cy="68" r="8" fill="rgba(16, 185, 129, 0.2)" />
                      <circle cx="280" cy="68" r="16" stroke="#10B981" strokeWidth="1" strokeOpacity="0.5" className="origin-center scale-90 animate-radar-pulse" />
                      
                      {/* Hospitals (Verified Points) */}
                      <g transform="translate(280, 68)">
                        <circle cx="0" cy="0" r="6" fill="#10B981" />
                        <circle cx="0" cy="0" r="12" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" />
                      </g>
                      <g transform="translate(160, 210)">
                        <circle cx="0" cy="0" r="5" fill="#EF4444" />
                        <circle cx="0" cy="0" r="10" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.3" />
                      </g>
                      <g transform="translate(320, 180)">
                        <circle cx="0" cy="0" r="5" fill="#F59E0B" />
                        <circle cx="0" cy="0" r="10" stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.3" />
                      </g>

                      {/* Ambulance Marker */}
                      <g transform="translate(160, 203)">
                        <circle cx="0" cy="0" r="6" fill="#E11D48" className="animate-pulse" />
                        <polygon points="-4,4 0,-6 4,4" fill="#ffffff" transform="rotate(35)" />
                      </g>
                    </svg>

                    {/* On-Map Stats HUD Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 bg-brand-navy-dark/90 border border-white/10 rounded-lg p-3 backdrop-blur-md">
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="space-y-1">
                          <div className="text-gray-500">TARGET APEX</div>
                          <div className="text-white font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-medical-emerald"></span>
                            FORTIS HOSP. SEC-62
                          </div>
                          <div className="text-gray-500">TRAFFIC INDEX</div>
                          <div className="text-medical-emerald font-semibold">CLEAR (AI REROUTED)</div>
                        </div>
                        <div className="space-y-1 border-l border-white/5 pl-3">
                          <div className="text-gray-500">OPTIMIZED ETA</div>
                          <div className="text-brand-red font-bold text-xs">{formatEta(eta)}</div>
                          <div className="text-gray-500">HOSP. ALERTS SENT</div>
                          <div className="text-white flex items-center gap-1 text-[9px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping"></span>
                            SLOTS SECURED (CARDIAC)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tiny HUD Marker Target */}
                    <div className="absolute top-8 right-16 px-2 py-0.5 rounded bg-medical-emerald/10 border border-medical-emerald/20 text-medical-emerald font-mono text-[9px]">
                      VERIFIED DEPT
                    </div>
                  </div>

                  {/* Vitals Telemetry Drawer */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-brand-red/10">
                        <Activity className="h-4.5 w-4.5 text-brand-red animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-mono">LIVE TELEMETRY</p>
                        <p className="text-xs text-white font-mono font-medium">HR: 84bpm | SpO2: 96%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-mono">AMBULANCE ID</p>
                      <p className="text-xs text-white font-mono font-semibold">KA-51-EM-2384</p>
                    </div>
                  </div>

                </div>

                {/* Interactive map background floating accents */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm -rotate-6 shadow-lg shadow-black/30">
                  <ShieldAlert className="h-5 w-5 text-brand-red" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm rotate-12 shadow-lg shadow-black/30">
                  <Heart className="h-5 w-5 text-brand-red animate-pulse" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-12 bg-brand-navy-dark/40 border-y border-white/5 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div 
                    key={stat.id}
                    className="relative group rounded-xl border border-white/5 bg-brand-navy-light/20 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-brand-navy-light/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-red/5 overflow-hidden"
                  >
                    {/* Accent glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <span className="font-mono text-xs text-gray-500 font-medium tracking-wider uppercase">METRIC INDEX</span>
                        <h3 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                          {stat.value}
                        </h3>
                        <p className="text-sm font-semibold text-gray-200">
                          {stat.label}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-lg border ${stat.accent}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-gray-400 font-light">
                      {stat.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-24 bg-brand-navy-dark overflow-hidden">
          {/* Decorative side grid overlay */}
          <div className="absolute right-0 top-0 w-1/3 h-full bg-brand-red/[0.02] pointer-events-none blur-2xl"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="font-mono text-xs text-brand-red font-semibold uppercase tracking-widest">
                CORE PLATFORM FUNCTIONS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                Engineered for Crisis. Optimized for Life.
              </h2>
              <p className="text-sm sm:text-base text-gray-400 font-light">
                JeevanRoute replaces legacy emergency phone lines with intelligent, automated data pipelines that eliminate coordination friction.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-12 gap-6 lg:gap-8">
              
              {/* Card 1: AI Triage Engine */}
              <div className="col-span-12 lg:col-span-7 rounded-2xl border border-white/5 bg-brand-navy-light/10 p-6 sm:p-8 backdrop-blur-sm flex flex-col justify-between group hover:border-white/10 transition-all duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red">
                      <Brain className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-sans">AI Triage Engine</h3>
                  </div>
                  <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                    Analyzes live patient symptoms and vitals en-route to recommend matching hospitals. Checks department workloads, ICU bed availability, and live status of crucial equipment like CT scanners or ventilators.
                  </p>
                </div>

                {/* Visual Widget: Symptom Analysis UI */}
                <div className="rounded-xl border border-white/5 bg-brand-navy-dark/80 p-4 font-mono text-xs text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-gray-500">
                    <span>PRE-ARRIVAL DIAGNOSTICS</span>
                    <span className="text-brand-red flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                      ANALYZING
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-gray-500">PRIMARY SYMPTOMS</div>
                      <div className="text-white text-[11px] font-semibold">Acute Chest Pain, Dyspnea</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-500">EKG TELEMETRY</div>
                      <div className="text-brand-red text-[11px] font-semibold">STEMI Suspicion (High)</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Target Hospital Capability Match:</span>
                      <span className="text-medical-emerald font-semibold">98.2%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-medical-emerald/10 text-medical-emerald text-[9px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Cath Lab Active
                      </span>
                      <span className="px-2 py-0.5 rounded bg-medical-emerald/10 text-medical-emerald text-[9px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Cardiologist On-Site
                      </span>
                      <span className="px-2 py-0.5 rounded bg-medical-emerald/10 text-medical-emerald text-[9px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> ICU Beds Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Dynamic Routing */}
              <div className="col-span-12 lg:col-span-5 rounded-2xl border border-white/5 bg-brand-navy-light/10 p-6 sm:p-8 backdrop-blur-sm flex flex-col justify-between group hover:border-white/10 transition-all duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
                      <Navigation className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-sans">Dynamic Routing</h3>
                  </div>
                  <p className="text-sm text-gray-400 font-light leading-relaxed mb-6">
                    Real-time traffic ingestion and signal overrides pre-plan the fastest path, updating ETAs by the second to keep both paramedics and hospitals in sync.
                  </p>
                </div>

                {/* Visual Widget: Route Steps */}
                <div className="rounded-xl border border-white/5 bg-brand-navy-dark/80 p-4 font-mono text-xs text-left space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-gray-500">
                    <span>ACTIVE NAVIGATION TRACKER</span>
                    <span className="text-blue-400 font-semibold font-mono">REROUTING</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-gray-300">Outer Ring Rd (NH-44)</span>
                      </div>
                      <span className="text-gray-500">2.4 km</span>
                    </div>
                    <div className="pl-2 border-l border-brand-red/30 space-y-1.5 my-1">
                      <div className="text-[10px] text-brand-red flex items-center gap-1.5">
                        <ShieldAlert className="h-3 w-3" /> Gridlock at Toll Plaza (+9m delay)
                      </div>
                      <div className="text-[10px] text-medical-emerald flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" /> Diversion: Bypass Rd Approved
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white">
                      <span>OPTIMIZED TRANSIT TIME</span>
                      <span className="text-brand-red animate-pulse">11m 45s (-7m saved)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Auto-Failover Alerts */}
              <div className="col-span-12 rounded-2xl border border-white/5 bg-brand-navy-light/10 p-6 sm:p-8 backdrop-blur-sm group hover:border-white/10 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Text Area */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-medical-emerald/10 border border-medical-emerald/20 text-medical-emerald">
                        <RefreshCw className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white font-sans">Auto-Failover Alerts</h3>
                    </div>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">
                      Eliminates waiting. When an ambulance is routed, the target hospital is pinged. If the hospital doesn't accept the case within 60 seconds (due to workload spikes or staff issues), the system triggers auto-failover, alerting the next best matching ER.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-500 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-brand-red" />
                        <span>60s Response Deadline</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-medical-emerald" />
                        <span>Instant Re-Routing Cascade</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Widget: Failover Log Timeline */}
                  <div className="lg:col-span-5 w-full">
                    <div className="rounded-xl border border-white/5 bg-brand-navy-dark/80 p-4 font-mono text-xs text-left space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[10px] text-gray-500">
                        <span>ALERT FLOW SEC-99</span>
                        <span className="text-medical-emerald">ACTIVE CASCADE</span>
                      </div>
                      <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                        
                        {/* Step 1: Hospital A timeout */}
                        <div className="flex items-start gap-4 relative">
                          <div className="w-4 h-4 rounded-full bg-brand-red/20 border border-brand-red flex items-center justify-center text-[8px] text-brand-red font-bold z-10">
                            ✖
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-semibold">City Heart Hospital</span>
                              <span className="text-[9px] text-gray-500">Timeout (60s)</span>
                            </div>
                            <p className="text-[10px] text-gray-500">Cardiac unit overload reported. Auto-declined.</p>
                          </div>
                        </div>

                        {/* Step 2: Failover Broadcast */}
                        <div className="flex items-start gap-4 relative">
                          <div className="w-4 h-4 rounded-full bg-brand-red/20 border border-brand-red flex items-center justify-center z-10 animate-ping">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-brand-red font-bold">Auto-Failover Protocol</span>
                              <span className="text-[9px] text-brand-red font-bold">0.4s</span>
                            </div>
                            <p className="text-[10px] text-gray-500">Broadcasting vitals packet to alternative tier-1 centers.</p>
                          </div>
                        </div>

                        {/* Step 3: Hospital B Accepted */}
                        <div className="flex items-start gap-4 relative">
                          <div className="w-4 h-4 rounded-full bg-medical-emerald/20 border border-medical-emerald flex items-center justify-center text-[8px] text-medical-emerald font-bold z-10">
                            ✓
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-medical-emerald font-bold">Metro Super Specialty</span>
                              <span className="text-[9px] text-medical-emerald font-semibold">ACCEPTED</span>
                            </div>
                            <p className="text-[10px] text-gray-500">Cardiac bay reserved. ETA locking at 8 mins.</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative py-24 bg-brand-navy-dark/70 border-t border-white/5 overflow-hidden">
          {/* Background glow points */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-red/[0.02] blur-3xl pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Section Header */}
            <div className="text-center mb-16 space-y-4">
              <span className="font-mono text-xs text-brand-red font-semibold uppercase tracking-widest">
                OPERATIONAL CLEARANCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                Frequently Answered Questions
              </h2>
              <p className="text-sm text-gray-400 font-light">
                Understand how our medical dispatch tech secures slots, handles signal drops, and complies with healthcare regulations.
              </p>
            </div>

            {/* Accordion Group */}
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index
                return (
                  <div 
                    key={faq.id}
                    className="rounded-xl border border-white/5 bg-brand-navy-light/10 overflow-hidden transition-colors duration-200 hover:border-white/10"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-5 text-left text-white font-medium hover:bg-white/[0.02] transition-colors focus:outline-none"
                    >
                      <span className="flex items-center gap-3 text-sm sm:text-base font-semibold">
                        <HelpCircle className="h-4.5 w-4.5 text-brand-red flex-shrink-0" />
                        {faq.question}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                        isOpen ? 'transform rotate-180 text-brand-red' : ''
                      }`} />
                    </button>
                    
                    {/* Content Panel */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-60 border-t border-white/5 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="p-5 text-xs sm:text-sm text-gray-400 font-light leading-relaxed bg-brand-navy-dark/40">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

function HelpCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-brand-navy-dark border-t border-white/5 pt-16 pb-8 overflow-hidden">
      {/* Footer Top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo & Description */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded bg-brand-red/10 border border-brand-red/30">
                <Activity className="h-4.5 w-4.5 text-brand-red" />
              </div>
              <span className="font-sans font-bold text-lg text-white">
                JR <span className="text-gray-300 font-light">JeevanRoute</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 font-light leading-relaxed max-w-sm">
              National AI-directed medical transit routing infrastructure. Streamlining dispatch networks, securing emergency admissions, and optimizing transit routes to protect lives.
            </p>
            {/* Active Status Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-medical-emerald/10 border border-medical-emerald/20 text-medical-emerald text-[10px] font-mono">
              <CheckCircle2 className="h-3.5 w-3.5" />
              SYSTEM STATUS: ALL NETWORKS NOMINAL
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-widest uppercase font-mono">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">Platform Features</a>
              </li>
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors font-light">About Platform</a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors font-light">FAQ & Compliance</a>
              </li>
            </ul>
          </div>

          {/* Active Contact Indicators */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-widest uppercase font-mono">Dispatch & Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4 text-brand-red flex-shrink-0" />
                <span className="font-mono text-white font-medium">1800-999-ROUTE</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4 text-brand-red flex-shrink-0" />
                <span>ops@jeevanroute.in</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 items-start">
                <MapPin className="h-4 w-4 text-brand-red flex-shrink-0 mt-0.5" />
                <span>National Health Command HQ, New Delhi, India</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 text-center md:flex md:items-center md:justify-between text-[11px] text-gray-500">
        <p>© {currentYear} JeevanRoute Tech. All rights reserved.</p>
        <p className="mt-2 md:mt-0 font-light">
          Approved for emergency medical coordination operations by NDHM & NDMA protocols.
        </p>
      </div>
    </footer>
  )
}
