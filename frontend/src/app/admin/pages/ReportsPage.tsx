import { useState, useMemo } from "react";
import { Printer, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface DiagnosisReport {
  id: number;
  diagnosis: string;
  totalFemale: number;
  totalMale: number;
}

// ── Mock Data ─────────────────────────────────────────────────
const WEEKLY_DATA: DiagnosisReport[] = [
  { id: 1,  diagnosis: "Plasmodiasis",   totalFemale: 32, totalMale: 57 },
  { id: 2,  diagnosis: "Plasmodiasis",   totalFemale: 32, totalMale: 57 },
  { id: 3,  diagnosis: "Typhoid fever",  totalFemale: 18, totalMale: 24 },
  { id: 4,  diagnosis: "Malaria",        totalFemale: 45, totalMale: 38 },
  { id: 5,  diagnosis: "Hypertension",   totalFemale: 22, totalMale: 31 },
  { id: 6,  diagnosis: "Diabetes",       totalFemale: 15, totalMale: 19 },
  { id: 7,  diagnosis: "Plasmodiasis",   totalFemale: 32, totalMale: 57 },
  { id: 8,  diagnosis: "Typhoid fever",  totalFemale: 18, totalMale: 24 },
  { id: 9,  diagnosis: "Malaria",        totalFemale: 45, totalMale: 38 },
  { id: 10, diagnosis: "Hypertension",   totalFemale: 22, totalMale: 31 },
  { id: 11, diagnosis: "Plasmodiasis",   totalFemale: 32, totalMale: 57 },
];

const MONTHLY_DATA: DiagnosisReport[] = [
  { id: 1,  diagnosis: "Malaria",        totalFemale: 120, totalMale: 145 },
  { id: 2,  diagnosis: "Typhoid fever",  totalFemale: 88,  totalMale: 94  },
  { id: 3,  diagnosis: "Hypertension",   totalFemale: 76,  totalMale: 82  },
  { id: 4,  diagnosis: "Diabetes",       totalFemale: 54,  totalMale: 61  },
  { id: 5,  diagnosis: "Plasmodiasis",   totalFemale: 99,  totalMale: 110 },
  { id: 6,  diagnosis: "Pneumonia",      totalFemale: 43,  totalMale: 55  },
  { id: 7,  diagnosis: "Anaemia",        totalFemale: 67,  totalMale: 39  },
  { id: 8,  diagnosis: "UTI",            totalFemale: 91,  totalMale: 22  },
  { id: 9,  diagnosis: "Malaria",        totalFemale: 110, totalMale: 130 },
  { id: 10, diagnosis: "Typhoid fever",  totalFemale: 75,  totalMale: 88  },
  { id: 11, diagnosis: "Hypertension",   totalFemale: 60,  totalMale: 74  },
  { id: 12, diagnosis: "Plasmodiasis",   totalFemale: 88,  totalMale: 102 },
];

const ITEMS_PER_PAGE = 11;

// ── Stat Card ─────────────────────────────────────────────────
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

function ReportIcon() {
  return (
    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#FF7221" strokeWidth="1.8"/>
        <line x1="8" y1="8"  x2="16" y2="8"  stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="8" y1="16" x2="12" y2="16" stroke="#FF7221" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-2">{title}</p>
          <p className="text-4xl font-bold text-slate-800">{value}</p>
        </div>
        {icon}
      </div>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [period, setPeriod]           = useState<"Weekly" | "Monthly">("Weekly");
  const [currentPage, setCurrentPage] = useState(1);

  // Switch data based on period
  const data = period === "Weekly" ? WEEKLY_DATA : MONTHLY_DATA;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(data.length / ITEMS_PER_PAGE));
  const paginated  = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Summary stats — calculated from ALL data (not just current page)
  const summary = useMemo(() => {
    const totalDiagnoses    = new Set(data.map((d) => d.diagnosis)).size;
    const totalPatients     = data.reduce((sum, d) => sum + d.totalFemale + d.totalMale, 0);
    return { totalDiagnoses, totalPatients };
  }, [data]);

  // Period label for summary bar
  const periodLabel = period === "Weekly" ? "This week" : "This month";

  // Handle period change — reset to page 1
  const handlePeriodChange = (val: "Weekly" | "Monthly") => {
    setPeriod(val);
    setCurrentPage(1);
  };

  // Print handler
  const handlePrint = () => window.print();

  // PDF placeholder
  const handleDownloadPdf = () => {
    alert("PDF download will be available once the backend is connected.");
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Staffs"
          value="450"
          subtitle="Active staffs in the system"
          icon={<StaffIcon />}
        />
        <StatCard
          title="Patients seen"
          value="50"
          subtitle="Patients diagnosed this week"
          icon={<StaffIcon />}
        />
        <StatCard
          title="Diagnosis recorded"
          value="450"
          subtitle="Different type of diagnosis"
          icon={<ReportIcon />}
        />
      </div>

      {/* ── Report table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

        {/* Table header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            Diagnosis summary report
          </h2>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value as "Weekly" | "Monthly")}
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-primary-500 text-primary-500 text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              <Printer size={15} />
              Print
            </button>

            {/* Download PDF button */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <Download size={15} />
              Download pdf
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Diagnosis
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Total Female
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Total Male
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Total Number of Patients Treated
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-slate-50 hover:bg-slate-50/80 transition-colors",
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                )}
              >
                <td className="px-6 py-4 text-sm text-slate-700">{row.diagnosis}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{row.totalFemale}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{row.totalMale}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {row.totalFemale + row.totalMale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-primary-500 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Summary bar ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-primary-200 bg-primary-50/30 px-8 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Report period */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Report period:</span>{" "}
              {periodLabel}
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-primary-200 hidden md:block" />

          {/* Total diagnoses */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Total diagnoses:</span>{" "}
              {summary.totalDiagnoses} different types
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-primary-200 hidden md:block" />

          {/* Total patients */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                Total patients treated {period === "Weekly" ? "this week" : "this month"}:
              </span>{" "}
              {summary.totalPatients} patients
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}