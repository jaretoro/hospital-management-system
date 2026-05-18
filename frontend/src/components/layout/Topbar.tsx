import { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface TopbarProps {
  sidebarCollapsed: boolean;
  pageTitle:        string;
}

interface Notification {
  _id:       string;
  type:      string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
  data?: {
    consultationId?: string;
    patientName?:    string;
    staffNumber?:    string;
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  const isMed = type.includes("stock") || type.includes("medication");
  const isVitals = type.includes("vital");
  const isPatient = type.includes("patient");

  if (isVitals) {
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }
  if (isMed) {
    return (
      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#FF7221" strokeWidth="1.8"/>
          <line x1="9" y1="12" x2="15" y2="12" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="12" y1="9" x2="12" y2="15" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }
  if (isPatient) {
    return (
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3" stroke="#16a34a" strokeWidth="1.8"/>
          <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="19" y1="8" x2="19" y2="14" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="16" y1="11" x2="22" y2="11" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FF7221" strokeWidth="1.8"/>
        <line x1="8" y1="9"  x2="16" y2="9"  stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8" y1="13" x2="14" y2="13" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export function Topbar({ sidebarCollapsed, pageTitle }: TopbarProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isDoctor  = location.pathname.startsWith("/doctor");

  const user     = getUser();
  const userName = user?.name ?? "User";
  const userRole = user?.role === "doctor"
    ? "Doctor"
    : user?.role === "nurse"
    ? "Clinic manager"
    : "Admin";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ── Notification state ────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [marking,       setMarking]       = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{
        data: { notifications: Notification[]; unreadCount: number };
      }>("/v1/notifications");
      setNotifications(res.data.notifications ?? []);
      setUnreadCount(res.data.unreadCount ?? 0);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    // Initial load
    fetchNotifications();

    // SSE for real-time notifications
    const token = localStorage.getItem("token");
    if (!token) return;

    const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
    const es = new EventSource(`${BASE_URL}/v1/notifications/stream?token=${token}`);

    es.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        setNotifications((prev) => {
          // avoid duplicates
          if (prev.some((n) => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });
        if (!notification.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      // SSE dropped — fall back to polling every 30s
      es.close();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    };

    return () => es.close();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/v1/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await api.patch("/v1/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setMarking(false);
    }
  };

  const handleViewAll = () => {
    setDropdownOpen(false);
    navigate(isDoctor ? "/doctor/notifications" : "/admin/notifications");
  };

  const handleProfileClick = () => {
    navigate(isDoctor ? "/doctor/profile" : "/admin/profile");
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
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-500" />
          <input
            type="search"
            placeholder="Find anything here"
            className="w-full h-11 pl-12 pr-5 rounded-full border border-slate-200 bg-white text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto shrink-0">

        {/* Bell with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className="relative w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary-500 text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={marking}
                      className="text-xs text-primary-500 font-medium hover:underline disabled:opacity-50"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No notifications.</p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleMarkAsRead(n._id)}
                      className={cn(
                        "w-full text-left flex items-start gap-3 px-4 py-3 border-b border-slate-50 transition-colors hover:bg-slate-50",
                        !n.isRead && "bg-primary-50/30"
                      )}
                    >
                      <NotifIcon type={n.type} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-xs leading-snug",
                          n.isRead ? "text-slate-500" : "text-slate-700 font-medium"
                        )}>
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <button
                onClick={handleViewAll}
                className="w-full py-3 text-sm text-primary-500 font-medium hover:bg-slate-50 transition-colors border-t border-slate-100"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* User profile */}
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
        >
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
