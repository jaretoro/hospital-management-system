import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
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
  status:      "waiting" | "in_consultation" | "ready_for_medication" | "completed" | "cancelled";
  complaint:   string;
  diagnosis?:  string;
  diagnosisNotes?: string;
  vitals?: {
    bloodPressure: string;
    heartRate:     number;
    temperature:   number;
    height:        number;
    weight:        number;
  };
  prescriptions: {
    _id:            string;
    medication:     string;
    medicationName: string;
    dosage:         string;
    quantity:       number;
    duration:       string;
    notes:          string;
  }[];
  attendedBy?: { _id: string; fullName: string; role: string };
  checkInTime:  string;
  checkOutTime?: string;
}

interface Medication {
  _id:      string;
  name:     string;
  quantity: number;
  status:   string;
}

interface PrescriptionItem {
  id:             number;
  medication:     string;
  medicationName: string;
  quantity:       string;
  instructions:   string;
  notes:          string;
}

type View = "list" | "edit" | "view";

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: Consultation["status"] }) {
  const styles = {
    waiting:              "bg-primary-50 text-primary-500",
    in_consultation:      "bg-blue-50 text-blue-500",
    ready_for_medication: "bg-purple-50 text-purple-600",
    completed:            "bg-green-50 text-green-600",
    cancelled:            "bg-red-50 text-red-500",
  };
  const labels = {
    waiting:              "Waiting",
    in_consultation:      "In consultation",
    ready_for_medication: "Ready for medication",
    completed:            "Completed",
    cancelled:            "Cancelled",
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

// ── Success Modal ─────────────────────────────────────────────
function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 z-10 p-12 flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 bg-primary-500 rounded-[40%] rotate-12 flex items-center justify-center">
          <svg className="-rotate-12" width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-slate-700 font-medium text-base max-w-xs">
          Consultation completed successfully!
        </p>
        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
        >
          Back to consultation list
        </button>
      </div>
    </div>
  );
}

