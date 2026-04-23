import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ConsultationEntry {
  id: number;
  staffName: string;
  staffNumber: string;
  department: string;
  status: "In consultation" | "Waiting" | "Completed";
  age: string;
  height: string;
  weight: string;
}

type View = "list" | "detail";

// ── Mock Data ─────────────────────────────────────────────────
const CONSULTATION_DATA: ConsultationEntry[] = [
  { id: 1,  staffName: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", status: "In consultation", age: "42yrs", height: "171cm", weight: "65.6kg" },
  { id: 2,  staffName: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", status: "Waiting",         age: "42yrs", height: "171cm", weight: "65.6kg" },
  { id: 3,  staffName: "Elizabeth Asojo", staffNumber: "SAH-3567", department: "Business Development", status: "Waiting",         age: "32yrs", height: "165cm", weight: "60.0kg" },
  { id: 4,  staffName: "John Okafor",     staffNumber: "SAH-3568", department: "Business Development", status: "Waiting",         age: "45yrs", height: "175cm", weight: "78.0kg" },
  { id: 5,  staffName: "Amaka Obi",       staffNumber: "SAH-3569", department: "Business Development", status: "Waiting",         age: "29yrs", height: "160cm", weight: "55.0kg" },
  { id: 6,  staffName: "Tunde Adeyemi",   staffNumber: "SAH-3570", department: "Business Development", status: "Waiting",         age: "38yrs", height: "180cm", weight: "85.0kg" },
  { id: 7,  staffName: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", status: "Completed",       age: "42yrs", height: "171cm", weight: "65.6kg" },
  { id: 8,  staffName: "Ngozi Eze",       staffNumber: "SAH-3571", department: "Business Development", status: "Waiting",         age: "35yrs", height: "163cm", weight: "58.0kg" },
  { id: 9,  staffName: "Emeka Nwachukwu", staffNumber: "SAH-3572", department: "Business Development", status: "Completed",       age: "41yrs", height: "172cm", weight: "72.0kg" },
  { id: 10, staffName: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", status: "Waiting",         age: "42yrs", height: "171cm", weight: "65.6kg" },
];

const ITEMS_PER_PAGE = 7;

// ── Staff Avatar ──────────────────────────────────────────────
function StaffAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-xs shrink-0">
      {initials}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: ConsultationEntry["status"] }) {
  const styles = {
    "In consultation": "bg-blue-50 text-blue-500",
    "Waiting":         "bg-primary-50 text-primary-500",
    "Completed":       "bg-green-50 text-green-600",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
}

// ── Dashed Lines ──────────────────────────────────────────────
function DashedLines({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-t border-dashed border-slate-200 w-full" />
      ))}
    </div>
  );
}

// ── Medical Record Detail View ────────────────────────────────
function MedicalRecordDetail({
  entry,
  onBack,
}: {
  entry: ConsultationEntry;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Go back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit"
      >
        <ArrowLeft size={16} /> Go back
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        {/* Title */}
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">
          Medical Record
        </h2>

        {/* Meta info */}
        <div className="flex justify-between mb-8">
          <div>
            <p className="text-sm text-slate-500">
              Date: <span className="text-slate-700 font-medium">05-03-2026</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Doctor: <span className="text-slate-700 font-medium">Olatunji Bolanle</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">
              Age: <span className="text-slate-700 font-medium">{entry.age}</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Time: <span className="text-slate-700 font-medium">12:56pm</span>
            </p>
          </div>
        </div>

        {/* Vitals */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            ❤️ Vitals
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Blood pressure", value: "121/78mmhg"  },
              { label: "Heart rate",     value: "56bpm"        },
              { label: "Temperature",    value: "32.5 C"       },
              { label: "Height",         value: entry.height   },
              { label: "Weight",         value: entry.weight   },
            ].map((v) => (
              <div key={v.label}>
                <p className="text-xs text-slate-400">{v.label}</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{v.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            🧠 Symptoms
          </h3>
          <DashedLines count={5} />
        </div>

        {/* Diagnosis */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            🧠 Diagnosis
          </h3>
          <DashedLines count={7} />
        </div>

        {/* Prescription */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            💊 Prescription
          </h3>
          <DashedLines count={8} />
        </div>

        {/* Doctor Notes */}
        <div className="border border-slate-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            🩺 Doctor Notes
          </h3>
          <DashedLines count={8} />
        </div>
      </div>
    </div>
  );
}

// ── Main Consultation Page ────────────────────────────────────
export default function ConsultationPage() {
  const [view, setView]               = useState<View>("list");
  const [selected, setSelected]       = useState<ConsultationEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(CONSULTATION_DATA.length / ITEMS_PER_PAGE));
  const paginated  = CONSULTATION_DATA.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Detail view ──────────────────────────────────────────────
  if (view === "detail" && selected) {
    return (
      <MedicalRecordDetail
        entry={selected}
        onBack={() => { setView("list"); setSelected(null); }}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Staff Name
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Staff Number
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Department
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Status
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
              >
                {/* Staff Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <StaffAvatar name={entry.staffName} />
                    <span className="text-sm font-medium text-slate-700">
                      {entry.staffName}
                    </span>
                  </div>
                </td>

                {/* Staff Number */}
                <td className="px-6 py-4 text-sm text-slate-500">
                  {entry.staffNumber}
                </td>

                {/* Department */}
                <td className="px-6 py-4 text-sm text-slate-500">
                  {entry.department}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <StatusBadge status={entry.status} />
                </td>

                {/* Action */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => { setSelected(entry); setView("detail"); }}
                    className="text-sm font-medium text-slate-700 hover:text-primary-500 transition-colors"
                  >
                    View
                  </button>
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
    </div>
  );
}