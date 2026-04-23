import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Pill,
  FileBarChart2,
  Stethoscope,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: "admin" | "doctor";
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    to: "/admin/dashboard",    icon: <LayoutDashboard size={20} /> },
  { label: "Staffs",       to: "/admin/staffs",       icon: <Users           size={20} /> },
  { label: "Medications",  to: "/admin/medications",  icon: <Pill            size={20} /> },
  { label: "Reports",      to: "/admin/reports",      icon: <FileBarChart2   size={20} /> },
  { label: "Consultation", to: "/admin/consultation", icon: <Stethoscope     size={20} /> },
  { label: "Profile",      to: "/admin/profile",      icon: <UserCircle      size={20} /> },
];

const DOCTOR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    to: "/doctor/dashboard",    icon: <LayoutDashboard size={20} /> },
  { label: "Staffs",       to: "/doctor/staffs",       icon: <Users           size={20} /> },
  { label: "Medications",  to: "/doctor/medications",  icon: <Pill            size={20} /> },
  { label: "Reports",      to: "/doctor/reports",      icon: <FileBarChart2   size={20} /> },
  { label: "Consultation", to: "/doctor/consultation", icon: <Stethoscope     size={20} /> },
  { label: "Profile",      to: "/doctor/profile",      icon: <UserCircle      size={20} /> },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", to: "/settings", icon: <Settings size={20} /> },
  { label: "Logout",   to: "/login",    icon: <LogOut   size={20} /> },
];

export function Sidebar({ collapsed, onToggle, role }: SidebarProps) {
  const NAV_ITEMS = role === "admin" ? ADMIN_NAV_ITEMS : DOCTOR_NAV_ITEMS;

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full z-30 flex flex-col bg-white border-r border-slate-100 sidebar-transition",
      collapsed ? "w-sidebar-w-sm" : "w-sidebar-w"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center px-6 h-topbar-h shrink-0",
        collapsed && "justify-center px-2"
      )}>
        {collapsed ? (
          <span className="font-bold text-primary-500 text-lg">S</span>
        ) : (
          <span className="text-xl font-bold tracking-tight">
            <span className="text-slate-700">SAHCO</span>
            <span className="text-primary-500">Med</span>
          </span>
        )}
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
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </div>
    </aside>
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
          <span className={cn(
            "shrink-0",
            isActive ? "text-white" : "text-primary-500"
          )}>
            {item.icon}
          </span>
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}