// ── Medical Record View (read-only) ───────────────────────────
function MedicalRecordView({
  consultation, onBack,
}: {
  consultation: Consultation; onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit">
        <ArrowLeft size={16} /> Go back
      </button>
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">Medical Record</h2>

        <div className="flex justify-between mb-6 pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-500">Date: <span className="font-medium text-slate-700">{new Date(consultation.checkInTime).toLocaleDateString()}</span></p>
            <p className="text-sm text-slate-500 mt-1">Doctor: <span className="font-medium text-slate-700">{consultation.attendedBy?.fullName ?? "—"}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Patient: <span className="font-medium text-slate-700">{consultation.patientName}</span></p>
            <p className="text-sm text-slate-500 mt-1">
              Time: <span className="font-medium text-slate-700">
                {new Date(consultation.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

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

        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Symptoms</h3>
          <p className="text-sm text-slate-600">{consultation.complaint || "—"}</p>
        </div>

        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Diagnosis</h3>
          <p className="text-sm text-slate-600">{consultation.diagnosis || "—"}</p>
          {consultation.diagnosisNotes && (
            <p className="text-sm text-slate-400 mt-2">{consultation.diagnosisNotes}</p>
          )}
        </div>

        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">💊 Prescription</h3>
          {consultation.prescriptions.length === 0 ? (
            <p className="text-sm text-slate-400">No prescription recorded.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {consultation.prescriptions.map((p) => (
                <div key={p._id} className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-medium">{p.medicationName}</span>
                  <span className="text-slate-400">{p.dosage}</span>
                  <span>{p.quantity} units</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Medical Record Edit ───────────────────────────────────────
function MedicalRecordEdit({
  consultation, onBack, onComplete,
}: {
  consultation: Consultation; onBack: () => void; onComplete: () => void;
}) {
  const [diagnosis,        setDiagnosis]        = useState("");
  const [diagnosisNotes,   setDiagnosisNotes]   = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [prescription,     setPrescription]     = useState<PrescriptionItem[]>([]);
  const [medications,      setMedications]      = useState<Medication[]>([]);
  const [showSuccess,      setShowSuccess]      = useState(false);
  const [loading,          setLoading]          = useState(false);
  const [errors,           setErrors]           = useState<Record<string, string>>({});

  // Fetch all available in-stock medications for prescription
  useEffect(() => {
    api.get<{ data: { medications: Medication[] } }>("/v1/medications?limit=100&status=in_stock")
      .then((res) => setMedications(res.data.medications))
      .catch(() => {});
  }, []);

  const addPrescriptionLine = () => {
    setPrescription((p) => [
      ...p,
      { id: Date.now(), medication: "", medicationName: "", quantity: "", instructions: "", notes: "" },
    ]);
  };

  const updateLine = (id: number, field: keyof PrescriptionItem, value: string) => {
    setPrescription((p) => p.map((item) => {
      if (item.id !== id) return item;
      if (field === "medication") {
        const med = medications.find((m) => m._id === value);
        return { ...item, medication: value, medicationName: med?.name ?? "" };
      }
      if (field === "medicationName") {
        // Free text — clear any linked medication ID
        return { ...item, medication: "", medicationName: value };
      }
      return { ...item, [field]: value };
    }));
  };

  const selectMedication = (id: number, med: Medication) => {
    setPrescription((p) => p.map((item) =>
      item.id !== id ? item : { ...item, medication: med._id, medicationName: med.name }
    ));
  };

  const removeLine = (id: number) => setPrescription((p) => p.filter((item) => item.id !== id));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    prescription.forEach((item) => {
      if (item.medicationName.trim() && !item.quantity)      e[`qty_${item.id}`] = "Enter quantity";
      if (item.medicationName.trim() && !item.instructions)  e[`ins_${item.id}`] = "Enter instructions";
    });
    return e;
  };

  const handleComplete = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      await api.patch(`/v1/consultations/${consultation._id}/diagnose`, {
        diagnosis,
        diagnosisNotes: diagnosisNotes + (prescriptionNotes.trim()
          ? `\n\nAdditional prescription notes: ${prescriptionNotes}`
          : ""),
        complaint: consultation.complaint,
        prescriptions: prescription
        .filter((p) => p.medicationName.trim())
        .map((p) => ({
          medication:     p.medication || p.medicationName,
          medicationName: p.medicationName,
          dosage:         p.instructions,
          quantity:       Number(p.quantity),
          duration:       "1",
          notes:          p.notes,
        })),
      });
      setShowSuccess(true);
    } catch (err: any) {
      setErrors({ diagnosis: err.message ?? "Failed to complete consultation" });
    } finally {
      setLoading(false);
    }
  };

  const textareaClass = (field: string) => cn(
    "w-full px-4 py-3 rounded-xl border text-sm text-slate-700",
    "placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors resize-none",
    errors[field] ? "border-red-400" : "border-slate-200"
  );

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit">
        <ArrowLeft size={16} /> Go back
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">Medical Record</h2>

        <div className="flex justify-between mb-6 pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-500">
              Date: <span className="font-medium text-slate-700">
                {new Date(consultation.checkInTime).toLocaleDateString()}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">
              Patient: <span className="font-medium text-slate-700">{consultation.patientName}</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Time: <span className="font-medium text-slate-700">
                {new Date(consultation.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

        {/* Vitals — read only */}
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

        {/* Symptoms — read only */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Symptoms</h3>
          <p className="text-sm text-slate-600">{consultation.complaint}</p>
        </div>

        {/* Diagnosis */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Diagnosis</h3>
          <textarea
            rows={3}
            placeholder="Enter diagnosis..."
            value={diagnosis}
            onChange={(e) => { setDiagnosis(e.target.value); setErrors((p) => ({ ...p, diagnosis: "" })); }}
            className={textareaClass("diagnosis")}
          />
          {errors.diagnosis && <p className="text-xs text-red-500 mt-1">{errors.diagnosis}</p>}
          <textarea
            rows={3}
            placeholder="Additional diagnosis notes (optional)..."
            value={diagnosisNotes}
            onChange={(e) => setDiagnosisNotes(e.target.value)}
            className={cn(textareaClass("diagnosisNotes"), "mt-3")}
          />
        </div>

        {/* Prescription */}
        <div className="border border-slate-100 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700">💊 Prescription</h3>
            <button
              onClick={addPrescriptionLine}
              className="flex items-center gap-1.5 text-sm text-primary-500 font-medium hover:underline"
            >
              <Plus size={14} /> Add medication
            </button>
          </div>

          {prescription.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              Click "Add medication" to prescribe
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {prescription.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  {/* Medication — combo: type freely or pick from suggestions */}
                  <div className="flex flex-col gap-1 flex-1 relative">
                    <input
                      placeholder="Type or select medication"
                      value={item.medicationName}
                      onChange={(e) => updateLine(item.id, "medicationName", e.target.value)}
                      className={cn(
                        "h-11 px-3 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400",
                        errors[`med_${item.id}`] ? "border-red-400" : "border-slate-200"
                      )}
                    />
                    {/* Dropdown suggestions */}
                    {item.medicationName.length > 0 && !item.medication && (() => {
                      const suggestions = medications.filter((m) =>
                        m.name.toLowerCase().includes(item.medicationName.toLowerCase())
                      );
                      return suggestions.length > 0 ? (
                        <div className="absolute top-12 left-0 right-0 z-30 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                          {suggestions.map((med) => (
                            <button
                              key={med._id}
                              type="button"
                              onMouseDown={() => selectMedication(item.id, med)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                            >
                              <span>{med.name}</span>
                              <span className="text-xs text-slate-400">stock: {med.quantity}</span>
                            </button>
                          ))}
                        </div>
                      ) : null;
                    })()}
                    {errors[`med_${item.id}`] && <p className="text-xs text-red-500">{errors[`med_${item.id}`]}</p>}
                  </div>

                  {/* Instructions */}
                  <div className="flex flex-col gap-1 w-48">
                    <input
                      placeholder="e.g. 1 tab tds x 3/7"
                      value={item.instructions}
                      onChange={(e) => updateLine(item.id, "instructions", e.target.value)}
                      className={cn(
                        "h-11 px-3 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400",
                        errors[`ins_${item.id}`] ? "border-red-400" : "border-slate-200"
                      )}
                    />
                    {errors[`ins_${item.id}`] && <p className="text-xs text-red-500">{errors[`ins_${item.id}`]}</p>}
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col gap-1 w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateLine(item.id, "quantity", e.target.value)}
                      className={cn(
                        "h-11 px-3 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400",
                        errors[`qty_${item.id}`] ? "border-red-400" : "border-slate-200"
                      )}
                    />
                    {errors[`qty_${item.id}`] && <p className="text-xs text-red-500">{errors[`qty_${item.id}`]}</p>}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeLine(item.id)}
                    className="mt-2 p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Free text area for additional notes */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2">
              Additional notes (e.g. medications to get from pharmacy outside)
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Patient should also get Vitamin C 500mg from any pharmacy..."
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Complete button */}
        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            disabled={loading}
            className="h-12 px-16 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <><LoadingSpinner size="sm" /> Completing...</> : "Complete consultation"}
          </button>
        </div>
      </div>

      {showSuccess && <SuccessState onClose={onComplete} />}
    </div>
  );
}

// ── Main Doctor Consultation Page ─────────────────────────────
export default function DoctorConsultationPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [view, setView]                   = useState<View>("list");
  const [selected, setSelected]           = useState<Consultation | null>(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);

  // Cancel state
  const [cancelTarget,  setCancelTarget]  = useState<Consultation | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchConsultations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      // Backend status filter is broken — fetch all and filter/sort client-side
      const res = await api.get<{ status: boolean; data: { consultations: Consultation[]; total: number; totalPages: number } }>(
        `/v1/consultations?limit=100`
      );
      const today = new Date().toDateString();
      const visible = res.data.consultations
        .filter((c) => {
          if (c.status === "cancelled") return false;
          // For completed, only show today's
          if (c.status === "completed" || c.status === "ready_for_medication") {
            return new Date(c.checkInTime).toDateString() === today;
          }
          return true;
        })
        // Active consultations float to top, completed sink to bottom
        .sort((a, b) => {
          const rank = (s: string) => s === "waiting" || s === "in_consultation" ? 0 : 1;
          // ready_for_medication and completed sink to bottom
          return rank(a.status) - rank(b.status);
        });
      setConsultations(visible);
      setTotalPages(1);
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
  }, []);

  const handleComplete = async () => {
    setView("list");
    setSelected(null);
    await fetchConsultations();
  };

  // ── Cancel ─────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await api.patch(`/v1/consultations/${cancelTarget._id}/cancel`, {});
      setConsultations((prev) =>
        prev.map((c) => c._id === cancelTarget._id ? { ...c, status: "cancelled" } : c)
      );
      setCancelTarget(null);
    } catch (err: any) {
      alert(err.message ?? "Failed to cancel consultation");
    } finally {
      setCancelLoading(false);
    }
  };

  if (view === "edit" && selected) {
    return (
      <MedicalRecordEdit
        consultation={selected}
        onBack={() => { setView("list"); setSelected(null); }}
        onComplete={handleComplete}
      />
    );
  }

  if (view === "view" && selected) {
    return (
      <MedicalRecordView
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
              // TODO: filter to only waiting/in_consultation for a cleaner doctor view — requires backend filter param or client-side filter toggle
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
                      {c.status === "completed" || c.status === "ready_for_medication" ? (
                        <button
                          onClick={() => { setSelected(c); setView("view"); }}
                          className="text-sm font-medium text-slate-700 hover:text-primary-500 transition-colors"
                        >
                          View
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              // Optimistically mark as in_consultation so other doctors see it's taken
                              setConsultations((prev) =>
                                prev.map((item) =>
                                  item._id === c._id ? { ...item, status: "in_consultation" } : item
                                )
                              );
                              setSelected({ ...c, status: "in_consultation" });
                              setView("edit");
                            }}
                            className="h-8 px-5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => setCancelTarget(c)}
                            className="h-8 px-4 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
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
          loading={cancelLoading}
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}