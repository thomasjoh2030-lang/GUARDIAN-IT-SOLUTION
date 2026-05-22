import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, 
  Cpu, 
  ClipboardList, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  Image as ImageIcon,
  DollarSign, 
  Bell, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Hash,
  Paperclip,
  Activity,
  Send
} from 'lucide-react';
import { Service, Order, SupportTicket, UserProfile, ThemeConfig, Notification } from '../types';
import LucideIcon from './LucideIcon';

interface UserDashboardProps {
  user: UserProfile;
  services: Service[];
  orders: Order[];
  tickets: SupportTicket[];
  notifications: Notification[];
  theme: ThemeConfig;
  onLogout: () => void;
  onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard' | 'admin') => void;
  onPlaceOrder: (serviceId: string, serviceTitle: string, price: number, formData: Record<string, string>) => Promise<Order>;
  onSubmitPaymentProof: (orderId: string, proof: { name: string; email: string; phone: string; txId: string; screenshot: string }) => Promise<void>;
  onAddTicket: (subject: string, firstMessage: string) => Promise<void>;
  onReplyTicket: (ticketId: string, message: string) => Promise<void>;
  onMarkNotificationRead: (notifId: string) => void;
  isDarkMode: boolean;
  onToggleAdminConvenience: (userId: string) => Promise<void>;
  currency: 'USD' | 'TZS';
  onCurrencyChange: (currency: 'USD' | 'TZS') => void;
}

