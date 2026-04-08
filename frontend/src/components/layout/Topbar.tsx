import { Bell, ChevronDown, Search } from "lucide-react";

interface TopbarProps {
  sidebarCollapsed: boolean;
  pageTitle: string;
}

export function Topbar({ sidebarCollapsed, pageTitle }: TopbarProps) {
  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-6 px-8 bg-white border-b border-slate-100"
      style={{
        left:       sidebarCollapsed ? "72px" : "260px",
        height:     "64px",
        transition: "left 250ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* ── Page title ───────────────────────────────────────── */}
      <h1 className="text-xl font-bold text-slate-800 shrink-0">{pageTitle}</h1>

      {/* ── Search bar ───────────────────────────────────────── */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500"
          />
          <input
            type="search"
            placeholder="Find anything here"
            className="w-full h-11 pl-12 pr-5 rounded-full border border-slate-200 bg-white text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* ── Right side ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 ml-auto shrink-0">

        {/* Bell with circle border */}
        <button className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        {/* User profile pill with border */}
        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
          {/* Avatar circle */}
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
            {/* Replace src with real avatar image later */}
            <span className="text-xs font-bold text-slate-500">NG</span>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-none">Nurse Glory</p>
            <p className="text-xs text-slate-400 mt-0.5">Clinic manager</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1" />
        </button>

      </div>
    </header>
  );
}