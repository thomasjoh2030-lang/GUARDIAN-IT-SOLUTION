import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  Service, 
  Order, 
  SupportTicket, 
  UserProfile, 
  ThemeConfig, 
  SystemStats, 
  Notification 
} from "./src/types";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Helper to write database
function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving database file:", error);
  }
}

// Helper to load database
function loadDB(): {
  users: UserProfile[];
  services: Service[];
  orders: Order[];
  tickets: SupportTicket[];
  notifications: Notification[];
  theme: ThemeConfig;
} {
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
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing & Ads",
      description: "Precision conversion operations on Meta, Google, and TikTok Networks.",
      longDescription: "Stop wasting budget. We construct deep funnel campaign maps, write conversion copy, design custom media briefs, and optimize bid mechanics.",
      price: 499,
      timeframe: "7 Days Setup",
      icon: "TrendingUp",
      enabled: true,
      fields: [
        { id: "monthly_budget", type: "number", label: "Estimated Monthly Ad Spend (USD)", required: true, placeholder: "1000" },
        { id: "target_location", type: "text", label: "Primary target regions/locations", required: true, placeholder: "United States, Europe" }
      ]
    },
    {
      id: "digital-products",
      title: "Selling Digital Products",
      description: "Fulfillment systems, checkout setups to sell digital assets globally.",
      longDescription: "Set up high-prestige digital shelves, automated PDF watermark stampers, video hosting filters, or recurring subscription vaults.",
      price: 199,
      timeframe: "3 - 5 Days",
      icon: "ShoppingBag",
      enabled: true,
      fields: [
        { id: "product_details", type: "notes", label: "Description of digital products being sold", required: true, placeholder: "E-books, Design asset packs..." },
        { id: "preferred_processor", type: "text", label: "Desired Checkout (e.g., Stripe, PayPal)", required: true, placeholder: "Stripe Checkout" }
      ]
    },
    {
      id: "movie-platform",
      title: "Streaming / Movie Platform",
      description: "Netflix-aesthetic custom streaming hubs with absolute video security.",
      longDescription: "High-definition custom content management portal. We bundle adaptive bitrate streaming players, dynamic catalogs, secure token playback, and high-performance CDN configs.",
      price: 999,
      timeframe: "10 - 15 Days",
      icon: "Tv",
      enabled: true,
      fields: [
        { id: "stream_name", type: "text", label: "Platform Branding Name", required: true, placeholder: "Nexus Cinema" },
        { id: "catalog_size", type: "number", label: "Estimated Total Media Count", required: true, placeholder: "150" }
      ]
    },
    {
      id: "youtube-automation",
      title: "YouTube Automation",
      description: "Passive cash-flow channels engineered from automated video flows.",
      longDescription: "Complete automated setup. We recruit expert scriptwriters, select elite voice actors, craft gorgeous custom thumbnail arrays, and integrate SEO metadata grids to trigger major YouTube algorithm push.",
      price: 799,
      timeframe: "10 Days Setup",
      icon: "Play",
      enabled: true,
      fields: [
        { id: "tube_niche", type: "text", label: "Channel Niche (e.g., Tech Luxury, Space)", required: true, placeholder: "Tech Luxury & Cryptography" },
        { id: "frequency", type: "number", label: "Target Videos per Week", required: true, placeholder: "3" }
      ]
    }
  ];

  const defaultTheme: ThemeConfig = {
    primaryColor: "violet",
    glowColor: "cyan",
    headlineText: "GUARDIAN INTERNET",
    subheadlineText: "ELITE CYBER OPS, ADVANCED DIGITAL SERVICES & IT ECOSYSTEMS",
    manualPaymentInstructions: "To fulfill this order, please submit your payment to our secure manual verification vault on Bitcoin or M-Pesa. Once the payment proof is uploaded, our elite technicians will vet the transactions and contact you on telegram/email within 1 hour.",
    paymentNumber: "BTC: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    paymentNumberName: "Bitcoin Premium Vault Account"
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading database file, creating fresh initial data:", error);
  }

  // Admin user bootstrapped automatically
  const defaultUsers: UserProfile[] = [
    {
      uid: "admin-default",
      email: "thomasjoh2030@gmail.com",
      username: "thomasjoh2030",
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ];

  const initialData = {
    users: defaultUsers,
    services: defaultServices,
    orders: [],
    tickets: [],
    notifications: [],
    theme: defaultTheme
  };

  saveDB(initialData);
  return initialData;
}

