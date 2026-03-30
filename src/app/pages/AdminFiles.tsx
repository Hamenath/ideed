import { useEffect, useRef, useState } from "react";
import { storage, auth } from "../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Sidebar } from "../components/ui/dashboard-with-collapsible-sidebar";
import { LogOut, Moon, Sun, Upload, Trash2, FileText, Image, Download, FolderOpen } from "lucide-react";
import { motion } from "motion/react";

interface StorageFile {
  name: string;
  fullPath: string;
  url: string;
  type: string;
}

const getFileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return <Image size={20} className="text-purple-500" />;
  if (['pdf'].includes(ext)) return <FileText size={20} className="text-red-500" />;
  return <FileText size={20} className="text-blue-500" />;
};

const getFileType = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'Image';
  if (['pdf'].includes(ext)) return 'PDF';
  return 'Document';
};

export function AdminFiles() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const listRef = ref(storage, "admin-files/");
      const res = await listAll(listRef);
      const fileData = await Promise.all(res.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          fullPath: item.fullPath,
          url,
          type: getFileType(item.name),
        };
      }));
      setFiles(fileData);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) { setCheckingAuth(false); fetchFiles(); }
      else window.location.href = "/admin/login";
    });
    return unsub;
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `admin-files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { console.error(err); setUploading(false); alert("Upload failed."); },
      async () => {
        setUploading(false);
        setUploadProgress(0);
        await fetchFiles();
      }
    );
  };

  const handleDelete = async (fullPath: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteObject(ref(storage, fullPath));
      setFiles(prev => prev.filter(f => f.fullPath !== fullPath));
    } catch (e) {
      console.error(e);
      alert("Failed to delete.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex min-h-[100vh] w-full ${isDark ? 'dark' : ''} font-sans`}>
      <div className="flex w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Sidebar />

        <main className="flex-1 overflow-x-hidden pt-8 px-6 md:px-10 pb-20">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>File Storage</h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Upload, manage, and share files via Firebase Storage.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60"
              >
                <Upload size={16} />
                {uploading ? `Uploading ${uploadProgress}%…` : "Upload File"}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
              <button onClick={() => setIsDark(!isDark)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 transition-colors shadow-sm">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={() => signOut(auth)} className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* Upload progress bar */}
          {uploading && (
            <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Uploading…</span><span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div className="h-2 bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* Files Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : files.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="py-24 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all"
            >
              <FolderOpen size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No files yet</h3>
              <p className="text-gray-400 text-sm mt-1">Click to upload your first file.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file, i) => (
                <motion.div
                  key={file.fullPath}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-3">
                    {getFileIcon(file.name)}
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 border border-gray-100 dark:border-gray-800 px-2 py-0.5 rounded-full">{file.type}</span>
                  </div>
                  {file.type === "Image" && (
                    <div className="mb-3 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 h-28">
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mb-4" title={file.name}>{file.name}</p>
                  <div className="flex gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-100 dark:border-blue-900 transition-colors"
                    >
                      <Download size={12} /> Download
                    </a>
                    <button
                      onClick={() => handleDelete(file.fullPath, file.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-gray-100 dark:border-gray-800 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {/* Upload card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all min-h-[140px]"
              >
                <Upload size={24} className="text-gray-400" />
                <p className="text-sm font-semibold text-gray-400">Upload File</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
