import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth,
  eachDayOfInterval, getDay,
  addMonths, subMonths, isToday,
} from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// ── Mock (notifications only — pending backend) ───────────────
const NOTIFICATIONS = [
  { id: 1, title: "New consultation",   timeAgo: "10mins ago" },
  { id: 2, title: "Stock alert",        timeAgo: "10mins ago" },
  { id: 3, title: "Medication restock", timeAgo: "10mins ago" },
  { id: 4, title: "Medication restock", timeAgo: "10mins ago" },
];

// ── Types ─────────────────────────────────────────────────────
interface StockAlert {
  _id:      string;
  name:     string;
  quantity: number;
  status:   "in_stock" | "low_stock" | "out_of_stock";
}

interface QueueItem {
  _id:         string;
  patientName: string;
  staffNumber: string;
  status:      string;
}

interface TrendPoint {
  day:   string;
  value: number;
}

// ── Helpers ───────────────────────────────────────────────────
function PatientAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-xs shrink-0">
      {initials}
    </div>
  );
}

function QueueStatusBadge({ status }: { status: string }) {
  if (status === "in_consultation") {
    return (
      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-500 text-xs font-medium whitespace-nowrap">
        In consultation
      </span>
    );
  }
  if (status === "ready_for_medication") {
    return (
      <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium whitespace-nowrap">
        Ready for medication
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-400 text-xs font-medium whitespace-nowrap">
      Waiting
    </span>
  );
}

function StockStatusBadge({ status }: { status: string }) {
  return status === "low_stock" || status === "out_of_stock" ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">
      ↓ Low
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
      ↑ Normal
    </span>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function StaffIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9"  cy="7"  r="3"   stroke="#FF7221" strokeWidth="1.8"/>
        <circle cx="16" cy="8"  r="2.5" stroke="#FF7221" strokeWidth="1.8"/>
        <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6"  stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 14c2.209 0 4 1.791 4 4"             stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function MedIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#FF7221" strokeWidth="1.8"/>
        <line x1="8"  y1="12" x2="16" y2="12" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="8"  x2="12" y2="16" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function NotificationIcon({ type }: { type: string }) {
  const isMed = type.toLowerCase().includes("medication") || type.toLowerCase().includes("stock");
  return (
    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
      {isMed ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#FF7221" strokeWidth="1.8"/>
          <line x1="9" y1="12" x2="15" y2="12" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="12" y1="9" x2="12" y2="15" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="#FF7221" strokeWidth="1.8"/>
          <line x1="8" y1="9"  x2="16" y2="9"  stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="8" y1="13" x2="14" y2="13" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  title, value, linkText, icon, to,
}: {
  title: string; value: React.ReactNode; linkText: string;
  icon: React.ReactNode; to: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-2">{title}</p>
          <p className="text-4xl font-bold text-slate-800">{value}</p>
        </div>
        {icon}
      </div>
      <button
        onClick={() => navigate(to)}
        className="flex items-center gap-1 text-sm text-primary-500 font-medium hover:underline w-fit"
      >
        {linkText} →
      </button>
    </div>
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
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <h2 className="text-base font-bold text-slate-800 mb-4">Calendar</h2>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-slate-50 rounded-lg">
          <ChevronLeft size={16} className="text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-slate-50 rounded-lg">
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
          if (!day) return <div key={`b-${i}`} className="h-8" />;
          const dow     = (getDay(day) + 6) % 7;
          const weekend = dow >= 5;
          const today   = isToday(day);
          return (
            <div key={day.toISOString()} className="flex items-center justify-center h-8">
              <button className={cn(
                "w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors",
                today   ? "bg-primary-500 text-white font-bold"
                : weekend ? "text-blue-500 hover:bg-blue-50"
                : "text-slate-600 hover:bg-slate-50"
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

// ── Main Admin Dashboard ──────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"Weekly" | "Monthly">("Weekly");

  // ── Real data ─────────────────────────────────────────────
  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [seenToday,     setSeenToday]     = useState<number | null>(null);
  const [totalMeds,     setTotalMeds]     = useState<number | null>(null);
  const [stockMeds,     setStockMeds]     = useState<StockAlert[]>([]);
  const [queue,         setQueue]         = useState<QueueItem[]>([]);
  const [chartData,     setChartData]     = useState<TrendPoint[]>([]);
  const [dashLoading,   setDashLoading]   = useState(true);
  const [stockLoading,  setStockLoading]  = useState(true);
  const [chartLoading,  setChartLoading]  = useState(true);

  useEffect(() => {
    // Single call replaces all separate stat/queue/stock fetches
    const fetchDashboard = async () => {
      try {
        const res = await api.get<{
          data: {
            totalPatients:      number;
            patientsSeenToday:  number;
            totalMedications:   number;
            stockAlerts:        StockAlert[];
            patientQueue:       QueueItem[];
          };
        }>("/api/v1/reports/dashboard");
        setTotalPatients(res.data.totalPatients ?? 0);
        setSeenToday(res.data.patientsSeenToday ?? 0);
        setTotalMeds(res.data.totalMedications ?? 0);
        setStockMeds(res.data.stockAlerts ?? []);
        const active = (res.data.patientQueue ?? []).filter(
          (c) => c.status === "waiting" || c.status === "in_consultation" || c.status === "ready_for_medication"
        );
        setQueue(active.slice(0, 5));
      } catch {
        setTotalPatients(0);
        setSeenToday(0);
        setTotalMeds(0);
        setStockMeds([]);
        setQueue([]);
      } finally {
        setDashLoading(false);
        setStockLoading(false);
      }
    };

    // Visit trend for chart
    const fetchTrend = async () => {
      try {
        const res = await api.get<{
          data: {
            period: string;
            trend: { date: string; count: number }[];
          };
        }>(`/api/v1/reports/visit-trend?period=${period.toLowerCase()}`);
        const mapped = (res.data.trend ?? []).map((t) => ({
          day:   format(new Date(t.date), period === "Weekly" ? "EEE" : "d MMM"),
          value: t.count,
        }));
        setChartData(mapped);
      } catch {
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchDashboard();
    fetchTrend();
  }, [period]);

  const statValue = (val: number | null) =>
    val === null || dashLoading ? <LoadingSpinner size="sm" /> : String(val);

  return (
    <div className="flex gap-6">

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Patients"
            value={statValue(totalPatients)}
            linkText="Manage your Patients"
            icon={<StaffIcon />}
            to="/admin/staffs"
          />
          <StatCard
            title="Patients seen today"
            value={statValue(seenToday)}
            linkText="View consultations"
            icon={<StaffIcon />}
            to="/admin/consultation"
          />
          <StatCard
            title="Total Medications"
            value={statValue(totalMeds)}
            linkText="Manage medications"
            icon={<MedIcon />}
            to="/admin/medications"
          />
        </div>

        {/* Report analysis */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
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
                  <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF7221" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF7221" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                <Area type="monotone" dataKey="value" stroke="#FF7221" strokeWidth={2.5} fill="url(#adminGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stock Alert */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Stock alert</h2>
          {stockLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : stockMeds.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">All medications are well stocked.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 rounded-l-lg">Medications</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Units Remaining</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockMeds.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="8" stroke="#FF7221" strokeWidth="2"/>
                            <line x1="9" y1="12" x2="15" y2="12" stroke="#FF7221" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <span className="text-sm text-slate-700">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{item.quantity} units</td>
                    <td className="px-4 py-3">
                      <StockStatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-6">

        {/* Calendar */}
        <Calendar />

        {/* Notifications — mock until backend delivers */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Notifications</h2>
            <button
              onClick={() => navigate("/admin/notifications")}
              className="text-sm text-primary-500 font-medium hover:underline"
            >
              Show more
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {NOTIFICATIONS.map((notif) => (
              <button
                key={notif.id}
                className="flex items-center gap-3 w-full hover:bg-slate-50 rounded-xl px-2 py-2.5 transition-colors"
              >
                <NotificationIcon type={notif.title} />
                <p className="text-sm font-medium text-slate-700 flex-1 text-left">{notif.title}</p>
                <span className="text-xs text-slate-400 shrink-0">{notif.timeAgo}</span>
                <ChevronRightIcon size={14} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Patient Queue — real data */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Patient queue</h2>
            <button
              onClick={() => navigate("/admin/consultation")}
              className="text-sm text-primary-500 font-medium hover:underline"
            >
              Show more
            </button>
          </div>
          {dashLoading ? (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="md" />
            </div>
          ) : queue.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No active patients.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {queue.map((patient) => (
                <div key={patient._id} className="flex items-center gap-3">
                  <PatientAvatar name={patient.patientName} />
                  <span className="text-sm font-medium text-slate-700 flex-1 truncate">
                    {patient.patientName}
                  </span>
                  <QueueStatusBadge status={patient.status} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
