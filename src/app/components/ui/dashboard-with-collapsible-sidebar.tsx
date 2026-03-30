"use client"
import React, { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  ListTodo,
  ChevronDown,
  ChevronsRight,
  Users,
  UserCheck,
  FolderOpen,
  Settings,
} from "lucide-react";

export const Sidebar = () => {
  const [open, setOpen] = useState(true);
  
  const [selected, setSelected] = useState(() => {
    if (typeof window !== "undefined") {
      const p = window.location.pathname;
      if (p.includes("/admin/projects")) return "Projects DB";
      if (p.includes("/admin/todo")) return "To Do List";
      if (p.includes("/admin/leads")) return "Leads";
      if (p.includes("/admin/clients")) return "Clients";
      if (p.includes("/admin/files")) return "Files";
      if (p.includes("/admin/settings")) return "Settings";
      if (p === "/admin") return "Dashboard";
    }
    return "Dashboard";
  });

  return (
    <nav
      className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${
        open ? 'w-64' : 'w-16'
      } border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm font-sans z-50 flex flex-col`}
    >
      <TitleSection open={open} />

      <div className="flex-1 overflow-y-auto space-y-1 pb-16">
        {open && <p className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-600">Main</p>}
        <Option Icon={LayoutDashboard} title="Dashboard" href="/admin" selected={selected} setSelected={setSelected} open={open} />

        {open && <p className="px-3 pt-4 pb-1 text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-600">CRM</p>}
        <Option Icon={Users} title="Leads" href="/admin/leads" selected={selected} setSelected={setSelected} open={open} />
        <Option Icon={UserCheck} title="Clients" href="/admin/clients" selected={selected} setSelected={setSelected} open={open} />

        {open && <p className="px-3 pt-4 pb-1 text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-600">Projects</p>}
        <Option Icon={Inbox} title="Projects DB" href="/admin/projects" selected={selected} setSelected={setSelected} open={open} />
        <Option Icon={ListTodo} title="To Do List" href="/admin/todo" selected={selected} setSelected={setSelected} open={open} />

        {open && <p className="px-3 pt-4 pb-1 text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-600">System</p>}
        <Option Icon={FolderOpen} title="Files" href="/admin/files" selected={selected} setSelected={setSelected} open={open} />
        <Option Icon={Settings} title="Settings" href="/admin/settings" selected={selected} setSelected={setSelected} open={open} />
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

const Option = ({ Icon, title, selected, setSelected, open, notifs, href }: any) => {
  const isSelected = selected === title;
  
  const content = (
    <>
      <div className="grid h-full w-12 shrink-0 place-content-center">
        <Icon className="h-5 w-5" />
      </div>
      
      {open && (
        <span className={`text-sm font-medium transition-opacity duration-200 whitespace-nowrap ${open ? 'opacity-100' : 'opacity-0'}`}>
          {title}
        </span>
      )}

      {notifs && open && (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 text-xs text-white font-medium">
          {notifs}
        </span>
      )}
    </>
  );

  const className = `relative flex h-11 w-full items-center rounded-lg transition-all duration-200 ${
    isSelected 
      ? "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm border-l-2 border-blue-500" 
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
  }`;

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={() => setSelected(title)} className={className}>
      {content}
    </button>
  );
};

const TitleSection = ({ open }: any) => {
  return (
    <div className="mb-4 border-b border-gray-200 dark:border-gray-800 pb-4">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <Logo />
          {open && (
            <div className={`transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
              <span className="block text-sm font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                iDEED Admin
              </span>
              <span className="block text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-widest">
                CRM Platform
              </span>
            </div>
          )}
        </div>
        {open && <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gray-900 dark:bg-white shadow-sm border border-gray-800 dark:border-gray-200">
       <span className="font-bold text-xl text-white dark:text-gray-900 tracking-tighter" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>iD</span>
    </div>
  );
};

const ToggleClose = ({ open, setOpen }: any) => {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 shrink-0 place-content-center">
          <ChevronsRight className={`h-5 w-5 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${open ? "rotate-180" : ""}`} />
        </div>
        {open && (
          <span className={`text-sm font-semibold text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
            Collapse Sidebar
          </span>
        )}
      </div>
    </button>
  );
};