// Initialize simple database state
let dbState = loadDB();

// Build Server
async function startServer() {
  const app = express();
  
  // Set json body limit higher to allow base64 screenshot uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // --- API ROUTE ENDPOINTS ---

  // 1. AUTHENTICATION (Simulated)
  app.post("/api/auth/register", (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !username) {
      return res.status(400).json({ error: "Email and username are required." });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: "Please enter a valid standard email address format." });
    }

    // Email lowercase
    const formattedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = dbState.users.find(u => u.email.toLowerCase() === formattedEmail);
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Role check: thomasjoh2030@gmail.com is ALWAYS ADMIN.
    const isSpecialAdmin = formattedEmail === "thomasjoh2030@gmail.com";
    const role: 'user' | 'admin' = isSpecialAdmin ? 'admin' : 'user';

    // Set password correctly (especially if it is thomasjoh2030 limit it to 203040)
    let finalPassword = password || "";
    if (isSpecialAdmin) {
      finalPassword = "203040";
    }

    const newUser: UserProfile & { password?: string } = {
      uid: "user_" + Math.random().toString(36).substr(2, 9),
      email: formattedEmail,
      username: username.trim(),
      role: role,
      password: finalPassword,
      createdAt: new Date().toISOString()
    };

    dbState.users.push(newUser);
    saveDB(dbState);

    // Dynamic welcoming notification
    const notification: Notification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      userId: newUser.uid,
      title: "Welcome to Guardian Internet!",
      message: `Your account is secure. Welcome, Agent ${newUser.username}. Explore our cyber solutions now.`,
      type: "success",
      createdAt: new Date().toISOString(),
      read: false
    };
    dbState.notifications.push(notification);

    // Notify administrators of registration
    dbState.users.filter(u => u.role === "admin").forEach(admin => {
      dbState.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: admin.uid,
        title: "👤 New User Registered",
        message: `New agent registered: ${newUser.username} (${formattedEmail}).`,
        type: "success",
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    saveDB(dbState);

    res.json({ token: "token_" + newUser.uid, user: newUser });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: "Please enter a valid standard email address format." });
    }

    const formattedEmail = email.toLowerCase().trim();
    const isAdminUser = formattedEmail === "thomasjoh2030@gmail.com";

    // 1. Enforce Maintenance / Coming soon mode blocks on login
    if (!isAdminUser) {
      if (dbState.theme.isMaintenanceEnabled) {
        return res.status(403).json({ error: "System is in secure maintenance mode. Standard operative login has been temporarily disconnected by administrative order." });
      }
      if (dbState.theme.isComingSoonEnabled) {
        return res.status(403).json({ error: `Portal is in Coming Soon launch mode (Scheduled opening: ${dbState.theme.opensAt || "Soon"}). Standard logins are locked.` });
      }
    }

    let user = dbState.users.find(u => u.email.toLowerCase() === formattedEmail);

    // If Admin email is entered but user does not exist in DB yet, auto-bootstrap them
    if (!user && isAdminUser) {
      user = {
        uid: "admin_thomas",
        email: "thomasjoh2030@gmail.com",
        username: "thomasjoh2030",
        role: "admin",
        password: "203040",
        createdAt: new Date().toISOString()
      } as any;
      dbState.users.push(user);
      saveDB(dbState);
    }

    if (!user) {
      return res.status(404).json({ error: "Account not found. Please click Register to create your identity." });
    }

    // Verify Password
    const inputPassword = password || "";
    const storedPassword = (user as any).password || "";

    if (isAdminUser) {
      if (inputPassword !== "203040") {
        return res.status(401).json({ error: "Secure authorization code mismatch. Access denied." });
      }
    } else {
      // For general user, if they have a stored password, check it
      if (storedPassword && storedPassword !== inputPassword) {
        return res.status(401).json({ error: "Mismatched security passcode check. Authenticate again." });
      }
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "This electronic identity has been banned by the Administrator due to policy violation." });
    }

    res.json({ token: "token_" + user.uid, user });
  });

  // Toggle user admin rights (for demo ease)
  app.post("/api/users/toggle-admin", (req, res) => {
    const { userId } = req.body;
    const user = dbState.users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.role = user.role === "admin" ? "user" : "admin";
    saveDB(dbState);
    res.json({ success: true, user });
  });


  // 2. SERVICES ENDPOINTS
  app.get("/api/services", (req, res) => {
    res.json(dbState.services);
  });

  app.post("/api/services", (req, res) => {
    const { title, description, longDescription, price, timeframe, icon, fields, isComingSoon, imageUrl } = req.body;
    if (!title || !description || price === undefined) {
      return res.status(400).json({ error: "Title, description, and price are required." });
    }

    const newService: Service = {
      id: "ser_" + Math.random().toString(36).substr(2, 9),
      title,
      description,
      longDescription: longDescription || description,
      price: Number(price),
      timeframe: timeframe || "Immediate",
      icon: icon || "Cpu",
      fields: fields || [],
      enabled: true,
      isComingSoon: isComingSoon !== undefined ? !!isComingSoon : false,
      imageUrl: imageUrl || ""
    };

    dbState.services.push(newService);
    saveDB(dbState);
    res.json(newService);
  });

  app.put("/api/services/:id", (req, res) => {
    const { id } = req.params;
    const index = dbState.services.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Service not found." });
    }

    dbState.services[index] = {
      ...dbState.services[index],
      ...req.body
    };

    saveDB(dbState);
    res.json(dbState.services[index]);
  });

  app.delete("/api/services/:id", (req, res) => {
    const { id } = req.params;
    const initialLength = dbState.services.length;
    dbState.services = dbState.services.filter(s => s.id !== id);
    
    if (dbState.services.length === initialLength) {
      return res.status(404).json({ error: "Service not found." });
    }

    saveDB(dbState);
    res.json({ success: true, id });
  });


  // 3. THEME/GENERAL SETTINGS ENDPOINTS
  app.get("/api/theme", (req, res) => {
    res.json(dbState.theme);
  });

  app.post("/api/theme", (req, res) => {
    dbState.theme = {
      ...dbState.theme,
      ...req.body
    };
    saveDB(dbState);
    res.json(dbState.theme);
  });


  // 4. ORDERS ENDPOINTS
  app.get("/api/orders", (req, res) => {
    const { userId, role } = req.query;
    if (role === "admin") {
      return res.json(dbState.orders);
    }
    if (!userId) {
      return res.status(400).json({ error: "Must specify userId to load orders." });
    }
    const filtered = dbState.orders.filter(o => o.userId === userId);
    res.json(filtered);
  });

  app.post("/api/orders", (req, res) => {
    const { serviceId, userId, userEmail, formData, price, serviceTitle } = req.body;
    if (!serviceId || !userId || !userEmail) {
      return res.status(400).json({ error: "Missing required order variables." });
    }

    const newOrder: Order = {
      id: "ord_" + Math.random().toString(36).substr(2, 9),
      serviceId,
      serviceTitle,
      price: Number(price),
      userId,
      userEmail,
      formData: formData || {},
      status: "pending",
      createdAt: new Date().toISOString()
    };

    dbState.orders.push(newOrder);
    saveDB(dbState);

    // Notify user of pending payment submit requirement
    const userNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      userId,
      title: "Order Submitted - Pending Proof",
      message: `Your tactical request has been received. Please upload payment proof to start operations on ${serviceTitle}.`,
      type: "info",
      createdAt: new Date().toISOString(),
      read: false
    };
    dbState.notifications.push(userNotif);

    // Notify administrators
    dbState.users.filter(u => u.role === "admin").forEach(admin => {
      dbState.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: admin.uid,
        title: "New Incoming Operational Order",
        message: `Client ${userEmail} ordered ${serviceTitle}. Awaiting manual payment verification ID.`,
        type: "info",
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    saveDB(dbState);
    res.json(newOrder);
  });

  // Submit payment proof and update fields
  app.put("/api/orders/:id/payment", (req, res) => {
    const { id } = req.params;
    const { name, email, phone, txId, screenshot } = req.body;

    const order = dbState.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    order.paymentProofName = name;
    order.paymentProofEmail = email;
    order.paymentProofPhone = phone;
    order.paymentProofTxId = txId;
    order.paymentProofScreenshot = screenshot;
    order.status = "pending"; // keeps pending to wait for admin review

    saveDB(dbState);

    // Notify admin database
    dbState.users.filter(u => u.role === "admin").forEach(admin => {
      dbState.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: admin.uid,
        title: "Proof Uploaded",
        message: `User ${order.userEmail} uploaded bank proof for ${order.serviceTitle} (TxID: ${txId}). Approve now.`,
        type: "success",
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    saveDB(dbState);
    res.json(order);
  });

  // Approve Order Payment (Admin)
  app.post("/api/orders/:id/approve", (req, res) => {
    const { id } = req.params;
    const order = dbState.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    order.status = "approved";
    order.paymentVerifiedAt = new Date().toISOString();

    // Create client Success notification
    const clientNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      userId: order.userId,
      title: "✅ Payment Vetted & Operation Live",
      message: `Your payment was successfully approved by Guardian operations. Our elite tech team is now executing ${order.serviceTitle}.`,
      type: "success",
      createdAt: new Date().toISOString(),
      read: false
    };
    dbState.notifications.push(clientNotif);
    saveDB(dbState);

    res.json(order);
  });

  // Track order execution to Processing status (Admin)
  app.post("/api/orders/:id/process", (req, res) => {
    const { id } = req.params;
    const order = dbState.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    order.status = "processing";

    // Create client Processing notification
    const clientNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      userId: order.userId,
      title: "⚙️ Package Processing Initiated",
      message: `The operations unit has vetted your documents and initiated actual deployment for: ${order.serviceTitle}. Status: Processing.`,
      type: "info",
      createdAt: new Date().toISOString(),
      read: false
    };
    dbState.notifications.push(clientNotif);
    saveDB(dbState);

    res.json(order);
  });

  // Bulk Approve All Pending Orders (Admin)
  app.post("/api/orders/approve-all", (req, res) => {
    const pendingOrders = dbState.orders.filter(o => o.status === "pending");
    const verifiedAt = new Date().toISOString();

    pendingOrders.forEach(order => {
      order.status = "approved";
      order.paymentVerifiedAt = verifiedAt;

      // Create client Success notification
      const clientNotif: Notification = {
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: order.userId,
        title: "✅ Payment Vetted & Operation Live",
        message: `Your payment was successfully approved by Guardian operations. Our elite tech team is now executing ${order.serviceTitle}.`,
        type: "success",
        createdAt: verifiedAt,
        read: false
      };
      dbState.notifications.push(clientNotif);
    });

    saveDB(dbState);
    res.json({ success: true, count: pendingOrders.length });
  });

  // Reject Order Payment (Admin)
  app.post("/api/orders/:id/reject", (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const order = dbState.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = "rejected";
    order.rejectionReason = reason || "Irregular payment records, missing transaction hashes, or empty screenshot proof.";

    // Notify client of failure
    const clientNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      userId: order.userId,
      title: "❌ Payment Validation Rejected",
      message: `Your payment validation request was rejected: "${order.rejectionReason}". Correct details or contact desk.`,
      type: "danger",
      createdAt: new Date().toISOString(),
      read: false
    };
    dbState.notifications.push(clientNotif);
    saveDB(dbState);

    res.json(order);
  });


  // 5. USER CHATS / SUPPORT TICKETS
  app.get("/api/tickets", (req, res) => {
    const { userId, role } = req.query;
    if (role === "admin") {
      return res.json(dbState.tickets);
    }
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    res.json(dbState.tickets.filter(t => t.userId === userId));
  });

  app.post("/api/tickets", (req, res) => {
    const { userId, userEmail, subject, message } = req.body;
    if (!userId || !userEmail || !subject || !message) {
      return res.status(400).json({ error: "Subject and first message are required." });
    }

    const newTicket: SupportTicket = {
      id: "tick_" + Math.random().toString(36).substr(2, 9),
      userId,
      userEmail,
      subject,
      messages: [
        {
          sender: "user",
          content: message,
          createdAt: new Date().toISOString()
        }
      ],
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbState.tickets.push(newTicket);
    
    // Admin notification
    dbState.users.filter(u => u.role === "admin").forEach(admin => {
      dbState.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: admin.uid,
        title: "New Support Ticket desk",
        message: `Client ${userEmail} filed support ticket: "${subject}".`,
        type: "info",
        createdAt: new Date().toISOString(),
        read: false
      });
    });

    saveDB(dbState);
    res.json(newTicket);
  });

  app.post("/api/tickets/:id/reply", (req, res) => {
    const { id } = req.params;
    const { content, sender } = req.body; // sender: 'user' | 'admin'

    const ticket = dbState.tickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    ticket.messages.push({
      sender,
      content,
      createdAt: new Date().toISOString()
    });
    ticket.updatedAt = new Date().toISOString();

    // Trigger target notifications
    if (sender === "user") {
      dbState.users.filter(user => user.role === "admin").forEach(admin => {
        dbState.notifications.push({
          id: "notif_" + Math.random().toString(36).substr(2, 9),
          userId: admin.uid,
          title: "New Reply in Support Ticket",
          message: `${ticket.userEmail} updated support string.`,
          type: "info",
          createdAt: new Date().toISOString(),
          read: false
        });
      });
    } else {
      // Notify the specific client
      dbState.notifications.push({
        id: "notif_" + Math.random().toString(36).substr(2, 9),
        userId: ticket.userId,
        title: "💬 Admin Support Replied",
        message: `Support Desk replied to "${ticket.subject}". Check your Support messages room.`,
        type: "success",
        createdAt: new Date().toISOString(),
        read: false
      });
    }

    saveDB(dbState);
    res.json(ticket);
  });


  // 6. SYSTEM STAMPED ANALYTICS DB
  app.get("/api/stats", (req, res) => {
    const approvedOrders = dbState.orders.filter(o => o.status === "approved");
    const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.price, 0);

    const stats: SystemStats = {
      totalRevenue,
      totalOrders: dbState.orders.length,
      approvedOrders: approvedOrders.length,
      pendingOrders: dbState.orders.filter(o => o.status === "pending").length,
      rejectedOrders: dbState.orders.filter(o => o.status === "rejected").length,
      totalUsers: dbState.users.length
    };

    res.json(stats);
  });


  // 7. USER MANAGEMENT (Admin)
  app.get("/api/profile", (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    const user = dbState.users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    const { password, ...cleaned } = user as any;
    res.json(cleaned);
  });

  app.get("/api/users", (req, res) => {
    res.json(dbState.users);
  });

  app.post("/api/users/:uid/ban", (req, res) => {
    const { uid } = req.params;
    const { isBanned } = req.body;
    
    const user = dbState.users.find(u => u.uid === uid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isBanned = isBanned;
    saveDB(dbState);
    res.json(user);
  });


  // 8. NOTIFICATIONS ENDPOINT
  app.get("/api/notifications/:userId", (req, res) => {
    const { userId } = req.params;
    const list = dbState.notifications.filter(n => n.userId === userId);
    res.json(list.reverse()); // latest first
  });

  app.post("/api/notifications/:id/read", (req, res) => {
    const { id } = req.params;
    const notif = dbState.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      saveDB(dbState);
    }
    res.json({ success: true });
  });

  // --- VITE DEV OR PRODUCTION SERVE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Listen
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Guardian Internet backend operations standing by on port ${PORT}`);
  });
}

startServer();
