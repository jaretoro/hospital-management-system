import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":    "Dashboard",
  "/admin/staffs":       "Patient management",
  "/admin/medications":  "Medications",
  "/admin/reports":      "Report analytics",
  "/admin/consultation": "Consultation",
  "/admin/profile":      "Profile",
  "/admin/settings":     "Settings",
  "/admin/notifications": "Notifications",
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "SAHCOMed";

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        role="admin"
      />
      <Topbar
  sidebarCollapsed={collapsed}
  pageTitle={pageTitle}
  userName="Nurse Glory"
  userRole="Clinic manager"
/>
      <main
        style={{
          paddingLeft: collapsed ? "72px" : "260px",
          paddingTop:  "64px",
          minHeight:   "100dvh",
          transition:  "padding-left 250ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="p-6 max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
  
}