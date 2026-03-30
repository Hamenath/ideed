import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, setDoc, serverTimestamp, query, orderBy, onSnapshot, increment } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Mail, Phone, Trash2, CheckCircle2, LayoutDashboard, UserCircle, Search, RefreshCw, CalendarDays, Inbox, LogOut, Bell, Moon, Sun, TrendingUp, DollarSign, Users, ShoppingCart, Package, Activity, Monitor } from "lucide-react";
import { Sidebar } from "../components/ui/dashboard-with-collapsible-sidebar";
import { motion } from "motion/react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget?: string;
  message: string;
  status: string; // 'New' or 'Contacted'
  createdAt: any;
}

export function AdminDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [linkClicks, setLinkClicks] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          status: data.status || "New"
        };
      }) as ContactMessage[];
      
      setMessages(messagesData);

      // Fetch active projects count and calculate total earnings
      const projSnap = await getDocs(collection(db, "projects"));
      setTotalProjects(projSnap.size);
      
      let earnings = 0;
      projSnap.docs.forEach(doc => {
        const data = doc.data();
        const budgetStr = data.budget || "0";
        const budgetNumeric = parseInt(budgetStr.replace(/[^0-9]/g, "")) || 0;
        earnings += budgetNumeric;
      });
      setTotalEarnings(earnings);

      // Real-time Traffic Listener (from stats collection, doc 'counters')
      const statsRef = doc(db, "stats", "counters");
      const unsubStats = onSnapshot(statsRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const newClicks = data.linkClicks || 0;

          setLinkClicks((current) => {
            if (newClicks > current && current !== 0) {
              setIsClicking(true);
              setTimeout(() => setIsClicking(false), 2000); 
            }
            return newClicks;
          });
        } else {
          setDoc(statsRef, { visits: 1250, linkClicks: 840, lastUpdate: serverTimestamp() });
        }
      });

      // Fetch Notifications
      const notifQ = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      const notifSnap = await getDocs(notifQ);
      setNotifications(notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      return unsubStats;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.read);
      for (const n of unreadNotifs) {
        await updateDoc(doc(db, "notifications", n.id), { read: true });
      }
      setNotifications(notifications.map(n => ({...n, read: true})));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUser(user);
        setCheckingAuth(false);
        fetchMessages();
      } else {
        window.location.href = "/admin/login";
      }
    });
    return unsub;
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to completely delete this lead?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete message.");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      const prevMessage = messages.find(m => m.id === id);
      setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg));
      
      await updateDoc(doc(db, "contacts", id), { status: newStatus });
      
      if (newStatus === "Converted" && prevMessage) {
        await addDoc(collection(db, "projects"), {
          clientName: prevMessage.name,
          projectName: prevMessage.projectType,
          service: prevMessage.projectType,
          status: "Planning",
          budget: prevMessage.budget || "N/A",
          notes: prevMessage.message,
          deadline: "",
          progress: 10,
          createdAt: serverTimestamp(),
        });

        // Push notification to DB
        await addDoc(collection(db, "notifications"), {
            text: `New lead converted: ${prevMessage.name}`,
            read: false,
            createdAt: serverTimestamp()
        });

        setTotalProjects(p => p + 1);
        alert("Lead marked as Converted and Project automatically created!");
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      alert("Failed to update lead status.");
      fetchMessages(); // Revert optimistic changes on failure
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.projectType.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`flex min-h-[100vh] w-full ${isDark ? 'dark' : ''} font-sans`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* New Collapsible Sidebar from UI Library */}
        <Sidebar />

        {/* Main Dashboard Workspace */}
        <main className="flex-1 overflow-x-hidden pt-8 px-6 md:px-10 pb-20">
          
          {/* Header section */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Manage and review project requests from your website.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search leads..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm font-medium transition-colors"
                />
              </div>
              
              <button 
                onClick={fetchMessages} 
                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all shadow-sm"
              >
                <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""} />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shadow-sm"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(n => {
                          const time = n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
                          return (
                            <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${n.read ? 'opacity-60' : ''}`}>
                              <p className="text-sm font-medium">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{time}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">No new notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <button onClick={() => signOut(auth)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm" title="Log out">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* Detailed Dashboard Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <Activity className="h-5 w-5 text-blue-600 mb-3" />
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Status: Leads</h3>
                <p className="text-3xl font-black">{messages.length}</p>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <Users className="h-5 w-5 text-orange-600 mb-3" />
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">New Inquiries</h3>
                <p className="text-3xl font-black">{messages.filter(m => m.status === 'New').length}</p>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <CheckCircle2 className="h-5 w-5 text-green-600 mb-3" />
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Converted</h3>
                <p className="text-3xl font-black">{messages.filter(m => m.status === 'Converted').length}</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between">
              <div>
                <DollarSign className="h-5 w-5 text-emerald-600 mb-3" />
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Earnings</h3>
                <p className="text-3xl font-black">${totalEarnings >= 1000 ? (totalEarnings / 1000).toFixed(1) + 'k' : totalEarnings.toFixed(0)}</p>
                <span className="text-[10px] text-blue-500 font-bold">From DB Budgets</span>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <Package className="h-5 w-5 text-indigo-600 mb-3" />
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Company URL Clicks</h3>
                <motion.p 
                  animate={{ 
                    scale: isClicking ? 1.1 : 1,
                    color: isClicking ? "#22c55e" : (isDark ? "#f3f4f6" : "#111827") 
                  }}
                  className="text-3xl font-black transition-colors duration-500"
                >
                  {linkClicks}
                </motion.p>
                <span className="text-[10px] text-indigo-500 font-bold">Real-time engagement</span>
                
                {isClicking && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -20 }}
                    className="absolute right-6 top-10 text-green-500 font-bold text-xs"
                  >
                    +1 Click
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity (Incoming Leads Stream) */}
            <div className="col-span-1 lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live Leads Board</h3>
                 </div>
                 
                 <div className="flex flex-col gap-4 relative min-h-[400px]">
                    {loading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 rounded-2xl">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                      </div>
                    ) : filteredMessages.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
                        <Inbox size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No leads found</h3>
                        <p className="text-gray-500 dark:text-gray-400">Wait for clients to complete the contact form.</p>
                      </div>
                    ) : (
                      filteredMessages.map((msg, index) => {
                        const dateObj = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();

                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            key={msg.id} 
                            className={`bg-white dark:bg-gray-900 rounded-xl border ${msg.status === 'Converted' ? 'border-green-200 dark:border-green-900/50' : msg.status === 'Contacted' ? 'border-blue-200 dark:border-blue-900/50' : 'border-orange-200 dark:border-orange-900/50'} p-5 flex flex-col relative transition-shadow hover:shadow-md`}
                          >
                            <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                              <div>
                                <div className="flex gap-3 items-center mb-1">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{msg.name}</h3>
                                  <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full ${msg.status === 'Converted' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' : msg.status === 'Contacted' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800 animate-pulse'}`}>
                                    {msg.status}
                                  </span>
                                </div>
                                <div className="flex gap-4 text-sm mt-2">
                                  <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><Mail size={14}/> {msg.email}</a>
                                  <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"><Phone size={14}/> {msg.phone}</a>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700">
                                  <CalendarDays size={14}/> 
                                  {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 mb-5">
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-md border border-blue-100 dark:border-blue-800">
                                  {msg.projectType}
                                </span>
                                {msg.budget && (
                                  <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-md border border-purple-100 dark:border-purple-800">
                                    {msg.budget}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                "{msg.message}"
                              </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                 {msg.status === "New" && (
                                    <button 
                                      onClick={() => updateStatus(msg.id, "Contacted")}
                                      className="text-xs font-bold px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-200 dark:border-blue-800"
                                    >
                                      Mark Contacted
                                    </button>
                                 )}
                                 {msg.status === "Contacted" && (
                                    <button 
                                      onClick={() => updateStatus(msg.id, "Converted")}
                                      className="text-xs font-bold px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all border border-green-200 dark:border-green-800"
                                    >
                                      Mark Converted
                                    </button>
                                 )}
                                 {msg.status === "Converted" && (
                                    <span className="text-xs font-bold text-green-500 dark:text-green-400 flex items-center gap-1">
                                      <CheckCircle2 size={16} /> Client Won
                                    </span>
                                 )}
                              </div>
                              
                              <button 
                                onClick={() => handleDelete(msg.id)}
                                className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Move to Trash"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                 </div>
              </div>
            </div>

            {/* Quick Stats Column */}
            <div className="col-span-1 space-y-6">
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Projects</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{totalProjects}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {messages.length > 0 ? Math.round((messages.filter(m => m.status === 'Converted').length / messages.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${messages.length > 0 ? Math.round((messages.filter(m => m.status === 'Converted').length / messages.length) * 100) : 0}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 py-2">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">Admin dashboard successfully merged with live Firebase data.</p>
                  </div>
                  <div className="flex items-start gap-3 py-2">
                    <div className="mt-0.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">Project sync is active and running smoothly in the background.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
