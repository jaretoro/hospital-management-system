import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ChevronLeft, ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay,
  addMonths, subMonths, isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import stethoscope from "@/assets/images/stethoscope.png";

// ── Notification helpers ──────────────────────────────────────
interface ApiNotification {
  _id:       string;
  type:      string;
  message:   string;
  isRead:    boolean;
  createdAt: string;
}

interface TrendPoint {
  day:   string;
  value: number;
}

function timeAgoStr(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Doctors only see consultation/vitals-related notifications
const DOCTOR_TYPES = ["new_consultation", "vitals_sent", "diagnosis"];
function filterDoctorNotifs(items: ApiNotification[]) {
  return items.filter((n) => DOCTOR_TYPES.includes(n.type));
}

// ── Types ─────────────────────────────────────────────────────
interface Consultation {
  _id:         string;
  patientName: string;
  staffNumber: string;
  status:      "waiting" | "in_consultation" | "completed" | "cancelled";
  checkInTime: string;
}

// ── Helpers ───────────────────────────────────────────────────
function getGreeting(name: string): string {
  const hour      = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const firstName = name.split(" ")[0];
  return `Good ${timeOfDay}, Dr. ${firstName}`;
}

function StaffAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-xs shrink-0">
      {initials}
    </div>
  );
}

