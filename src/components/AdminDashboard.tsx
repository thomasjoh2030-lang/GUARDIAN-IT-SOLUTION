import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, 
  Cpu, 
  ClipboardList, 
  MessageSquare, 
  Settings, 
  User, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  Ban, 
  Activity, 
  DollarSign, 
  Users, 
  Bell, 
  Edit3, 
  Eye,
  FileText,
  TrendingUp,
  Sliders,
  Sparkles,
  Search,
  Check,
  Send,
  Lock,
  Globe,
  X,
  Menu,
  Mail,
  Phone,
  Calendar,
  Shield
} from 'lucide-react';
import { 
  Service, 
  Order, 
  SupportTicket, 
  UserProfile, 
  ThemeConfig, 
  SystemStats, 
  FormField 
} from '../types';
import LucideIcon, { availableIconsArray } from './LucideIcon';

interface AdminDashboardProps {
  user: UserProfile;
  services: Service[];
  orders: Order[];
  tickets: SupportTicket[];
  theme: ThemeConfig;
  stats: SystemStats;
  users: UserProfile[];
  onNavigate: (view: 'landing' | 'login' | 'register' | 'dashboard' | 'admin') => void;
  onCreateService: (serviceData: Omit<Service, 'id' | 'enabled'>) => Promise<void>;
  onUpdateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
  onApproveOrder: (id: string) => Promise<void>;
  onProcessOrder: (id: string) => Promise<void>;
  onApproveAllOrders: () => Promise<void>;
  onRejectOrder: (id: string, reason: string) => Promise<void>;
  onReplyTicket: (ticketId: string, reply: string) => Promise<void>;
  onUpdateTheme: (themeData: Partial<ThemeConfig>) => Promise<void>;
  onBanUser: (uid: string, isBanned: boolean) => Promise<void>;
  isDarkMode: boolean;
  currency: 'USD' | 'TZS';
  onCurrencyChange: (currency: 'USD' | 'TZS') => void;
}

