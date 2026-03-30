import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Search, RefreshCw, LogOut, Bell, Moon, Sun, CheckCircle2, Clock, PlayCircle, AlertCircle, ListTodo } from "lucide-react";
import { Sidebar } from "../components/ui/dashboard-with-collapsible-sidebar";
import { motion } from "motion/react";

interface ProjectTask {
  id: string;
  projectName: string;
  clientName: string;
  status: string; // 'Planning', 'Development', 'Completed', 'On Hold'
  progress: number;
  lastUpdate: string;
}

export function AdminTodo() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const tasksData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Calculate mock progress based on status if not present
        const status = data.status || "Planning";
        let progress = data.progress || 0;
        if (!data.progress) {
            if (status === "Completed") progress = 100;
            else if (status === "Development") progress = 45;
            else progress = 10;
        }

        return {
          id: doc.id,
          projectName: data.projectName || "Unnamed Project",
          clientName: data.clientName || "Unknown Client",
          status: status,
          progress: progress,
          lastUpdate: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : "Just now"
        };
      }) as ProjectTask[];
      
      setTasks(tasksData);

      // Fetch Notifications
      const notifQ = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
      const notifSnap = await getDocs(notifQ);
      setNotifications(notifSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching tasks:", error);
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
        fetchTasks();
      } else {
        window.location.href = "/admin/login";
      }
    });
    return unsub;
  }, []);

  const updateProgress = async (id: string, newProgress: number) => {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: newProgress } : t));
      await updateDoc(doc(db, "projects", id), { progress: newProgress });
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const filteredTasks = tasks.filter(t => 
    t.projectName.toLowerCase().includes(search.toLowerCase()) ||
    t.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`flex min-h-[100vh] w-full ${isDark ? 'dark' : ''} font-sans`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        <Sidebar />

        <main className="flex-1 overflow-x-hidden pt-8 px-6 md:px-10 pb-20">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>To-Do List</h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Live project milestones and development tracking.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 text-sm font-medium transition-colors"
                />
              </div>
              
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

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <h3 className="font-bold flex items-center gap-2">
                        <ListTodo size={20} className="text-blue-600" />
                        Active Project Milestones
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 font-bold">Project / Client</th>
                                <th className="px-6 py-4 font-bold">Live Status</th>
                                <th className="px-6 py-4 font-bold">Overall Progress</th>
                                <th className="px-6 py-4 font-bold">Last Update</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center"><RefreshCw className="animate-spin text-blue-500" /></div>
                                    </td>
                                </tr>
                            ) : filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No projects found</td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={task.id} 
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-gray-100">{task.projectName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{task.clientName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {task.status === "Completed" && <CheckCircle2 size={16} className="text-green-500" />}
                                                {task.status === "Development" && <PlayCircle size={16} className="text-blue-500 animate-pulse" />}
                                                {task.status === "Planning" && <Clock size={16} className="text-orange-500" />}
                                                {task.status === "On Hold" && <AlertCircle size={16} className="text-red-500" />}
                                                <span className="text-sm font-medium">{task.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[120px]">
                                                <div className="flex justify-between text-[10px] font-bold mb-1">
                                                    <span>{task.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full transition-all duration-500 ${
                                                        task.progress === 100 ? 'bg-green-500' : 
                                                        task.progress > 50 ? 'bg-blue-500' : 'bg-orange-500'
                                                    }`} style={{ width: `${task.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {task.lastUpdate}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    const p = prompt("Enter new progress % (0-100)", task.progress.toString());
                                                    if (p !== null) updateProgress(task.id, parseInt(p));
                                                }}
                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Platform Integrity</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400/80 leading-relaxed">
                        Track your projects in real-time. Use the 'Update' action to synchronize manual milestones with the live client dashboard.
                    </p>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                    <h4 className="font-bold text-green-900 dark:text-green-300 mb-2">Automated Sync</h4>
                    <p className="text-sm text-green-700 dark:text-green-400/80 leading-relaxed">
                        System automatically reconciles 'Converted' leads into this project board. Status changes here will reflect across your entire team.
                    </p>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
