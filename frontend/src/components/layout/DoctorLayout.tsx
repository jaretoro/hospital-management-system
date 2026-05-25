import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const PAGE_TITLES: Record<string, string> = {
  "/doctor/dashboard":     "Dashboard",
  "/doctor/staffs":        "Patient management",
  "/doctor/medications":   "Medications",
  "/doctor/reports":       "Report analytics",
  "/doctor/consultation":  "Consultation",
  "/doctor/profile":       "Profile",
  "/doctor/settings":      "Settings",
  "/doctor/notifications": "Notifications",
};

export function DoctorLayout() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location  = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "SAHCOMed";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        role="doctor"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar
        pageTitle={pageTitle}
        onMobileMenuClick={() => setMobileOpen((v) => !v)}
      />
      <main
        className="pt-16 transition-[padding-left] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ paddingLeft: `var(--sidebar-width)` }}
      >
        <style>{`
          :root {
            --sidebar-width: 0px;
          }
          @media (min-width: 1024px) {
            :root {
              --sidebar-width: ${collapsed ? "72px" : "260px"};
            }
          }
        `}</style>
        <div className="p-4 md:p-6 max-w-screen-2xl mx-auto min-h-[calc(100dvh-64px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