export default function UserDashboard({
  user,
  services,
  orders,
  tickets,
  notifications,
  theme,
  onLogout,
  onNavigate,
  onPlaceOrder,
  onSubmitPaymentProof,
  onAddTicket,
  onReplyTicket,
  onMarkNotificationRead,
  isDarkMode,
  onToggleAdminConvenience,
  currency,
  onCurrencyChange
}: UserDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'catalog' | 'history' | 'support' | 'profile'>('catalog');

  const formatPrice = (usdAmount: number) => {
    if (currency === 'TZS') {
      return `Tsh ${(usdAmount * 2600).toLocaleString()}`;
    }
    return `$${usdAmount.toLocaleString()}`;
  };

  // Order workflow states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeOrderFormId, setActiveOrderFormId] = useState<string | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Record<string, string>>({});
  const [currentPlacingOrder, setCurrentPlacingOrder] = useState<Order | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Payment upload states
  const [uploadedScreenshotBase64, setUploadedScreenshotBase64] = useState<string>("");
  const [paymentName, setPaymentName] = useState(user.username);
  const [paymentEmail, setPaymentEmail] = useState(user.email);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentTxId, setPaymentTxId] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Support states
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isLodgingTicket, setIsLodgingTicket] = useState(false);

  // File Upload Helper to convert images to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2 MB limit. Please select a smaller digital file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceFormData(prev => ({
          ...prev,
          [fieldId]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Main payment proof screenshot handler
  const handlePaymentScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedScreenshotBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit dynamic form data to place order
  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Validate ALL dynamic fields based on their specified type
    for (const field of selectedService.fields) {
      const val = serviceFormData[field.id];

      // 1. Check required status
      if (field.required) {
        if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
          alert(`The field "${field.label}" is required. Please fill it before continuing.`);
          return;
        }
      }

      // 2. Type-specific validation
      if (val !== undefined && val !== null && typeof val === 'string' && val.trim() !== '') {
        const cleanVal = val.trim();

        if (field.type === 'email') {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(cleanVal)) {
            alert(`Please write a valid email address for "${field.label}" (e.g., mail@domain.com).`);
            return;
          }
        }

        else if (field.type === 'number') {
          if (isNaN(Number(cleanVal))) {
            alert(`The field "${field.label}" requires a valid numeric value.`);
            return;
          }
        }

        else if (field.type === 'date') {
          const parsedDate = Date.parse(cleanVal);
          if (isNaN(parsedDate)) {
            alert(`Please supply a valid calendar date format for "${field.label}".`);
            return;
          }
        }

        else if (field.type === 'password') {
          if (cleanVal.length < 4) {
            alert(`The security password for "${field.label}" should be at least 4 characters long.`);
            return;
          }
        }

        else if (field.type === 'image' || field.type === 'file') {
          if (!cleanVal.startsWith('data:')) {
            alert(`Internal payload structure for "${field.label}" is invalid. Please remove and re-load the file attachment.`);
            return;
          }
        }
      }
    }

    setSubmittingOrder(true);
    try {
      // Create initial order row
      const orderCreated = await onPlaceOrder(
        selectedService.id,
        selectedService.title,
        selectedService.price,
        serviceFormData
      );
      
      // Store current placed order, move directly to payment phase!
      setCurrentPlacingOrder(orderCreated);
      setSelectedService(null); // Close catalog modal
    } catch (err) {
      console.error(err);
      alert("Error generating service order session.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Submit payment proof screenshot + transactional details
  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPlacingOrder) return;

    if (!paymentEmail || !paymentEmail.trim()) {
      alert("Please provide the depositor email address.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(paymentEmail.trim())) {
      alert("Please specify a valid email address format (e.g. name@domain.com) for the depositor.");
      return;
    }

    if (!paymentTxId.trim()) {
      alert("Please provide the transaction hash or reference code.");
      return;
    }

    setSubmittingPayment(true);
    try {
      await onSubmitPaymentProof(currentPlacingOrder.id, {
        name: paymentName,
        email: paymentEmail,
        phone: paymentPhone,
        txId: paymentTxId,
        screenshot: uploadedScreenshotBase64 || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=150"
      });

      // Clear states
      setUploadedScreenshotBase64("");
      setPaymentPhone("");
      setPaymentTxId("");
      
      // Navigate to succes status animation
      setShowSuccessAnimation(true);
      setCurrentPlacingOrder(null);
    } catch (err) {
      console.error(err);
      alert("Error loading payment ledger proof.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Lodge Ticket
  const handleLodgeTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMessage.trim()) return;

    try {
      await onAddTicket(newTicketSubject, newTicketMessage);
      setNewTicketSubject("");
      setNewTicketMessage("");
      setIsLodgingTicket(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Ticket reply
  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      await onReplyTicket(selectedTicket.id, replyMessage);
      setReplyMessage("");
      // re-find ticket in update lists
      const freshTicket = tickets.find(t => t.id === selectedTicket.id);
      if (freshTicket) {
        setSelectedTicket(freshTicket);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Track status styles
  const statusColors = {
    pending: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    approved: 'bg-green-500/10 border-green-500/20 text-green-400',
    rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
  };

  return (
    <div className={`min-h-screen flex text-gray-200 ${isDarkMode ? 'bg-[#050505]' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* Cinematic Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* DASHBOARD SIDEBAR PANEL */}
      <aside className={`w-[260px] border-r z-10 hidden lg:flex flex-col flex-shrink-0 relative transition-colors ${isDarkMode ? 'bg-[#08080c] border-white/5' : 'bg-white border-gray-200'}`}>
        
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <span className="font-display font-extrabold text-[15px] tracking-tight text-white uppercase">
            GUARDIAN <span className="text-purple-500">INTEL</span>
          </span>
        </div>

        {/* User Identity short-brief */}
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold font-mono">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="text-left overflow-hidden">
              <span className="block text-sm font-semibold text-white truncate">{user.username}</span>
              <span className={`block text-[10px] font-mono tracking-wider ${user.role === 'admin' ? 'text-purple-400' : 'text-gray-500'} uppercase`}>
                {user.role === 'admin' ? 'SUPER ADMIN' : 'OPERATIVE NODE'}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="flex-1 p-4 space-y-1.5 text-left">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'catalog' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Cpu size={16} /> Services Catalog
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <ClipboardList size={16} /> Operational History
            {orders.length > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold text-gray-300">
                {orders.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('support')}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'support' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <MessageSquare size={16} /> Support Messages
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'profile' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Settings size={16} /> Operation Settings
          </button>

          {user.role === "admin" && (
            <div className="pt-4 border-t border-white/5 mt-4">
              <span className="px-4 text-[9px] uppercase font-mono tracking-widest text-purple-400 block mb-2">Systems Level</span>
              <button 
                onClick={() => onNavigate('admin')}
                className="w-full h-11 px-4 rounded-xl bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 flex items-center gap-3 text-xs font-semibold cursor-pointer transition-colors border border-purple-500/15"
              >
                <Server size={16} /> Admin Console
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="w-full h-11 px-4 rounded-xl hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 flex items-center gap-3 text-xs font-semibold cursor-pointer transition-all"
          >
            <LogOut size={16} /> Purge Session
          </button>
        </div>
      </aside>

      {/* MAIN MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-y-auto z-10">
        
        {/* Core Nav header bar */}
        <header className={`h-20 px-6 md:px-8 border-b flex items-center justify-between transition-colors ${isDarkMode ? 'bg-[#050508]/85 border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="text-left flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white">
              <ShieldCheck size={18} />
            </div>
            <span className="font-display font-black text-sm tracking-widest uppercase text-white">GUARDIAN</span>
          </div>

          <div className="hidden lg:flex flex-col text-left">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              {activeTab === 'catalog' && 'Operational catalog'}
              {activeTab === 'history' && 'Tactical Order ledger'}
              {activeTab === 'support' && 'Encrypted Live support chatroom'}
              {activeTab === 'profile' && 'Identity profiles & nodes'}
            </h2>
            <span className="text-[10px] font-mono text-gray-500">SERVER STATUS: GUARDIAN_SECURE_ENCRYPTION_HOSTED</span>
          </div>

          {/* Quick Info & Notifications Header Bar */}
          <div className="flex items-center gap-4">
            
            {/* Dynamic currency toggle buttons in dashboard */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1 mr-1">
              <button
                onClick={() => onCurrencyChange('USD')}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Use USD ($)"
              >
                USD ($)
              </button>
              <button
                onClick={() => onCurrencyChange('TZS')}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded transition-all cursor-pointer ${
                  currency === 'TZS' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title="Use Tanzanian Shilling (Tsh)"
              >
                TZS (Tsh)
              </button>
            </div>

            {/* Quick role-switch info for verification */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500">{user.email}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono capitalize tracking-wider ${user.role === 'admin' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/20' : 'bg-white/5 text-gray-400'}`}>
                {user.role}
              </span>
            </div>

            {/* Quick admin panel redirect button */}
            {user.role === "admin" && (
              <button 
                onClick={() => onNavigate('admin')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-mono block lg:hidden"
              >
                Admin Panel
              </button>
            )}

            {/* Logout mobile */}
            <button 
              onClick={onLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 lg:hidden text-gray-400 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* WORKSPACE MIDDLE BODY ELEMENT */}
        <div className="p-6 md:p-8 flex-1">

          {/* NOTIFICATION HUB ALERTS */}
          {notifications.filter(n => !n.read).slice(0, 2).map((notif) => (
            <div 
              key={notif.id}
              className="mb-4 p-4 rounded-xl border glass-panel border-purple-500/20 flex items-start gap-3 justify-between animate-fade-in"
            >
              <div className="flex items-start gap-2.5 text-left">
                <Bell size={16} className="text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-white leading-tight">{notif.title}</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">{notif.message}</span>
                </div>
              </div>
              <button 
                onClick={() => onMarkNotificationRead(notif.id)}
                className="text-gray-500 hover:text-gray-300 pointer"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* SWITCH CASE TABS */}
          <AnimatePresence mode="wait">
            
            {/* 1. SERVICES CATALOG */}
            {activeTab === 'catalog' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 rounded-2xl text-left border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-full bg-radial-gradient from-purple-500/5 to-transparent blur-2xl font-mono pointer-events-none" />
                  <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-bold block mb-1">Operational Vectors</span>
                  <h3 className="text-xl md:text-2xl font-bold font-display text-white">Create Tactical Service Requests</h3>
                  <p className="text-xs text-gray-400 font-light mt-1 max-w-2xl">
                    Select any of the 12 verified digital frameworks below. File your account information on the dynamic custom form, proceed to manual vault deposit, and monitor live execution.
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {services.filter(s => s.enabled).map((service) => (
                    <div 
                      key={service.id}
                      className={`rounded-2xl border glass-panel border-white/5 p-6 text-left flex flex-col justify-between transition-all group ${service.isComingSoon ? "cursor-not-allowed opacity-90" : "hover:border-purple-500/40 cursor-pointer"}`}
                      onClick={() => {
                        if (service.isComingSoon) {
                          return;
                        }
                        setSelectedService(service);
                        setServiceFormData({});
                      }}
                    >
                      <div>
                        {service.imageUrl && (
                          <div className="w-full h-36 rounded-xl overflow-hidden border border-white/5 mb-4 shrink-0 bg-black/20">
                            <img 
                              src={service.imageUrl} 
                              alt={service.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-5">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/15 text-purple-400">
                            <LucideIcon name={service.icon} size={20} />
                          </div>
                          {service.isComingSoon ? (
                            <span className="text-[10px] px-2.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 font-mono text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                              Coming Soon
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-gray-400">
                              {service.timeframe}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">{service.title}</h4>
                        <p className="text-xs font-light text-gray-400 line-clamp-3 leading-relaxed mb-6">{service.description}</p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-mono text-gray-500 block">Service price</span>
                          <span className="text-lg font-bold text-white">{formatPrice(service.price)}</span>
                        </div>
                        {service.isComingSoon ? (
                          <button 
                            disabled
                            className="h-9 px-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-xs flex items-center gap-1 cursor-not-allowed uppercase font-mono"
                          >
                            Coming Soon
                          </button>
                        ) : (
                          <button className="h-9 px-4 rounded-lg bg-purple-600 group-hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors">
                            Configure <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. ORDER HISTORY */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6 rounded-2xl text-left border-white/5">
                  <h3 className="text-lg font-bold text-white">Your Placed Operations</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Trace all filed request parameters, verify upload states, and view structural responses from the administration vault.
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
                    <ClipboardList className="text-gray-600 mb-2" size={32} />
                    <p className="text-xs text-gray-500 font-mono">No operations lodged yet. Visit Catalog to initiate.</p>
                  </div>
                ) : (
                  <div className="border border-white/5 rounded-2xl overflow-hidden glass-panel">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">ORDER ID</th>
                            <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">SERVICE BRIEF</th>
                            <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">PRICE RATE</th>
                            <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">ORDER DATE</th>
                            <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">STATUS</th>
                            <th className="p-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {orders.slice().reverse().map((order) => (
                            <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 font-mono text-xs text-gray-400 font-bold">
                                #{order.id.replace("ord_", "").toUpperCase()}
                              </td>
                              <td className="p-4">
                                <span className="block text-xs font-semibold text-white">{order.serviceTitle}</span>
                              </td>
                              <td className="p-4 text-xs font-mono text-white font-bold">
                                {formatPrice(order.price)}
                              </td>
                              <td className="p-4 text-xs font-mono text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider border font-bold uppercase ${statusColors[order.status]}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-4">
                                {order.status === "pending" && !order.paymentProofTxId ? (
                                  <button
                                    onClick={() => setCurrentPlacingOrder(order)}
                                    className="px-2.5 py-1 rounded bg-amber-500 text-black text-[10px] font-bold cursor-pointer hover:bg-amber-400"
                                  >
                                    Pay Now
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      // Toggle simple details modal
                                      alert(`Operational specs for Order #${order.id.toUpperCase()}:\n\n- Service: ${order.serviceTitle}\n- Status: ${order.status.toUpperCase()}\n- Submitted Fields:\n${JSON.stringify(order.formData, null, 2)}\n\n${order.rejectionReason ? `- Rejection Reason: ${order.rejectionReason}` : ''}`);
                                    }}
                                    className="px-2.5 py-1 rounded bg-white/5 text-gray-300 text-[10px] font-medium cursor-pointer hover:bg-white/10"
                                  >
                                    View Specs
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. SUPPORT MESSAGES */}
            {activeTab === 'support' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                
                {/* Tickets list */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="glass-panel p-4 rounded-xl border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Tickets Inbox</h4>
                      <p className="text-[10px] text-gray-500">Direct query lines</p>
                    </div>
                    <button
                      onClick={() => setIsLodgingTicket(true)}
                      className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold cursor-pointer"
                    >
                      + File Ticket
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[450px] overflow-y-auto">
                    {tickets.length === 0 ? (
                      <p className="text-[11px] text-gray-500 text-center py-8">No tickets logged.</p>
                    ) : (
                      tickets.map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'}`}
                        >
                          <span className="block text-xs font-bold text-white truncate">{ticket.subject}</span>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[10px] font-mono text-gray-500">
                              {new Date(ticket.updatedAt).toLocaleDateString()}
                            </span>
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${ticket.status === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-gray-500'}`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Active Chat box */}
                <div className="lg:col-span-8">
                  {selectedTicket ? (
                    <div className="border border-white/5 rounded-2xl glass-panel h-[500px] flex flex-col justify-between">
                      
                      {/* Chat Header */}
                      <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-white block">{selectedTicket.subject}</span>
                          <span className="text-[9px] font-mono text-gray-500">Ticket ID: {selectedTicket.id}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedTicket(null)}
                          className="text-gray-500 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Chat Body */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {selectedTicket.messages.map((msg, idx) => (
                          <div 
                            key={idx}
                            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                          >
                            <span className="text-[9px] text-gray-500 font-mono mb-1 capitalize">
                              {msg.sender === 'user' ? 'Operator' : 'Guardian Admin'}
                            </span>
                            <div className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/[0.05] text-gray-200 rounded-tl-none'}`}>
                              {msg.content}
                            </div>
                            <span className="text-[8px] font-mono text-gray-600 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Chat Footer Reply Form */}
                      <form onSubmit={handleReplyTicket} className="p-4 border-t border-white/5 flex gap-2">
                        <input
                          type="text"
                          required
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Decrypt message and respond..."
                          className="flex-1 h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="submit"
                          className="w-12 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center cursor-pointer shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </form>

                    </div>
                  ) : (
                    <div className="h-[500px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                      <MessageSquare className="text-gray-700 mb-2" size={32} />
                      <p className="text-xs text-gray-500">Select a Support ticket file to decrypt transmission stream.</p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* 4. PROFILE & CONVENIENCE SWITCH */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto space-y-6 text-left"
              >
                <div className="glass-panel p-6 rounded-2xl border-white/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold font-mono">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{user.username}</h3>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">System Identity Code</span>
                      <span className="font-mono text-gray-500 select-all">{user.uid}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Security Clearance</span>
                      <span className="font-mono text-purple-400 uppercase font-bold">{user.role} CODE</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Registered At</span>
                      <span className="font-mono text-gray-500">{new Date(user.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>


              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* --- WORKFLOW MODAL 1: PLACE ORDER DYNAMIC FORM --- */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl glass-panel text-left p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="inline-flex gap-2 items-center text-xs text-purple-400 font-mono uppercase mb-1">
                    <LucideIcon name={selectedService.icon} size={14} /> Configuring Service File
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedService.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Please fill your account values below. Cost: {formatPrice(selectedService.price)}</p>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="p-1 rounded-lg bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl mb-6 text-xs leading-relaxed text-gray-300">
                {selectedService.longDescription}
              </div>

              {/* Form starts */}
              <form onSubmit={handleInitiateOrder} className="space-y-4">
                {selectedService.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-[11px] font-mono text-gray-400 mb-2 uppercase">
                      {field.label} {field.required && <span className="text-purple-500">*</span>}
                    </label>

                    {field.type === "notes" ? (
                      <textarea
                        required={field.required}
                        rows={3}
                        placeholder={field.placeholder || "Enter details here..."}
                        onChange={(e) => setServiceFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        className="w-full p-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    ) : field.type === "image" || field.type === "file" ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center p-6 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                          <input
                            type="file"
                            accept={field.type === "image" ? "image/*" : "*"}
                            required={field.required && !serviceFormData[field.id]}
                            onChange={(e) => handleFileChange(e, field.id)}
                            className="hidden"
                            id={`file-${field.id}`}
                          />
                          <label htmlFor={`file-${field.id}`} className="cursor-pointer flex flex-col items-center gap-1">
                            <Upload className="text-purple-400 mb-1" size={24} />
                            <span className="text-xs text-white">Select digital payload</span>
                            <span className="text-[10px] text-gray-500">Maximum limit: 2MB</span>
                          </label>
                        </div>
                        {serviceFormData[field.id] && (
                          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg border border-white/5">
                            {field.type === "image" ? (
                              <img src={serviceFormData[field.id]} alt="Attachment brief preview" className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <Paperclip className="text-purple-400" size={16} />
                            )}
                            <span className="text-[10px] text-gray-400 truncate">Payload Loaded Successfully</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder || `Enter ${field.label}...`}
                        onChange={(e) => setServiceFormData(prev => ({ ...prev, [field.id]: e.target.value }))}
                        className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full h-12 rounded-xl bg-white text-black hover:bg-gray-100 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingOrder ? "Staging order..." : "Continue to Payment Gate"} <ArrowRight size={14} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- WORKFLOW MODAL 2: MANUAL PAYMENT UPLOAD PANEL --- */}
      <AnimatePresence>
        {currentPlacingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl glass-panel text-left p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">Manual Settlement Vault</span>
                  <h3 className="text-lg font-bold text-white">Manual Payment Proof</h3>
                </div>
                <button 
                  onClick={() => setCurrentPlacingOrder(null)}
                  className="p-1 rounded bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Instructions Panel */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-6 text-xs text-gray-300 leading-relaxed space-y-3">
                <p className="font-semibold text-amber-400 uppercase tracking-wide">PAYMENT ROUTE DETAILED INFO</p>
                <p>{theme.manualPaymentInstructions}</p>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10 font-mono text-[11px] flex justify-between items-center">
                  <span>{theme.paymentNumber}</span>
                  <span className="text-[10px] text-purple-400 font-semibold">{theme.paymentNumberName}</span>
                </div>
              </div>

              {/* Vetting Detail Fields */}
              <form onSubmit={handleVerifyPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">DEPOSITOR NAME</label>
                    <input 
                      type="text" 
                      required 
                      value={paymentName}
                      onChange={(e) => setPaymentName(e.target.value)}
                      placeholder="Enter legal reference name" 
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">EMAIL ADRESS</label>
                    <input 
                      type="email" 
                      required 
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                      placeholder="e.g. buyer@gmail.com" 
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">PHONE STRING</label>
                    <input 
                      type="text" 
                      required 
                      value={paymentPhone}
                      onChange={(e) => setPaymentPhone(e.target.value)}
                      placeholder="Phone or wallet number" 
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">TRANSACTION HASH ID</label>
                    <input 
                      type="text" 
                      required 
                      value={paymentTxId}
                      onChange={(e) => setPaymentTxId(e.target.value)}
                      placeholder="Enter M-Pesa ID / Block hash" 
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Screenshot upload */}
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">UPLOAD SCREENSHOT SCREEN PROOF</label>
                  <div className="flex items-center justify-center p-6 border border-dashed border-white/10 rounded-xl bg-white/[0.01] hover:bg-white/[0.03]">
                    <input
                      type="file"
                      accept="image/*"
                      id="payment-screenshot"
                      required
                      onChange={handlePaymentScreenshotChange}
                      className="hidden"
                    />
                    <label htmlFor="payment-screenshot" className="cursor-pointer flex flex-col items-center">
                      <ImageIcon className="text-purple-400 mb-1" size={24} />
                      <span className="text-[11px] text-white font-semibold">Select Proof Digital Image</span>
                    </label>
                  </div>
                  {uploadedScreenshotBase64 && (
                    <div className="mt-3 p-2 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                      <img src={uploadedScreenshotBase64} alt="Payment screenshot proof" className="w-12 h-12 object-cover rounded-lg" />
                      <span className="text-[10px] text-green-400 font-mono">Proof Screenshot Linked Successfully</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingPayment ? "Validating cryptologies..." : "Submit Transaction coordinates"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CINEMATIC SUCCESS ANIMATION PAGE --- */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md text-center p-8 rounded-3xl glass-panel border-purple-500/20"
            >
              {/* Spinning/pulsating green lock radar */}
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/35 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full border-2 border-purple-500/10 animate-reverse-spin" />
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={32} />
                </div>
              </div>

              <h3 className="font-display font-black text-2xl text-white tracking-tight mb-4">DISPATCH ENCRYPTED</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light mb-8">
                “Your request has been received. Please wait while Guardian Internet support reviews your payment and contacts you.”
              </p>

              <button
                onClick={() => {
                  setShowSuccessAnimation(false);
                  setActiveTab('history'); // Navigate directly to orders log
                }}
                className="w-full h-11 rounded-lg bg-white text-black font-semibold text-xs hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Launch History Desk
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support ticket creation modal */}
      <AnimatePresence>
        {isLodgingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl glass-panel text-left p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-white">Create Support Incident</h3>
                <button 
                  onClick={() => setIsLodgingTicket(false)}
                  className="text-gray-500 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleLodgeTicket} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1.5">INCIDENT SUBJECT</label>
                  <input
                    type="text"
                    required
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    placeholder="e.g. Account recovery assistance needed"
                    className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1.5">INITIAL TRANSMISSION</label>
                  <textarea
                    required
                    rows={4}
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    placeholder="Enter detailed request support message..."
                    className="w-full p-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Dispatch Incident Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
