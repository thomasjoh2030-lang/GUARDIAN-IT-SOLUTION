export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'date' | 'password' | 'notes' | 'file' | 'image';
  label: string;
  placeholder?: string;
  required: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  timeframe: string;
  icon: string; // string representing one of the pre-mapped Lucide icons
  fields: FormField[];
  enabled: boolean;
  isComingSoon?: boolean;
  imageUrl?: string;
}

export interface Order {
  id: string;
  serviceId: string;
  serviceTitle: string;
  price: number;
  userId: string;
  userEmail: string;
  formData: Record<string, string>; // Maps field.id to value or base64 file
  createdAt: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  rejectionReason?: string;
  
  // Payment verification fields submitted by user
  paymentProofName?: string;
  paymentProofEmail?: string;
  paymentProofPhone?: string;
  paymentProofTxId?: string;
  paymentProofScreenshot?: string; // base64 encoded image or placeholder preview
  paymentVerifiedAt?: string;
}

export interface TicketMessage {
  sender: 'user' | 'admin';
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  messages: TicketMessage[];
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  phone?: string;
  isBanned?: boolean;
  createdAt: string;
}

export interface SystemStats {
  totalRevenue: number;
  totalOrders: number;
  approvedOrders: number;
  pendingOrders: number;
  rejectedOrders: number;
  totalUsers: number;
}

export interface ThemeConfig {
  primaryColor: string; // e.g., 'violet', 'emerald', 'cyan', 'rose'
  glowColor: string;
  headlineText: string;
  subheadlineText: string;
  manualPaymentInstructions: string;
  paymentNumber: string;
  paymentNumberName: string;
  isComingSoonEnabled?: boolean;
  opensAt?: string;
  isMaintenanceEnabled?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'danger' | 'info';
  createdAt: string;
  read: boolean;
}
