import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Sidebar } from "../components/ui/dashboard-with-collapsible-sidebar";
import { Search, RefreshCw, LogOut, Trash2, UserPlus, Mail, Phone, Moon, Sun, Bell } from "lucide-react";
import { motion } from "motion/react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget?: string;
  message: string;
  status: string;
  createdAt: any;
}

export function AdminLeads() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
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

      const notifQ = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      const notifSnap = await getDocs(notifQ);
      setNotifications(notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching leads:", error);
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
        setCheckingAuth(false);
        fetchMessages();
      } else {
        window.location.href = "/admin/login";
      }
    });
    return unsub;
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete lead.");
    }
  };

  const convertToClient = async (msg: ContactMessage) => {
    if (!window.confirm(`Convert ${msg.name} to a Client/Project?`)) return;
    try {
      // Optimistic upate
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: "Converted" } : m));
      
      await updateDoc(doc(db, "contacts", msg.id), { status: "Converted" });
      
      await addDoc(collection(db, "projects"), {
        clientName: msg.name,
        projectName: msg.projectType,
        service: msg.projectType,
        status: "Planning",
        budget: msg.budget || "N/A",
        notes: msg.message,
        deadline: "",
        progress: 10,
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
          text: `New lead converted: ${msg.name}`,
          read: false,
          createdAt: serverTimestamp()
      });

      alert("Lead successfully converted to Client/Project!");
    } catch (error) {
      console.error("Error converting lead: ", error);
      alert("Failed to convert lead.");
      fetchMessages();
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.projectType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`flex min-h-[100vh] w-full ${isDark ? 'dark' : ''} font-sans`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        <Sidebar />

        <main className="flex-1 overflow-x-hidden pt-8 px-6 md:px-10 pb-20">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Leads Management</h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Review and conversion of form submissions.</p>
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
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden text-left">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <button onClick={markAllAsRead} className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 hover:underline">
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

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">
                      <tr>
                         <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">Name</th>
                         <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">Contact</th>
                         <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">Service</th>
                         <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">Status</th>
                         <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">Date</th>
                         <th className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {loading ? (
                          <tr><td colSpan={6} className="px-6 py-12 text-center"><RefreshCw className="animate-spin text-blue-500 mx-auto" /></td></tr>
                      ) : filteredMessages.length === 0 ? (
                          <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No leads found.</td></tr>
                      ) : (
                          filteredMessages.map((msg, index) => {
                             const dateObj = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
                             return (
                                <motion.tr 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: index * 0.03 }}
                                  key={msg.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                                >
                                   <td className="px-6 py-4 align-top">
                                      <span className="font-bold text-gray-900 dark:text-gray-100">{msg.name}</span>
                                      <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={msg.message}>
                                        {msg.message}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 align-top text-sm">
                                      <div className="flex flex-col gap-1.5">
                                         <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600"><Mail size={14}/> <span className="truncate max-w-[150px]">{msg.email}</span></a>
                                         <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600"><Phone size={14}/> {msg.phone}</a>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 align-top">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{msg.projectType}</span>
                                      {msg.budget && <div className="text-xs text-gray-500 mt-1">{msg.budget}</div>}
                                   </td>
                                   <td className="px-6 py-4 align-top">
                                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${msg.status === 'Converted' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' : msg.status === 'Contacted' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800'}`}>
                                        {msg.status}
                                      </span>
                                   </td>
                                   <td className="px-6 py-4 align-top text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                   </td>
                                   <td className="px-6 py-4 align-top text-right space-x-2 whitespace-nowrap">
                                      {msg.status !== 'Converted' && (
                                          <button 
                                            onClick={() => convertToClient(msg)} 
                                            className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
                                            title="Convert to Client"
                                          >
                                            <UserPlus size={16} />
                                          </button>
                                      )}
                                      <button 
                                        onClick={() => handleDelete(msg.id)}
                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors border border-gray-100 dark:border-gray-700"
                                        title="Delete Lead"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                   </td>
                                </motion.tr>
                             );
                          })
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
