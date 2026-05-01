import { Bell, ChevronDown, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TopbarProps {
  sidebarCollapsed: boolean;
  pageTitle: string;
  userName?: string;
  userRole?: string;
}

export function Topbar({
  sidebarCollapsed,
  pageTitle,
  userName = "Nurse Glory",
  userRole = "Clinic manager",
}: TopbarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isDoctor  = location.pathname.startsWith("/doctor");

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleBellClick = () => {
    navigate(isDoctor ? "/doctor/notifications" : "/admin/notifications");
  };

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center gap-6 px-8 bg-white border-b border-slate-100"
      style={{
        left:       sidebarCollapsed ? "72px" : "260px",
        height:     "64px",
        transition: "left 250ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Page title */}
      <h1 className="text-xl font-bold text-slate-800 shrink-0">{pageTitle}</h1>

      {/* Search */}
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

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Bell — navigates to notifications */}
        <button
          onClick={handleBellClick}
          className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        {/* User profile */}
        <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 shrink-0 flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-none">{userName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{userRole}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1" />
        </button>
      </div>
    </header>
  );
}