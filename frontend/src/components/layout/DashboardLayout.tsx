import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_TITLES: Record<string, string> = {
  "/":              "Dashboard",
  "/dashboard":     "Dashboard",
  "/staffs":        "Staffs",
  "/medications":   "Medications",
  "/reports":       "Report analytics",
  "/patient-queue": "Patient Queue",
  "/profile":       "Profile",
  "/settings":      "Settings",
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location  = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "SAHCOMed";

  return (
    <div className="min-h-screen bg-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <Topbar sidebarCollapsed={collapsed} pageTitle={pageTitle} />
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