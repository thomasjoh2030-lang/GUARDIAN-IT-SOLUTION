import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowLeft,
  Moon,
  Sun
} from 'lucide-react';
import { Service, Order, SupportTicket, UserProfile, ThemeConfig, Notification, SystemStats } from './types';
import LandingPage from './components/LandingPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const fApp = initializeApp(firebaseConfig);
export const fDb = getFirestore(fApp, firebaseConfig.firestoreDatabaseId);

// Validate and test initial connection
async function testConnection() {
  try {
    await getDocFromServer(doc(fDb, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Please check your Firebase configuration or network.");
    }
  }
}
testConnection();

// Client-Side Full-Stack Database Emulator (for robust Vercel deployments and fallback resilience)
const getLocalDB = () => {
  const defaultServices: Service[] = [
    {
      id: "social-media",
      title: "Social Media Management",
      description: "Elite brand visibility, organic scaling & viral visual operations.",
      longDescription: "Our special ops social systems secure your organic reach, design high-converting visual architectures, and execute hyper-target content deployment across TikTok, Instagram, and X for maximum brand prestige.",
      price: 299,
      timeframe: "Monthly Retainer",
      icon: "Share2",
      enabled: true,
      fields: [
        { id: "platform", type: "text", label: "Target Platforms (e.g., Tik Tok, IG)", required: true, placeholder: "Instagram, TikTok" },
        { id: "handle", type: "text", label: "Current Digital Handles", required: true, placeholder: "@yourbrand" },
        { id: "goals", type: "notes", label: "Key Campaign Objectives", required: true, placeholder: "Increase engagement & premium content aesthetic" }
      ]
    },
    {
      id: "tiktok-verify",
      title: "TikTok Verification Guidance",
      description: "Direct elite pathing to secure verified blue insignia credentials.",
      longDescription: "A curated strategy bypasses standard automated rejections. We manage PR placements, brand credibility alignments, and direct media portal submissions to unlock your blue check.",
      price: 149,
      timeframe: "3 - 7 Days",
      icon: "ShieldCheck",
      enabled: true,
      fields: [
        { id: "username", type: "text", label: "TikTok Account Handle", required: true, placeholder: "@verified_user" },
        { id: "press", type: "notes", label: "Existing Press Links & Media Mentions", required: false, placeholder: "Forbes, TechCrunch links if any..." },
        { id: "verification_screenshot", type: "image", label: "Attach Account Settings Screenshot", required: true }
      ]
    },
    {
      id: "web-dev",
      title: "Website Design & Development",
      description: "Stripe-class web software, luxury interfaces & robust codebases.",
      longDescription: "No-template architectural designs. We construct hyper-immersive react codebases, optimized database environments, and lightning-fast animations tuned to elite aesthetic standards.",
      price: 1499,
      timeframe: "14 - 21 Days",
      icon: "Cpu",
      enabled: true,
      fields: [
        { id: "site_desc", type: "notes", label: "Project Brief & Core Functionality", required: true, placeholder: "Explain your startup or business system..." },
        { id: "design_style", type: "text", label: "Aesthetic References (e.g., Tesla Minimal)", required: true, placeholder: "Apple-level minimal dark & glassmorphism" },
        { id: "budget_scope", type: "number", label: "Project Scaling Phase budget", required: false, placeholder: "1500" }
      ]
    },
    {
      id: "mobile-dev",
      title: "Mobile App Development",
      description: "Immersive standalone iOS & Android engines with seamless synchronization.",
      longDescription: "We build native and cross-platform applications combining flawless screen tracking, offline caching, and cinematic motion effects to retain client attention.",
      price: 2499,
      timeframe: "21 - 35 Days",
      icon: "Smartphone",
      enabled: true,
      fields: [
        { id: "app_purpose", type: "notes", label: "Core App Concept & Workflows", required: true, placeholder: "Uber for IT services..." },
        { id: "preferred_platform", type: "text", label: "Launch Strategy (iOS / Android / Both)", required: true, placeholder: "Both Platforms" }
      ]
    },
    {
      id: "graphic-design",
      title: "Graphic Design & Branding",
      description: "High-fashion identity structures, luxury brand books & cinematic systems.",
      longDescription: "Synthesize a timeless logo, premium typography systems, custom brand style guides, and ultra-high-definition vector marketing arrays.",
      price: 399,
      timeframe: "5 - 7 Days",
      icon: "Layers",
      enabled: true,
      fields: [
        { id: "brand_name", type: "text", label: "Brand Name & Concept", required: true, placeholder: "Aegis Security" },
        { id: "brand_vibe", type: "text", label: "Desired Vibe Color Palette", required: true, placeholder: "Deep purple, gold and matte black" }
      ]
    }
  ];

  const defaultTheme: ThemeConfig = {
    primaryColor: "violet",
    glowColor: "cyan",
    headlineText: "GUARDIAN INTERNET",
    subheadlineText: "ELITE CYBER OPS, ADVANCED DIGITAL SERVICES & IT ECOSYSTEMS",
    manualPaymentInstructions: "To fulfill this order, please submit your payment to our secure manual verification vault on Bitcoin or M-Pesa. Once the payment proof is uploaded, our elite technicians will contact you.",
    paymentNumber: "BTC: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    paymentNumberName: "Bitcoin Premium Vault Account",
    isComingSoonEnabled: false,
    opensAt: "",
    isMaintenanceEnabled: false
  };

  const stored = localStorage.getItem("guardian_client_db");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fail silently
    }
  }

  const initial = {
    users: [
      {
        uid: "admin_thomas",
        email: "thomasjoh2030@gmail.com",
        username: "thomasjoh2030",
        role: "admin",
        password: "203040",
        createdAt: new Date().toISOString()
      }
    ],
    services: defaultServices,
    orders: [],
    tickets: [],
    notifications: [],
    theme: defaultTheme
  };
  localStorage.setItem("guardian_client_db", JSON.stringify(initial));
  return initial;
};

const saveLocalDB = (db: any) => {
  localStorage.setItem("guardian_client_db", JSON.stringify(db));
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: localStorage.getItem("guardian_token") || "anonymous",
      email: localStorage.getItem("guardian_user") ? JSON.parse(localStorage.getItem("guardian_user")!).email : "anonymous",
      emailVerified: true
    },
    operationType,
    path
  };
  console.warn('Firestore Error: ', JSON.stringify(errInfo));
}

