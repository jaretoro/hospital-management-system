import { Bell, Search } from "lucide-react";
import { getInitials } from "@/lib/utils";

const MOCK_USER = { name: "Dr. Admin", role: "admin" };

interface TopbarProps {
  sidebarCollapsed: boolean;
}

export function Topbar({ sidebarCollapsed }: TopbarProps) {
  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-4 px-6 bg-surface border-b border-border shadow-topbar"
      style={{
        left: sidebarCollapsed ? "72px" : "260px",
        height: "64px",
        transition: "left 250ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search patients, doctors…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-muted text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
        </button>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
            {getInitials(MOCK_USER.name)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-700 leading-none">{MOCK_USER.name}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">{MOCK_USER.role}</p>
          </div>
        </button>
      </div>
    </header>
  );
}