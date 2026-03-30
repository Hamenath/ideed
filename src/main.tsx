import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AdminDashboard } from "./app/pages/AdminDashboard.tsx";
import { AdminLogin } from "./app/pages/AdminLogin.tsx";
import { AdminProjects } from "./app/pages/AdminProjects.tsx";
import { AdminTodo } from "./app/pages/AdminTodo.tsx";
import { AdminLeads } from "./app/pages/AdminLeads.tsx";
import { AdminClients } from "./app/pages/AdminClients.tsx";
import { AdminFiles } from "./app/pages/AdminFiles.tsx";
import { AdminSettings } from "./app/pages/AdminSettings.tsx";
import "./styles/index.css";
import emailjs from "@emailjs/browser";

emailjs.init("IhfZK-dOg8HkPlms_");

const root = createRoot(document.getElementById("root")!);

const path = window.location.pathname;

if (path === "/admin") {
  root.render(<AdminDashboard />);
} else if (path === "/admin/login") {
  root.render(<AdminLogin />);
} else if (path === "/admin/leads") {
  root.render(<AdminLeads />);
} else if (path === "/admin/clients") {
  root.render(<AdminClients />);
} else if (path === "/admin/projects") {
  root.render(<AdminProjects />);
} else if (path === "/admin/todo") {
  root.render(<AdminTodo />);
} else if (path === "/admin/files") {
  root.render(<AdminFiles />);
} else if (path === "/admin/settings") {
  root.render(<AdminSettings />);
} else {
  root.render(<App />);
}