const getFirestoreDB = async (): Promise<any> => {
  try {
    const usersSnap = await getDocs(collection(fDb, "users"));
    const usersSet: UserProfile[] = [];
    usersSnap.forEach(d => {
      usersSet.push(d.data() as UserProfile);
    });

    const servicesSnap = await getDocs(collection(fDb, "services"));
    let servicesSet: Service[] = [];
    servicesSnap.forEach(d => {
      servicesSet.push(d.data() as Service);
    });

    const ordersSnap = await getDocs(collection(fDb, "orders"));
    const ordersSet: Order[] = [];
    ordersSnap.forEach(d => {
      ordersSet.push(d.data() as Order);
    });

    const ticketsSnap = await getDocs(collection(fDb, "tickets"));
    const ticketsSet: SupportTicket[] = [];
    ticketsSnap.forEach(d => {
      ticketsSet.push(d.data() as SupportTicket);
    });

    const notifsSnap = await getDocs(collection(fDb, "notifications"));
    const notifsSet: Notification[] = [];
    notifsSnap.forEach(d => {
      notifsSet.push(d.data() as Notification);
    });

    const themeDocRef = doc(fDb, "theme", "global");
    const themeSnap = await getDoc(themeDocRef);
    let themeSet: ThemeConfig;
    if (themeSnap.exists()) {
      themeSet = themeSnap.data() as ThemeConfig;
    } else {
      themeSet = {
        primaryColor: "violet",
        glowColor: "cyan",
        headlineText: "GUARDIAN INTERNET",
        subheadlineText: "ELITE CYBER OPS, ADVANCED DIGITAL SERVICES & IT ECOSYSTEMS",
        manualPaymentInstructions: "To fulfill this order, please submit your payment to our secure manual verification vault on Bitcoin or M-Pesa. Once the payment proof is uploaded, our elite technicians will contact you.",
        paymentNumber: "BTC: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        paymentNumberName: "Bitcoin Premium Vault Account",
        isComingSoonEnabled: false,
        opensAt: "",
        isMaintenanceEnabled: false
      };
      await setDoc(themeDocRef, themeSet);
    }

    // Seed default services if empty
    if (servicesSet.length === 0) {
      const defaultServicesList: Service[] = [
        {
          id: "social-media",
          title: "Social Media Management",
          description: "Elite brand visibility, organic scaling & viral visual operations.",
          longDescription: "Our special ops social systems secure your organic reach, design high-converting visual architectures, and execute hyper-target content deployment across TikTok, Instagram, and X for maximum brand prestige.",
          price: 299,
          timeframe: "Monthly Retainer",
          icon: "Share2",
          enabled: true,
          fields: [
            { id: "platform", type: "text", label: "Target Platforms (e.g., Tik Tok, IG)", required: true, placeholder: "Instagram, TikTok" },
            { id: "handle", type: "text", label: "Current Digital Handles", required: true, placeholder: "@yourbrand" },
            { id: "goals", type: "notes", label: "Key Campaign Objectives", required: true, placeholder: "Increase engagement & premium content aesthetic" }
          ]
        },
        {
          id: "tiktok-verify",
          title: "TikTok Verification Guidance",
          description: "Direct elite pathing to secure verified blue insignia credentials.",
          longDescription: "A curated strategy bypasses standard automated rejections. We manage PR placements, brand credibility alignments, and direct media portal submissions to unlock your blue check.",
          price: 149,
          timeframe: "3 - 7 Days",
          icon: "ShieldCheck",
          enabled: true,
          fields: [
            { id: "username", type: "text", label: "TikTok Account Handle", required: true, placeholder: "@verified_user" },
            { id: "press", type: "notes", label: "Existing Press Links & Media Mentions", required: false, placeholder: "Forbes, TechCrunch links if any..." },
            { id: "verification_screenshot", type: "image", label: "Attach Account Settings Screenshot", required: true }
          ]
        },
        {
          id: "web-dev",
          title: "Website Design & Development",
          description: "Stripe-class web software, luxury interfaces & robust codebases.",
          longDescription: "No-template architectural designs. We construct hyper-immersive react codebases, optimized database environments, and lightning-fast animations tuned to elite aesthetic standards.",
          price: 1499,
          timeframe: "14 - 21 Days",
          icon: "Cpu",
          enabled: true,
          fields: [
            { id: "site_desc", type: "notes", label: "Project Brief & Core Functionality", required: true, placeholder: "Explain your startup or business system..." },
            { id: "design_style", type: "text", label: "Aesthetic References (e.g., Tesla Minimal)", required: true, placeholder: "Apple-level minimal dark & glassmorphism" },
            { id: "budget_scope", type: "number", label: "Project Scaling Phase budget", required: false, placeholder: "1500" }
          ]
        },
        {
          id: "mobile-dev",
          title: "Mobile App Development",
          description: "Immersive standalone iOS & Android engines with seamless synchronization.",
          longDescription: "We build native and cross-platform applications combining flawless screen tracking, offline caching, and cinematic motion effects to retain client attention.",
          price: 2499,
          timeframe: "21 - 35 Days",
          icon: "Smartphone",
          enabled: true,
          fields: [
            { id: "app_purpose", type: "notes", label: "Core App Concept & Workflows", required: true, placeholder: "Uber for IT services..." },
            { id: "preferred_platform", type: "text", label: "Launch Strategy (iOS / Android / Both)", required: true, placeholder: "Both Platforms" }
          ]
        },
        {
          id: "graphic-design",
          title: "Graphic Design & Branding",
          description: "High-fashion identity structures, luxury brand books & cinematic systems.",
          longDescription: "Synthesize a timeless logo, premium typography systems, custom brand style guides, and ultra-high-definition vector marketing arrays.",
          price: 399,
          timeframe: "5 - 7 Days",
          icon: "Layers",
          enabled: true,
          fields: [
            { id: "brand_name", type: "text", label: "Brand Name & Concept", required: true, placeholder: "Aegis Security" },
            { id: "brand_vibe", type: "text", label: "Desired Vibe Color Palette", required: true, placeholder: "Deep purple, gold and matte black" }
          ]
        },
        {
          id: "video-editing",
          title: "Video Editing",
          description: "High-retention social ads, mini-documentaries, and commercial video formats.",
          longDescription: "Professional video engineering focusing on frame-by-frame color correction, premium kinetic typography, sound design, and retention hooks to maximize viewer stickiness.",
          price: 199,
          timeframe: "2 - 4 Days",
          icon: "Video",
          enabled: true,
          fields: [
            { id: "video_duration", type: "number", label: "Estimated Length (in Seconds)", required: true, placeholder: "60" },
            { id: "footage_link", type: "text", label: "Link to Raw Footage (Google Drive / Dropbox)", required: true, placeholder: "https://drive.google.com/..." }
          ]
        },
        {
          id: "account-recovery",
          title: "Account Recovery & Security Setup",
          description: "Advanced asset protection, incident response, & system hardening.",
          longDescription: "Locked out of critical accounts? Secure our digital operations division. We analyze logs, construct incident mitigation files, and deploy biometric hardware-key security overrides.",
          price: 349,
          timeframe: "1 - 3 Days",
          icon: "Lock",
          enabled: true,
          fields: [
            { id: "compromised_platform", type: "text", label: "Target Account/Platform", required: true, placeholder: "Instagram / Google Business" },
            { id: "username_recovery", type: "text", label: "Compromised Account ID / Username", required: true, placeholder: "@mybusiness_old" },
            { id: "ownership_proof", type: "notes", label: "Account Ownership Details & Historical Logs", required: true, placeholder: "Provide original signup date or phone number..." }
          ]
        },
        {
          id: "ai-prompt",
          title: "AI Prompt Engineering",
          description: "Enterprise system prompt crafting & orchestration tuning.",
          longDescription: "Maximize utility from modern models (Gemini-3.5-pro, GPT-4o). We engineer robust system directives, format constraints, and safety guidelines to reduce hallucination and bypass prompt-injection vectors.",
          price: 99,
          timeframe: "1 - 2 Days",
          icon: "Terminal",
          enabled: true,
          fields: [
            { id: "ai_goal", type: "notes", label: "Operational goals for the LLM pipeline", required: true, placeholder: "SaaS automation, Customer support filtering..." },
            { id: "target_model", type: "text", label: "Primary Model Choice (e.g. Gemini 3.5)", required: true, placeholder: "Gemini 3.5 Flash" }
          ]
        }
      ];
      for (const s of defaultServicesList) {
        await setDoc(doc(fDb, "services", s.id), s);
      }
      servicesSet = defaultServicesList;
    }

    return {
      users: usersSet,
      services: servicesSet,
      orders: ordersSet,
      tickets: ticketsSet,
      notifications: servicesSet.length > 0 ? (notifsSet || []) : [],
      theme: themeSet
    };
  } catch (error) {
    console.warn("Firestore connection error in getFirestoreDB:", error);
    return getLocalDB();
  }
};

