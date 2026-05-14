import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Pill,
  FileBarChart2, Stethoscope, UserCircle,
  Settings, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuth } from "@/lib/auth";

interface SidebarProps {
  collapsed: boolean;
  onToggle:  () => void;
  role:      "admin" | "doctor";
}

interface NavItem {
  label:  string;
  to:     string;
  icon:   React.ReactNode;
  isLogout?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    to: "/admin/dashboard",    icon: <LayoutDashboard size={20} /> },
  { label: "Patients",     to: "/admin/staffs",       icon: <Users           size={20} /> },
  { label: "Medications",  to: "/admin/medications",  icon: <Pill            size={20} /> },
  { label: "Reports",      to: "/admin/reports",      icon: <FileBarChart2   size={20} /> },
  { label: "Consultation", to: "/admin/consultation", icon: <Stethoscope     size={20} /> },
  { label: "Profile",      to: "/admin/profile",      icon: <UserCircle      size={20} /> },
];

const DOCTOR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    to: "/doctor/dashboard",    icon: <LayoutDashboard size={20} /> },
  { label: "Patients",     to: "/doctor/staffs",       icon: <Users           size={20} /> },
  { label: "Medications",  to: "/doctor/medications",  icon: <Pill            size={20} /> },
  { label: "Reports",      to: "/doctor/reports",      icon: <FileBarChart2   size={20} /> },
  { label: "Consultation", to: "/doctor/consultation", icon: <Stethoscope     size={20} /> },
  { label: "Profile",      to: "/doctor/profile",      icon: <UserCircle      size={20} /> },
];

const ADMIN_BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", to: "/admin/settings", icon: <Settings size={20} />            },
  { label: "Logout",   to: "/login",          icon: <LogOut   size={20} />, isLogout: true },
];

const DOCTOR_BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", to: "/doctor/settings", icon: <Settings size={20} />            },
  { label: "Logout",   to: "/login",           icon: <LogOut   size={20} />, isLogout: true },
];

export function Sidebar({ collapsed, onToggle, role }: SidebarProps) {
  const navigate  = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const NAV_ITEMS    = role === "admin" ? ADMIN_NAV_ITEMS    : DOCTOR_NAV_ITEMS;
  const BOTTOM_ITEMS = role === "admin" ? ADMIN_BOTTOM_ITEMS : DOCTOR_BOTTOM_ITEMS;

  const confirmLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <aside className={cn(
        "fixed left-0 top-0 h-full z-30 flex flex-col bg-white border-r border-slate-100 sidebar-transition",
        collapsed ? "w-sidebar-w-sm" : "w-sidebar-w"
      )}>
        {/* Logo */}
        <div className={cn(
          "flex items-center h-topbar-h shrink-0 gap-2",
          collapsed ? "justify-center px-2" : "justify-between px-6"
        )}>
          {collapsed ? (
            <span className="font-bold text-primary-500 text-lg">S</span>
          ) : (
            <span className="text-xl font-bold tracking-tight">
              <span className="text-slate-700">SAHCO</span>
              <span className="text-primary-500">Med</span>
            </span>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-6 flex flex-col gap-2">
          {BOTTOM_ITEMS.map((item) => (
            item.isLogout ? (
              <button
                key={item.to}
                onClick={() => setShowLogoutConfirm(true)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium w-full",
                  collapsed && "justify-center",
                  "text-slate-600 hover:bg-red-50 hover:text-red-500"
                )}
              >
                <span className="shrink-0 text-primary-500">
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ) : (
              <SidebarLink key={item.to} item={item} collapsed={collapsed} />
            )
          ))}
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 z-10 p-8 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="16 17 21 12 16 7" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Log out?</h2>
              <p className="text-sm text-slate-500">Are you sure you want to end your session?</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-12 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium",
          collapsed && "justify-center",
          isActive
            ? "bg-primary-500 text-white"
            : "text-slate-600 hover:bg-primary-50 hover:text-primary-500"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cn("shrink-0", isActive ? "text-white" : "text-primary-500")}>
            {item.icon}
          </span>
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}