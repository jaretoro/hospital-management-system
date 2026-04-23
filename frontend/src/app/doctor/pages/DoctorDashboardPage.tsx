import { useState, useMemo } from "react";
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

// ── Mock Data ─────────────────────────────────────────────────
const CHART_DATA = [
  { day: "Monday",    value: 20 },
  { day: "Tuesday",   value: 35 },
  { day: "Wednesday", value: 30 },
  { day: "Thursday",  value: 50 },
  { day: "Friday",    value: 65 },
  { day: "Saturday",  value: 80 },
  { day: "Sunday",    value: 90 },
];

const MONTHLY_DATA = [
  { day: "Week 1", value: 40 },
  { day: "Week 2", value: 65 },
  { day: "Week 3", value: 55 },
  { day: "Week 4", value: 80 },
];

const PATIENT_QUEUE = [
  { id: 1, name: "Glory Nwosu",     staffNumber: "SAH-0001", status: "In consultation" },
  { id: 2, name: "Glory Nwosu",     staffNumber: "SAH-0001", status: "Waiting"         },
  { id: 3, name: "Elizabeth Asojo", staffNumber: "SAH-3567", status: "Waiting"         },
  { id: 4, name: "John Okafor",     staffNumber: "SAH-3568", status: "Waiting"         },
];

const RECENT_CONSULTATIONS = [
  { id: 1, name: "Glory Nwosu",     staffNumber: "SAH-0001", timeAgo: "30 mins ago" },
  { id: 2, name: "Elizabeth Asojo", staffNumber: "SAH-3567", timeAgo: "1 hour ago"  },
  { id: 3, name: "John Okafor",     staffNumber: "SAH-3568", timeAgo: "Yesterday"   },
  { id: 4, name: "Amaka Obi",       staffNumber: "SAH-3569", timeAgo: "Yesterday"   },
];

const NOTIFICATIONS = [
  { id: 1, title: "New consultation",   timeAgo: "10mins ago" },
  { id: 2, title: "Stock alert",        timeAgo: "10mins ago" },
  { id: 3, title: "Medication restock", timeAgo: "10mins ago" },
  { id: 4, title: "New consultation",   timeAgo: "10mins ago" },
  { id: 5, title: "New consultation",   timeAgo: "10mins ago" },
];

