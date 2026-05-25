import { useState, useEffect, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// ── Types ─────────────────────────────────────────────────────
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
    department?:     string;
    status?:         string;
  };
}

type SortType = "recent" | "unread";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// ── Notification Icon ─────────────────────────────────────────
function NotifIcon({ type }: { type: string }) {
  const isMed    = type.includes("stock") || type.includes("medication");
  const isVitals = type.includes("vital");
  const isPatient = type.includes("patient");

  if (isVitals) {
    return (
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }
  if (isMed) {
    return (
      <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#FF7221" strokeWidth="1.8"/>
          <line x1="9" y1="12" x2="15" y2="12" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="12" y1="9" x2="12" y2="15" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }
  if (isPatient) {
    return (
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3" stroke="#16a34a" strokeWidth="1.8"/>
          <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="19" y1="8" x2="19" y2="14" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="16" y1="11" x2="22" y2="11" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FF7221" strokeWidth="1.8"/>
        <line x1="8" y1="9"  x2="16" y2="9"  stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8" y1="13" x2="14" y2="13" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function typeLabel(type: string): string {
  if (type === "new_consultation")     return "New consultation";
  if (type === "vitals_sent")          return "Vitals sent";
  if (type === "stock_alert")          return "Stock alert";
  if (type === "medication_restock")   return "Medication restock";
  if (type === "new_patient")          return "New patient";
  if (type === "diagnosis")            return "Diagnosis recorded";
  if (type === "ready_for_medication") return "Ready for medication";
  return type.replace(/_/g, " ");
}

// Fix 4 & 5: exact match + ready_for_medication added
const DOCTOR_TYPES = ["new_consultation", "vitals_sent", "diagnosis", "ready_for_medication"];
const NURSE_TYPES  = ["new_consultation", "vitals_sent", "stock_alert", "medication_restock", "new_patient", "ready_for_medication"];

function filterByRole(notifications: Notification[], isDoctor: boolean): Notification[] {
  const allowed = isDoctor ? DOCTOR_TYPES : NURSE_TYPES;
  return notifications.filter((n) => allowed.includes(n.type));
}

// ── Main Page ─────────────────────────────────────────────────
export default function NotificationsPage() {
  const location  = useLocation();
  const isDoctor  = location.pathname.startsWith("/doctor");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [marking,       setMarking]       = useState(false);
  const [search,        setSearch]        = useState("");
  const [sortType,      setSortType]      = useState<SortType>("recent");

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{
        data: { notifications: Notification[]; unreadCount: number };
      }>("/v1/notifications");
      setNotifications(filterByRole(res.data.notifications ?? [], isDoctor));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Listen for new notifications (SSE) and read-status changes (bell/topbar)
  useEffect(() => {
    fetchNotifications();
    window.addEventListener("sahcomed:notification", fetchNotifications);
    window.addEventListener("sahcomed:read-updated", fetchNotifications);
    return () => {
      window.removeEventListener("sahcomed:notification", fetchNotifications);
      window.removeEventListener("sahcomed:read-updated", fetchNotifications);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const notif = notifications.find((n) => n._id === id);
    if (!notif || notif.isRead) return;
    try {
      await api.patch(`/v1/notifications/${id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => n._id === id ? { ...n, isRead: true } : n)
      );
      // Notify Topbar bell + dashboards to sync
      window.dispatchEvent(new CustomEvent("sahcomed:read-updated"));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await api.patch("/v1/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      // Notify Topbar bell + dashboards to sync
      window.dispatchEvent(new CustomEvent("sahcomed:read-updated"));
    } catch {
      // ignore
    } finally {
      setMarking(false);
    }
  };

  const handleClear = () => {
    setSearch("");
    setSortType("recent");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const processed = useMemo(() => {
    let result = notifications.filter((n) =>
      n.message.toLowerCase().includes(search.toLowerCase()) ||
      typeLabel(n.type).toLowerCase().includes(search.toLowerCase())
    );
    if (sortType === "unread") {
      result = [...result].sort((a, b) => {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
        return 0;
      });
    }
    return result;
  }, [notifications, search, sortType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
          <input
            type="search"
            placeholder="Search notifications"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <SlidersHorizontal size={14} />
            <span>Sort by</span>
          </div>
          <button
            onClick={() => setSortType("recent")}
            className={cn(
              "font-medium transition-colors",
              sortType === "recent" ? "text-primary-500" : "text-slate-700 hover:text-primary-500"
            )}
          >
            Recent
          </button>
          <button
            onClick={() => setSortType("unread")}
            className={cn(
              "font-medium transition-colors flex items-center gap-1",
              sortType === "unread" ? "text-primary-500" : "text-slate-700 hover:text-primary-500"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear <X size={13} />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            className="ml-auto text-sm text-primary-500 font-medium hover:underline disabled:opacity-50"
          >
            {marking ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* ── Notifications list ───────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {processed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-sm text-slate-400">No notifications found.</p>
          </div>
        ) : (
          processed.map((notif) => (
            <button
              key={notif._id}
              onClick={() => handleMarkAsRead(notif._id)}
              className={cn(
                "w-full text-left bg-white rounded-2xl border transition-all duration-150 p-5",
                notif.isRead
                  ? "border-slate-100 hover:border-slate-200"
                  : "border-primary-100 bg-primary-50/20 hover:border-primary-200"
              )}
            >
              <div className="flex items-start gap-4">
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className={cn(
                      "text-sm font-bold",
                      notif.isRead ? "text-slate-700" : "text-slate-800"
                    )}>
                      {typeLabel(notif.type)}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(notif.createdAt)}</p>
                  <p className={cn(
                    "text-sm mt-2",
                    notif.isRead ? "text-slate-500" : "text-primary-600"
                  )}>
                    {notif.message}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
