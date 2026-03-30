import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { LayoutDashboard, UserCircle, Search, RefreshCw, Inbox, LogOut, Plus, Trash2, FolderGit2, Calendar, FileText, CheckCircle2 } from "lucide-react";
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
  
  const [newProject, setNewProject] = useState({
    clientName: "", projectName: "", service: "Website Development", status: "Planning", deadline: "", budget: "", notes: ""
  });

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
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "Inter, sans-serif" }}>
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-blue-600" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            iDEED <span className="text-gray-900 text-lg">Admin</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <LayoutDashboard size={20} />
            Lead Management
          </a>
          <a href="/admin/projects" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
            <FolderGit2 size={20} />
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

      {/* Main Workspace */}
      <main className="flex-1 overflow-x-hidden pt-8 px-6 md:px-10 pb-20 relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Project Board</h2>
            <p className="text-gray-500 font-medium">Manage converted leads and active technical milestones.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative border border-gray-200 rounded-xl bg-white overflow-hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Find a project..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 text-sm font-medium focus:outline-none"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="px-4 py-2 rounded-xl border border-transparent bg-blue-600 text-white hover:bg-blue-700 font-bold flex items-center gap-2 shadow-sm transition-colors text-sm"
            >
              <Plus size={18} /> New Project
            </button>
          </div>
        </header>

        {/* Dynamic Project Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {filteredProjects.map((proj, i) => (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3, delay: i * 0.05 }}
               key={proj.id} 
               className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow relative"
             >
                <div className="absolute top-4 right-4">
                  <button onClick={() => handleDelete(proj.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 pr-6 mb-1">{proj.projectName}</h3>
                <p className="text-sm font-medium text-blue-600 mb-4">{proj.clientName}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FolderGit2 size={16} className="text-gray-400"/> {proj.service}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} className="text-gray-400"/> Deadline: {proj.deadline || "TBD"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={16} className="text-gray-400"/> Budget: {proj.budget || "N/A"}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 font-medium mb-5 border border-gray-200">
                  {proj.notes || "No notes attached."}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                   <select 
                     value={proj.status}
                     onChange={(e) => updateStatus(proj.id, e.target.value)}
                     className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                       proj.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                       proj.status === 'Development' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                       'bg-orange-50 text-orange-700 border-orange-200'
                     }`}
                   >
                     <option value="Planning">Planning</option>
                     <option value="Development">Development</option>
                     <option value="Completed">Completed</option>
                   </select>
                   {proj.status === "Completed" && <CheckCircle2 className="text-green-500" size={18}/>}
                </div>
             </motion.div>
          ))}
        </div>

        {/* New Project Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900">Initialize New Project</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 font-bold hover:text-gray-900">✕</button>
              </div>
              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Client Name</label>
                    <input type="text" required value={newProject.clientName} onChange={e=>setNewProject({...newProject, clientName: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Project Name</label>
                    <input type="text" required value={newProject.projectName} onChange={e=>setNewProject({...newProject, projectName: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-gray-600 uppercase">Service Category</label>
                     <select value={newProject.service} onChange={e=>setNewProject({...newProject, service: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-blue-500">
                        <option>Website Development</option>
                        <option>App Development</option>
                        <option>UI/UX Design</option>
                        <option>IoT Solutions</option>
                     </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Status</label>
                     <select value={newProject.status} onChange={e=>setNewProject({...newProject, status: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-blue-500">
                        <option value="Planning">Planning</option>
                        <option value="Development">Development</option>
                        <option value="Completed">Completed</option>
                     </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Deadline</label>
                    <input type="date" value={newProject.deadline} onChange={e=>setNewProject({...newProject, deadline: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Budget</label>
                    <input type="text" value={newProject.budget} onChange={e=>setNewProject({...newProject, budget: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-blue-500" placeholder="$5,000" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Project Notes</label>
                  <textarea rows={3} value={newProject.notes} onChange={e=>setNewProject({...newProject, notes: e.target.value})} className="w-full mt-1 px-3 py-2 border rounded-xl bg-gray-50 text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="Requirements from the lead..."></textarea>
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors mt-2">
                  Create Project Record
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
