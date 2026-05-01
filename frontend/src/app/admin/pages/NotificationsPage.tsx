import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────
interface Notification {
  id: number;
  type: "stock_alert" | "new_consultation" | "medication_restock" | "vitals_sent" | "new_patient";
  title: string;
  description: string;
  date: string;
  timeAgo: string;
  read: boolean;
  role: "both" | "admin" | "doctor";
}

type SortType = "recent" | "unread";

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1,  type: "stock_alert",        title: "Stock alert",          description: "You're running low on supplies. Time to restock",          date: "15th January, 2025", timeAgo: "10mins", read: false, role: "both"  },
  { id: 2,  type: "new_consultation",   title: "New consultation",     description: "Glory Nwosu has been added to the consultation queue",      date: "15th January, 2025", timeAgo: "15mins", read: false, role: "both"  },
  { id: 3,  type: "medication_restock", title: "Medication restock",   description: "Cefuroxime stock has been restocked to 1500 pieces",        date: "15th January, 2025", timeAgo: "30mins", read: false, role: "both"  },
  { id: 4,  type: "stock_alert",        title: "Stock alert",          description: "You're running low on supplies. Time to restock",          date: "15th January, 2025", timeAgo: "1hr",    read: false, role: "both"  },
  { id: 5,  type: "vitals_sent",        title: "Vitals sent",          description: "Elizabeth Asojo's vitals have been sent to the doctor",     date: "15th January, 2025", timeAgo: "1hr",    read: true,  role: "both"  },
  { id: 6,  type: "new_consultation",   title: "New consultation",     description: "John Okafor has been added to the consultation queue",      date: "15th January, 2025", timeAgo: "2hrs",   read: true,  role: "both"  },
  { id: 7,  type: "new_patient",        title: "New patient added",    description: "Amaka Obi has been registered as a new patient",           date: "14th January, 2025", timeAgo: "1 day",  read: true,  role: "admin" },
  { id: 8,  type: "medication_restock", title: "Medication restock",   description: "Ampiclox stock has been restocked to 800 pieces",          date: "14th January, 2025", timeAgo: "1 day",  read: true,  role: "both"  },
  { id: 9,  type: "stock_alert",        title: "Stock alert",          description: "You're running low on supplies. Time to restock",          date: "14th January, 2025", timeAgo: "1 day",  read: true,  role: "both"  },
  { id: 10, type: "new_consultation",   title: "New consultation",     description: "Tunde Adeyemi has been added to the consultation queue",    date: "14th January, 2025", timeAgo: "2 days", read: true,  role: "both"  },
  { id: 11, type: "vitals_sent",        title: "Vitals sent",          description: "Ngozi Eze's vitals have been sent to the doctor",          date: "13th January, 2025", timeAgo: "2 days", read: true,  role: "both"  },
  { id: 12, type: "new_patient",        title: "New patient added",    description: "Emeka Nwachukwu has been registered as a new patient",     date: "13th January, 2025", timeAgo: "2 days", read: true,  role: "admin" },
];

// ── Notification Icon ─────────────────────────────────────────
function NotifIcon({ type }: { type: Notification["type"] }) {
  const icons = {
    stock_alert: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#FF7221" strokeWidth="1.8"/>
        <line x1="9" y1="12" x2="15" y2="12" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="9" x2="12" y2="15" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    new_consultation: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FF7221" strokeWidth="1.8"/>
        <line x1="8" y1="9"  x2="16" y2="9"  stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8" y1="13" x2="14" y2="13" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    medication_restock: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#FF7221" strokeWidth="1.8"/>
        <line x1="9" y1="12" x2="15" y2="12" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="9" x2="12" y2="15" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    vitals_sent: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    new_patient: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="7" r="3" stroke="#FF7221" strokeWidth="1.8"/>
        <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="19" y1="8" x2="19" y2="14" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="16" y1="11" x2="22" y2="11" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
      {icons[type]}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function NotificationsPage() {
  const location = useLocation();
  const isDoctor = location.pathname.startsWith("/doctor");

  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [search, setSearch]               = useState("");
  const [sortType, setSortType]           = useState<SortType>("recent");

  // Filter by role
  const roleFiltered = useMemo(() =>
    notifications.filter((n) =>
      n.role === "both" || n.role === (isDoctor ? "doctor" : "admin")
    ),
  [notifications, isDoctor]);

  // Filter by search + sort
  const processed = useMemo(() => {
    let result = roleFiltered.filter((n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
    );
    if (sortType === "unread") {
      result = [...result].sort((a, b) => {
        if (!a.read && b.read) return -1;
        if (a.read && !b.read) return 1;
        return 0;
      });
    }
    return result;
  }, [roleFiltered, search, sortType]);

  // Mark single as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Clear search + sort
  const handleClear = () => {
    setSearch("");
    setSortType("recent");
  };

  const unreadCount = roleFiltered.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
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

        {/* Sort + filters */}
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

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="ml-auto text-sm text-primary-500 font-medium hover:underline"
          >
            Mark all as read
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
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={cn(
                "w-full text-left bg-white rounded-2xl border transition-all duration-150 p-5",
                notif.read
                  ? "border-slate-100 hover:border-slate-200"
                  : "border-primary-100 bg-primary-50/20 hover:border-primary-200"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <NotifIcon type={notif.type} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className={cn(
                      "text-sm font-bold",
                      notif.read ? "text-slate-700" : "text-slate-800"
                    )}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notif.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                      )}
                      <span className="text-xs text-slate-400">{notif.timeAgo}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{notif.date}</p>
                  <p className={cn(
                    "text-sm mt-2",
                    notif.read ? "text-slate-500" : "text-primary-600"
                  )}>
                    {notif.description}
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