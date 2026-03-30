import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Mail, Phone, Trash2, CheckCircle2, Clock, LayoutDashboard, UserCircle, Search, RefreshCw, CalendarDays, Inbox, LogOut } from "lucide-react";
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
          status: data.status || "New" // Default schema migration
        };
      }) as ContactMessage[];
      
      setMessages(messagesData);

      // Fetch active projects count
      const projSnap = await getDocs(collection(db, "projects"));
      setTotalProjects(projSnap.size);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
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
          createdAt: serverTimestamp(),
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
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Inter, sans-serif" }}>
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-blue-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            iDEED <span className="text-gray-900 text-lg">Admin</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} />
            Lead Management
          </a>
          <a href="/admin/projects" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <Inbox size={20} />
            Projects DB
          </a>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-gray-600">
            <div className="flex items-center gap-3">
              <UserCircle size={24} />
              <div className="text-sm">
                <p className="font-bold text-gray-900">Admin</p>
                <p className="text-[10px] truncate max-w-[80px]">{adminUser?.email}</p>
              </div>
            </div>
            <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 transition-colors" title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 overflow-x-hidden pt-8 px-6 md:px-10 pb-20">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Incoming Leads</h2>
            <p className="text-gray-500 font-medium">Manage and review project requests from your website.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search leads..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm font-medium"
              />
            </div>
            <button 
              onClick={fetchMessages} 
              className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
            >
              <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""} />
            </button>
          </div>
        </header>

        {/* Status Metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-6 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 text-xs font-bold tracking-wider uppercase mb-1">Total Leads</p>
            <p className="text-3xl font-black text-gray-900">{messages.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex flex-col justify-center bg-gradient-to-br from-white to-orange-50/30">
            <p className="text-orange-600 text-xs font-bold tracking-wider uppercase mb-1">New</p>
            <p className="text-3xl font-black text-gray-900">{messages.filter(m => m.status === 'New').length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-center bg-gradient-to-br from-white to-blue-50/30">
            <p className="text-blue-600 text-xs font-bold tracking-wider uppercase mb-1">Contacted</p>
            <p className="text-3xl font-black text-gray-900">{messages.filter(m => m.status === 'Contacted').length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm flex flex-col justify-center bg-gradient-to-br from-white to-green-50/30">
            <p className="text-green-600 text-xs font-bold tracking-wider uppercase mb-1">Converted</p>
            <p className="text-3xl font-black text-gray-900">{messages.filter(m => m.status === 'Converted').length}</p>
          </div>
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <p className="text-gray-400 text-xs font-bold tracking-wider uppercase mb-1">Total Projects</p>
            <p className="text-3xl font-black text-white">{totalProjects}</p>
          </div>
        </div>

        {/* Data Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 relative min-h-[400px]">
          {loading ? (
            <div className="col-span-full absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10 rounded-2xl">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No leads found</h3>
              <p className="text-gray-500">Wait for clients to complete the contact form.</p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const dateObj = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
              const isContacted = msg.status === "Contacted";

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={msg.id} 
                  className={`bg-white rounded-2xl border ${msg.status === 'Converted' ? 'border-green-200' : msg.status === 'Contacted' ? 'border-blue-200' : 'border-orange-200 shadow-[0_8px_30px_rgb(37,99,235,0.06)]'} p-6 flex flex-col relative`}
                >
                  <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-5">
                    <div>
                      <div className="flex gap-3 items-center mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{msg.name}</h3>
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full ${msg.status === 'Converted' ? 'bg-green-50 text-green-700 border border-green-200' : msg.status === 'Contacted' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse'}`}>
                          {msg.status}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm mt-3">
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-medium transition-colors"><Mail size={14}/> {msg.email}</a>
                        <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-medium transition-colors"><Phone size={14}/> {msg.phone}</a>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <CalendarDays size={14}/> 
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-100">
                        {msg.projectType}
                      </span>
                      {msg.budget && (
                        <span className="px-3 py-1.5 bg-purple-50 text-purple-700 font-bold text-xs rounded-lg border border-purple-100">
                          {msg.budget}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      "{msg.message}"
                    </p>
                  </div>

                  <div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       {msg.status === "New" && (
                          <button 
                            onClick={() => updateStatus(msg.id, "Contacted")}
                            className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all border border-blue-200"
                          >
                            Mark Contacted
                          </button>
                       )}
                       {msg.status === "Contacted" && (
                          <button 
                            onClick={() => updateStatus(msg.id, "Converted")}
                            className="text-xs font-bold px-4 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-all border border-green-200"
                          >
                            Mark Converted
                          </button>
                       )}
                       {msg.status === "Converted" && (
                          <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                            <CheckCircle2 size={16} /> Client Won
                          </span>
                       )}
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(msg.id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Move to Trash"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
