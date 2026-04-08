import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
  isSameMonth,
} from "date-fns";
import { useNavigate } from "react-router-dom";

// ── Mock data ─────────────────────────────────────────────────
const chartData = [
  { day: "Monday",    value: 20 },
  { day: "Tuesday",   value: 35 },
  { day: "Wednesday", value: 30 },
  { day: "Thursday",  value: 50 },
  { day: "Friday",    value: 65 },
  { day: "Saturday",  value: 80 },
  { day: "Sunday",    value: 90 },
];

const stockAlerts = [
  { name: "Cefuroxime",       units: "150 pieces", status: "Low"    },
  { name: "Arthrocare forte", units: "150 pieces", status: "Normal" },
  { name: "Ampiclox",         units: "150 pieces", status: "Low"    },
  { name: "Amatem soft gel",  units: "150 pieces", status: "Normal" },
  { name: "Diclofenac",       units: "150 pieces", status: "Low"    },
  { name: "Omeprazole",       units: "150 pieces", status: "Normal" },
];

const patientQueue = [
  { name: "Glory Nwosu", id: "SAH-0001", status: "In consultation" },
  { name: "Glory Nwosu", id: "SAH-0001", status: "Waiting"         },
  { name: "Glory Nwosu", id: "SAH-0001", status: "Waiting"         },
];

// ── Calendar Component ────────────────────────────────────────
function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart  = startOfMonth(currentDate);
  const monthEnd    = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for first day (0=Sun, convert to Mon-based: Mon=0)
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;

  // Fill leading empty slots
  const blanks = Array(startDayOfWeek).fill(null);

  const allCells = [...blanks, ...daysInMonth];

  const DAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-base font-bold text-slate-800 mb-4">Calendar</h2>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ChevronLeft size={16} className="text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              d === "Sa" || d === "Su" ? "text-blue-400" : "text-slate-500"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {allCells.map((day, i) => {
          if (!day) {
            return <div key={`blank-${i}`} className="h-8" />;
          }

          const dayOfWeek = (getDay(day) + 6) % 7; // Mon=0, Sun=6
          const isWeekend  = dayOfWeek >= 5;
          const todayDate  = isToday(day);
          const inMonth    = isSameMonth(day, currentDate);

          return (
            <div key={day.toISOString()} className="flex items-center justify-center h-8">
              <button
                className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors
                  ${!inMonth
                    ? "text-slate-300"
                    : todayDate
                    ? "bg-primary-500 text-white font-bold"
                    : isWeekend
                    ? "text-blue-500 hover:bg-blue-50"
                    : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StaffIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="9"  cy="7"  r="3"   stroke="#FF7221" strokeWidth="1.8"/>
        <circle cx="16" cy="8"  r="2.5" stroke="#FF7221" strokeWidth="1.8"/>
        <path d="M3 19c0-3.314 2.686-6 6-6s6 2.686 6 6"   stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 14c2.209 0 4 1.791 4 4"              stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function MedicationIcon() {
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

function StatCard({
  title,
  value,
  linkText,
  icon,
  to,
}: {
  title: string;
  value: string;
  linkText: string;
  icon: React.ReactNode;
  to: string;
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
        {linkText} <span className="text-base">→</span>
      </button>
    </div>
  );
}

// ── Patient Avatar ────────────────────────────────────────────
function PatientAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

// ── Queue Status Badge ────────────────────────────────────────
function QueueStatus({ status }: { status: string }) {
  if (status === "In consultation") {
    return (
      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium whitespace-nowrap">
        In consultation
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-400 text-xs font-medium">
      Waiting
    </span>
  );
}

// ── Stock Status Badge ────────────────────────────────────────
function StockStatus({ status }: { status: string }) {
  if (status === "Low") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">
        ↓ Low
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
      ↑ Normal
    </span>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Staffs"
          value="450"
          linkText="Manage your staffs"
          icon={<StaffIcon />}
          to="/staffs"
        />
        <StatCard
          title="Patients seen today"
          value="50"
          linkText="Manage your staffs"
          icon={<StaffIcon />}
          to="/staffs"
        />
        <StatCard
          title="Total Medications"
          value="450"
          linkText="Manage medications"
          icon={<MedicationIcon />}
          to="/medications"
        />
      </div>

      {/* ── Chart + Calendar ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-800">Report analysis</h2>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
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
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF7221" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF7221" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                ticks={[10, 20, 50, 100]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#FF7221"
                strokeWidth={2.5}
                fill="url(#orangeGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Live Calendar */}
        <Calendar />
      </div>

      {/* ── Stock Alert + Patient Queue ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Stock Alert */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Stock alert</h2>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 rounded-l-lg">
                  Medications
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                  Units Remaining
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 rounded-r-lg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stockAlerts.map((item, i) => (
                <tr key={i} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
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
                  <td className="px-4 py-3 text-sm text-slate-500">{item.units}</td>
                  <td className="px-4 py-3">
                    <StockStatus status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Patient Queue — two sections */}
        <div className="flex flex-col gap-4">
          {[0, 1].map((section) => (
            <div key={section} className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">Patient queue</h2>
                <button
                  onClick={() => navigate("/patient-queue")}
                  className="text-sm text-primary-500 font-medium hover:underline"
                >
                  Show more
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {patientQueue.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <PatientAvatar name={p.name} />
                    <span className="text-sm font-medium text-slate-700 flex-1">
                      {p.name}
                    </span>
                    <span className="text-sm text-slate-400 mr-2">{p.id}</span>
                    <QueueStatus status={p.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}