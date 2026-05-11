import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";

// ── Types ─────────────────────────────────────────────────────
interface Consultation {
  _id:         string;
  patientName: string;
  staffNumber: string;
  department:  string;
  status:      "waiting" | "in_consultation" | "completed" | "cancelled";
  complaint:   string;
  diagnosis?:  string;
  vitals?: {
    bloodPressure: string;
    heartRate:     number;
    temperature:   number;
    height:        number;
    weight:        number;
    recordedBy:    { _id: string; fullName: string };
    recordedAt:    string;
  };
  prescriptions: {
    _id:            string;
    medicationName: string;
    dosage:         string;
    quantity:       number;
    duration:       string;
    notes:          string;
  }[];
  attendedBy?: { _id: string; fullName: string; role: string };
  diagnosisNotes?: string;
  checkInTime:  string;
  checkOutTime?: string;
  createdAt:    string;
}

type View = "list" | "detail";

const ITEMS_PER_PAGE = 7;

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: Consultation["status"] }) {
  const styles = {
    waiting:         "bg-primary-50 text-primary-500",
    in_consultation: "bg-blue-50 text-blue-500",
    completed:       "bg-green-50 text-green-600",
    cancelled:       "bg-red-50 text-red-500",
  };
  const labels = {
    waiting:         "Waiting",
    in_consultation: "In consultation",
    completed:       "Completed",
    cancelled:       "Cancelled",
  };
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
      styles[status]
    )}>
      {labels[status]}
    </span>
  );
}

// ── Patient Avatar ────────────────────────────────────────────
function PatientAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-xs shrink-0">
      {initials}
    </div>
  );
}

// ── Consultation Detail View ──────────────────────────────────
function ConsultationDetailView({
  consultation,
  onBack,
}: {
  consultation: Consultation;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit"
      >
        <ArrowLeft size={16} /> Go back
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">
          Medical Record
        </h2>

        {/* Meta */}
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-500">
              Date: <span className="font-medium text-slate-700">
                {new Date(consultation.checkInTime).toLocaleDateString()}
              </span>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Doctor: <span className="font-medium text-slate-700">
                {consultation.attendedBy?.fullName ?? "Not assigned"}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">
              Patient: <span className="font-medium text-slate-700">
                {consultation.patientName}
              </span>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Time: <span className="font-medium text-slate-700">
                {new Date(consultation.checkInTime).toLocaleTimeString()}
              </span>
            </p>
          </div>
        </div>

        {/* Vitals */}
        {consultation.vitals && (
          <div className="border border-slate-100 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-4">❤️ Vitals</h3>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Blood pressure", value: consultation.vitals.bloodPressure },
                { label: "Heart rate",     value: `${consultation.vitals.heartRate}bpm` },
                { label: "Temperature",    value: `${consultation.vitals.temperature}°C` },
                { label: "Height",         value: `${consultation.vitals.height}cm` },
                { label: "Weight",         value: `${consultation.vitals.weight}kg` },
              ].map((v) => (
                <div key={v.label}>
                  <p className="text-xs text-slate-400">{v.label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{v.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complaint / Symptoms */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Symptoms / Complaint</h3>
          <p className="text-sm text-slate-600">{consultation.complaint || "—"}</p>
        </div>

        {/* Diagnosis */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Diagnosis</h3>
          <p className="text-sm text-slate-600">{consultation.diagnosis || "—"}</p>
          {consultation.diagnosisNotes && (
            <p className="text-sm text-slate-400 mt-2">{consultation.diagnosisNotes}</p>
          )}
        </div>

        {/* Prescription */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">💊 Prescription</h3>
          {consultation.prescriptions.length === 0 ? (
            <p className="text-sm text-slate-400">No prescription recorded.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {consultation.prescriptions.map((p) => (
                <div key={p._id} className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-medium">{p.medicationName}</span>
                  <span>{p.dosage}</span>
                  <span>{p.quantity} units</span>
                  <span>{p.duration} days</span>
                  {p.notes && <span className="text-slate-400">{p.notes}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-slate-500">Status:</span>
          <StatusBadge status={consultation.status} />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ConsultationPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [view, setView]                   = useState<View>("list");
  const [selected, setSelected]           = useState<Consultation | null>(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{
        status: boolean;
        data: {
          consultations: Consultation[];
          total:         number;
          totalPages:    number;
        };
      }>("/v1/consultations");
      setConsultations(response.data.consultations);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      setError(err.message ?? "Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConsultations(); }, []);

  if (view === "detail" && selected) {
    return (
      <ConsultationDetailView
        consultation={selected}
        onBack={() => { setView("list"); setSelected(null); }}
      />
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={fetchConsultations} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Patient Name</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Staff Number</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Department</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-sm text-slate-400">
                  No consultations found.
                </td>
              </tr>
            ) : (
              consultations.map((c) => (
                <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <PatientAvatar name={c.patientName} />
                      <span className="text-sm font-medium text-slate-700">{c.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.staffNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.department}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { setSelected(c); setView("detail"); }}
                      className="text-sm font-medium text-slate-700 hover:text-primary-500 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40"
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}