// ── Helpers ───────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
function StethoscopeIllustration() {
  return (
    <svg
      width="180"
      height="160"
      viewBox="0 0 180 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <ellipse cx="42" cy="18" rx="6" ry="8" fill="#1e293b" transform="rotate(-15 42 18)" />
      <ellipse cx="98" cy="18" rx="6" ry="8" fill="#1e293b" transform="rotate(15 98 18)" />
      <path d="M42 24 C42 38 48 46 70 46 C92 46 98 38 98 24" stroke="#334155" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M42 24 C42 38 48 46 70 46 C92 46 98 38 98 24" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
      <path d="M70 46 C70 68 67 88 63 108 C60 122 61 130 70 136" stroke="#334155" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M70 46 C70 68 67 88 63 108 C60 122 61 130 70 136" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.2" transform="translate(2, 2)" />
      <path d="M70 46 C71 65 69 84 66 103" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.35" />
      <circle cx="70" cy="138" r="18" fill="#e2e8f0" />
      <circle cx="70" cy="138" r="15" fill="#FF7221" />
      <circle cx="70" cy="138" r="10" fill="#ff9a5c" />
      <circle cx="70" cy="138" r="5"  fill="#FF7221" />
      <circle cx="64" cy="132" r="3.5" fill="white" opacity="0.35" />
      <circle cx="67" cy="130" r="1.5" fill="white" opacity="0.25" />
      <circle cx="70" cy="138" r="18" stroke="#cbd5e1" strokeWidth="1" fill="none" />
      <circle cx="148" cy="25"  r="5"   fill="#FF7221" opacity="0.25" />
      <circle cx="162" cy="52"  r="3.5" fill="#FF7221" opacity="0.18" />
      <circle cx="145" cy="72"  r="2.5" fill="#FF7221" opacity="0.22" />
      <circle cx="20"  cy="72"  r="3.5" fill="#FF7221" opacity="0.18" />
      <circle cx="10"  cy="48"  r="2.5" fill="#FF7221" opacity="0.22" />
      <circle cx="155" cy="100" r="2"   fill="#FF7221" opacity="0.15" />
      <circle cx="15"  cy="100" r="2"   fill="#FF7221" opacity="0.15" />
    </svg>
  );
}

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
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");
  const chartData = period === "Weekly" ? CHART_DATA : MONTHLY_DATA;

  // suppress unused warning
  void useMemo(() => ({
    waiting:        PATIENT_QUEUE.filter((p) => p.status === "Waiting").length,
    inConsultation: PATIENT_QUEUE.filter((p) => p.status === "In consultation").length,
  }), []);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Row 1: Greeting + Calendar ──────────────────────── */}
      <div className="flex gap-6">

        {/* Greeting card */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-8 flex items-center justify-between">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary-500">
                {getGreeting()}, Dr. Olatunji
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Here's your schedule for today
              </p>
            </div>
            <button
              onClick={() => navigate("/doctor/consultation")}
              className="flex items-center justify-center h-11 px-6 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors w-fit"
            >
              Start Consultation
            </button>
          </div>
          <StethoscopeIllustration />
        </div>

        {/* Calendar */}
        <div className="w-72 shrink-0">
          <Calendar />
        </div>

      </div>

      {/* ── Row 2: Chart + Notifications ────────────────────── */}
      <div className="flex gap-6">

        {/* Report analysis */}
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
          <p className="text-xs text-slate-400 mb-3">
            Average number of staffs seen in a week
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-primary-500">87%</span>
            <TrendingUp size={18} className="text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="doctorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF7221" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF7221" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} ticks={[10, 20, 50, 100]} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Area type="monotone" dataKey="value" stroke="#FF7221" strokeWidth={2.5} fill="url(#doctorGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Notifications */}
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Notifications</h2>
            <button className="text-sm text-primary-500 font-medium hover:underline">
              Show more
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {NOTIFICATIONS.map((notif) => (
              <button
                key={notif.id}
                className="flex items-center gap-3 w-full hover:bg-slate-50 rounded-xl px-2 py-2.5 transition-colors"
              >
                <NotificationIcon />
                <p className="text-sm font-medium text-slate-700 flex-1 text-left">
                  {notif.title}
                </p>
                <span className="text-xs text-slate-400 shrink-0">
                  {notif.timeAgo}
                </span>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Row 3: Patient queue + Recent consultations ──────── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Patient queue */}
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
          <div className="flex flex-col gap-3">
            {PATIENT_QUEUE.map((patient) => (
              <div key={patient.id} className="flex items-center gap-3">
                <StaffAvatar name={patient.name} />
                <span className="text-sm font-medium text-slate-700 w-28 shrink-0 truncate">
                  {patient.name}
                </span>
                <span className="text-sm text-slate-400 shrink-0">
                  {patient.staffNumber}
                </span>
                <div className="flex-1 flex justify-end items-center gap-2">
                  <QueueStatusBadge status={patient.status} />
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
        </div>

        {/* Recent consultations */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800">Recent consultation</h2>
          </div>
          <div className="flex flex-col gap-3">
            {RECENT_CONSULTATIONS.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <StaffAvatar name={item.name} />
                <span className="text-sm font-medium text-slate-700 w-28 shrink-0 truncate">
                  {item.name}
                </span>
                <span className="text-sm text-slate-400 shrink-0">
                  {item.staffNumber}
                </span>
                <span className="text-sm text-slate-400 ml-auto shrink-0">
                  {item.timeAgo}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}