export default function AdminDashboard({
  user,
  services,
  orders,
  tickets,
  theme,
  stats,
  users,
  onNavigate,
  onCreateService,
  onUpdateService,
  onDeleteService,
  onApproveOrder,
  onProcessOrder,
  onApproveAllOrders,
  onRejectOrder,
  onReplyTicket,
  onUpdateTheme,
  onBanUser,
  isDarkMode,
  currency,
  onCurrencyChange
}: AdminDashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'services' | 'users' | 'support' | 'customization'>('analytics');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const formatPrice = (usdAmount: number) => {
    if (currency === 'TZS') {
      return `Tsh ${(usdAmount * 2600).toLocaleString()}`;
    }
    return `$${usdAmount.toLocaleString()}`;
  };

  // Search & Filter states
  const [userSearch, setUserSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'approved' | 'rejected'>('all');

  // Interactive screenshot lightbox modal zoom preview
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  // User Profile details modal state
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserProfile | null>(null);

  // Service CRUD states
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServiceLongDesc, setNewServiceLongDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(199);
  const [newServiceTimeframe, setNewServiceTimeframe] = useState("3 - 5 Days");
  const [newServiceIcon, setNewServiceIcon] = useState("Cpu");
  const [newServiceFields, setNewServiceFields] = useState<FormField[]>([]);
  const [newServiceImageUrl, setNewServiceImageUrl] = useState("");
  const [newServiceIsComingSoon, setNewServiceIsComingSoon] = useState(false);

  // Field construction state
  const [currentFieldLabel, setCurrentFieldLabel] = useState("");
  const [currentFieldType, setCurrentFieldType] = useState<FormField['type']>("text");
  const [currentFieldRequired, setCurrentFieldRequired] = useState(true);

  // Rejection state
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  // Support state
  const [activeAdminTicket, setActiveAdminTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");

  // Theme customization state
  const [heroTitleText, setHeroTitleText] = useState(theme.headlineText);
  const [heroSubText, setHeroSubText] = useState(theme.subheadlineText);
  const [manualPaymentText, setManualPaymentText] = useState(theme.manualPaymentInstructions);
  const [paymentTargetNode, setPaymentTargetNode] = useState(theme.paymentNumber);
  const [paymentTargetLabel, setPaymentTargetLabel] = useState(theme.paymentNumberName);
  const [siteColorTone, setSiteColorTone] = useState(theme.primaryColor);
  const [isComingSoonEnabled, setIsComingSoonEnabled] = useState(!!theme.isComingSoonEnabled);
  const [opensAt, setOpensAt] = useState(theme.opensAt || "");
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(!!theme.isMaintenanceEnabled);

  // Security Activity Audit timeline
  const [adminActivityLogs, setAdminActivityLogs] = useState<Array<{ text: string; time: string }>>([
    { text: "Admin console unlocked by secure key authorization token.", time: new Date(Date.now() - 30 * 60000).toLocaleTimeString() },
    { text: "Operational statistics fetched from core database segment.", time: new Date(Date.now() - 25 * 60000).toLocaleTimeString() }
  ]);

  // Non-blocking user interfaces states for iframes
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 4000);
  };

  const triggerConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(null);
      }
    });
  };

  const logActivityAction = (phrase: string) => {
    setAdminActivityLogs(prev => [
      { text: phrase, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 8)
    ]);
  };

  // Field constructors
  const handleAddNewField = () => {
    if (!currentFieldLabel.trim()) {
      showToast("Please enter a field label name first.", "error");
      return;
    }
    
    // Prevent duplicated field label naming to avoid collision and confusion
    const isDuplicate = newServiceFields.some(
      f => f.label.toLowerCase().trim() === currentFieldLabel.toLowerCase().trim()
    );
    if (isDuplicate) {
      showToast(`A field named "${currentFieldLabel.trim()}" is already present in this service configuration.`, "error");
      return;
    }

    const newF: FormField = {
      id: "f_" + Math.random().toString(36).substr(2, 9),
      label: currentFieldLabel.trim(),
      type: currentFieldType,
      required: currentFieldRequired
    };
    setNewServiceFields(prev => [...prev, newF]);
    setCurrentFieldLabel("");
    showToast(`Added field "${newF.label}" (${newF.type}) successfully!`, "success");
  };

  const handleRemoveNewField = (fid: string) => {
    const target = newServiceFields.find(f => f.id === fid);
    setNewServiceFields(prev => prev.filter(f => f.id !== fid));
    if (target) {
      showToast(`Removed field "${target.label}"`, "info");
    }
  };

  // Submit complete service creation or update
  const handleCreateServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    if (newServiceFields.length === 0) {
      showToast("Services require at least one dynamic field input configuration.", "error");
      return;
    }

    try {
      if (editingService) {
        // Edit flow
        await onUpdateService(editingService.id, {
          title: newServiceName,
          description: newServiceDesc,
          longDescription: newServiceLongDesc || newServiceDesc,
          price: Number(newServicePrice),
          timeframe: newServiceTimeframe,
          icon: newServiceIcon,
          fields: newServiceFields,
          imageUrl: newServiceImageUrl,
          isComingSoon: newServiceIsComingSoon
        });
        logActivityAction(`Edited premium service config: ${newServiceName}`);
        showToast(`Successfully updated service "${newServiceName}"!`, "success");
      } else {
        // Create flow
        await onCreateService({
          title: newServiceName,
          description: newServiceDesc,
          longDescription: newServiceLongDesc || newServiceDesc,
          price: Number(newServicePrice),
          timeframe: newServiceTimeframe,
          icon: newServiceIcon,
          fields: newServiceFields,
          imageUrl: newServiceImageUrl,
          isComingSoon: newServiceIsComingSoon
        });
        logActivityAction(`Created new premium service config: ${newServiceName}`);
        showToast(`Successfully created service "${newServiceName}"!`, "success");
      }
      
      // Clear
      setEditingService(null);
      setNewServiceName("");
      setNewServiceDesc("");
      setNewServiceLongDesc("");
      setNewServicePrice(199);
      setNewServiceTimeframe("3 - 5 Days");
      setNewServiceIcon("Cpu");
      setNewServiceFields([]);
      setNewServiceImageUrl("");
      setNewServiceIsComingSoon(false);
      setShowAddServiceModal(false);
    } catch (err: any) {
      showToast(err.message || "Error submitting service.", "error");
    }
  };

  // Submit Website Customizer Change
  const handleSaveCustomization = async () => {
    try {
      await onUpdateTheme({
        headlineText: heroTitleText,
        subheadlineText: heroSubText,
        manualPaymentInstructions: manualPaymentText,
        paymentNumber: paymentTargetNode,
        paymentNumberName: paymentTargetLabel,
        primaryColor: siteColorTone,
        isComingSoonEnabled,
        opensAt,
        isMaintenanceEnabled
      });
      logActivityAction("Website content overrides, Coming Soon and Maintenance configurations set and saved successfully.");
      showToast("Guardian Internet aesthetic & mode specifications updated.", "success");
    } catch (err) {
      showToast("Error posting website customization update.", "error");
    }
  };

  // Approve payment verify action
  const handleApproveAction = (orderId: string, title: string) => {
    triggerConfirmation(
      "Confirm Order Vetting Approval",
      `Are you sure you want to approve manual transaction verification checks for: "${title}" (Order ID: #${orderId.substring(4)})? This will trigger automated live fulfillment actions.`,
      async () => {
        try {
          await onApproveOrder(orderId);
          logActivityAction(`Approved payment audit check for Order ID #${orderId.substring(4)} (${title})`);
          showToast(`Order approved successfully!`, "success");
        } catch (err: any) {
          showToast(err.message || "Error posting approval ledger.", "error");
        }
      }
    );
  };

  // Initiate process action
  const handleProcessAction = (orderId: string, title: string) => {
    triggerConfirmation(
      "Confirm Order Processing Status",
      `Are you sure you want to set the status of this order to "Processing"? This signifies the Operations Unit has accepted and is currently setting up the dynamic configuration parameters.`,
      async () => {
        try {
          await onProcessOrder(orderId);
          logActivityAction(`Initiated processing for Order ID #${orderId.substring(4)} (${title})`);
          showToast(`Order is now being processed.`, "success");
        } catch (err: any) {
          showToast(err.message || "Error setting order to processing.", "error");
        }
      }
    );
  };

  // Bulk approve action
  const handleApproveAllAction = async () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) {
      showToast("No pending payments registered for automatic vetting.", "info");
      return;
    }

    triggerConfirmation(
      "Confirm Bulk Vetting Approval",
      `Are you sure you want to approve all ${pendingOrders.length} pending payments in queue?`,
      async () => {
        try {
          await onApproveAllOrders();
          logActivityAction(`Executed Bulk Operation: Approved all ${pendingOrders.length} pending file elements.`);
          showToast(`Successfully approved all ${pendingOrders.length} pending payments.`, "success");
        } catch (err: any) {
          showToast(err.message || "Error committing bulk approval transaction.", "error");
        }
      }
    );
  };

  // Reject payment verify action
  const handleRejectAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder || !rejectionReasonInput.trim()) return;

    try {
      await onRejectOrder(rejectingOrder.id, rejectionReasonInput);
      logActivityAction(`Rejected payment proof for Order ID #${rejectingOrder.id.substring(4)}: ${rejectionReasonInput}`);
      setRejectingOrder(null);
      setRejectionReasonInput("");
      showToast("Payment proof rejected successfully.", "info");
    } catch (err: any) {
      showToast(err.message || "Error posting rejection ledger.", "error");
    }
  };

  // Reply ticket admin
  const handleReplyTicketAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdminTicket || !adminReplyText.trim()) return;

    try {
      await onReplyTicket(activeAdminTicket.id, adminReplyText);
      logActivityAction(`Replied to client ticket: "${activeAdminTicket.subject}"`);
      setAdminReplyText("");
      showToast("Support ticket response submitted.", "success");
      // re-fetch ticket state
      const freshTicket = tickets.find(t => t.id === activeAdminTicket.id);
      if (freshTicket) {
        setActiveAdminTicket(freshTicket);
      }
    } catch (err) {
      showToast("Error drafting support reply.", "error");
    }
  };

  // User ban toggle
  const handleBanToggle = async (uid: string, username: string, currentBanState: boolean) => {
    const actionPhrase = currentBanState ? "UNBAN" : "BAN";
    triggerConfirmation(
      `${actionPhrase} User Account Node`,
      `Are you sure you want to ${actionPhrase.toLowerCase()} the customer account for: "${username}"?`,
      async () => {
        try {
          await onBanUser(uid, !currentBanState);
          logActivityAction(`${actionPhrase} action verified on User identity node: ${username}`);
          showToast(`Successfully ${currentBanState ? 'unbanned' : 'banned'} user "${username}".`, "success");
        } catch (err) {
          showToast("Error targeting user banning operations.", "error");
        }
      }
    );
  };

  // Toggle active/inactive services
  const handleToggleServiceActive = async (service: Service) => {
    try {
      await onUpdateService(service.id, { enabled: !service.enabled });
      logActivityAction(`Service visibility toggled for: ${service.title}`);
      showToast(`Service "${service.title}" visibility toggled!`, "success");
    } catch (err) {
      showToast("Error setting service values.", "error");
    }
  };

  // Open edit modal and populate values
  const handleEditServiceClick = (service: Service) => {
    setEditingService(service);
    setNewServiceName(service.title);
    setNewServiceDesc(service.description);
    setNewServiceLongDesc(service.longDescription || service.description);
    setNewServicePrice(service.price);
    setNewServiceTimeframe(service.timeframe);
    setNewServiceIcon(service.icon);
    setNewServiceFields(service.fields || []);
    setNewServiceImageUrl(service.imageUrl || "");
    setNewServiceIsComingSoon(!!service.isComingSoon);
    setShowAddServiceModal(true);
  };

  // Delete Service completely
  const handleDeleteService = async (id: string, title: string) => {
    triggerConfirmation(
      "Confirm Permanent Service Purge",
      `Warning: You are about to permanently delete service "${title}" from the commercial catalog. This action cannot be undone.`,
      async () => {
        try {
          await onDeleteService(id);
          logActivityAction(`Purged service element: ${title}`);
          showToast(`Successfully deleted service "${title}".`, "success");
        } catch (err) {
          showToast("Error deleting service.", "error");
        }
      }
    );
  };

  const filteredOrders = orders.filter(o => orderFilter === 'all' || o.status === orderFilter);
  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div className={`min-h-screen flex text-gray-200 overflow-x-hidden ${isDarkMode ? 'bg-[#050505]' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* 1. ADMIN SIDEBAR NAVIGATION */}
      {/* Mobile Sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-[260px] border-r flex flex-col flex-shrink-0 transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDarkMode ? 'bg-[#050505] border-white/5' : 'bg-white border-gray-200'}
      `}>
        
        {/* Brand */}
        <div className="h-20 px-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black">
              <Server size={18} />
            </div>
            <span className="font-display font-bold text-[13px] tracking-wide text-white font-mono uppercase">
              GUARDIAN <span className="text-purple-500">ADMIN</span>
            </span>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/5 lg:hidden text-gray-500 hover:text-white cursor-pointer"
            title="Close navigation panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Console info */}
        <div className="p-4 border-b border-white/5 bg-purple-500/[0.02]">
          <span className="text-[10px] font-mono text-purple-400 block mb-1">AUDIT CLEARANCE</span>
          <span className="text-xs font-bold text-white block">SUPER ADMIN MODULE</span>
          <span className="text-[9px] text-gray-450 block mt-0.5 max-w-[220px] truncate">Ident: {user.email}</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1.5 text-left">
          <button 
            onClick={() => { setActiveTab('analytics'); setIsMobileSidebarOpen(false); }}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'analytics' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-450 hover:bg-white/5 hover:text-white'}`}
          >
            <Activity size={16} /> Analytics Dashboard
          </button>

          <button 
            onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'orders' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-450 hover:bg-white/5 hover:text-white'}`}
          >
            <ClipboardList size={16} /> Payment Auditing
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('services'); setIsMobileSidebarOpen(false); }}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'services' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-450 hover:bg-white/5 hover:text-white'}`}
          >
            <Cpu size={16} /> Services & Form Builder
          </button>

          <button 
            onClick={() => { setActiveTab('users'); setIsMobileSidebarOpen(false); }}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-450 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={16} /> User Management
          </button>

          <button 
            onClick={() => { setActiveTab('support'); setIsMobileSidebarOpen(false); }}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'support' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-450 hover:bg-white/5 hover:text-white'}`}
          >
            <MessageSquare size={16} /> Support Center
          </button>

          <button 
            onClick={() => { setActiveTab('customization'); setIsMobileSidebarOpen(false); }}
            className={`w-full h-11 px-4 rounded-xl flex items-center gap-3 text-xs font-medium cursor-pointer transition-colors ${activeTab === 'customization' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' : 'text-gray-450 hover:bg-white/5 hover:text-white'}`}
          >
            <Sliders size={16} /> Portal Overrides
          </button>
        </nav>

        {/* Exit admin console */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => { onNavigate('dashboard'); setIsMobileSidebarOpen(false); }}
            className="w-full h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-3 text-xs font-bold cursor-pointer transition-all"
          >
            <ArrowLeft size={16} /> Exit Admin Node
          </button>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTROLS CONTAINER */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-y-auto overflow-x-hidden">
        
        {/* Header bar */}
        <header className={`h-20 px-4 md:px-8 border-b flex items-center justify-between gap-3 transition-colors ${isDarkMode ? 'bg-[#050508]/85 border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 text-left overflow-hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`p-2 rounded-xl lg:hidden cursor-pointer flex-shrink-0 border transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'}`}
              title="Open Navigation Menu"
            >
              <Menu size={18} />
            </button>
            <div className="truncate">
              <h3 className={`text-xs md:text-sm font-semibold uppercase tracking-wider font-mono truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'analytics' && 'Operational Metrics Panel'}
                {activeTab === 'orders' && 'MANUAL PAYMENTS AUDITING'}
                {activeTab === 'services' && 'CUSTOM IT SERVICE CONSTRUCTOR'}
                {activeTab === 'users' && 'SECURITY USER NODE MONITORING'}
                {activeTab === 'support' && 'OUTSTANDING INCIDENT TICKETS'}
                {activeTab === 'customization' && 'PORTAL STYLE OVERRIDES'}
              </h3>
              <span className="text-[8px] md:text-[10px] text-gray-500 uppercase font-mono truncate block">AUTHORITY ROOT: ALL PERMISSIONS DEPLOYED SECURE</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Dynamic currency toggle buttons in admin panel */}
            <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5 font-mono">
              <button
                onClick={() => onCurrencyChange('USD')}
                className={`px-1.5 py-0.5 text-[8px] md:text-[9.5px] font-bold rounded transition-all cursor-pointer ${
                  currency === 'USD' ? 'bg-purple-600 text-white' : 'text-gray-450 hover:text-white'
                }`}
                title="Use USD ($)"
              >
                USD
              </button>
              <button
                onClick={() => onCurrencyChange('TZS')}
                className={`px-1.5 py-0.5 text-[8px] md:text-[9.5px] font-bold rounded transition-all cursor-pointer ${
                  currency === 'TZS' ? 'bg-purple-600 text-white' : 'text-gray-450 hover:text-white'
                }`}
                title="Use Tanzanian Shilling (Tsh)"
              >
                TZS
              </button>
            </div>

            <span className="hidden sm:inline-block text-[9px] font-mono text-green-400 px-2 py-0.5 rounded bg-green-500/5 border border-green-500/10 uppercase">● Live</span>
          </div>
        </header>

        {/* Center operational views */}
        <div className="p-4 md:p-8 flex-1">
          <AnimatePresence mode="wait">

            {/* A: ANALYTICS PORTAL SECTION */}
            {activeTab === 'analytics' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8 text-left"
              >
                {/* Visual Widgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {/* Revenue */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Core Revenue Vetted</span>
                      <span className="text-3xl font-extrabold text-white">{formatPrice(stats.totalRevenue)}</span>
                      <span className="block text-[10px] text-green-400 mt-2">Approved Ledgers stream</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                      <DollarSign size={22} />
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Total Operations Placed</span>
                      <span className="text-3xl font-extrabold text-white">{stats.totalOrders}</span>
                      <span className="block text-[10px] text-purple-400 mt-2">{stats.approvedOrders} Completed files</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <ClipboardList size={22} />
                    </div>
                  </div>

                  {/* Pending Checks */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Awaiting Vetting Proofs</span>
                      <span className="text-3xl font-extrabold text-yellow-400">{stats.pendingOrders}</span>
                      <span className="block text-[10px] text-yellow-400/70 mt-2">Awaiting Ledger screenshots</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-450 border border-yellow-500/20">
                      <Clock size={22} />
                    </div>
                  </div>

                  {/* Identity Nodes */}
                  <div className="glass-panel p-6 rounded-2xl border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 block uppercase mb-1">User Identities Online</span>
                      <span className="text-3xl font-extrabold text-cyan-400">{stats.totalUsers}</span>
                      <span className="block text-[10px] text-cyan-400 mt-2">Active security profiles</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                      <Users size={22} />
                    </div>
                  </div>
                </div>

                {/* Analytical custom Vector Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  <div className="lg:col-span-8 p-6 rounded-2xl glass-panel border-white/5 text-left flex flex-col justify-between">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white">Digital Transactions Flow Metric</h4>
                      <p className="text-[10px] text-gray-500">Bespoke Vector system representing ledger transactions logs</p>
                    </div>

                    {/* Vector representation of analytic bar columns */}
                    <div className="h-56 flex items-end justify-between px-4 pt-6 border-b border-white/5 pb-2">
                      <div className="flex flex-col items-center gap-2 w-12">
                        <div className="w-7 h-40 bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-lg shadow-lg shadow-purple-500/10" />
                        <span className="text-[9px] font-mono text-gray-400">SocMedia</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-12">
                        <div className="w-7 h-16 bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-lg shadow-lg shadow-purple-500/10" />
                        <span className="text-[9px] font-mono text-gray-400">TikTok</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-12">
                        <div className="w-7 h-48 bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-lg shadow-lg shadow-purple-500/10" />
                        <span className="text-[9px] font-mono text-gray-400">WebDev</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-12">
                        <div className="w-7 h-36 bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-lg shadow-lg shadow-purple-500/10" />
                        <span className="text-[9px] font-mono text-gray-400">MobileApp</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-12">
                        <div className="w-7 h-10 bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-lg shadow-lg shadow-purple-500/10" />
                        <span className="text-[9px] font-mono text-gray-400">Branding</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 w-12">
                        <div className="w-7 h-28 bg-gradient-to-t from-purple-800 to-purple-600 rounded-t-lg shadow-lg shadow-purple-500/10" />
                        <span className="text-[9px] font-mono text-gray-400 font-bold">AIPrompt</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 p-6 rounded-2xl glass-panel border-white/5 text-left">
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-purple-400 animate-pulse" /> security action logs
                    </h4>
                    <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                      {adminActivityLogs.map((log, idx) => (
                        <div key={idx} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-[11px]">
                          <p className="text-gray-300 leading-tight">{log.text}</p>
                          <span className="block text-[8px] font-mono text-purple-400 uppercase mt-1 tracking-wider">{log.time} - SECURE GATEWAY</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* B: PAYMENT VERIFICATION / ORDER AUDITING */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left"
              >
                <div className="glass-panel p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">Manual Vetting Center</h3>
                    <p className="text-xs text-slate-400 mt-1">Review bank screenshots, verify transaction hashes, and Approve or Reject client files.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {orders.filter(o => o.status === 'pending').length > 0 && (
                      <button
                        onClick={handleApproveAllAction}
                        className="px-4 h-9 bg-green-500 hover:bg-green-400 text-black text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-green-500/10 active:scale-95"
                      >
                        <CheckCircle size={14} /> Approve All Pending ({orders.filter(o => o.status === 'pending').length})
                      </button>
                    )}

                    <div className="flex gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/5">
                      {['all', 'pending', 'processing', 'approved', 'rejected'].map(filterVal => (
                        <button
                          key={filterVal}
                          onClick={() => setOrderFilter(filterVal as any)}
                          className={`px-3.5 h-7 rounded-lg text-[11px] font-mono capitalize tracking-wider cursor-pointer transition-all ${orderFilter === filterVal ? 'bg-purple-600 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          {filterVal === 'approved' ? 'Successful' : filterVal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* table list */}
                {filteredOrders.length === 0 ? (
                  <div className="h-64 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
                    <ClipboardList className="text-gray-600 mb-2" size={32} />
                    <p className="text-xs text-gray-500 font-mono">No matching operations registered in database state.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mobile Cards (visible on screens smaller than md) */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {filteredOrders.slice().reverse().map(order => {
                        const orderUser = users.find(u => u.uid === order.userId || u.email === order.userEmail);
                        const formDataCount = order.formData ? Object.keys(order.formData).length : 0;
                        return (
                          <div key={order.id} className="glass-panel p-4 rounded-xl border-white/5 space-y-3 relative text-left">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="block font-bold text-white uppercase tracking-tight text-xs">
                                  {order.paymentProofName || orderUser?.username || "Guest Customer"}
                                </span>
                                <span className="block text-[10px] text-gray-450 font-mono truncate max-w-[180px]">{order.userEmail}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider ${
                                order.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                                order.status === 'processing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/10' :
                                order.status === 'rejected' ? 'bg-rose-500/10 text-rose-450 border border-rose-550/15' : 
                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              }`}>
                                {order.status === 'approved' ? 'Successful' : order.status}
                              </span>
                            </div>

                            <div className="border-t border-white/[0.03] pt-3 space-y-1.5">
                              <div className="flex justify-between">
                                <span className="text-[10px] text-gray-400 font-mono">Package:</span>
                                <span className="font-bold text-purple-400 text-[11px]">{order.serviceTitle}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[10px] text-gray-400 font-mono">Price:</span>
                                <span className="text-[10px] font-mono text-slate-300">{formatPrice(order.price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[10px] text-gray-400 font-mono">Tx ID Ref:</span>
                                <span className="text-[10px] font-mono text-white select-all bg-white/5 px-1.5 py-0.5 rounded border border-white/5">{order.paymentProofTxId || 'NO_HASH_CODE'}</span>
                              </div>
                            </div>

                            {/* Custom form info fold */}
                            {formDataCount > 0 && (
                              <div className="p-2 rounded-lg bg-white/[0.01] border border-white/5 space-y-1 text-[10px]">
                                <div className="text-[8.5px] font-mono text-gray-500 uppercase">Form inputs:</div>
                                <div className="space-y-0.5 max-h-[70px] overflow-y-auto font-mono text-gray-400">
                                  {Object.entries(order.formData).map(([key, val]) => {
                                    const isFile = typeof val === 'string' && val.startsWith('data:');
                                    return (
                                      <div key={key} className="truncate">
                                        <span className="text-gray-500 uppercase">{key}:</span>{" "}
                                        {isFile ? <span className="text-purple-350 underline">[Uploaded file]</span> : String(val)}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Buttons and actions */}
                            <div className="border-t border-white/[0.03] pt-3 flex flex-wrap gap-2 justify-between items-center">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    if (orderUser) {
                                      setSelectedUserDetail(orderUser);
                                    } else {
                                      setSelectedUserDetail({
                                        uid: order.userId,
                                        email: order.userEmail,
                                        username: order.paymentProofName || "Guest",
                                        role: 'user',
                                        phone: order.paymentProofPhone,
                                        createdAt: order.createdAt
                                      });
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-[9px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded cursor-pointer"
                                >
                                  <User size={10} /> View Profile
                                </button>
                                {order.paymentProofScreenshot && (
                                  <button 
                                    onClick={() => setPreviewOrder(order)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[9px] text-purple-400 bg-purple-500/10 rounded cursor-pointer"
                                  >
                                    <Eye size={10} /> Inspect
                                  </button>
                                )}
                              </div>

                              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                {order.status === "pending" && (
                                  <div className="grid grid-cols-3 gap-1.5 w-full">
                                    <button
                                      onClick={() => handleProcessAction(order.id, order.serviceTitle)}
                                      className="text-center py-1 bg-blue-600 text-white font-bold rounded text-[9px] cursor-pointer"
                                    >
                                      Process
                                    </button>
                                    <button
                                      onClick={() => handleApproveAction(order.id, order.serviceTitle)}
                                      className="text-center py-1 bg-green-500 text-black font-extrabold rounded text-[9px] cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRejectingOrder(order);
                                        setRejectionReasonInput("");
                                      }}
                                      className="text-center py-1 bg-rose-500/10 text-rose-400 font-semibold rounded text-[9px] cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {order.status === "processing" && (
                                  <div className="grid grid-cols-2 gap-1.5 w-full">
                                    <button
                                      onClick={() => handleApproveAction(order.id, order.serviceTitle)}
                                      className="text-center py-1 bg-green-500 text-black font-extrabold rounded text-[9px] cursor-pointer"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRejectingOrder(order);
                                        setRejectionReasonInput("");
                                      }}
                                      className="text-center py-1 bg-rose-500/10 text-rose-400 font-semibold rounded text-[9px] cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {order.status === "rejected" && (
                                  <p className="text-[9.5px] text-rose-400 italic font-mono">Reason: {order.rejectionReason}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table (hidden on mobile, visible on md+) */}
                    <div className="hidden md:block glass-panel border-white/5 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-gray-550 tracking-wider uppercase">
                              <th className="p-4">Client profile & link</th>
                              <th className="p-4">Package & Custom Form responses</th>
                              <th className="p-4">Payment TxID</th>
                              <th className="p-4">Screenshots</th>
                              <th className="p-4">Op Status</th>
                              <th className="p-4">Process Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                            {filteredOrders.slice().reverse().map(order => {
                              const orderUser = users.find(u => u.uid === order.userId || u.email === order.userEmail);
                              const formDataCount = order.formData ? Object.keys(order.formData).length : 0;

                              return (
                                <motion.tr 
                                  key={order.id} 
                                  layout
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.25 }}
                                  className="hover:bg-white/[0.01] transition-colors"
                                >
                                  
                                  {/* 1. Client profile & Link */}
                                  <td className="p-4">
                                    <div className="space-y-1">
                                      <span className="block font-bold text-white hover:text-purple-400 transition-colors uppercase tracking-tight">
                                        {order.paymentProofName || orderUser?.username || "Guest Customer"}
                                      </span>
                                      <span className="block text-[10.5px] text-gray-450 font-mono truncate max-w-[150px]">{order.userEmail}</span>
                                      {order.paymentProofPhone && (
                                        <span className="block text-[10px] font-mono text-gray-500">{order.paymentProofPhone}</span>
                                      )}
                                      <button
                                        onClick={() => {
                                          if (orderUser) {
                                            setSelectedUserDetail(orderUser);
                                          } else {
                                            setSelectedUserDetail({
                                              uid: order.userId,
                                              email: order.userEmail,
                                              username: order.paymentProofName || "Guest",
                                              role: 'user',
                                              phone: order.paymentProofPhone,
                                              createdAt: order.createdAt
                                            });
                                          }
                                        }}
                                        className="inline-flex items-center gap-1 mt-1 text-[10px] text-purple-400 hover:text-purple-300 cursor-pointer font-medium hover:underline bg-purple-500/10 px-2 py-0.5 rounded"
                                      >
                                        <User size={10} /> View Profile details
                                      </button>
                                    </div>
                                  </td>

                                  {/* 2. Package & Custom Form responses */}
                                  <td className="p-4">
                                    <div className="space-y-1.5 max-w-[280px]">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-purple-400 text-xs">{order.serviceTitle}</span>
                                        <span className="text-[10px] font-mono text-slate-500">{formatPrice(order.price)}</span>
                                      </div>
                                      
                                      {/* Compact list of form responses */}
                                      {formDataCount > 0 ? (
                                        <div className="p-2 rounded-lg bg-white/[0.01] border border-white/5 space-y-1 text-[10.5px]">
                                          <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 uppercase border-b border-white/[0.03] pb-1">
                                            <span>Custom form inputs</span>
                                            <span className="text-purple-400">({formDataCount} fields)</span>
                                          </div>
                                          <div className="space-y-1 max-h-[85px] overflow-y-auto font-mono text-gray-400 pr-1">
                                            {Object.entries(order.formData).map(([key, val]) => {
                                              const isFile = typeof val === 'string' && val.startsWith('data:');
                                              return (
                                                <div key={key} className="truncate text-[10px]">
                                                  <span className="text-gray-500 font-semibold uppercase">{key}:</span>{" "}
                                                  {isFile ? <span className="text-purple-300 underline">[Uploaded file]</span> : String(val)}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-gray-650 italic font-mono block">No extra details submitted</span>
                                      )}

                                      <button 
                                        onClick={() => setPreviewOrder(order)}
                                        className="inline-flex items-center gap-1 text-[9.5px] text-purple-400 hover:underline cursor-pointer"
                                      >
                                        <ClipboardList size={11} /> Open full forms & files view
                                      </button>
                                    </div>
                                  </td>

                                  {/* 3. Transaction ID Referral */}
                                  <td className="p-4">
                                    <span className="font-mono text-white text-xs select-all bg-white/5 px-2 py-1 rounded border border-white/5 block w-fit">
                                      {order.paymentProofTxId || 'NO_HASH_CODE'}
                                    </span>
                                  </td>

                                  {/* 4. Document screenshot */}
                                  <td className="p-4">
                                    {order.paymentProofScreenshot ? (
                                      <div className="flex items-center gap-1.5">
                                        <button 
                                          onClick={() => setPreviewOrder(order)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/15 rounded-lg border border-purple-500/20 cursor-pointer transition-all"
                                        >
                                          <Eye size={11} /> Inspect Page
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-gray-550 italic font-mono">No Slip Uploaded</span>
                                    )}
                                  </td>

                                  {/* 5. Operational Status */}
                                  <td className="p-4 font-mono">
                                    <AnimatePresence mode="wait">
                                      <motion.div
                                        key={order.status}
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.6 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                      >
                                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider block w-fit ${
                                          order.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/10' :
                                          order.status === 'processing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/10' :
                                          order.status === 'rejected' ? 'bg-rose-500/10 text-rose-450 border border-rose-550/15' : 
                                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        }`}>
                                          {order.status === 'approved' ? 'Successful' : order.status}
                                        </span>
                                      </motion.div>
                                    </AnimatePresence>
                                  </td>

                                  {/* 6. Decision Controllers */}
                                  <td className="p-4">
                                    <div className="min-w-[130px]">
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={order.status}
                                          initial={{ opacity: 0, scale: 0.85 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.85 }}
                                          transition={{ duration: 0.22, ease: "easeOut" }}
                                          className="space-y-1.5"
                                        >
                                          
                                          {/* Action button states based on status */}
                                          {order.status === "pending" && (
                                            <div className="flex flex-col gap-1.5">
                                              <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleProcessAction(order.id, order.serviceTitle)}
                                                className="w-full text-center h-7 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px] cursor-pointer transition-colors"
                                              >
                                                Start Process
                                              </motion.button>
                                              <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleApproveAction(order.id, order.serviceTitle)}
                                                className="w-full text-center h-7 px-2 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded text-[10px] cursor-pointer transition-colors"
                                              >
                                                Successful
                                              </motion.button>
                                              <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => {
                                                  setRejectingOrder(order);
                                                  setRejectionReasonInput("");
                                                }}
                                                className="w-full text-center h-7 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded text-[10px] cursor-pointer transition-colors"
                                              >
                                                Reject Payment
                                              </motion.button>
                                            </div>
                                          )}

                                          {order.status === "processing" && (
                                            <div className="flex flex-col gap-1.5">
                                              <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleApproveAction(order.id, order.serviceTitle)}
                                                className="w-full text-center h-7 px-2 bg-green-500 hover:bg-green-400 text-black font-extrabold rounded text-[10px] cursor-pointer transition-colors"
                                              >
                                                Successful (Complete)
                                              </motion.button>
                                              <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => {
                                                  setRejectingOrder(order);
                                                  setRejectionReasonInput("");
                                                }}
                                                className="w-full text-center h-7 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold rounded text-[10px] cursor-pointer transition-colors"
                                              >
                                                Reject / Direct Cancel
                                              </motion.button>
                                            </div>
                                          )}

                                          {order.status === "rejected" && (
                                            <div className="space-y-1">
                                              <p className="text-[10px] text-rose-400 italic line-clamp-2 max-w-[150px]">Reason: {order.rejectionReason}</p>
                                              <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleProcessAction(order.id, order.serviceTitle)}
                                                className="text-[9px] font-semibold text-blue-400 hover:underline cursor-pointer block"
                                              >
                                                Re-evaluate & Processing
                                              </motion.button>
                                            </div>
                                          )}

                                          {order.status === "approved" && (
                                            <div className="text-[10px] text-green-400 font-medium space-y-1">
                                              <span>✔ Fully approved successful</span>
                                              <span className="block text-[9px] font-mono text-gray-550">Verified: {new Date(order.paymentVerifiedAt || order.createdAt).toLocaleDateString()}</span>
                                            </div>
                                          )}

                                        </motion.div>
                                      </AnimatePresence>
                                    </div>
                                  </td>

                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* C: SERVICES CRUD & FORM BUILDER */}
            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left"
              >
                <div className="glass-panel p-6 rounded-2xl flex justify-between items-center border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">Dynamic Form & Service builder</h3>
                    <p className="text-xs text-slate-400 mt-1">Deploy, disable or refine available commercial frameworks instantly.</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingService(null);
                      setNewServiceName("");
                      setNewServiceDesc("");
                      setNewServiceLongDesc("");
                      setNewServicePrice(199);
                      setNewServiceTimeframe("3 - 5 Days");
                      setNewServiceIcon("Cpu");
                      setNewServiceFields([]);
                      setNewServiceImageUrl("");
                      setNewServiceIsComingSoon(false);
                      setShowAddServiceModal(true);
                    }}
                    className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Plus size={16} /> Deploy New Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map(ser => (
                    <div key={ser.id} className="p-6 rounded-2xl glass-panel text-left flex flex-col justify-between border-white/5">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                            <LucideIcon name={ser.icon} size={20} />
                          </div>

                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => handleToggleServiceActive(ser)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-colors shrink-0 ${ser.enabled ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'}`}
                            >
                              {ser.enabled ? 'Active' : 'Disabled'}
                            </button>
                            <button
                              onClick={() => handleEditServiceClick(ser)}
                              className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                              title="Edit service parameters"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteService(ser.id, ser.title)}
                              className="p-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                              title="Delete service"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-4 items-start">
                          {ser.imageUrl && (
                            <img 
                              src={ser.imageUrl} 
                              alt={ser.title} 
                              className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 bg-black/40"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                              {ser.title}
                              {ser.isComingSoon && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase shrink-0">Coming Soon</span>
                              )}
                            </h4>
                            <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed line-clamp-2">{ser.description}</p>
                            <span className="block text-lg font-bold text-purple-400 mt-2">{formatPrice(ser.price)}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
                          <span className="block text-[10px] font-mono uppercase text-gray-600">Configured custom Fields:</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {ser.fields.map((f, idx) => (
                              <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 capitalize">
                                {f.label} ({f.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* D: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 text-left"
              >
                <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">Identity database</h3>
                    <p className="text-xs text-slate-400 mt-1">Audit accounts, manage roles, and target banning operations if needed.</p>
                  </div>

                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search accounts credentials..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Mobile Users Cards List (under md) */}
                  <div className="grid grid-cols-1 gap-4 md:hidden">
                    {filteredUsers.map(u => (
                      <div key={u.uid} className="glass-panel p-4 rounded-xl border-white/5 space-y-3 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="block font-semibold text-white text-sm">{u.username}</span>
                            <span className="block text-[11px] font-mono text-gray-400">{u.email}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${u.role === 'admin' ? 'bg-purple-900/40 text-purple-300' : 'bg-white/5 text-gray-400'}`}>
                            {u.role}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] border-t border-white/[0.03] pt-3">
                          <span className="font-mono text-gray-500">ID: {u.uid}</span>
                          <div>
                            {u.isBanned ? (
                              <span className="text-rose-500 font-bold uppercase">● Banned</span>
                            ) : (
                              <span className="text-green-500">Active</span>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-white/[0.03] pt-3 flex gap-2">
                          <button
                            onClick={() => setSelectedUserDetail(u)}
                            className="flex-1 text-center py-2 rounded text-[10px] font-bold cursor-pointer bg-purple-500/15 text-purple-400"
                          >
                            View details
                          </button>
                          {u.uid !== "admin-default" && (
                            <button
                              onClick={() => handleBanToggle(u.uid, u.username, !!u.isBanned)}
                              className={`flex-1 text-center py-2 rounded text-[10px] font-bold cursor-pointer ${u.isBanned ? 'bg-green-500 text-black' : 'bg-rose-500/10 text-rose-400'}`}
                            >
                              {u.isBanned ? 'Remove Ban' : 'Ban Identity'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Users Table (hidden on mobile, visible on md+) */}
                  <div className="hidden md:block border border-white/5 rounded-2xl overflow-hidden glass-panel">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-gray-550 uppercase tracking-widest">
                            <th className="p-4">USER ID</th>
                            <th className="p-4">USERNAME</th>
                            <th className="p-4">EMAIL ADRESS</th>
                            <th className="p-4">CLEARANCE ROLE</th>
                            <th className="p-4">BANNED STATE</th>
                            <th className="p-4">SECURITY ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                          {filteredUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-white/[0.01] transition-colors">
                              <td className="p-4 font-mono font-bold text-gray-500">{u.uid}</td>
                              <td className="p-4 font-semibold text-white">{u.username}</td>
                              <td className="p-4 font-mono">{u.email}</td>
                              <td className="p-4 capitalize">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${u.role === 'admin' ? 'bg-purple-900/40 text-purple-300' : 'bg-white/5 text-gray-400'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="p-4 font-mono">
                                {u.isBanned ? (
                                  <span className="text-rose-500 font-bold uppercase">● Banned</span>
                                ) : (
                                  <span className="text-green-500">Active</span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => setSelectedUserDetail(u)}
                                    className="px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/15"
                                  >
                                    <User size={10} /> View details
                                  </button>
                                  {u.uid === "admin-default" ? (
                                    <span className="text-[10px] text-gray-600 self-center font-mono">Immutable</span>
                                  ) : (
                                    <button
                                      onClick={() => handleBanToggle(u.uid, u.username, !!u.isBanned)}
                                      className={`px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${u.isBanned ? 'bg-green-500 text-black' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'}`}
                                    >
                                      <Ban size={10} /> {u.isBanned ? 'Remove Ban' : 'Ban Identity'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* E: SUPPORT TICKETS REPLIER */}
            {activeTab === 'support' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                {/* Tickets list */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="glass-panel p-4 rounded-xl border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Active Support string</h4>
                    <span className="text-[10px] text-gray-500 uppercase">Incoming client files waiting</span>
                  </div>

                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                    {tickets.length === 0 ? (
                      <p className="text-[11px] text-gray-400 text-center py-6 block font-mono">Ledger is empty.</p>
                    ) : (
                      tickets.map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => setActiveAdminTicket(ticket)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${activeAdminTicket?.id === ticket.id ? 'bg-purple-500/10 border-purple-500/35' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}
                        >
                          <span className="block text-xs font-bold text-white truncate">{ticket.subject}</span>
                          <span className="block text-[10px] text-purple-400 font-mono mt-1">{ticket.userEmail}</span>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-[9px] font-mono text-gray-500">
                              {new Date(ticket.updatedAt).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase ${ticket.status === 'open' ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-gray-500'}`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Response portal */}
                <div className="lg:col-span-8">
                  {activeAdminTicket ? (
                    <div className="border border-white/5 rounded-2xl glass-panel h-[500px] flex flex-col justify-between">
                      
                      {/* Ticket top brief */}
                      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <div>
                          <span className="text-xs font-bold text-white block">{activeAdminTicket.subject}</span>
                          <span className="text-[10px] text-purple-400 block font-mono mt-0.5">Author email: {activeAdminTicket.userEmail}</span>
                        </div>
                        <button 
                          onClick={() => setActiveAdminTicket(null)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Chat string logs */}
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {activeAdminTicket.messages.map((m, idx) => (
                          <div key={idx} className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] text-gray-500 font-mono mb-1">
                              {m.sender === 'admin' ? 'Support Desk Reply' : `Client (${activeAdminTicket.userEmail})`}
                            </span>
                            <div className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${m.sender === 'admin' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/[0.05] text-gray-200 rounded-tl-none'}`}>
                              {m.content}
                            </div>
                            <span className="text-[8px] font-mono text-gray-600 mt-1">
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={handleReplyTicketAdmin} className="p-4 border-t border-white/5 flex gap-2">
                        <input
                          type="text"
                          required
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="Draft support override response..."
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
                      <p className="text-xs text-gray-500 font-mono">Select client ticket from Left block to start support operations.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* F: WEBSITE OVERRIDES & PAYMENTS STYLE CUSTOMIZER */}
            {activeTab === 'customization' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-4xl text-left space-y-6"
              >
                <div className="glass-panel p-6 rounded-2xl border-white/5">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Sparkles className="text-purple-400" size={18} /> Landing text & color customizer
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Override landing page displays, update Bitcoin/bank addresses, and adjust color schemes dynamically.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Headline & Color */}
                  <div className="p-6 rounded-2xl glass-panel space-y-4 border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Typography Overrides</h4>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">Hero main Title</label>
                      <input 
                        type="text" 
                        value={heroTitleText}
                        onChange={(e) => setHeroTitleText(e.target.value)}
                        className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">Hero detailed Subtitle</label>
                      <textarea 
                        rows={3}
                        value={heroSubText}
                        onChange={(e) => setHeroSubText(e.target.value)}
                        className="w-full p-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                      />
                    </div>

                    {/* Color schema */}
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase">Accent primary shade tone</label>
                      <select 
                        value={siteColorTone}
                        onChange={(e) => setSiteColorTone(e.target.value)}
                        className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none uppercase font-mono"
                      >
                        <option value="violet">Violet Glow</option>
                        <option value="emerald">Emerald Stealth</option>
                        <option value="cyan">Cyan Digital</option>
                        <option value="rose">Crimson Threat</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment instructions */}
                  <div className="p-6 rounded-2xl glass-panel space-y-4 border-white/5">
                    <h4 className="text-xs font-bold text-white uppercase font-mono">Manual payment gate settings</h4>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase font-mono">Settlement instruct text</label>
                      <textarea 
                        rows={4}
                        value={manualPaymentText}
                        onChange={(e) => setManualPaymentText(e.target.value)}
                        className="w-full p-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase font-mono">Gateway target info</label>
                        <input 
                          type="text" 
                          value={paymentTargetNode}
                          onChange={(e) => setPaymentTargetNode(e.target.value)}
                          className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-gray-500 mb-1.5 uppercase font-mono">Gateway account name</label>
                        <input 
                          type="text" 
                          value={paymentTargetLabel}
                          onChange={(e) => setPaymentTargetLabel(e.target.value)}
                          className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Operational Modes */}
                  <div className="p-6 rounded-2xl glass-panel space-y-4 border-white/5 animate-fade-in">
                    <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                      <Settings size={14} className="text-purple-400" /> Operational System Modes
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Coming Soon Settings */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-white block">Coming Soon Mode</span>
                            <span className="text-[10px] text-gray-400 font-light block">Only allows register, blocks login</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsComingSoonEnabled(!isComingSoonEnabled)}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 cursor-pointer ${isComingSoonEnabled ? 'bg-purple-600 justify-end' : 'bg-gray-800 justify-start'}`}
                          >
                            <span className="w-4 h-4 bg-white rounded-full block shadow" />
                          </button>
                        </div>

                        {isComingSoonEnabled && (
                          <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                            <label className="block text-[10px] font-mono text-gray-400 uppercase">Set Launch Date & Time</label>
                            <input
                              type="datetime-local"
                              value={opensAt}
                              onChange={(e) => setOpensAt(e.target.value)}
                              className="w-full h-10 px-3 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none font-mono"
                            />
                          </div>
                        )}
                      </div>

                      {/* Maintenance Settings */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-white block">System Maintenance Mode</span>
                            <span className="text-[10px] text-gray-400 font-light block">Blocks all standard app usage</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsMaintenanceEnabled(!isMaintenanceEnabled)}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 cursor-pointer ${isMaintenanceEnabled ? 'bg-rose-600 justify-end' : 'bg-gray-800 justify-start'}`}
                          >
                            <span className="w-4 h-4 bg-white rounded-full block shadow" />
                          </button>
                        </div>
                        <div className="text-[10px] text-rose-400 font-light leading-relaxed bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                          <strong>Warning:</strong> Turning on Maintenance Mode takes the whole system offline immediately for standard operatives. Only admins can authenticate to restore operations.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveCustomization}
                    className="h-12 px-6 rounded-xl bg-white hover:bg-slate-100 text-black font-semibold text-xs flex items-center gap-2 cursor-pointer transition-all shadow"
                  >
                    <Save size={16} /> Save Portal Overrides config
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* --- ADD NEW SERVICE DIALOGUE MODAL --- */}
      <AnimatePresence>
        {showAddServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl glass-panel text-left p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 block uppercase font-bold tracking-wider">
                    {editingService ? "Dynamic properties override" : "Dynamic services staging"}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {editingService ? `Edit Service: ${editingService.title}` : "Configure New IT Service"}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowAddServiceModal(false)}
                  className="p-1 rounded bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateServiceSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase font-mono">Service title name</label>
                    <input 
                      type="text" required value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="e.g. Cybersecurity Audit & Compliance" 
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase font-mono">Icon representation</label>
                    <select
                      value={newServiceIcon}
                      onChange={(e) => setNewServiceIcon(e.target.value)}
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none uppercase font-mono"
                    >
                      {availableIconsArray.map(ico => (
                        <option value={ico} key={ico}>{ico}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase font-mono">Investment Price (USD)</label>
                    <input 
                      type="number" required value={newServicePrice} onChange={(e) => setNewServicePrice(Number(e.target.value))}
                      placeholder="e.g. 500" 
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase font-mono">Estimated delivery timeframe</label>
                    <input 
                      type="text" required value={newServiceTimeframe} onChange={(e) => setNewServiceTimeframe(e.target.value)}
                      placeholder="e.g. 3 - 5 business days" 
                      className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase font-mono">Short tagline Description</label>
                  <input 
                    type="text" required value={newServiceDesc} onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Enter short 1-sentence sales tagline..." 
                    className="w-full h-11 px-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase font-mono">Long details brief Description</label>
                  <textarea 
                    rows={2} value={newServiceLongDesc} onChange={(e) => setNewServiceLongDesc(e.target.value)}
                    placeholder="Detailed explanation of the workflow delivery deliverables..." 
                    className="w-full p-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                  />
                </div>

                {/* PRODUCT/SERVICE IMAGE CONFIGURATION */}
                <div className="border border-white/10 p-5 rounded-2xl bg-white/[0.01] space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Service Visual Graphic Cover</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase font-mono">Direct Image URL Coordinate</label>
                      <input 
                        type="text" value={newServiceImageUrl} onChange={(e) => setNewServiceImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-... or base64" 
                        className="w-full h-10 px-3 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none placeholder-gray-700" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase font-mono">Or Select Image Upload</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewServiceImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-mono file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer pt-1" 
                      />
                    </div>
                  </div>

                  {newServiceImageUrl && (
                    <div className="flex gap-4 items-center bg-white/5 border border-white/5 rounded-xl p-3">
                      <img 
                        src={newServiceImageUrl} 
                        alt="Service Preview" 
                        className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1 text-left">
                        <span className="text-[9px] font-mono text-green-400 block uppercase">Visual system layout file active</span>
                        <button 
                          type="button" 
                          onClick={() => setNewServiceImageUrl("")}
                          className="text-[9px] font-mono text-rose-405 hover:underline text-rose-450 mt-0.5 cursor-pointer decoration-rose-500"
                        >
                          Clear Cover Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* COMING SOON OPTIONS */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">Status Toggle: Coming Soon mode</span>
                    <span className="text-[10px] text-gray-550 font-mono">Turn on if this service is currently in draft-only (coming soon). Clients will not be able to order.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={newServiceIsComingSoon} 
                      id="checkbox-coming-soon" 
                      onChange={(e) => setNewServiceIsComingSoon(e.target.checked)}
                      className="w-5 h-5 rounded border-white/10 bg-purple-900/30 text-purple-600 focus:ring-0 cursor-pointer" 
                    />
                    <label htmlFor="checkbox-coming-soon" className="text-xs font-mono font-bold text-purple-400 select-none cursor-pointer">COMING SOON</label>
                  </div>
                </div>

                {/* DYNAMIC FIELDS GENERATOR */}
                <div className="border border-white/10 p-5 rounded-2xl bg-white/[0.01]">
                  <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider font-mono">Add Dynamic Order fields</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end mb-4">
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase font-mono">Field label name</label>
                      <input 
                        type="text" value={currentFieldLabel} 
                        onChange={(e) => setCurrentFieldLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewField();
                          }
                        }}
                        placeholder="e.g. Instagram Handle" 
                        className="w-full h-10 px-3 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-gray-500 mb-1 uppercase font-mono">Field field type</label>
                      <select 
                        value={currentFieldType} onChange={(e) => setCurrentFieldType(e.target.value as any)}
                        className="w-full h-10 px-3 text-xs rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none font-mono"
                      >
                        <option value="text">Text value</option>
                        <option value="number">Numeric price/years</option>
                        <option value="email">Email coordinate</option>
                        <option value="date">Calendar Date</option>
                        <option value="password">Encrypted password</option>
                        <option value="notes">Paragraph notes</option>
                        <option value="file">Generic File attachment</option>
                        <option value="image">Image Attachment PNG/JPG</option>
                      </select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="h-10 flex items-center gap-1.5">
                        <input 
                          type="checkbox" checked={currentFieldRequired} id="field-required" onChange={(e) => setCurrentFieldRequired(e.target.checked)}
                          className="rounded border-white/10 bg-white/5 text-purple-600 focus:ring-0" 
                        />
                        <label htmlFor="field-required" className="text-[10px] font-mono text-gray-400">Required</label>
                      </div>
                      <button 
                        type="button" onClick={handleAddNewField}
                        className="h-10 px-4 rounded-lg bg-white text-black font-semibold text-xs flex items-center justify-center cursor-pointer flex-1"
                      >
                        + Add field
                      </button>
                    </div>
                  </div>

                  {/* Active list display */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    {newServiceFields.length === 0 ? (
                      <span className="text-[10px] font-mono text-gray-500 italic">No fields defined yet. Services require at least one dynamic field input.</span>
                    ) : (
                      newServiceFields.map((field) => (
                        <span key={field.id} className="text-xs font-mono inline-flex items-center gap-1 px-3 py-1 bg-white/5 rounded-xl border border-white/10 text-purple-300 capitalize">
                          {field.label} ({field.type})
                          <button type="button" onClick={() => handleRemoveNewField(field.id)} className="text-rose-400 font-bold ml-1 hover:text-rose-500">
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    {editingService ? "Save service properties updates" : "Deploy service to production node"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- REJECTION DIALOGUE MODAL --- */}
      <AnimatePresence>
        {rejectingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl glass-panel text-left p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] font-mono text-rose-500 block uppercase font-bold tracking-wider">Reject action pending</span>
                  <h3 className="text-base font-bold text-white">Rejection reason justification</h3>
                </div>
                <button 
                  onClick={() => setRejectingOrder(null)}
                  className="p-1 rounded bg-white/5 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRejectAction} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1.5 uppercase font-mono">SPECIFY DETAILED REJECTION REASON</label>
                  <textarea
                    required
                    rows={4}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Enter message for client e.g. Payment hash is invalid..."
                    className="w-full p-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Reject & Update Client notification
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* D: LIGHTBOX IMAGE PREVIEW MODAL / OPERATION DETAIL BOARD */}
        {previewOrder && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#08080c] border border-white/10 rounded-3xl max-w-6xl w-full p-6 flex flex-col max-h-[92vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 block uppercase font-bold tracking-wider text-left">Elite Operations & Administration Desk</span>
                  <h3 className="text-lg font-bold text-white text-left flex items-center gap-2 overflow-visible">
                    {previewOrder.serviceTitle}
                    <span className="text-sm font-light text-slate-400">({formatPrice(previewOrder.price)})</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={previewOrder.status}
                        initial={{ opacity: 0, scale: 0.65 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.65 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest ${
                          previewOrder.status === 'approved' ? 'bg-green-500/15 text-green-400 border border-green-500/10 animate-pulse' :
                          previewOrder.status === 'processing' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/10' :
                          previewOrder.status === 'rejected' ? 'bg-rose-500/15 text-rose-450 border border-rose-500/10' : 'bg-amber-500/15 text-amber-500 border border-amber-500/10'
                        }`}
                      >
                        {previewOrder.status === 'approved' ? 'completed / successful' : previewOrder.status}
                      </motion.span>
                    </AnimatePresence>
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5 text-left">Order UUID Reference: #{previewOrder.id.substring(4)}</p>
                </div>
                <button 
                  onClick={() => setPreviewOrder(null)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              {(() => {
                const orderUser = users.find(u => u.uid === previewOrder.userId || u.email === previewOrder.userEmail);
                const serviceDef = services.find(s => s.id === previewOrder.serviceId);

                return (
                  <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-1">
                    
                    {/* Column 1: Financial Document Proof Vetting */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase font-mono border-b border-white/5 pb-2 text-left flex items-center gap-1.5">
                        <DollarSign size={13} className="text-purple-400" /> Accounting deposit proof
                      </h4>

                      <div className="bg-black/40 rounded-2xl border border-white/5 p-2 flex items-center justify-center relative min-h-[180px] max-h-[260px] overflow-hidden group">
                        {previewOrder.paymentProofScreenshot ? (
                          <img 
                            src={previewOrder.paymentProofScreenshot} 
                            alt="Deposit validation proof" 
                            className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 hover:scale-[1.03]"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center text-gray-500 font-mono text-[11px] p-4">
                            No deposit screenshot proof uploaded in payment forms.
                          </div>
                        )}
                        {previewOrder.paymentProofScreenshot && (
                          <a 
                            href={previewOrder.paymentProofScreenshot} 
                            target="_blank" 
                            referrerPolicy="no-referrer"
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-black text-gray-300 hover:text-white border border-white/10"
                            title="Full screen view"
                          >
                            <Eye size={12} />
                          </a>
                        )}
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-3 text-left">
                        <div>
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">Depositor Claim name</span>
                          <span className="block text-xs font-semibold text-white mt-0.5">{previewOrder.paymentProofName || "Not Provided"}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">Verification TxID Hash</span>
                          <span className="block text-xs font-bold font-mono text-purple-300 break-all select-all mt-0.5 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/10">
                            {previewOrder.paymentProofTxId || "Not Provided"}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono text-gray-500 uppercase">Submitted at timezone</span>
                          <span className="block text-xs font-mono text-white/75 mt-0.5">{new Date(previewOrder.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Package Custom Form Answers */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase font-mono border-b border-white/5 pb-2 text-left flex items-center gap-1.5">
                        <ClipboardList size={13} className="text-purple-400" /> Customer Filled Form Details
                      </h4>

                      {(!previewOrder.formData || Object.keys(previewOrder.formData).length === 0) ? (
                        <div className="h-48 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-4">
                          <ClipboardList size={22} className="text-gray-600 mb-1" />
                          <p className="text-[10px] font-mono text-gray-500 italic">No package variables requested.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                          {Object.entries(previewOrder.formData).map(([key, value]) => {
                            const fieldMeta = serviceDef?.fields.find(f => f.id === key);
                            const label = fieldMeta?.label || key;
                            const isDataUri = typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('data:application') || value.startsWith('data:text'));

                            return (
                              <div key={key} className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 text-left space-y-1 hover:border-white/10 transition-colors">
                                <span className="block text-[9px] font-mono text-purple-400 uppercase font-bold tracking-wider">{label}</span>
                                {isDataUri ? (
                                  <div className="mt-1.5 flex items-center gap-3">
                                    <img 
                                      src={value} 
                                      alt={label} 
                                      className="w-12 h-12 rounded-lg object-cover bg-black border border-white/10 shrink-0" 
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="min-w-0">
                                      <span className="text-[9px] font-mono text-green-400 block uppercase">Client Document Uploaded</span>
                                      <a 
                                        href={value} 
                                        download={`dyn_form_${previewOrder.id}_${key}.png`}
                                        className="inline-block text-[9px] font-mono text-purple-400 hover:underline mt-0.5"
                                      >
                                        Download Raw Payload
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="block text-xs text-white select-all font-mono whitespace-pre-wrap break-all leading-relaxed bg-white/[0.01] p-2 rounded-lg border border-white/[0.02]">
                                    {value || <span className="text-gray-600 italic">Empty string</span>}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Column 3: client User account Profile & Status actions */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase font-mono border-b border-white/5 pb-2 text-left flex items-center gap-1.5">
                          <User size={13} className="text-purple-400" /> Client Account Profile
                        </h4>

                        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-3.5 text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                              {orderUser ? orderUser.username.substring(0, 2).toUpperCase() : "G"}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-xs font-bold text-white truncate">{orderUser?.username || "Guest account"}</span>
                              <span className="block text-[10px] text-gray-500 font-mono truncate">{previewOrder.userEmail}</span>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/5">
                            {orderUser?.phone && (
                              <div className="flex items-center gap-2 text-[11px]">
                                <Phone size={12} className="text-gray-500 shrink-0" />
                                <span className="text-white font-mono">{orderUser.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[11px]">
                              <Mail size={12} className="text-gray-500 shrink-0" />
                              <span className="text-white/80 select-all truncate font-mono">{previewOrder.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <Calendar size={12} className="text-gray-500 shrink-0" />
                              <span className="text-white/60">Joined: {orderUser?.createdAt ? new Date(orderUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <Shield size={12} className="text-gray-500 shrink-0" />
                              <span className="capitalize">{orderUser?.role || 'Guest'} Node Authorization</span>
                            </div>
                            {orderUser?.isBanned && (
                              <div className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] font-mono tracking-widest font-bold uppercase text-center mt-1">
                                ● Identity exile ban is currently active
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* OP Status Actions Console */}
                      <div className="bg-[#0e0e14] border border-white/5 rounded-2xl p-4 space-y-2 mt-4">
                        <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider text-left mb-1.5">Action operations console</span>
                        
                        {/* Process Mode Trigger */}
                        {(previewOrder.status === 'pending' || previewOrder.status === 'rejected') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              handleProcessAction(previewOrder.id, previewOrder.serviceTitle);
                              setPreviewOrder(null);
                            }}
                            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Clock size={14} /> Set mode: PROCESS (In progress)
                          </motion.button>
                        )}

                        {/* Complete Success Mode Trigger */}
                        {(previewOrder.status === 'pending' || previewOrder.status === 'processing' || previewOrder.status === 'rejected') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              handleApproveAction(previewOrder.id, previewOrder.serviceTitle);
                              setPreviewOrder(null);
                            }}
                            className="w-full h-11 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Check size={14} /> Set mode: SUCCESSFUL (Kamilisha)
                          </motion.button>
                        )}

                        {/* Rejection Mode Trigger */}
                        {(previewOrder.status === 'pending' || previewOrder.status === 'processing') && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setRejectingOrder(previewOrder);
                              setRejectionReasonInput("");
                              setPreviewOrder(null);
                            }}
                            className="w-full h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-500/25"
                          >
                            <X size={14} /> Reject / Deny payment
                          </motion.button>
                        )}

                        {previewOrder.status === 'approved' && (
                          <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20 space-y-1">
                            <span className="text-[9.5px] font-mono font-bold text-green-400 block uppercase tracking-widest">✔ COMPLETED SUCCESSFUL</span>
                            <span className="text-[9.5px] text-gray-500 font-mono">Operations successfully deployed & fulfilled.</span>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                handleProcessAction(previewOrder.id, previewOrder.serviceTitle);
                                setPreviewOrder(null);
                              }}
                              className="text-[9.5px] text-blue-400 hover:underline hover:text-blue-300 font-mono mt-1 w-full text-center block cursor-pointer"
                            >
                              Move status back to processing
                            </motion.button>
                          </div>
                        )}

                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPreviewOrder(null)}
                          className="w-full h-10 text-xs rounded-xl bg-white/5 text-gray-400 hover:text-white font-medium cursor-pointer transition-colors"
                        >
                          Close View Overlay
                        </motion.button>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast Feedback Overlay Portal */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[100] p-4 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md max-w-sm border font-sans text-xs`}
            style={{
              backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              borderColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : toast.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
              color: toast.type === 'success' ? '#34d399' : toast.type === 'error' ? '#f87171' : '#60a5fa'
            }}
          >
            <div className="flex-1">
              <span className="font-bold uppercase tracking-wider block text-[9px] mb-0.5">{toast.type}</span>
              <p className="text-white/90 text-[11px] leading-relaxed font-semibold">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Confirmation Dialog Portal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl glass-panel text-left p-6 md:p-8 relative border border-white/10 bg-[#0c0d12]"
            >
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide text-purple-400">{confirmModal.title}</h3>
              <p className="text-gray-300 text-xs leading-relaxed mb-6 font-medium">{confirmModal.message}</p>
              <div className="flex justify-end gap-3 font-semibold text-xs">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-colors shadow-lg shadow-purple-600/15"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER PERSONAL DETAILS AUDIT DIALOG */}
      <AnimatePresence>
        {selectedUserDetail && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#090a0f] border border-white/10 rounded-3xl max-w-2xl w-full p-6 flex flex-col max-h-[88vh] overflow-hidden text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-purple-400 block uppercase font-bold tracking-widest">Client Personal Profile Dossier</span>
                  <h3 className="text-base font-bold text-white mt-1 uppercase tracking-tight flex items-center gap-2">
                    {selectedUserDetail.username}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                      selectedUserDetail.role === 'admin' ? 'bg-purple-900/40 text-purple-300' : 'bg-white/10 text-gray-300'
                    }`}>
                      {selectedUserDetail.role}
                    </span>
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedUserDetail(null)}
                  className="p-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto min-h-0 space-y-5 pr-1">
                
                {/* 1. Core Profile Details Card */}
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3.5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Account Email Link</span>
                      <span className="block text-xs font-mono text-white select-all break-all mt-0.5">{selectedUserDetail.email}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Contact Phone Line</span>
                      <span className="block text-xs font-bold font-mono text-purple-300 mt-0.5">{selectedUserDetail.phone || "Not provided by client"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/[0.03]">
                    <div>
                      <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Unique Node ID (UUID)</span>
                      <span className="block text-[10px] font-mono text-white/70 select-all break-all mt-0.5">{selectedUserDetail.uid}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono text-gray-500 uppercase tracking-wider">Date Registered</span>
                      <span className="block text-xs font-mono text-white/70 mt-0.5">
                        {selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleString() : 'System Initialized'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.03] flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-mono text-[9px] uppercase">Security status level</span>
                    {selectedUserDetail.isBanned ? (
                      <span className="text-rose-400 font-bold font-mono text-[10px] uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/15">
                        Exiled / Banned state active
                      </span>
                    ) : (
                      <span className="text-green-400 font-bold font-mono text-[10px] uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/15">
                        ● Authorized & Operational
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. client Order ledger logs */}
                {(() => {
                  const clientOrders = orders.filter(o => o.userId === selectedUserDetail.uid || o.userEmail === selectedUserDetail.email);
                  return (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1">
                          <ClipboardList size={13} className="text-purple-400" /> Package Order history
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">({clientOrders.length} orders total)</span>
                      </div>

                      {clientOrders.length === 0 ? (
                        <p className="text-[10.5px] text-gray-500 italic block py-4 text-center font-mono bg-white/[0.01] rounded-xl border border-white/[0.02]">
                          This node has not committed any package purchases.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {clientOrders.map(ord => (
                            <div key={ord.id} className="p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs transition-all">
                              <div>
                                <span className="block font-bold text-white uppercase tracking-tight">{ord.serviceTitle}</span>
                                <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{formatPrice(ord.price)} — TxID: {ord.paymentProofTxId || 'None'}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                ord.status === 'approved' ? 'bg-green-500/10 text-green-400' :
                                ord.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                                ord.status === 'rejected' ? 'bg-rose-500/10 text-rose-450' : 'bg-amber-500/10 text-amber-500'
                              }`}>
                                {ord.status === 'approved' ? 'Successful' : ord.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Client Support String tickets */}
                {(() => {
                  const clientTickets = tickets.filter(t => t.userId === selectedUserDetail.uid || t.userEmail === selectedUserDetail.email);
                  return (
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1">
                          <MessageSquare size={13} className="text-purple-400" /> Linked support tickets
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">({clientTickets.length} incidents logged)</span>
                      </div>

                      {clientTickets.length === 0 ? (
                        <p className="text-[10.5px] text-gray-500 italic block py-4 text-center font-mono bg-white/[0.01] rounded-xl border border-white/[0.02]">
                          No outstanding security incidence or questions reported.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {clientTickets.map(tk => (
                            <div key={tk.id} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 flex items-center justify-between text-xs">
                              <div className="min-w-0 flex-1 pr-3">
                                <span className="block font-bold text-white truncate">{tk.subject}</span>
                                <span className="block text-[9.5px] text-slate-500 font-mono mt-0.5">Tickets UUID: #{tk.id.substring(4)} — Updated {new Date(tk.updatedAt).toLocaleDateString()}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono tracking-widest uppercase shrink-0 ${
                                tk.status === 'open' ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-gray-400'
                              }`}>
                                {tk.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>

              {/* Close Button */}
              <div className="mt-5 pt-3 border-t border-white/5">
                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Close dossier dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
