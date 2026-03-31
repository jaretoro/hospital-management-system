import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-surface-muted">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <Topbar sidebarCollapsed={collapsed} />
      <main style={{
        paddingLeft: collapsed ? "72px" : "260px",
        paddingTop: "64px",
        minHeight: "100dvh",
        transition: "padding-left 250ms cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}