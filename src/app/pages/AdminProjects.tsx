import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Search, RefreshCw, LogOut, Plus, Trash2, FolderGit2, Calendar, FileText, CheckCircle2, Bell, Moon, Sun } from "lucide-react";
import { query, orderBy } from "firebase/firestore";
import { Sidebar } from "../components/ui/dashboard-with-collapsible-sidebar";
import { motion } from "motion/react";

interface Project {
  id: string;
  clientName: string;
  projectName: string;
  service: string;
  status: string; // 'Planning', 'Development', 'Completed'
  deadline: string;
  budget: string;
  notes: string;
  createdAt: any;
}

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const [newProject, setNewProject] = useState({
    clientName: "", projectName: "", service: "Website Development", status: "Planning", deadline: "", budget: "", notes: ""
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      projectsData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setProjects(projectsData);

      // Fetch Notifications
      const notifQ = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      const notifSnap = await getDocs(notifQ);
      setNotifications(notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching projects:", error);
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
        fetchProjects();
      } else {
        window.location.href = "/admin/login";
      }
    });
    return unsub;
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "projects"), {
        ...newProject,
        createdAt: serverTimestamp(),
      });
      alert("Project initialized successfully!");
      setIsModalOpen(false);
      setNewProject({ clientName: "", projectName: "", service: "Website Development", status: "Planning", deadline: "", budget: "", notes: "" });
      fetchProjects();
    } catch (error) {
      console.error("Error adding project: ", error);
      alert("Failed to create project.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting project: ", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      await updateDoc(doc(db, "projects", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status: ", error);
      fetchProjects();
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredProjects = projects.filter(p => 
    p.clientName.toLowerCase().includes(search.toLowerCase()) ||
    p.projectName.toLowerCase().includes(search.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Projects Board</h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Manage converted leads and active technical milestones.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Find a project..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm font-medium transition-colors"
                />
              </div>
              
              <button 
                onClick={fetchProjects} 
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
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl z-50 overflow-hidden text-left font-sans">
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

              <button 
                onClick={() => setIsModalOpen(true)} 
                className="px-4 py-2.5 rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
              >
                <Plus size={18} /> New Project
              </button>

              <button onClick={() => signOut(auth)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm" title="Log out">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* Dynamic Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((proj, i) => (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.3, delay: i * 0.05 }}
                 key={proj.id} 
                 className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:shadow-md transition-shadow relative"
               >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleDelete(proj.id)} className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 p-2 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 pr-12 mb-1">{proj.projectName}</h3>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">{proj.clientName}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FolderGit2 size={16} className="text-gray-400 dark:text-gray-500"/> {proj.service}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500"/> Deadline: {proj.deadline || "TBD"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText size={16} className="text-gray-400 dark:text-gray-500"/> Budget: {proj.budget || "N/A"}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-sm text-gray-600 dark:text-gray-300 font-medium mb-5 border border-gray-200 dark:border-gray-700">
                    {proj.notes || "No notes attached."}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                     <select 
                       value={proj.status}
                       onChange={(e) => updateStatus(proj.id, e.target.value)}
                       className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                         proj.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                         proj.status === 'Development' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                         'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                       }`}
                     >
                       <option value="Planning">Planning</option>
                       <option value="Development">Development</option>
                       <option value="Completed">Completed</option>
                     </select>
                     {proj.status === "Completed" && <CheckCircle2 className="text-green-500 drop-shadow-sm" size={20}/>}
                  </div>
               </motion.div>
            ))}
          </div>

          {/* New Project Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Initialize New Project</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-500 font-bold hover:text-gray-900 dark:hover:text-gray-100 transition-colors">✕</button>
                </div>
                <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Client Name</label>
                      <input type="text" required value={newProject.clientName} onChange={e=>setNewProject({...newProject, clientName: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Project Name</label>
                      <input type="text" required value={newProject.projectName} onChange={e=>setNewProject({...newProject, projectName: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Service Category</label>
                       <select value={newProject.service} onChange={e=>setNewProject({...newProject, service: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
                          <option>Website Development</option>
                          <option>App Development</option>
                          <option>UI/UX Design</option>
                          <option>IoT Solutions</option>
                       </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Status</label>
                       <select value={newProject.status} onChange={e=>setNewProject({...newProject, status: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors">
                          <option value="Planning">Planning</option>
                          <option value="Development">Development</option>
                          <option value="Completed">Completed</option>
                       </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Deadline</label>
                      <input type="date" value={newProject.deadline} onChange={e=>setNewProject({...newProject, deadline: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Budget</label>
                      <input type="text" value={newProject.budget} onChange={e=>setNewProject({...newProject, budget: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors" placeholder="$5,000" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Project Notes</label>
                    <textarea rows={3} value={newProject.notes} onChange={e=>setNewProject({...newProject, notes: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-colors" placeholder="Requirements from the lead..."></textarea>
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mt-2 shadow-sm">
                    Create Project Record
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
