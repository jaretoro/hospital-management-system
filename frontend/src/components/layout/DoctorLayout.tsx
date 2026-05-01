import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_TITLES: Record<string, string> = {
  "/doctor/dashboard":    "Dashboard",
  "/doctor/staffs":       "Patient management",
  "/doctor/medications":  "Medications",
  "/doctor/reports":      "Report analytics",
  "/doctor/consultation": "Consultation",
  "/doctor/profile":      "Profile",
  "/doctor/settings":     "Settings",
  "/doctor/notifications": "Notifications",
};

export function DoctorLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "SAHCOMed";

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        role="doctor"
      />
      <Topbar
  sidebarCollapsed={collapsed}
  pageTitle={pageTitle}
  userName="Bolanle Olatunji"
  userRole="Doctor"
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