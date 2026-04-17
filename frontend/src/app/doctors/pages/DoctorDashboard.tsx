
import { useNavigate} from "react-router-dom";
import { useState} from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameMonth } from "date-fns";

// ============================================
// SECTION 1: DATA / STATE
// ============================================

const chartData = [
  { day: "Mon", value: 20 },
  { day: "Tue", value: 35 },
  { day: "Wed", value: 30 },
  { day: "Thu", value: 50 },
  { day: "Fri", value: 65 },
  { day: "Sat", value: 80 },
  { day: "Sun", value: 90 },
];

const patientQueue = [
  { name: "Glory Nwosu", id: "SAH-0001", status: "In consultation" },
  { name: "Glory Nwosu", id: "SAH-0001", status: "Waiting" },
  { name: "Glory Nwosu", id: "SAH-0001", status: "Waiting" },
  { name: "Glory Nwosu", id: "SAH-0001", status: "Waiting" },
];

const recentConsultations = [
  { name: "Glory Nwosu", id: "SAH-0001", time: "30 mins ago" },
  { name: "Glory Nwosu", id: "SAH-0001", time: "1 hour ago" },
  { name: "Glory Nwosu", id: "SAH-0001", time: "Yesterday" },
  { name: "Glory Nwosu", id: "SAH-0001", time: "2 days ago" },
];

const notifications = [
  { title: "New consultation", time: "10mins ago" },
  { title: "Stock alert", time: "10mins ago" },
  { title: "Medication restock", time: "10mins ago" },
  { title: "Medication restock", time: "10mins ago" },
  { title: "Medication restock", time: "10mins ago" },
];

// ============================================
// SECTION 3: SMALL COMPONENTS
// ============================================

function PatientAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600 shrink-0">
      {initials}
    </div>
  );
}

function QueueBadge({ status }: { status: string }) {
  const isActive = status === "In consultation";
  return (
    <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${isActive ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-400"}`}>
      {status}
    </span>
  );
}

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;
  const blanks = Array(startDayOfWeek).fill(null);
  const allCells = [...blanks, ...daysInMonth];
  const DAY_HEADERS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
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
        {DAY_HEADERS.map((d) => (
          <div key={d} className={`text-center text-xs font-medium py-1 ${d === "Sa" || d === "Su" ? "text-blue-400" : "text-slate-500"}`}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {allCells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} className="h-8" />;
          const todayDate = isToday(day);
          const inMonth = isSameMonth(day, currentDate);
          const dayOfWeek = (getDay(day) + 6) % 7;
          const isWeekend = dayOfWeek >= 5;
          return (
            <div key={day.toISOString()} className="flex items-center justify-center h-8">
              <button className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center transition-colors
                ${!inMonth ? "text-slate-300" : todayDate ? "bg-orange-500 text-white font-bold" : isWeekend ? "text-blue-500 hover:bg-blue-50" : "text-slate-600 hover:bg-slate-50"}`}>
                {format(day, "d")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// SECTION 4: MAIN COMPONENT
// ============================================

export default function DoctorDashboard() {
  const navigate = useNavigate();

 return (
  <div className="p-6 bg-white min-h-screen">
    <div className="grid grid-cols-3 gap-6">

      {/* ROW 1 LEFT — Greeting */}
      <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold text-orange-500">Good morning, Dr. Olatunji</h2>
            <p className="text-sm text-slate-400 mt-1">Here's your schedule for today</p>
          </div>
          <button
            onClick={() => navigate("/consultation")}
            className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 transition w-fit mt-20"
          >
            Start Consultation
          </button>
        </div>
        <img src="/stethoscope.png" alt="stethoscope" className="w-55 h-40 object-contain rounded-2xl" />
      </div>

      {/* ROW 1 RIGHT — Calendar */}
      <div className="col-span-1">
        <Calendar />
      </div>

      {/* ROW 2 LEFT — Chart */}
      <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-slate-800">Report Analysis</h2>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none bg-white">
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>
        <p className="text-xs text-slate-400 mb-3">Average number of staffs seen in a week</p>
        <p className="text-2xl font-bold text-orange-500 mb-4">87% ↑</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(255, 114, 33)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="rgb(255, 114, 33)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgb(148, 163, 184)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "rgb(148, 163, 184)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid rgb(226, 232, 240)", fontSize: "12px" }} />
            <Area type="monotone" dataKey="value" stroke="rgb(255, 114, 33)" strokeWidth={2.5} fill="url(#orangeGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ROW 2 RIGHT — Notifications */}
      <div className="col-span-1 bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-slate-800">Notifications</h2>
          <span className="text-orange-500 text-xs cursor-pointer">Show more</span>
        </div>
        <div className="flex flex-col gap-3">
          {notifications.map((note, index) => (
            <div key={index} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                <p className="text-sm text-slate-600 font-medium">{note.title}</p>
              </div>
              <p className="text-[10px] text-slate-400">{note.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 3 — Patient Queue + Recent Consultations */}
<div className="col-span-3 grid grid-cols-2 gap-6">

  {/* Patient Queue */}
  <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-base font-bold text-slate-800">Patient Queue</h2>
      <span className="text-orange-500 text-xs cursor-pointer">Show All</span>
    </div>
    <div className="flex flex-col gap-4">
      {patientQueue.map((patient, index) => (
        <div key={index} className="flex items-center gap-3">
          <PatientAvatar name={patient.name} />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">{patient.name}</p>
            <p className="text-[10px] text-slate-400">{patient.id}</p>
          </div>
          <QueueBadge status={patient.status} />
          <button className="bg-orange-500 text-white px-4 py-1 rounded-lg text-xs hover:bg-orange-600 transition">Start</button>
        </div>
      ))}
    </div>
  </div>

  {/* Recent Consultations */}
  <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-base font-bold text-slate-800">Recent Consultations</h2>
      <span className="text-orange-500 text-xs cursor-pointer">Show All</span>
    </div>
    <div className="flex flex-col gap-4">
      {recentConsultations.map((recent, index) => (
        <div key={index} className="flex items-center gap-3">
          <PatientAvatar name={recent.name} />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">{recent.name}</p>
            <p className="text-[10px] text-slate-400">{recent.id}</p>
          </div>
          <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-1 rounded-full">{recent.time}</span>
          <button className="bg-orange-500 text-white px-4 py-1 rounded-lg text-xs hover:bg-orange-600 transition">Start</button>
        </div>
      ))}
    </div>
  </div>

</div>
  </div>
  </div>
);
}