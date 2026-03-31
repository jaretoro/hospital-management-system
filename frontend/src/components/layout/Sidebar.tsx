import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Stethoscope, Settings, ChevronLeft, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",    to: "/dashboard",    icon: <LayoutDashboard size={18} /> },
  { label: "Patients",     to: "/patients",     icon: <Users           size={18} /> },
  { label: "Appointments", to: "/appointments", icon: <Calendar        size={18} /> },
  { label: "Doctors",      to: "/doctors",      icon: <Stethoscope     size={18} /> },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", to: "/settings", icon: <Settings size={18} /> },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full z-30 flex flex-col",
      "bg-surface border-r border-border shadow-sidebar sidebar-transition",
      collapsed ? "w-sidebar-w-sm" : "w-sidebar-w"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-topbar-h border-b border-border shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600 text-white shrink-0">
          <Activity size={16} />
        </div>
        {!collapsed && (
          <span className="font-semibold text-slate-800 text-base tracking-tight truncate">
            SAHCOMed
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-border flex flex-col gap-0.5">
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={collapsed} />
        ))}
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left",
            "text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150 text-sm",
            collapsed && "justify-center"
          )}
        >
          <ChevronLeft size={16} className={cn("shrink-0 transition-transform duration-250", collapsed && "rotate-180")} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
        collapsed && "justify-center",
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      )}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}