function QueueStatusBadge({ status }: { status: string }) {
  if (status === "In consultation") {
    return (
      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-medium whitespace-nowrap">
        In consultation
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-500 text-xs font-medium whitespace-nowrap">
      Waiting
    </span>
  );
}

// ── Stethoscope SVG ───────────────────────────────────────────


// ── Calendar ──────────────────────────────────────────────────
function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart  = startOfMonth(currentDate);
  const monthEnd    = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay    = (getDay(monthStart) + 6) % 7;
  const blanks      = Array(startDay).fill(null);
  const allCells    = [...blanks, ...daysInMonth];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 h-full">
      <h2 className="text-base font-bold text-slate-800 mb-4">Calendar</h2>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
          <ChevronLeft size={16} className="text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => (
          <div key={d} className={cn("text-center text-xs font-medium py-1", d === "Sa" || d === "Su" ? "text-blue-400" : "text-slate-400")}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {allCells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} className="h-8" />;
          const dayOfWeek = (getDay(day) + 6) % 7;
          const isWeekend = dayOfWeek >= 5;
          const todayDate = isToday(day);
          return (
            <div key={day.toISOString()} className="flex items-center justify-center h-8">
              <button className={cn(
                "w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors",
                todayDate ? "bg-primary-500 text-white font-bold" : isWeekend ? "text-blue-500 hover:bg-blue-50" : "text-slate-600 hover:bg-slate-50"
              )}>
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Notification Icon ─────────────────────────────────────────
function NotificationIcon() {
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

// ── Main Page ─────────────────────────────────────────────────
export default function DoctorDashboardPage() {
  const navigate  = useNavigate();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");

  const user     = getUser();
  const greeting = getGreeting(user?.name ?? "Doctor");

  // ── Real data ─────────────────────────────────────────────
  const [queue,           setQueue]           = useState<Consultation[]>([]);
  const [recentDone,      setRecentDone]      = useState<Consultation[]>([]);
  const [queueLoading,    setQueueLoading]    = useState(true);
  const [recentLoading,   setRecentLoading]   = useState(true);
  const [chartData,       setChartData]       = useState<TrendPoint[]>([]);
  const [chartLoading,    setChartLoading]    = useState(true);
  const [notifications,   setNotifications]   = useState<ApiNotification[]>([]);

  useEffect(() => {
    // Active patient queue
    const fetchQueue = async () => {
      try {
        const res = await api.get<{ data: { consultations: Consultation[] } }>(
          "/v1/consultations?limit=100"
        );
        const active = (res.data.consultations ?? []).filter(
          (c) => c.status === "waiting" || c.status === "in_consultation"
        );
        setQueue(active.slice(0, 4));
      } catch {
        setQueue([]);
      } finally {
        setQueueLoading(false);
      }
    };

    // Recent completed consultations
    const fetchRecent = async () => {
      try {
        const res = await api.get<{ data: { consultations: Consultation[] } }>(
          "/v1/consultations?limit=100"
        );
        const completed = (res.data.consultations ?? []).filter(
          (c) => c.status === "completed"
        );
        setRecentDone(completed.slice(0, 4));
      } catch {
        setRecentDone([]);
      } finally {
        setRecentLoading(false);
      }
    };

    // Notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get<{ data: ApiNotification[] }>("/api/v1/notifications");
        const all = Array.isArray(res.data) ? res.data as unknown as ApiNotification[] : (res.data as any)?.notifications ?? [];
        setNotifications(filterDoctorNotifs(all).slice(0, 5));
      } catch {
        setNotifications([]);
      }
    };

    fetchQueue();
    fetchRecent();
    fetchNotifications();
  }, []);

  // Chart data — refetches when period changes
  useEffect(() => {
    setChartLoading(true);
    api.get<{
      data: { period: string; trend: { date: string; count: number }[] };
    }>(`/api/v1/reports/visit-trend?period=${period.toLowerCase()}`)
      .then((res) => {
        const mapped = (res.data.trend ?? []).map((t) => ({
          day:   format(new Date(t.date), period === "Weekly" ? "EEE" : "d MMM"),
          value: t.count,
        }));
        setChartData(mapped);
      })
      .catch(() => setChartData([]))
      .finally(() => setChartLoading(false));
  }, [period]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60)  return `${mins} min${mins !== 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Row 1: Greeting + Calendar ─────────────────────── */}
      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-8 flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-500">{greeting}</h1>
              <p className="text-sm text-slate-500 mt-1">Here's your schedule for today</p>
            </div>
            <button
              onClick={() => navigate("/doctor/consultation")}
              className="flex items-center justify-center h-11 px-6 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors w-fit"
            >
              Start Consultation
            </button>
          </div>
          <img src={stethoscope} alt="Stethoscope" className="w-48 h-auto shrink-0 object-contain" />
        </div>
        <div className="w-72 shrink-0">
          <Calendar />
        </div>
      </div>

      {/* ── Row 2: Chart + Notifications ───────────────────── */}
      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-800">Report analysis</h2>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "Weekly" | "Monthly")}
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            >
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mb-3">Number of patient visits per day</p>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          {chartLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <LoadingSpinner size="md" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-sm text-slate-400">
              No visit data for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="doctorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF7221" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF7221" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Area type="monotone" dataKey="value" stroke="#FF7221" strokeWidth={2.5} fill="url(#doctorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Notifications — real data */}
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Notifications</h2>
            <button
              onClick={() => navigate("/doctor/notifications")}
              className="text-sm text-primary-500 font-medium hover:underline"
            >
              Show more
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No notifications yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {notifications.map((notif) => (
                <button
                  key={notif._id}
                  onClick={() => navigate("/doctor/notifications")}
                  className="flex items-center gap-3 w-full hover:bg-slate-50 rounded-xl px-2 py-2.5 transition-colors"
                >
                  <NotificationIcon />
                  <p className={cn(
                    "text-sm flex-1 text-left truncate",
                    notif.isRead ? "text-slate-500 font-normal" : "text-slate-700 font-medium"
                  )}>
                    {notif.message}
                  </p>
                  <span className="text-xs text-slate-400 shrink-0">{timeAgoStr(notif.createdAt)}</span>
                  <ChevronRight size={14} className="text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Patient queue + Recent consultations ─────── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Patient queue — real */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Patient queue</h2>
            <button
              onClick={() => navigate("/doctor/consultation")}
              className="text-sm text-primary-500 font-medium hover:underline"
            >
              Show more
            </button>
          </div>
          {queueLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          ) : queue.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No active patients in queue.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {queue.map((patient) => (
                <div key={patient._id} className="flex items-center gap-3">
                  <StaffAvatar name={patient.patientName} />
                  <span className="text-sm font-medium text-slate-700 w-28 shrink-0 truncate">
                    {patient.patientName}
                  </span>
                  <span className="text-sm text-slate-400 shrink-0">{patient.staffNumber}</span>
                  <div className="flex-1 flex justify-end items-center gap-2">
                    <QueueStatusBadge status={
                      patient.status === "in_consultation" ? "In consultation" : "Waiting"
                    } />
                    <button
                      onClick={() => navigate("/doctor/consultation")}
                      className="h-8 px-4 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors shrink-0"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent consultations — real */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Recent consultation</h2>
          </div>
          {recentLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          ) : recentDone.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No completed consultations yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentDone.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <StaffAvatar name={item.patientName} />
                  <span className="text-sm font-medium text-slate-700 w-28 shrink-0 truncate">
                    {item.patientName}
                  </span>
                  <span className="text-sm text-slate-400 shrink-0">{item.staffNumber}</span>
                  <span className="text-sm text-slate-400 ml-auto shrink-0">{timeAgo(item.checkInTime)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}