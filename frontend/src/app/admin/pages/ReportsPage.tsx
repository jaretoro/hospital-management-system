import { useState, useEffect, useMemo } from "react";
import { Printer, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// ── Types ─────────────────────────────────────────────────────
interface DiagnosisRow {
  diagnosis:     string;
  totalFemale:   number;
  totalMale:     number;
  totalPatients: number;
}

type Period = "Weekly" | "Monthly";

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

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  title, value, subtitle, icon,
}: {
  title: string; value: React.ReactNode; subtitle: string; icon: React.ReactNode;
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

const ITEMS_PER_PAGE = 11;

// ── Main Page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const [period,       setPeriod]       = useState<Period>("Weekly");
  const [currentPage, setCurrentPage]  = useState(1);
  const [rows,         setRows]         = useState<DiagnosisRow[]>([]);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDiagnoses, setTotalDiagnoses] = useState(0);
  const [loading,      setLoading]      = useState(true);

  // Dashboard summary for stat cards
  const [staffCount,   setStaffCount]   = useState<number | null>(null);

  useEffect(() => {
    // Fetch staff count once
    api.get<{ data: { total: number } }>("/v1/users/staff")
      .then((res) => setStaffCount((res.data as any).staffs?.length ?? (res.data as any).total ?? 0))
      .catch(() => setStaffCount(0));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get<{
      data: {
        rows:          DiagnosisRow[];
        totalPatients: number;
        totalDiagnoses: number;
        totalPages:    number;
        currentPage:   number;
      };
    }>(`/v1/reports/diagnosis-summary?period=${period.toLowerCase()}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`)
      .then((res) => {
        setRows(res.data.rows ?? []);
        setTotalPatients(res.data.totalPatients ?? 0);
        setTotalDiagnoses(res.data.totalDiagnoses ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      })
      .catch(() => {
        setRows([]);
        setTotalPatients(0);
        setTotalDiagnoses(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [period, currentPage]);

  const periodLabel = period === "Weekly" ? "This week" : "This month";

  const handlePeriodChange = (val: Period) => {
    setPeriod(val);
    setCurrentPage(1);
  };

  const summary = useMemo(() => ({
    totalDiagnoses,
    totalPatients,
  }), [totalDiagnoses, totalPatients]);

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => alert("PDF download coming soon.");

  return (
    <div className="flex flex-col gap-6">

      {/* ── Print header ──────────────────────────────────────── */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          SAHCOMed — Diagnosis Summary Report
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Period: {periodLabel} | Generated: {new Date().toLocaleDateString()}
        </p>
        <hr className="my-4 border-slate-200" />
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <StatCard
          title="Total Staffs"
          value={staffCount === null ? <LoadingSpinner size="sm" /> : String(staffCount)}
          subtitle="Active staffs in the system"
          icon={<StaffIcon />}
        />
        <StatCard
          title="Patients seen"
          value={loading ? <LoadingSpinner size="sm" /> : String(totalPatients)}
          subtitle={`Patients diagnosed ${periodLabel.toLowerCase()}`}
          icon={<StaffIcon />}
        />
        <StatCard
          title="Diagnosis recorded"
          value={loading ? <LoadingSpinner size="sm" /> : String(totalDiagnoses)}
          subtitle="Different types of diagnosis"
          icon={<ReportIcon />}
        />
      </div>

      {/* ── Report table ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden">
          <h2 className="text-base font-bold text-slate-800">Diagnosis summary report</h2>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value as Period)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 h-9 px-4 rounded-lg border border-primary-500 text-primary-500 text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <Download size={15} /> Download pdf
            </button>
          </div>
        </div>

        <div className="hidden print:block px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-800">
            Diagnosis Summary Report — {periodLabel}
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Diagnosis</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Total Female</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Total Male</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Total Patients Treated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <LoadingSpinner size="lg" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                  No diagnosis data for this period.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={`${row.diagnosis}-${i}`}
                  className={cn(
                    "border-b border-slate-50 hover:bg-slate-50/80 transition-colors",
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  )}
                >
                  <td className="px-6 py-4 text-sm text-slate-700 capitalize">{row.diagnosis}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{row.totalFemale}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{row.totalMale}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{row.totalPatients}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 print:hidden">
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
                page === currentPage ? "bg-primary-500 text-white" : "text-slate-500 hover:bg-slate-100"
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

      {/* ── Summary bar ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-primary-200 bg-primary-50/30 px-8 py-5 print:hidden">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Report period:</span>{" "}
              {periodLabel}
            </span>
          </div>
          <div className="h-6 w-px bg-primary-200 hidden md:block" />
          <div>
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">Total diagnoses:</span>{" "}
              {summary.totalDiagnoses} different types
            </span>
          </div>
          <div className="h-6 w-px bg-primary-200 hidden md:block" />
          <div>
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                Total patients treated {periodLabel.toLowerCase()}:
              </span>{" "}
              {summary.totalPatients} patients
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
