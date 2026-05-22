import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle, 
  LockKeyhole, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Zap, 
  Activity, 
  Play, 
  Award,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Lock,
  Menu,
  X
} from 'lucide-react';
import { Service, ThemeConfig } from '../types';
import LucideIcon from './LucideIcon';

interface LandingPageProps {
  services: Service[];
  theme: ThemeConfig;
  onSelectService: (service: Service) => void;
  onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard' | 'admin') => void;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  currency: 'USD' | 'TZS';
  onCurrencyChange: (currency: 'USD' | 'TZS') => void;
}

export default function LandingPage({
  services,
  theme,
  onSelectService,
  onNavigate,
  isAuthenticated,
  isDarkMode,
  currency,
  onCurrencyChange
}: LandingPageProps) {
  // Local state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [typedHeadline, setTypedHeadline] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const formatPrice = (usdAmount: number) => {
    if (currency === 'TZS') {
      return `Tsh ${(usdAmount * 2600).toLocaleString()}`;
    }
    return `$${usdAmount.toLocaleString()}`;
  };

  // Typewriter effect on heading
  useEffect(() => {
    let index = 0;
    const txt = theme.headlineText;
    setTypedHeadline("");
    const timer = setInterval(() => {
      if (index < txt.length) {
        setTypedHeadline((prev) => prev + txt.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [theme.headlineText]);

  // Testimonials
  const testimonials = [
    {
      name: "Sébastien Moretti",
      role: "VP of Engineering, Veloce Operations",
      text: "The website speed and dynamic React app architectures delivered by Guardian Internet have increased our team's operational conversions by 47%. Absolutely Apple-standard.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      name: "Elena Rostova",
      role: "Strategic Brand Director, Chronos Digital",
      text: "Securing our compromised premium TikTok accounts was resolved in less than 24 hours. Their cybersecurity recovery system is unmatched.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      name: "Kojo Adjei",
      role: "Founder, Zenith Media",
      text: "YouTube automation setup yielded profitable passive streams within 30 days. This platform behaves like a multi-million dollar tech startup.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    }
  ];

  // Carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // FAQs
  const faqs = [
    {
      q: "What is Guardian Internet's verification speed?",
      a: "For advanced services such as TikTok verification, standard turnaround is 3 to 7 business days, including complete strategic PR support."
    },
    {
      q: "How does the manual payment authorization work?",
      a: "Once you place a service request, you are navigated to our encryption-safe payment protocol page showing exact coordinates. You submit your local invoice code or transaction ID and proof screenshot. Admin verifies the currency on chain or ledger and activates your service within 60 minutes."
    },
    {
      q: "Are credentials stored securely on your server?",
      a: "Yes. All form-configured notes and temporary passwords are encrypted at rest. Once an operative completes the task, credentials are automatically purged from our databases."
    },
    {
      q: "Do you offer offline CCTV setups or networking?",
      a: "No. Guardian Internet is strictly an enterprise-grade cloud digital solutions, software, and marketing provider. We do not design offline CCTV systems or cafe facilities."
    },
    {
      q: "Can I cancel a service mid-integration?",
      a: "Yes, you can file a refund or state change via our integrated support chat desk in your user dashboard, subject to vetting by our strategic administrators."
    }
  ];

  const themeGradients = {
    violet: "from-violet-600 via-purple-700 to-indigo-900 border-violet-500 text-violet-400 bg-violet-500/10",
    emerald: "from-emerald-600 via-teal-700 to-cyan-900 border-emerald-500 text-emerald-400 bg-emerald-500/10",
    cyan: "from-cyan-600 via-blue-500 to-indigo-900 border-cyan-500 text-cyan-400 bg-cyan-500/10",
    rose: "from-rose-600 via-pink-700 to-purple-950 border-rose-500 text-rose-400 bg-rose-500/10"
  };

  const selectedGradient = themeGradients[theme.primaryColor as keyof typeof themeGradients] || themeGradients.violet;

  return (
    <div className={`relative min-h-screen font-sans antialiased text-gray-200 transition-colors duration-500 ${isDarkMode ? 'bg-[#050505]' : 'bg-gray-50 text-gray-800'}`}>
      {isDarkMode && (
        <>
          <div className="canvas-glow" />
          <div className="canvas-glow-alt" />
        </>
      )}
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-35 overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b ${isDarkMode ? 'from-purple-900/10 to-transparent' : 'from-indigo-600/5 to-transparent'}`} />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)]'} bg-[size:32px_32px]`} />
      </div>

      {/* Modern High-End Header Navbar */}
      <nav className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${isDarkMode ? 'bg-[#050505]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedGradient} flex items-center justify-center border shadow-lg shadow-purple-500/20`}>
              <ShieldCheck className="text-white" size={22} />
            </div>
            <span className="font-display font-black tracking-[-0.04em] text-xl text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" /> GUARDIAN INTERNET
            </span>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className={`text-sm font-medium hover:text-purple-400 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Services</a>
            <a href="#why-choose-us" className={`text-sm font-medium hover:text-purple-400 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Integrity</a>
            <a href="#security" className={`text-sm font-medium hover:text-purple-400 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Security Protocol</a>
            <a href="#faqs" className={`text-sm font-medium hover:text-purple-400 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>FAQ Desk</a>
            <a href="#contact" className={`text-sm font-medium hover:text-purple-400 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Secure Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Dynamic currency quick toggle buttons */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 mr-2">
              <button
                onClick={() => onCurrencyChange('USD')}
                className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-purple-600 text-white' : 'text-gray-405 hover:text-white'
                }`}
                title="Use US Dollars"
              >
                USD ($)
              </button>
              <button
                onClick={() => onCurrencyChange('TZS')}
                className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                  currency === 'TZS' ? 'bg-purple-600 text-white' : 'text-gray-405 hover:text-white'
                }`}
                title="Use Tanzanian Shilling (Rate 2600/USD)"
              >
                TZS (Tsh)
              </button>
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-5 h-11 text-xs rounded-lg bg-white text-black font-semibold hover:bg-gray-100 flex items-center gap-2 border border-white hover:border-gray-200 shadow-md cursor-pointer transition-all active:scale-95"
              >
                Launch Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className={`text-sm font-medium hover:text-white transition-all cursor-pointer ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-5 h-11 text-xs rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-medium shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 cursor-pointer transition-all active:scale-95"
                >
                  Create Secure Identity
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburg */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full border-b bg-gray-950 flex flex-col p-6 gap-4 border-white/5 z-50 text-white"
            >
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-base text-gray-300 py-2">Services</a>
              <a href="#why-choose-us" onClick={() => setMobileMenuOpen(false)} className="text-base text-gray-300 py-2">Integrity Why Us</a>
              <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-base text-gray-300 py-2">Security Protocol</a>
              <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="text-base text-gray-300 py-2">Common Questions</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-base text-gray-300 py-2">Secure Desk</a>
              
              <div className="flex items-center justify-between py-2 border-t border-white/5 mt-2 pt-2">
                <span className="text-xs text-gray-400 font-mono">CURRENCY NODE:</span>
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                  <button
                    onClick={() => { onCurrencyChange('USD'); setMobileMenuOpen(false); }}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                      currency === 'USD' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => { onCurrencyChange('TZS'); setMobileMenuOpen(false); }}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                      currency === 'TZS' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    TZS
                  </button>
                </div>
              </div>

              <hr className="border-white/10" />

              {isAuthenticated ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('dashboard'); }}
                  className="w-full h-11 rounded-lg bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  Dashboard <ArrowRight size={14} />
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('login'); }}
                    className="w-full h-11 rounded-lg border border-white/10 text-gray-300 font-semibold text-xs cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onNavigate('register'); }}
                    className="w-full h-11 rounded-lg bg-purple-600 text-white font-semibold text-xs cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:py-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Cinematic Backdrop Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[700px] h-[350px] md:h-[700px] rounded-full blur-[100px] md:blur-[160px] opacity-15 pointer-events-none bg-purple-600" />
        <div className="absolute bottom-1/8 left-1/4 w-[300px] h-[300px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-cyan-500" />

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="status-badge inline-flex items-center gap-2 mb-8 tracking-wider uppercase"
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse" /> Zero-Trust Digital Services Vault
          </motion.div>

          {/* Core Dynamic Headline */}
          <h1 className="hero-title-bold mb-6 select-none">
            {typedHeadline}
            <span className="text-[#00F0FF] animate-pulse">|</span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-base md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {theme.subheadlineText}
          </motion.p>

          {/* Direct Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in"
          >
            <button
              onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'register')}
              className="btn-primary-bold w-full sm:w-auto px-10 h-14 text-sm flex items-center justify-center gap-3 cursor-pointer active:scale-95"
            >
              Order Premium Service <ArrowRight size={16} />
            </button>
            <a
              href="#services"
              className="btn-secondary-bold w-full sm:w-auto px-10 h-14 flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95"
            >
              Explore Cyber Solutions
            </a>
          </motion.div>

          {/* Floating Floating Terminal Window */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, type: 'spring' }}
            className="mt-16 md:mt-24 max-w-3xl mx-auto rounded-xl border glass-panel border-white/10 shadow-2xl p-4 md:p-6 overflow-hidden text-left shadow-purple-900/15"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">GUARDIAN_SECURE_VAULT_CORE.log</span>
              <div className="w-8 shrink-0" />
            </div>

            {/* Terminal lines */}
            <div className="font-mono text-xs text-gray-400 space-y-2 leading-relaxed">
              <p className="text-purple-400"><span className="text-gray-600">&gt;</span> GUARDIAN_INITIALIZE_SECURITY_PROTOCOL_STAGING</p>
              <p className="text-green-400"><span className="text-gray-600">&gt;</span> [SUCCESS] 256-Bit Cryptographic Vault Connected</p>
              <p><span className="text-gray-600">&gt;</span> SECURE PORTAL DEPLOYED ACROSS SERVER REGIONS SUCCESSFULLY</p>
              <p className="text-cyan-400"><span className="text-gray-600">&gt;</span> Services Active: Social Media Mgmt, TikTok Verification, Digital Marketing, AI Prompt Orchestration, App Production (excluding offline installations)</p>
              <div className="flex items-center gap-1.5 pt-1 text-gray-100 font-bold">
                <span className="text-purple-500 animate-pulse">&gt;</span>
                <span>Enter dashboard node: create secure credentials below...</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Active Service Showcase */}
      <section id="services" className={`py-20 md:py-28 px-6 border-t ${isDarkMode ? 'border-white/5 bg-[#050505]' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00F0FF]">DYNAMIC SELECTION PLATFORM</span>
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-[-0.04em] text-white uppercase mb-4">
              {isDarkMode ? 'Elite Operational Services' : 'Our Professional Solutions'}
            </h2>
            <p className={`text-sm md:text-base font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Guardian Internet designs, develops and automates your entire business presence. Select a vector block below to establish operations.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.filter(s => s.enabled).map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -6, scale: 1.01 }}
                onClick={() => onSelectService(service)}
                className={`relative rounded-2xl p-6 border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isDarkMode 
                    ? 'bg-white/[0.02] border-white/5 hover:border-purple-500/45 hover:bg-white/[0.04]' 
                    : 'bg-gray-50 border-gray-100 hover:border-purple-300 hover:bg-white hover:shadow-xl'
                }`}
              >
                {/* Glow Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all" />

                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
                      <LucideIcon name={service.icon} size={24} />
                    </div>
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                      {service.timeframe}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className={`text-xs font-light mb-6 line-clamp-3 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block">Invest cost</span>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                  <span className="text-xs text-purple-400 font-semibold group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    Order System <ArrowRight size={14} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className="py-20 md:py-28 px-6 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#00F0FF]">UNMATCHED INTEGRITY PROTOCOL</span>
              <h2 className="font-display font-black text-3xl md:text-5xl tracking-[-0.04em] text-white uppercase mt-3 mb-6">
                Why Elite Agencies Trust Guardian Internet
              </h2>
              <p className={`text-sm md:text-base font-light leading-relaxed mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We operate with the speed of an executive SWAT team. Client names, financial balances, and identity setups are treated with absolute secrecy under our state systems.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-purple-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Full-Stack Capability</h4>
                    <p className={`text-xs font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>We integrate clean React websites with lightning-fast cloud backend operations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-purple-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Zero Cloud Outsourcing</h4>
                    <p className={`text-xs font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Private codebases are designed in-house to protect proprietary code intellectual models.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-purple-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Advanced Form Builders</h4>
                    <p className={`text-xs font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Admin operators can instantly update service forms with no technical friction.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Stats Display */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl glass-panel text-left flex flex-col justify-between h-48">
                <Activity className="text-purple-400" size={28} />
                <div>
                  <span className="text-3xl font-extrabold text-white font-display">99.9%</span>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">Service Deployment Reliability</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-panel text-left flex flex-col justify-between h-48">
                <Users className="text-cyan-400" size={28} />
                <div>
                  <span className="text-3xl font-extrabold text-white font-display">4,200+</span>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">Global Operational Agents Served</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-panel text-left flex flex-col justify-between h-48">
                <LockKeyhole className="text-yellow-400" size={28} />
                <div>
                  <span className="text-3xl font-extrabold text-white font-display">Zero</span>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">Security Data Leak Incidents</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-panel text-left flex flex-col justify-between h-48 bg-gradient-to-br from-violet-950/20 to-purple-900/35 border-purple-500/20">
                <Award className="text-white" size={28} />
                <div>
                  <span className="text-xl font-bold text-white font-display block mb-1">Cyber-IT Accredited</span>
                  <p className="text-xs text-purple-300">Certified for high prestige enterprise systems integration.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Security & Privacy Section */}
      <section id="security" className="py-20 md:py-28 px-6 border-y border-white/5 bg-[#050505]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 text-left">
          <div className="md:w-1/2">
            <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-widest">CYBERSHIELD ARCHITECTURE</span>
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-[-0.04em] text-white uppercase mt-3 mb-6">
              Encrypted Operational Pipeline
            </h2>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light mb-6">
              Our manual vault verification mechanisms bypass automatic automated hacks. All client records and credentials are saved via sandbox nodes.
            </p>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Lock className="text-purple-400" size={20} />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Vault validation hashes ensure that no standard third party can view or access data. System admins hold master keys to grant physical clearance.
              </p>
            </div>
          </div>
          <div className="md:w-1/2 relative flex items-center justify-center">
            {/* Visual Abstract target radar panel */}
            <div className="w-72 h-72 rounded-full border border-purple-500/25 flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
              <div className="w-56 h-56 rounded-full border border-cyan-500/10 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border border-purple-500/5" />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 glass-panel border-purple-500/30 rounded-2xl flex items-center gap-4">
              <ShieldCheck className="text-green-400" size={36} />
              <div>
                <span className="block text-xs font-mono text-gray-500">VETTING SECURE</span>
                <span className="text-sm font-bold text-white font-mono uppercase tracking-wider">AES SECURE 256 LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#00F0FF]">OPERATIVE REVIEWS</span>
          <h2 className="font-display font-black text-3xl md:text-5xl tracking-[-0.04em] text-white uppercase mt-2 mb-12">Client Retrospective</h2>
          
          <div className="min-h-56 flex flex-col justify-center items-center">
            <p className="text-lg md:text-2xl font-light italic text-gray-300 max-w-2xl leading-relaxed mb-8">
              "{testimonials[testimonialIndex].text}"
            </p>
            <div className="flex items-center gap-3">
              <img 
                src={testimonials[testimonialIndex].avatar} 
                alt={testimonials[testimonialIndex].name} 
                className="w-12 h-12 rounded-full object-cover border border-purple-500/30"
              />
              <div className="text-left">
                <span className="block text-sm font-semibold text-white">{testimonials[testimonialIndex].name}</span>
                <span className="block text-xs text-gray-500">{testimonials[testimonialIndex].role}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${testimonialIndex === idx ? 'w-8 bg-purple-500' : 'bg-white/20'}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="py-20 md:py-28 px-6 bg-[#050505] border-t border-white/5">
        <div className="max-w-4xl mx-auto text-left">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00F0FF]">KNOWLEDGE DIRECTORY</span>
            <h2 className="font-display font-black text-3xl md:text-5xl tracking-[-0.04em] text-white uppercase mt-2 mb-4">FAQ Desk</h2>
            <p className="text-xs md:text-sm text-gray-400 font-light">Frequently encountered technical inquiries during service initialization protocols.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-white/5 rounded-2xl bg-white/[0.01] overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center bg-transparent cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp className="text-purple-400" size={18} /> : <ChevronDown className="text-gray-400" size={18} />}
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-white/[0.005]"
                    >
                      <p className="p-6 text-xs text-gray-400 font-light leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl glass-panel p-8 md:p-12 border-purple-500/10 flex flex-col lg:flex-row gap-12 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="lg:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-widest">DISPATCH TERMINAL</span>
                <h2 className="font-display font-black text-3xl md:text-5xl tracking-[-0.04em] text-white uppercase mt-3 mb-6">
                  Initiate Strategic Contact
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed font-light mb-8">
                  Get in touch with our security clearing representatives. For immediate responses, register and use the direct support channels in your console dashboard.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-mono">SUPPORT DESK</span>
                    <a href="mailto:support@guardian-internet.com" className="text-sm text-white hover:text-purple-400 transition-colors">support@guardian-internet.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-mono">ENCRYPTED VOICE STRING</span>
                    <span className="text-sm text-white font-mono">+1 (405) 555-GUARDS</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-mono">HEADQUARTER GRID</span>
                    <span className="text-sm text-white">Zone 4 Secure Citadel, Central Cyber Operations</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-xl">
              <form onSubmit={(e) => { e.preventDefault(); alert("Your secure message was logged. Register to start direct live tracking chat with security controllers."); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2">OPERATIVE NAME</label>
                  <input required placeholder="Enter name or agency code" type="text" className="w-full h-11 px-4 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2">EMAIL COORDINATE</label>
                  <input required placeholder="agent@agency.com" type="email" className="w-full h-11 px-4 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2">MESSAGE PAYLOAD</label>
                  <textarea rows={4} required placeholder="Enter tactical request brief description..." className="w-full p-4 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
                <button
                  type="submit"
                  className="btn-primary-bold w-full h-12 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  Send Encrypted Dispatch <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'login')}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-purple-800 border border-violet-500 text-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-purple-900/30"
          title="Direct Operative support"
        >
          <MessageSquare size={22} className="animate-pulse" />
        </button>
      </div>

      {/* Modern Premium Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#050505] px-6 text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <ShieldCheck className="text-purple-400" size={16} />
            </div>
            <span className="font-mono text-xs tracking-wider text-gray-400">
              © 2026 GUARDIAN INTERNET SECURITY OPERATIONS. ALL ARCHITECTURAL KEYRIGHTS GUARDED.
            </span>
          </div>

          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#services" className="hover:text-purple-400 transition-colors">Services Directory</a>
            <a href="#why-choose-us" className="hover:text-purple-400 transition-colors">Warrants & Audits</a>
            <a href="#security" className="hover:text-purple-400 transition-colors">Digital Accords</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
