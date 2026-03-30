import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
import { AdminDashboard } from "./app/pages/AdminDashboard.tsx";
import { AdminLogin } from "./app/pages/AdminLogin.tsx";
import { AdminProjects } from "./app/pages/AdminProjects.tsx";
import "./styles/index.css";

const root = createRoot(document.getElementById("root")!);

const path = window.location.pathname;

if (path === "/admin") {
  root.render(<AdminDashboard />);
} else if (path === "/admin/login") {
  root.render(<AdminLogin />);
} else if (path === "/admin/projects") {
  root.render(<AdminProjects />);
} else {
  root.render(<App />);
}