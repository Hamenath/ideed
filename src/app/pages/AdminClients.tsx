import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Sidebar } from "../components/ui/dashboard-with-collapsible-sidebar";
import { Search, RefreshCw, LogOut, Moon, Sun, UserCheck, Briefcase, DollarSign, Mail, Phone, FolderOpen } from "lucide-react";
import { motion } from "motion/react";

interface Client {
  id: string;
  clientName: string;
  projectName: string;
  service: string;
  status: string;
  budget: string;
  deadline: string;
  notes: string;
  progress: number;
  createdAt: any;
  // From contacts
  email?: string;
  phone?: string;
}

export function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Fetch all projects (converted leads)
      const projSnap = await getDocs(collection(db, "projects"));
      const projectsData = projSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Client[];
      projectsData.sort((a, b) => {
        const tA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
        const tB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
        return tB - tA;
      });

      // Fetch contacts to enrich client data with email/phone
      const contSnap = await getDocs(collection(db, "contacts"));
      const contactsMap: Record<string, any> = {};
      contSnap.docs.forEach(d => {
        const data = d.data();
        if (data.name) contactsMap[data.name.toLowerCase()] = data;
      });

      const enriched = projectsData.map(proj => {
        const contact = contactsMap[proj.clientName?.toLowerCase()] || {};
        return { ...proj, email: contact.email || null, phone: contact.phone || null };
      });

      setClients(enriched);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) { setCheckingAuth(false); fetchClients(); }
      else window.location.href = "/admin/login";
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

  const filtered = clients.filter(c =>
    c.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    c.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    c.service?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    Completed: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    Development: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    Planning: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    "On Hold": "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  return (
    <div className={`flex min-h-[100vh] w-full ${isDark ? 'dark' : ''} font-sans`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Sidebar />

        <main className="flex-1 overflow-x-hidden pt-8 px-6 md:px-10 pb-20">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Clients</h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">All converted leads with active projects.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm font-medium"
                />
              </div>
              <button onClick={fetchClients} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all shadow-sm">
                <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""} />
              </button>
              <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 transition-colors shadow-sm">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => signOut(auth)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Clients", value: clients.length, icon: UserCheck, color: "text-blue-600" },
              { label: "Active Projects", value: clients.filter(c => c.status === "Development").length, icon: Briefcase, color: "text-indigo-600" },
              { label: "Completed", value: clients.filter(c => c.status === "Completed").length, icon: FolderOpen, color: "text-green-600" },
              { label: "Total Revenue", value: `$${clients.reduce((s, c) => s + (parseInt((c.budget || "0").replace(/\D/g, "")) || 0), 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
            ].map((stat, i) => (
              <div key={i} className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <p className={`text-2xl font-black text-gray-900 dark:text-gray-100`}>{stat.value}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Client Cards Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <UserCheck size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No clients yet</h3>
              <p className="text-gray-400 text-sm mt-1">Convert leads from the Leads page to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{client.clientName}</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{client.projectName}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${statusColors[client.status] || statusColors.Planning}`}>
                      {client.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-400" /> {client.service}</div>
                    {client.email && <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> <a href={`mailto:${client.email}`} className="hover:text-blue-600 truncate">{client.email}</a></div>}
                    {client.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {client.phone}</div>}
                    <div className="flex items-center gap-2"><DollarSign size={14} className="text-gray-400" /> {client.budget || "N/A"}</div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1.5 text-gray-500 dark:text-gray-400">
                      <span>Progress</span><span>{client.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${(client.progress || 0) === 100 ? 'bg-green-500' : (client.progress || 0) > 50 ? 'bg-blue-500' : 'bg-orange-400'}`}
                        style={{ width: `${client.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