const handleClientFallback = async (url: string, options?: RequestInit): Promise<Response> => {
  console.log("🔒 Running client-side database fallback:", url);
  const db = await getFirestoreDB();
  const path = url.split("?")[0];
  const method = options?.method || "GET";
  const body = options?.body ? JSON.parse(options.body as string) : {};

  let data: any = null;
  let status = 200;
  let error = "";

  // 1. AUTH REGISTER
  if (path === "/api/auth/register" && method === "POST") {
    const { email, password, username } = body;
    const formattedEmail = String(email || "").toLowerCase().trim();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === formattedEmail);
    if (existing) {
      status = 400;
      error = "An account with this email already exists.";
    } else {
      const isSpecialAdmin = formattedEmail === "thomasjoh2030@gmail.com";
      const role = isSpecialAdmin ? 'admin' : 'user';
      const finalPassword = isSpecialAdmin ? "203040" : (password || "");
      const newUser = {
        uid: "user_" + Math.random().toString(36).substr(2, 9),
        email: formattedEmail,
        username: String(username || "").trim(),
        role: role,
        password: finalPassword,
        createdAt: new Date().toISOString()
      };
      
      const notif = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: newUser.uid,
        title: "Welcome to Guardian Internet!",
        message: `Your account is secure. Welcome, Agent ${newUser.username}. Explore our cyber solutions now.`,
        type: "success" as const,
        createdAt: new Date().toISOString(),
        read: false
      };

      try {
        await setDoc(doc(fDb, "users", newUser.uid), newUser);
        await setDoc(doc(fDb, "notifications", notif.id), notif);
        db.users.push(newUser);
        db.notifications.push(notif);
        saveLocalDB(db);
        data = { token: "token_" + newUser.uid, user: newUser };
      } catch (e) {
        // Fallback: Continue with local state storage to allow frictionless testing
        db.users.push(newUser);
        db.notifications.push(notif);
        saveLocalDB(db);
        data = { token: "token_" + newUser.uid, user: newUser };
        status = 200;
        error = "";
        handleFirestoreError(e, OperationType.WRITE, "users/" + newUser.uid);
      }
    }
  }
  // 2. AUTH LOGIN
  else if (path === "/api/auth/login" && method === "POST") {
    const { email, password } = body;
    const formattedEmail = String(email || "").toLowerCase().trim();
    const isAdminUser = formattedEmail === "thomasjoh2030@gmail.com";

    if (!isAdminUser) {
      if (db.theme.isMaintenanceEnabled) {
        status = 403;
        error = "System is in secure maintenance mode. Standard operative login has been temporarily disconnected by administrative order.";
      } else if (db.theme.isComingSoonEnabled) {
        status = 403;
        error = `Portal is in Coming Soon launch mode (Scheduled opening: ${db.theme.opensAt || "Soon"}). Standard logins are locked.`;
      }
    }

    if (status === 200) {
      let user = db.users.find((u: any) => u.email.toLowerCase() === formattedEmail);
      if (!user && isAdminUser) {
        user = {
          uid: "admin_thomas",
          email: "thomasjoh2030@gmail.com",
          username: "thomasjoh2030",
          role: "admin",
          password: "203040",
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(fDb, "users", user.uid), user);
          db.users.push(user);
          saveLocalDB(db);
        } catch (e) {
          console.error("Failed to seed admin user to firestore:", e);
        }
      }

      if (!user) {
        status = 404;
        error = "Account not found. Please click Register to create your identity.";
      } else {
        const inputPassword = password || "";
        const storedPassword = user.password || "";
        if (isAdminUser && inputPassword !== "203040") {
          status = 401;
          error = "Secure authorization code mismatch. Access denied.";
        } else if (!isAdminUser && storedPassword && storedPassword !== inputPassword) {
          status = 401;
          error = "Mismatched security passcode check. Authenticate again.";
        } else if (user.isBanned) {
          status = 403;
          error = "This electronic identity has been banned by the Administrator due to policy violation.";
        } else {
          data = { token: "token_" + user.uid, user };
        }
      }
    }
  }
  // 3. THEME GET
  else if (path === "/api/theme" && method === "GET") {
    data = db.theme;
  }
  // 4. THEME POST/UPDATE
  else if (path === "/api/theme" && method === "POST") {
    const updatedTheme = { ...db.theme, ...body };
    try {
      await setDoc(doc(fDb, "theme", "global"), updatedTheme);
      db.theme = updatedTheme;
      saveLocalDB(db);
      data = db.theme;
    } catch (e) {
      status = 500;
      error = "Theme sync error.";
      handleFirestoreError(e, OperationType.WRITE, "theme/global");
    }
  }
  // 5. SERVICES GET
  else if (path === "/api/services" && method === "GET") {
    data = db.services;
  }
  // 6. SERVICES POST
  else if (path === "/api/services" && method === "POST") {
    const newService = {
      id: "ser_" + Math.random().toString(36).substr(2, 9),
      ...body,
      price: Number(body.price || 199),
      enabled: true
    };
    try {
      await setDoc(doc(fDb, "services", newService.id), newService);
      db.services.push(newService);
      saveLocalDB(db);
      data = newService;
    } catch (e) {
      status = 500;
      error = "Service creation sync failed.";
      handleFirestoreError(e, OperationType.WRITE, "services/" + newService.id);
    }
  }
  // 7. SERVICES PUT
  else if (path.startsWith("/api/services/") && method === "PUT") {
    const id = path.split("/").pop() || "";
    const idx = db.services.findIndex((s: any) => s.id === id);
    if (idx !== -1) {
      const updatedService = { ...db.services[idx], ...body };
      try {
        await setDoc(doc(fDb, "services", id), updatedService);
        db.services[idx] = updatedService;
        saveLocalDB(db);
        data = db.services[idx];
      } catch (e) {
        status = 500;
        error = "Service update sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "services/" + id);
      }
    } else {
      status = 404;
      error = "Service not found.";
    }
  }
  // 8. SERVICES DELETE
  else if (path.startsWith("/api/services/") && method === "DELETE") {
    const id = path.split("/").pop() || "";
    try {
      await deleteDoc(doc(fDb, "services", id));
      db.services = db.services.filter((s: any) => s.id !== id);
      saveLocalDB(db);
      data = { success: true, id };
    } catch (e) {
      status = 500;
      error = "Service delete sync failed.";
      handleFirestoreError(e, OperationType.DELETE, "services/" + id);
    }
  }
  // 9. ORDERS GET
  else if (path === "/api/orders" && method === "GET") {
    const queryStr = url.split("?")[1] || "";
    const params = new URLSearchParams(queryStr);
    const userId = params.get("userId");
    const role = params.get("role");
    if (role === "admin") {
      data = db.orders;
    } else {
      data = db.orders.filter((o: any) => o.userId === userId);
    }
  }
  // 10. ORDERS POST
  else if (path === "/api/orders" && method === "POST") {
    const newOrder = {
      id: "ord_" + Math.random().toString(36).substr(2, 9),
      ...body,
      price: Number(body.price || 0),
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    const orderNotif = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      userId: body.userId,
      title: "Order Submitted - Pending Proof",
      message: `Your tactical request has been received. Please upload payment proof to start operations on ${body.serviceTitle}.`,
      type: "info" as const,
      createdAt: new Date().toISOString(),
      read: false
    };

    try {
      await setDoc(doc(fDb, "orders", newOrder.id), newOrder);
      await setDoc(doc(fDb, "notifications", orderNotif.id), orderNotif);
      db.orders.push(newOrder);
      db.notifications.push(orderNotif);
      saveLocalDB(db);
      data = newOrder;
    } catch (e) {
      status = 500;
      error = "Order transaction sync failed.";
      handleFirestoreError(e, OperationType.WRITE, "orders/" + newOrder.id);
    }
  }
  // 11. ORDERS PAYMENT PROOF PUT
  else if (path.startsWith("/api/orders/") && path.endsWith("/payment") && method === "PUT") {
    const id = path.split("/")[3];
    const order = db.orders.find((o: any) => o.id === id);
    if (order) {
      const updatedOrder = {
        ...order,
        paymentProofName: body.name,
        paymentProofEmail: body.email,
        paymentProofPhone: body.phone,
        paymentProofTxId: body.txId,
        paymentProofScreenshot: body.screenshot,
        status: "pending" as const
      };
      try {
        await setDoc(doc(fDb, "orders", id), updatedOrder);
        const orderIdx = db.orders.findIndex((o: any) => o.id === id);
        db.orders[orderIdx] = updatedOrder;
        saveLocalDB(db);
        data = updatedOrder;
      } catch (e) {
        status = 500;
        error = "Payment proof upload sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "orders/" + id);
      }
    } else {
      status = 404;
      error = "Order not found";
    }
  }
  // 12. ORDER CONTROLS (APPROVE, PROCESS, REJECT)
  else if (path.startsWith("/api/orders/") && path.endsWith("/approve") && method === "POST") {
    const id = path.split("/")[3];
    const order = db.orders.find((o: any) => o.id === id);
    if (order) {
      const updatedOrder = {
        ...order,
        status: "approved" as const,
        paymentVerifiedAt: new Date().toISOString()
      };
      
      const approveNotif = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: order.userId,
        title: "✅ Payment Vetted & Operation Live",
        message: `Your payment was successfully approved by Guardian operations. Our elite tech team is now executing ${order.serviceTitle}.`,
        type: "success" as const,
        createdAt: new Date().toISOString(),
        read: false
      };

      try {
        await setDoc(doc(fDb, "orders", id), updatedOrder);
        await setDoc(doc(fDb, "notifications", approveNotif.id), approveNotif);
        const orderIdx = db.orders.findIndex((o: any) => o.id === id);
        db.orders[orderIdx] = updatedOrder;
        db.notifications.push(approveNotif);
        saveLocalDB(db);
        data = updatedOrder;
      } catch (e) {
        status = 500;
        error = "Order approval sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "orders/" + id);
      }
    } else {
      status = 404;
      error = "Order not found";
    }
  }
  else if (path.startsWith("/api/orders/") && path.endsWith("/process") && method === "POST") {
    const id = path.split("/")[3];
    const order = db.orders.find((o: any) => o.id === id);
    if (order) {
      const updatedOrder = {
        ...order,
        status: "processing" as const
      };

      const processNotif = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: order.userId,
        title: "⚙️ Package Processing Initiated",
        message: `The operations unit has vetted your documents and initiated actual deployment for: ${order.serviceTitle}. Status: Processing.`,
        type: "info" as const,
        createdAt: new Date().toISOString(),
        read: false
      };

      try {
        await setDoc(doc(fDb, "orders", id), updatedOrder);
        await setDoc(doc(fDb, "notifications", processNotif.id), processNotif);
        const orderIdx = db.orders.findIndex((o: any) => o.id === id);
        db.orders[orderIdx] = updatedOrder;
        db.notifications.push(processNotif);
        saveLocalDB(db);
        data = updatedOrder;
      } catch (e) {
        status = 500;
        error = "Order status sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "orders/" + id);
      }
    } else {
      status = 404;
      error = "Order not found";
    }
  }
  else if (path === "/api/orders/approve-all" && method === "POST") {
    const pendings = db.orders.filter((o: any) => o.status === "pending");
    try {
      for (const order of pendings) {
        const updatedOrder = {
          ...order,
          status: "approved" as const,
          paymentVerifiedAt: new Date().toISOString()
        };
        const approveNotif = {
          id: "notif_" + Math.random().toString(36).substr(2, 9),
          userId: order.userId,
          title: "✅ Payment Vetted & Operation Live",
          message: `Your payment was successfully approved by Guardian operations. Our elite tech team is now executing ${order.serviceTitle}.`,
          type: "success" as const,
          createdAt: new Date().toISOString(),
          read: false
        };
        await setDoc(doc(fDb, "orders", order.id), updatedOrder);
        await setDoc(doc(fDb, "notifications", approveNotif.id), approveNotif);
        const orderIdx = db.orders.findIndex((o: any) => o.id === order.id);
        if (orderIdx !== -1) db.orders[orderIdx] = updatedOrder;
        db.notifications.push(approveNotif);
      }
      saveLocalDB(db);
      data = { success: true, count: pendings.length };
    } catch (e) {
      status = 500;
      error = "Approve all sync failed.";
      handleFirestoreError(e, OperationType.WRITE, "orders/approve-all");
    }
  }
  else if (path.startsWith("/api/orders/") && path.endsWith("/reject") && method === "POST") {
    const id = path.split("/")[3];
    const order = db.orders.find((o: any) => o.id === id);
    if (order) {
      const updatedOrder = {
        ...order,
        status: "rejected" as const,
        rejectionReason: body.reason || "Payment validation failed."
      };
      
      const rejectNotif = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: order.userId,
        title: "❌ Payment Validation Rejected",
        message: `Your payment validation request was rejected: "${updatedOrder.rejectionReason}". Correct details or contact desk.`,
        type: "danger" as const,
        createdAt: new Date().toISOString(),
        read: false
      };

      try {
        await setDoc(doc(fDb, "orders", id), updatedOrder);
        await setDoc(doc(fDb, "notifications", rejectNotif.id), rejectNotif);
        const orderIdx = db.orders.findIndex((o: any) => o.id === id);
        db.orders[orderIdx] = updatedOrder;
        db.notifications.push(rejectNotif);
        saveLocalDB(db);
        data = updatedOrder;
      } catch (e) {
        status = 500;
        error = "Order reject sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "orders/" + id);
      }
    } else {
      status = 404;
      error = "Order not found";
    }
  }
  // 13. TICKETS (GET, POST, REPLY)
  else if (path === "/api/tickets" && method === "GET") {
    const queryStr = url.split("?")[1] || "";
    const params = new URLSearchParams(queryStr);
    const userId = params.get("userId");
    const role = params.get("role");
    if (role === "admin") {
      data = db.tickets;
    } else {
      data = db.tickets.filter((t: any) => t.userId === userId);
    }
  }
  else if (path === "/api/tickets" && method === "POST") {
    const newTicket = {
      id: "tick_" + Math.random().toString(36).substr(2, 9),
      userId: body.userId,
      userEmail: body.userEmail,
      subject: body.subject,
      messages: [{ sender: "user", content: body.message, createdAt: new Date().toISOString() }],
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(fDb, "tickets", newTicket.id), newTicket);
      db.tickets.push(newTicket);
      saveLocalDB(db);
      data = newTicket;
    } catch (e) {
      status = 500;
      error = "Support ticket sync failed.";
      handleFirestoreError(e, OperationType.WRITE, "tickets/" + newTicket.id);
    }
  }
  else if (path.startsWith("/api/tickets/") && path.endsWith("/reply") && method === "POST") {
    const id = path.split("/")[3];
    const ticket = db.tickets.find((t: any) => t.id === id);
    if (ticket) {
      const updatedTicket = {
        ...ticket,
        messages: [
          ...ticket.messages,
          {
            sender: body.sender,
            content: body.content,
            createdAt: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };

      let replyNotif: any = null;
      if (body.sender === "admin") {
        replyNotif = {
          id: "notif_" + Math.random().toString(36).substr(2, 9),
          userId: ticket.userId,
          title: "💬 Admin Support Replied",
          message: `Support Desk replied to "${ticket.subject}". Check your Support messages room.`,
          type: "success" as const,
          createdAt: new Date().toISOString(),
          read: false
        };
      }

      try {
        await setDoc(doc(fDb, "tickets", id), updatedTicket);
        if (replyNotif) {
          await setDoc(doc(fDb, "notifications", replyNotif.id), replyNotif);
          db.notifications.push(replyNotif);
        }
        const ticketIdx = db.tickets.findIndex((t: any) => t.id === id);
        db.tickets[ticketIdx] = updatedTicket;
        saveLocalDB(db);
        data = updatedTicket;
      } catch (e) {
        status = 500;
        error = "Support reply sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "tickets/" + id);
      }
    } else {
      status = 404;
      error = "Ticket not found";
    }
  }
  // 14. STATS GET
  else if (path === "/api/stats" && method === "GET") {
    const approved = db.orders.filter((o: any) => o.status === "approved");
    const totalRev = approved.reduce((sum: number, o: any) => sum + o.price, 0);
    data = {
      totalRevenue: totalRev,
      totalOrders: db.orders.length,
      approvedOrders: approved.length,
      pendingOrders: db.orders.filter((o: any) => o.status === "pending").length,
      rejectedOrders: db.orders.filter((o: any) => o.status === "rejected").length,
      totalUsers: db.users.length
    };
  }
  // 15. USERS IN DB
  else if (path === "/api/users" && method === "GET") {
    data = db.users;
  }
  else if (path.startsWith("/api/users/") && path.endsWith("/ban") && method === "POST") {
    const uid = path.split("/")[3];
    const u = db.users.find((usr: any) => usr.uid === uid);
    if (u) {
      const updatedUser = { ...u, isBanned: body.isBanned };
      try {
        await setDoc(doc(fDb, "users", uid), updatedUser);
        const uIdx = db.users.findIndex((usr: any) => usr.uid === uid);
        db.users[uIdx] = updatedUser;
        saveLocalDB(db);
        data = updatedUser;
      } catch (e) {
        status = 500;
        error = "User ban status sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "users/" + uid);
      }
    } else {
      status = 404;
      error = "User not found";
    }
  }
  // 16. NOTIFICATIONS
  else if (path.startsWith("/api/notifications/") && method === "GET") {
    const userId = path.split("/").pop();
    data = db.notifications.filter((n: any) => n.userId === userId).slice().reverse();
  }
  else if (path.startsWith("/api/notifications/") && path.endsWith("/read") && method === "POST") {
    const id = path.split("/")[3];
    const n = db.notifications.find((notif: any) => notif.id === id);
    if (n) {
      const updatedNotification = { ...n, read: true };
      try {
        await setDoc(doc(fDb, "notifications", id), updatedNotification);
        const nIdx = db.notifications.findIndex((notif: any) => notif.id === id);
        db.notifications[nIdx] = updatedNotification;
        saveLocalDB(db);
        data = { success: true };
      } catch (e) {
        status = 500;
        error = "Notification update sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "notifications/" + id);
      }
    } else {
      data = { success: true };
    }
  }
  // 17. TOGGLE ADMIN
  else if (path === "/api/users/toggle-admin" && method === "POST") {
    const u = db.users.find((usr: any) => usr.uid === body.userId);
    if (u) {
      const updatedUser = { ...u, role: u.role === "admin" ? ("user" as const) : ("admin" as const) };
      try {
        await setDoc(doc(fDb, "users", body.userId), updatedUser);
        const uIdx = db.users.findIndex((usr: any) => usr.uid === body.userId);
        db.users[uIdx] = updatedUser;
        saveLocalDB(db);
        data = { success: true, user: updatedUser };
      } catch (e) {
        status = 500;
        error = "Privilege sync failed.";
        handleFirestoreError(e, OperationType.WRITE, "users/" + body.userId);
      }
    }
  }

  // Delay for native feel
  await new Promise(resolve => setTimeout(resolve, 150));

  if (error) {
    return {
      ok: false,
      status,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ error })
    } as Response;
  }

  return {
    ok: true,
    status,
    headers: new Headers({ "Content-Type": "application/json" }),
    json: async () => data
  } as Response;
};

