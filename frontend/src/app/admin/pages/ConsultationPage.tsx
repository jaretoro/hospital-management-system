import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
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

// ── Confirm Modal ─────────────────────────────────────────────
function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmClass,
  loading,
  onConfirm,
  onClose,
}: {
  title:        string;
  message:      string;
  confirmLabel: string;
  confirmClass: string;
  loading:      boolean;
  onConfirm:    () => void;
  onClose:      () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 z-10 p-8 flex flex-col gap-5">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            No, go back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 h-11 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2",
              confirmClass
            )}
          >
            {loading ? <><LoadingSpinner size="sm" /> Working...</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Consultation Detail View ──────────────────────────────────
function ConsultationDetailView({
  consultation: initial,
  onBack,
}: {
  consultation: Consultation;
  onBack: () => void;
}) {
  const [consultation, setConsultation] = useState<Consultation>(initial);
  const [fetching, setFetching]         = useState(true);

  // Always fetch fresh data so nurse sees latest doctor updates
  useEffect(() => {
    api.get<{ data: { consultation: Consultation } }>(`/v1/consultations/${initial._id}`)
      .then((res) => setConsultation(res.data.consultation))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [initial._id]);

  if (fetching) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit">
          <ArrowLeft size={16} /> Go back
        </button>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

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
              {new Date(consultation.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

  // Action states
  const [cancelTarget,    setCancelTarget]    = useState<Consultation | null>(null);
  const [administerTarget, setAdministerTarget] = useState<Consultation | null>(null);
  const [actionLoading,   setActionLoading]   = useState(false);

  const fetchConsultations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const response = await api.get<{
        status: boolean;
        data: {
          consultations: Consultation[];
          total:         number;
          totalPages:    number;
        };
      }>(`/v1/consultations?page=${currentPage}&limit=${ITEMS_PER_PAGE}&date=${today}`);
      setConsultations(response.data.consultations);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      if (!silent) setError(err.message ?? "Failed to load consultations");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
    const interval = setInterval(() => fetchConsultations(true), 15000);
    return () => clearInterval(interval);
  }, [currentPage]);

  // ── Cancel ─────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/v1/consultations/${cancelTarget._id}/cancel`, {});
      setConsultations((prev) =>
        prev.map((c) => c._id === cancelTarget._id ? { ...c, status: "cancelled" } : c)
      );
      setCancelTarget(null);
    } catch (err: any) {
      alert(err.message ?? "Failed to cancel consultation");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Administer ─────────────────────────────────────────────
  const handleAdminister = async () => {
    if (!administerTarget) return;
    const user = getUser();
    if (!user) { alert("Session expired. Please log in again."); return; }
    setActionLoading(true);
    try {
      await api.patch(`/v1/consultations/${administerTarget._id}/administer`, { userId: user.id });
      // Remove from list — medication has been dispensed, consultation is fully done
      setConsultations((prev) => prev.filter((c) => c._id !== administerTarget._id));
      setAdministerTarget(null);
    } catch (err: any) {
      alert(err.message ?? "Failed to administer medication");
    } finally {
      setActionLoading(false);
    }
  };

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
                    <div className="flex items-center gap-3">
                      {/* View — always available */}
                      <button
                        onClick={() => { setSelected(c); setView("detail"); }}
                        className="text-sm font-medium text-slate-700 hover:text-primary-500 transition-colors"
                      >
                        View
                      </button>

                      {/* Administer — after doctor has diagnosed (backend keeps in_consultation status until administer) */}
                      {(c.status === "completed" || c.status === "in_consultation") && c.prescriptions.length > 0 && (
                        <button
                          onClick={() => setAdministerTarget(c)}
                          className="h-8 px-4 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
                        >
                          Administer
                        </button>
                      )}

                      {/* Cancel — only when doctor hasn't diagnosed yet */}
                      {(c.status === "waiting" || (c.status === "in_consultation" && c.prescriptions.length === 0)) && (
                        <button
                          onClick={() => setCancelTarget(c)}
                          className="h-8 px-4 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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

      {/* Cancel Confirm Modal */}
      {cancelTarget && (
        <ConfirmModal
          title="Cancel consultation?"
          message={`Are you sure you want to cancel ${cancelTarget.patientName}'s consultation? This cannot be undone.`}
          confirmLabel="Yes, cancel it"
          confirmClass="bg-red-500 hover:bg-red-600"
          loading={actionLoading}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {/* Administer Confirm Modal */}
      {administerTarget && (
        <ConfirmModal
          title="Administer medication?"
          message={`Confirm that medication has been administered to ${administerTarget.patientName}. This will deduct the prescribed quantities from stock.`}
          confirmLabel="Yes, administer"
          confirmClass="bg-green-500 hover:bg-green-600"
          loading={actionLoading}
          onConfirm={handleAdminister}
          onClose={() => setAdministerTarget(null)}
        />
      )}
    </div>
  );
}