const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    const method = options?.method?.toUpperCase() || "GET";
    let finalUrl = url;
    let finalOptions = { ...options };

    if (method === "GET") {
      const separator = url.includes("?") ? "&" : "?";
      finalUrl = `${url}${separator}_t=${Date.now()}`;
      
      // Inject anti-caching headers for WebKit / Safari
      finalOptions.headers = {
        ...(options?.headers || {}),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      };
    }

    const res = await fetch(finalUrl, finalOptions);
    const contentType = res.headers.get("Content-Type") || "";
    if (res.ok && !contentType.includes("text/html")) {
      return res;
    }
    // Static hosting files like index.html returned or routing error 404
    if (contentType.includes("text/html") || res.status === 404) {
      throw new Error("API Route missing or returned HTML static page from fallback router.");
    }
    // Return original error if it's correct json
    return res;
  } catch (err) {
    return handleClientFallback(url, options);
  }
};

export default function App() {
  // Views navigation state
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'admin'>('landing');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Currency Toggle state ('USD' vs 'TZS' where 1 USD = 2605 TZS, 1 USD = 2600 TZS here)
  const [currency, setCurrency] = useState<'USD' | 'TZS'>(() => {
    return (localStorage.getItem("guardian_currency") as any) || 'USD';
  });

  const handleCurrencyChange = (newCurrency: 'USD' | 'TZS') => {
    setCurrency(newCurrency);
    localStorage.setItem("guardian_currency", newCurrency);
  };

  // Authenticated State info
  const [token, setToken] = useState<string | null>(localStorage.getItem("guardian_token"));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("guardian_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Services list
  const [services, setServices] = useState<Service[]>([]);
  // Theme content
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: "violet",
    glowColor: "cyan",
    headlineText: "GUARDIAN INTERNET",
    subheadlineText: "ELITE CYBER OPERATIONS, HIGH-END WEB ECOSYSTEMS & ADVANCED DIGITAL SERVICES",
    manualPaymentInstructions: "Please deposit to our Bitcoin network vault and input your screenshot proof to trigger automatic manual verification vetting.",
    paymentNumber: "BTC: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    paymentNumberName: "Bitcoin Premium Vault"
  });

  // Data logs
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalRevenue: 2499,
    totalOrders: 3,
    approvedOrders: 1,
    pendingOrders: 1,
    rejectedOrders: 1,
    totalUsers: 2
  });

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPass, setAuthConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  // Initial loads & polling refreshers
  useEffect(() => {
    // Check express health check or pull default values on mount
    apiFetch("/api/theme")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTheme(data); })
      .catch(err => console.log("Express background not running yet, using preloaded settings."));

    fetchServices();
  }, []);

  // Poller trigger when user state loads
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchTickets();
      fetchNotifications();
      if (user.role === 'admin') {
        fetchStats();
        fetchUsers();
      }
    }
  }, [user, currentView]);

  // Periodic polling interval for live notifications, theme, services & admin updates
  useEffect(() => {
    const timer = setInterval(() => {
      // Dynamic live sync for everyone
      apiFetch("/api/theme")
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setTheme(data); })
        .catch(err => console.log("Theme refresh failed", err));

      fetchServices();

      if (user) {
        // Refresh active user's profile to prevent stale roles or status
        apiFetch(`/api/profile?userId=${user.uid}`)
          .then(r => r.ok ? r.json() : null)
          .then(freshUser => {
            if (freshUser) {
              if (freshUser.isBanned) {
                // Instantly log out banned users
                handleLogout();
              } else {
                setUser(freshUser);
                localStorage.setItem("guardian_user", JSON.stringify(freshUser));
              }
            }
          })
          .catch(err => console.log("Profile refresh sync failed", err));

        fetchOrders();
        fetchNotifications();
        if (user.role === 'admin') {
          fetchStats();
          fetchUsers(); // Poll user registration list for Thomas/Admin
        }
      }
    }, 8000); // 8s intervals
    return () => clearInterval(timer);
  }, [user]);

  // Core API Fetches
  const fetchServices = async () => {
    try {
      const res = await apiFetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (e) {
      console.error("Error connecting to services endpoint:", e);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const q = `/api/orders?userId=${user.uid}&role=${user.role}`;
      const res = await apiFetch(q);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTickets = async () => {
    if (!user) return;
    try {
      const q = `/api/tickets?userId=${user.uid}&role=${user.role}`;
      const res = await apiFetch(q);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiFetch(`/api/notifications/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiFetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setSystemStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiFetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auth Operations
  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authEmail.trim() || !authUsername.trim() || !authPassword.trim()) {
      setAuthError("Please fill out all operational identity parameters.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(authEmail.trim())) {
      setAuthError("Please specify a valid email address format (e.g. name@domain.com).");
      return;
    }

    if (authPassword !== authConfirmPass) {
      setAuthError("Identity security overrides confirm password mismatch.");
      return;
    }

    setAuthenticating(true);
    try {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          username: authUsername,
          password: authPassword
        })
      });

      const body = await res.json();
      if (!res.ok) {
        setAuthError(body.error || "Error establishing digital identity profile.");
        return;
      }

      // Direct secure login on successful registration (Email Verification removed as requested)
      setToken("token_" + body.user.uid);
      setUser(body.user);
      localStorage.setItem("guardian_token", "token_" + body.user.uid);
      localStorage.setItem("guardian_user", JSON.stringify(body.user));

      // Clear operational identity parameters
      setAuthEmail("");
      setAuthUsername("");
      setAuthPassword("");
      setAuthConfirmPass("");

      // Direct login redirection
      setCurrentView(body.user.role === 'admin' ? 'admin' : 'dashboard');
      setAuthSuccess("Account successfully registered! Logging you in...");
    } catch (err) {
      setAuthError("Failed to establish server connection sync.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLoginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Operational credentials email and password are required.");
      return;
    }

    const emailRegex2 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex2.test(authEmail.trim())) {
      setAuthError("Please specify a valid email address format (e.g. name@domain.com).");
      return;
    }

    setAuthenticating(true);
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword
        })
      });

      const body = await res.json();
      if (!res.ok) {
        setAuthError(body.error || "Credentials authorization invalid.");
        return;
      }

      setToken("token_" + body.user.uid);
      setUser(body.user);
      localStorage.setItem("guardian_token", "token_" + body.user.uid);
      localStorage.setItem("guardian_user", JSON.stringify(body.user));

      // Clear
      setAuthEmail("");
      setAuthPassword("");

      // Navigate to dashboard automatically
      setCurrentView(body.user.role === 'admin' ? 'admin' : 'dashboard');
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("guardian_token");
    localStorage.removeItem("guardian_user");
    setCurrentView('landing');
  };

  // Order Placement logic
  const handlePlaceOrder = async (serviceId: string, serviceTitle: string, price: number, formData: Record<string, string>): Promise<Order> => {
    if (!user) throw new Error("Unauthenticated user profile session.");

    const res = await apiFetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        serviceTitle,
        price,
        formData,
        userId: user.uid,
        userEmail: user.email
      })
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "Failed to compile manual order specifications.");
    }

    const orderCreated = await res.json();
    fetchOrders();
    return orderCreated;
  };

  // Submit payment proof screenshot
  const handleSubmitPaymentProof = async (orderId: string, proof: { name: string; email: string; phone: string; txId: string; screenshot: string }) => {
    const res = await apiFetch(`/api/orders/${orderId}/payment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proof)
    });

    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "Failed to submit transaction evidence coordinates.");
    }

    fetchOrders();
  };

  // Support Ticket logic
  const handleAddTicket = async (subject: string, firstMessage: string) => {
    if (!user) return;
    const res = await apiFetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.uid,
        userEmail: user.email,
        subject,
        message: firstMessage
      })
    });

    if (res.ok) {
      fetchTickets();
    }
  };

  const handleReplyTicket = async (ticketId: string, content: string) => {
    if (!user) return;
    const sender = user.role === 'admin' ? 'admin' : 'user';
    const res = await apiFetch(`/api/tickets/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, sender })
    });

    if (res.ok) {
      fetchTickets();
    }
  };

  // Mark notifications read
  const handleMarkNotificationRead = async (id: string) => {
    const res = await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
    if (res.ok && user) {
      fetchNotifications();
    }
  };

  // Override / update landing page theme customizations
  const handleUpdateTheme = async (themeData: Partial<ThemeConfig>) => {
    const res = await apiFetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(themeData)
    });

    if (res.ok) {
      const updated = await res.json();
      setTheme(updated);
    }
  };

  // Manage Services (Admin)
  const handleCreateService = async (serviceData: Omit<Service, 'id' | 'enabled'>) => {
    const res = await apiFetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to deploy new commercial service.");
    }
    fetchServices();
  };

  const handleUpdateServiceSub = async (id: string, updates: Partial<Service>) => {
    const res = await apiFetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to update service properties.");
    }
    fetchServices();
  };

  const handleDeleteServiceSub = async (id: string) => {
    const res = await apiFetch(`/api/services/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to scrap/delete existing service.");
    }
    fetchServices();
  };

  // Admin order approvals
  const handleApproveOrder = async (id: string) => {
    const res = await apiFetch(`/api/orders/${id}/approve`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to approve payment vetting request.");
    }
    fetchOrders();
    fetchStats();
  };

  const handleProcessOrder = async (id: string) => {
    const res = await apiFetch(`/api/orders/${id}/process`, { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to initiate client project execution.");
    }
    fetchOrders();
    fetchStats();
  };

  const handleApproveAllPendingOrders = async () => {
    const res = await apiFetch("/api/orders/approve-all", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to bulk approve pending orders.");
    }
    fetchOrders();
    fetchStats();
  };

  const handleRejectOrder = async (id: string, reason: string) => {
    const res = await apiFetch(`/api/orders/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to submit rejection payload.");
    }
    fetchOrders();
    fetchStats();
  };

  // Ban trigger
  const handleBanUser = async (uid: string, isBanned: boolean) => {
    const res = await apiFetch(`/api/users/${uid}/ban`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to execute ban action instruction.");
    }
    fetchUsers();
  };

  // Admin toggler convenience role function
  const handleToggleAdminConvenience = async (userId: string) => {
    const res = await apiFetch(`/api/users/toggle-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem("guardian_user", JSON.stringify(data.user));
    }
  };

  return (
    <div className={`min-h-screen relative font-sans ${isDarkMode ? 'bg-[#050505] text-gray-100' : 'bg-gray-50 text-gray-900'} transition-all`}>
      
      {/* 0. SYSTEM ENCRYPTED MAINTENANCE INTERCEPT OVERLAY */}
      {theme.isMaintenanceEnabled && (!user || user.role !== 'admin') ? (
        <div className="min-h-screen bg-[#050505] text-gray-100 flex items-center justify-center px-6 relative overflow-hidden">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.08),transparent)] pointer-events-none" />
          
          <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-rose-500/10 shadow-2xl relative z-10 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse">
              <ShieldCheck size={32} />
            </div>
            
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-rose-500 font-bold uppercase tracking-widest bg-rose-500/5 px-2.5 py-1 rounded-full border border-rose-500/10 inline-block">
                SYS_STATUS // SECURITY_MAINTENANCE
              </span>
              <h2 className="font-display font-black text-2xl text-white tracking-tight">System Under Maintenance</h2>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Guardian Internet systems are currently undergoing scheduled administrative upgrades. Full client connectivity has been locked by general order.
              </p>
            </div>

            <div className="bg-rose-500/[0.02] border border-rose-500/10 p-4 rounded-2xl text-[11px] text-rose-300 font-mono text-left leading-relaxed">
              &gt; SECURE_OVERHAUL_ACTIVE<br />
              &gt; OPERATIVE_DEVICES: FORCE_LOCKOUT<br />
              &gt; SYSTEM_GATE: offline_503
            </div>

            <div className="pt-2 border-t border-white/5 space-y-4">
              <span className="text-[10px] text-gray-450 block font-mono">AUTHORIZED OPERATOR DECRYPT DEPLOYMENT KEY:</span>
              
              <form onSubmit={handleLoginUser} className="space-y-3">
                <input 
                  type="email" 
                  required 
                  placeholder="thomasjoh2030@gmail.com" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose-500 font-mono" 
                />
                <input 
                  type="password" 
                  required 
                  placeholder="Access Passcode" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full h-11 px-3.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose-500 font-mono" 
                />
                <button 
                  type="submit" 
                  disabled={authenticating}
                  className="w-full h-12 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
                >
                  {authenticating ? "Vetting clearance..." : "Decrypt Credentials & Bypass"}
                </button>
              </form>
              
              {authError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[11px] font-mono">
                  {authError}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
      
      {/* Upper floating theme/currency toggle switches for responsive ease */}
      <div className="fixed top-24 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all ${isDarkMode ? 'bg-white text-gray-900 border-gray-200' : 'bg-gray-900 text-white border-transparent'}`}
          title="Toggle Ambient Light/Dark Theme"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => handleCurrencyChange(currency === 'USD' ? 'TZS' : 'USD')}
          className={`w-10 h-10 rounded-full flex flex-col items-center justify-center border shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px] font-mono font-black ${isDarkMode ? 'bg-white text-gray-900 border-gray-100' : 'bg-gray-900 text-white border-transparent'}`}
          title={`Switch currency to ${currency === 'USD' ? 'TZS (Tsh)' : 'USD ($)'}`}
        >
          {currency}
        </button>
      </div>

      {/* RENDER VIEW SWITCH CORES */}
      <AnimatePresence mode="wait">

        {/* 1. PUBLIC LANDING PAGE */}
        {currentView === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage
              services={services}
              theme={theme}
              onSelectService={(service) => {
                if (user) {
                  setCurrentView('dashboard');
                } else {
                  // Direct to login but trigger quick warning
                  setAuthError("Operational Security protocols mandate creating standard credentials before order configuration.");
                  setCurrentView('register');
                }
              }}
              onNavigate={(view) => {
                if (view === 'dashboard' && user) {
                  setCurrentView(user.role === 'admin' ? 'admin' : 'dashboard');
                } else {
                  setCurrentView(view as any);
                }
              }}
              isAuthenticated={!!user}
              isDarkMode={isDarkMode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
            />
          </motion.div>
        )}

        {/* 2. SECURE AUTHENTICATION LOGIN VIEW */}
        {currentView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="min-h-screen flex items-center justify-center px-6 relative"
          >
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
            
            <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-purple-500/10 shadow-2xl relative z-10 text-left">
              <button 
                onClick={() => setCurrentView('landing')}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-white mb-6 cursor-pointer"
              >
                <ArrowLeft size={12} /> Back to civilian overview
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white">
                  <ShieldCheck size={18} />
                </div>
                <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-widest">Auth Protocol</span>
              </div>

              <h2 className="font-display font-bold text-2xl text-white mb-1.5 tracking-tight">Identity Login</h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">Awaiting entry credentials. Register below if you have not established security keys.</p>

              {theme.isComingSoonEnabled && (
                <div className="mb-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-left space-y-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-purple-400" />
                    <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-widest">Portal Launch Mode</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                    Operative Registration is open, but general logging access is locked until launch date.
                  </p>
                  {theme.opensAt && (
                    <div className="pt-2 text-xs font-mono text-purple-300">
                      Target Open Date: <span className="font-semibold">{new Date(theme.opensAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {authError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs mb-4">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase">EMAIL ADRESS</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="email" required placeholder="agent@agency.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase">PASSPHRASE KEY</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type={showPassword ? "text" : "password"} required placeholder="••••••••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full h-11 pl-11 pr-11 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                    <button 
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" disabled={authenticating}
                  className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {authenticating ? "Vetting clearance..." : "Decrypt Authenticate"}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-6 text-center">
                New Operative? <button onClick={() => { setAuthError(""); setCurrentView('register'); }} className="text-purple-400 hover:underline">Establish secure credentials</button>
              </p>
            </div>
          </motion.div>
        )}

        {/* 3. SECURE AUTHENTICATION REGISTER VIEW */}
        {currentView === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="min-h-screen flex items-center justify-center px-6 relative"
          >
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent)] pointer-events-none" />
            
            <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-purple-500/10 shadow-2xl relative z-10 text-left">
              <button 
                onClick={() => setCurrentView('landing')}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 hover:text-white mb-6 cursor-pointer"
              >
                <ArrowLeft size={12} /> Back to portal
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white">
                  <ShieldCheck size={18} />
                </div>
                <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-widest">Protocol Setup</span>
              </div>

              <h2 className="font-display font-bold text-2xl text-white mb-1.5 tracking-tight font-display">Create Secure Identity</h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">Register your electronic node on our system database.</p>

              {authError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs mb-4">
                  {authError}
                </div>
              )}

              <form onSubmit={handleRegisterUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase">Agency Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="text" required placeholder="agent_code" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase">EMAIL ADDRESS</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="email" required placeholder="agent@agency.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase">Create Key Access PASS</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="password" required placeholder="••••••••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-2 uppercase">Confirm Access Pass</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      type="password" required placeholder="••••••••••••••" value={authConfirmPass} onChange={(e) => setAuthConfirmPass(e.target.value)}
                      className="w-full h-11 pl-11 pr-4 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={authenticating}
                  className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {authenticating ? "Constructing node..." : "Deploy secure profile"}
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-6 text-center">
                Have an identity? <button onClick={() => { setAuthError(""); setCurrentView('login'); }} className="text-purple-400 hover:underline">Log in securely</button>
              </p>
            </div>
          </motion.div>
        )}

        {/* 4. PRIVATE USER CONSOLE DASHBOARD */}
        {currentView === 'dashboard' && user && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <UserDashboard
              user={user}
              services={services}
              orders={orders}
              tickets={tickets}
              notifications={notifications}
              theme={theme}
              onLogout={handleLogout}
              onNavigate={setCurrentView}
              onPlaceOrder={handlePlaceOrder}
              onSubmitPaymentProof={handleSubmitPaymentProof}
              onAddTicket={handleAddTicket}
              onReplyTicket={handleReplyTicket}
              onMarkNotificationRead={handleMarkNotificationRead}
              isDarkMode={isDarkMode}
              onToggleAdminConvenience={handleToggleAdminConvenience}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
            />
          </motion.div>
        )}

        {/* 5. PRIVILEGED OPERATIONS SUPER ADMIN DESK */}
        {currentView === 'admin' && user && user.role === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminDashboard
              user={user}
              services={services}
              orders={orders}
              tickets={tickets}
              theme={theme}
              stats={systemStats}
              users={usersList}
              onNavigate={setCurrentView}
              onCreateService={handleCreateService}
              onUpdateService={handleUpdateServiceSub}
              onDeleteService={handleDeleteServiceSub}
              onApproveOrder={handleApproveOrder}
              onProcessOrder={handleProcessOrder}
              onApproveAllOrders={handleApproveAllPendingOrders}
              onRejectOrder={handleRejectOrder}
              onReplyTicket={handleReplyTicket}
              onUpdateTheme={handleUpdateTheme}
              onBanUser={handleBanUser}
              isDarkMode={isDarkMode}
              currency={currency}
              onCurrencyChange={handleCurrencyChange}
            />
          </motion.div>
        )}

      </AnimatePresence>
        </>
      )}
    </div>
  );
}
