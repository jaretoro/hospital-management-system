import { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Trash2, MoreVertical,
  Pencil, X, SlidersHorizontal, ChevronLeft,
  ChevronRight, ArrowLeft, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";

// ── Types ─────────────────────────────────────────────────────
interface Patient {
  _id:         string;
  fullName:    string;
  staffNumber: string;
  department:  string;
  age:         number;
  gender:      string;
  phoneNumber: string;
  email:       string;
  address:     string;
  bloodGroup:  string;
  genotype:    string;
  height:      number;
  weight:      number;
  status:      "active" | "inactive";
  createdAt:   string;
  updatedAt:   string;
}

interface Consultation {
  _id:        string;
  diagnosis?: string;
  complaint:  string;
  status:     string;
  checkInTime: string;
  vitals?: {
    bloodPressure: string;
    heartRate:     number;
    temperature:   number;
    height:        number;
    weight:        number;
  };
  prescriptions: {
    _id:            string;
    medicationName: string;
    dosage:         string;
    quantity:       number;
    duration:       string;
  }[];
  attendedBy?: { _id: string; fullName: string };
}

interface Vitals {
  bloodPressure: string;
  heartRate:     string;
  temperature:   string;
  height:        string;
  weight:        string;
}

type SortField = "department" | "staffNumber" | null;
type View      = "list" | "detail";

const DEPARTMENTS  = ["Business Development", "Internal Control", "Clinic", "MTCE", "Finance", "IT"];
const ITEMS_PER_PAGE = 7;

// ── Helpers ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: "active" | "inactive" }) {
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium capitalize",
      status === "active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"
    )}>
      {status}
    </span>
  );
}

function ConsultationStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed:       "text-green-600",
    in_consultation: "text-blue-500",
    waiting:         "text-primary-500",
    cancelled:       "text-red-400",
  };
  return (
    <span className={cn("text-sm font-medium capitalize", styles[status] ?? "text-slate-500")}>
      {status.replace("_", " ")}
    </span>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass = (error?: string) => cn(
  "w-full h-12 px-4 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors",
  error ? "border-red-400" : "border-slate-200"
);

// ── Patient Form ──────────────────────────────────────────────
function PatientForm({
  title, initial, onClose, onSubmit, submitLabel, loading,
}: {
  title: string; initial: Partial<Patient>; onClose: () => void;
  onSubmit: (data: any) => void; submitLabel: string; loading?: boolean;
}) {
  const [form, setForm] = useState({
    fullName:    initial.fullName    ?? "",
    age:         initial.age?.toString() ?? "",
    gender:      initial.gender      ?? "",
    staffNumber: initial.staffNumber ?? "",
    department:  initial.department  ?? "",
    phoneNumber: initial.phoneNumber ?? "",
    email:       initial.email       ?? "",
    address:     initial.address     ?? "",
    bloodGroup:  initial.bloodGroup  ?? "",
    genotype:    initial.genotype    ?? "",
    height:      initial.height?.toString() ?? "",
    weight:      initial.weight?.toString() ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())    e.fullName    = "Full name is required";
    if (!form.age.trim())         e.age         = "Age is required";
    if (!form.gender.trim())      e.gender      = "Gender is required";
    if (!form.staffNumber.trim()) e.staffNumber = "Patient number is required";
    if (!form.department.trim())  e.department  = "Department is required";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    if (!form.email.trim())       e.email       = "Email is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSubmit({
      ...form,
      age:    Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
          <X size={18} className="text-slate-500" />
        </button>
      </div>
      <div className="p-6 flex flex-col gap-5">
        <FormField label="Full name" error={errors.fullName}>
          <input className={inputClass(errors.fullName)} placeholder="Glory Nwosu" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Age" error={errors.age}>
            <input className={inputClass(errors.age)} placeholder="42" type="number" value={form.age} onChange={(e) => set("age", e.target.value)} />
          </FormField>
          <FormField label="Gender" error={errors.gender}>
            <select className={inputClass(errors.gender)} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
        <FormField label="Patient Number" error={errors.staffNumber}>
          <input className={inputClass(errors.staffNumber)} placeholder="SAH-0001" value={form.staffNumber} onChange={(e) => set("staffNumber", e.target.value)} />
        </FormField>
        <FormField label="Department" error={errors.department}>
          <select className={inputClass(errors.department)} value={form.department} onChange={(e) => set("department", e.target.value)}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </FormField>
        <FormField label="Phone number" error={errors.phoneNumber}>
          <input className={inputClass(errors.phoneNumber)} placeholder="+234 80 8000 0000" value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} />
        </FormField>
        <FormField label="Email address" error={errors.email}>
          <input className={inputClass(errors.email)} placeholder="name@gmail.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </FormField>
        <FormField label="Address" error={undefined}>
          <input className={inputClass()} placeholder="Ikeja" value={form.address} onChange={(e) => set("address", e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Blood group" error={undefined}>
            <input className={inputClass()} placeholder="O+" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} />
          </FormField>
          <FormField label="Genotype" error={undefined}>
            <input className={inputClass()} placeholder="AS" value={form.genotype} onChange={(e) => set("genotype", e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Height (cm)" error={undefined}>
            <input className={inputClass()} placeholder="171" type="number" value={form.height} onChange={(e) => set("height", e.target.value)} />
          </FormField>
          <FormField label="Weight (kg)" error={undefined}>
            <input className={inputClass()} placeholder="65.6" type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </FormField>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <><LoadingSpinner size="sm" /> Saving...</> : submitLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Record Vitals Modal ───────────────────────────────────────
function RecordVitalsModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const [form, setForm]   = useState<Vitals>({
    bloodPressure: "", heartRate: "",
    temperature: "", height: patient.height.toString(), weight: patient.weight.toString(),
  });
  const [complaint, setComplaint]           = useState("");
  const [errors, setErrors]                 = useState<Record<string, string>>({});
  const [successState, setSuccessState]     = useState<"sent" | "saved" | null>(null);
  const [loading, setLoading]               = useState(false);
  const [initLoading, setInitLoading]       = useState(true);
  // Existing active consultation found on open — reuse it instead of creating new
  const [existingConsultationId, setExistingConsultationId] = useState<string | null>(null);
  const [vitalsAlreadySaved, setVitalsAlreadySaved]         = useState(false);

  // On open, check for an existing waiting consultation with vitals already saved
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const res = await api.get<{
          data: { consultations: { _id: string; status: string; patient: any; complaint: string; vitals?: any }[] };
        }>(`/v1/consultations?limit=100&date=${today}`);

        const active = res.data.consultations.find((c) => {
          const patientId = typeof c.patient === "object" ? c.patient._id : c.patient;
          return patientId === patient._id && (c.status === "waiting" || c.status === "in_consultation");
        });

        if (active) {
          setExistingConsultationId(active._id);
          setComplaint(active.complaint ?? "");
          if (active.vitals) {
            setForm({
              bloodPressure: active.vitals.bloodPressure ?? "",
              heartRate:     active.vitals.heartRate?.toString() ?? "",
              temperature:   active.vitals.temperature?.toString() ?? "",
              height:        active.vitals.height?.toString() ?? patient.height.toString(),
              weight:        active.vitals.weight?.toString() ?? patient.weight.toString(),
            });
            setVitalsAlreadySaved(true);
          }
        }
      } catch {
        // silently ignore — fall back to blank form
      } finally {
        setInitLoading(false);
      }
    };
    checkExisting();
  }, [patient._id]);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = (requireComplaint = false) => {
    const e: Record<string, string> = {};
    if (!form.bloodPressure.trim()) e.bloodPressure = "Required";
    if (!form.heartRate.trim())     e.heartRate     = "Required";
    if (!form.temperature.trim())   e.temperature   = "Required";
    if (!form.height.trim())        e.height        = "Required";
    if (!form.weight.trim())        e.weight        = "Required";
    if (requireComplaint && !complaint.trim()) e.complaint = "Complaint is required to send to doctor";
    return e;
  };

  const getOrCreateConsultation = async (complaintText: string): Promise<string> => {
    if (existingConsultationId) return existingConsultationId;
    const response = await api.post<{
      data: { consultation: { _id: string } };
    }>("/v1/consultations/check-in", {
      patientId: patient._id,
      complaint: complaintText,
    });
    return response.data.consultation._id;
  };

  const recordVitals = async (consultationId: string) => {
    await api.patch(`/v1/consultations/${consultationId}/vitals`, {
      bloodPressure: form.bloodPressure,
      heartRate:     Number(form.heartRate),
      temperature:   Number(form.temperature),
      height:        Number(form.height),
      weight:        Number(form.weight),
    });
  };

  // ── Send to doctor ───────────────────────────────────────────
  const handleSendToDoctor = async () => {
    const e = validate(true);
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const consultationId = await getOrCreateConsultation(complaint);
      await recordVitals(consultationId);
      await api.patch(`/v1/consultations/${consultationId}/send-to-doctor`, {});
      setSuccessState("sent");
      setTimeout(() => onClose(), 2500);
    } catch (err: any) {
      alert(err.message ?? "Failed to send to doctor");
    } finally {
      setLoading(false);
    }
  };

  // ── Save vitals only ─────────────────────────────────────────
  const handleSaveVitals = async () => {
    const e = validate(false);
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const consultationId = await getOrCreateConsultation(complaint);
      await recordVitals(consultationId);
      setExistingConsultationId(consultationId);
      setVitalsAlreadySaved(true);
      setSuccessState("saved");
    } catch (err: any) {
      alert(err.message ?? "Failed to save vitals");
    } finally {
      setLoading(false);
    }
  };

  if (successState === "sent") {
    return (
      <Modal onClose={onClose}>
        <div className="p-12 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-24 h-24 bg-primary-500 rounded-[40%] rotate-12 flex items-center justify-center">
            <svg className="-rotate-12" width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-slate-700 font-medium text-base max-w-xs">
            Patient's vitals sent to doctor successfully!
          </p>
        </div>
      </Modal>
    );
  }

  if (successState === "saved") {
    return (
      <Modal onClose={onClose}>
        <div className="p-12 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-24 h-24 bg-green-500 rounded-[40%] rotate-12 flex items-center justify-center">
            <svg className="-rotate-12" width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-slate-700 font-medium text-base max-w-xs">
            Vitals saved. You can send to doctor later from this patient's record.
          </p>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  if (initLoading) {
    return (
      <Modal onClose={onClose}>
        <div className="p-12 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Record vitals</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
          <X size={18} className="text-slate-500" />
        </button>
      </div>
      <div className="p-6 flex flex-col gap-5">
        {vitalsAlreadySaved && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Vitals already saved — review and send to doctor when ready.
          </div>
        )}

        {/* Complaint */}
        <FormField label="Complaint / Symptoms" error={errors.complaint}>
          <textarea
            rows={3}
            placeholder="What is the patient complaining about?"
            value={complaint}
            onChange={(e) => { setComplaint(e.target.value); setErrors((p) => ({ ...p, complaint: "" })); }}
            className={cn(
              "w-full px-4 py-3 rounded-xl border text-sm text-slate-700 placeholder:text-slate-300",
              "focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors resize-none",
              errors.complaint ? "border-red-400" : "border-slate-200"
            )}
          />
        </FormField>

        <div className="border-t border-slate-100 pt-1" />

        <FormField label="Blood pressure (mm/hg)" error={errors.bloodPressure}>
          <input className={inputClass(errors.bloodPressure)} placeholder="e.g. 120/80" value={form.bloodPressure} onChange={(e) => set("bloodPressure", e.target.value)} />
        </FormField>
        <FormField label="Heart rate (bpm)" error={errors.heartRate}>
          <input className={inputClass(errors.heartRate)} placeholder="e.g. 72" type="number" value={form.heartRate} onChange={(e) => set("heartRate", e.target.value)} />
        </FormField>
        <FormField label="Temperature (°C)" error={errors.temperature}>
          <input className={inputClass(errors.temperature)} placeholder="e.g. 37.5" type="number" value={form.temperature} onChange={(e) => set("temperature", e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Height (cm)" error={errors.height}>
            <input className={inputClass(errors.height)} type="number" value={form.height} onChange={(e) => set("height", e.target.value)} />
          </FormField>
          <FormField label="Weight (kg)" error={errors.weight}>
            <input className={inputClass(errors.weight)} type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </FormField>
        </div>
        <button
          onClick={handleSendToDoctor}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <><LoadingSpinner size="sm" /> Sending...</> : "Send to doctor"}
        </button>
        <button
          onClick={handleSaveVitals}
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary-50 text-primary-500 font-semibold text-sm border border-primary-100 hover:bg-primary-100 transition-colors disabled:opacity-70"
        >
          Save vitals only
        </button>
      </div>
    </Modal>
  );
}

// ── Action Dropdown ───────────────────────────────────────────
function ActionDropdown({
  onView, onRecordVitals, onDelete, onClose, openUp,
}: {
  onView: () => void; onRecordVitals: () => void;
  onDelete: () => void; onClose: () => void; openUp?: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className={cn("absolute right-8 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 w-40", openUp ? "bottom-8" : "top-8")}>
        <button onClick={onView} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <Eye size={15} className="text-slate-400" /> View
        </button>
        <button onClick={onRecordVitals} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <Pencil size={15} className="text-slate-400" /> Record vitals
        </button>
        <button onClick={onDelete} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </>
  );
}

// ── Medical Record Slide-over ─────────────────────────────────
function MedicalRecordSlideOver({
  record, patient, onClose,
}: {
  record: Consultation; patient: Patient; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl z-50 bg-white shadow-2xl overflow-y-auto">
        <div className="p-4 md:p-8">
          <button onClick={onClose} className="flex items-center gap-2 text-primary-500 font-medium text-sm mb-6 hover:underline">
            <ArrowLeft size={16} /> Go back
          </button>
          <h2 className="text-xl font-bold text-slate-800 text-center mb-8">Medical Record</h2>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-sm text-slate-500">
                Date: <span className="text-slate-700 font-medium">
                  {new Date(record.checkInTime).toLocaleDateString()}
                </span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Doctor: <span className="text-slate-700 font-medium">
                  {record.attendedBy?.fullName ?? "Not assigned"}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">
                Age: <span className="text-slate-700 font-medium">{patient.age}yrs</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Time: <span className="text-slate-700 font-medium">
                  {new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>
          </div>

          {/* Vitals */}
          {record.vitals && (
            <div className="border border-slate-100 rounded-xl p-5 mb-4">
              <h3 className="text-sm font-bold text-slate-700 mb-3">❤️ Vitals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { label: "Blood pressure", value: record.vitals.bloodPressure },
                  { label: "Heart rate",     value: `${record.vitals.heartRate}bpm` },
                  { label: "Temperature",    value: `${record.vitals.temperature}°C` },
                  { label: "Height",         value: `${record.vitals.height}cm` },
                  { label: "Weight",         value: `${record.vitals.weight}kg` },
                ].map((v) => (
                  <div key={v.label}>
                    <p className="text-xs text-slate-400">{v.label}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-0.5">{v.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaint */}
          <div className="border border-slate-100 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Symptoms</h3>
            <p className="text-sm text-slate-600">{record.complaint || "—"}</p>
          </div>

          {/* Diagnosis */}
          <div className="border border-slate-100 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Diagnosis</h3>
            <p className="text-sm text-slate-600">{record.diagnosis || "—"}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-500">Status:</span>
              <ConsultationStatus status={record.status} />
            </div>
          </div>

          {/* Prescription */}
          <div className="border border-slate-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">💊 Prescription</h3>
            {record.prescriptions.length === 0 ? (
              <p className="text-sm text-slate-400">No prescription recorded.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {record.prescriptions.map((p) => (
                  <div key={p._id} className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="font-medium">{p.medicationName}</span>
                    <span>{p.dosage}</span>
                    <span>{p.quantity} units</span>
                    <span>{p.duration} days</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Patient Detail View ───────────────────────────────────────
function PatientDetailView({
  patient, onBack, onUpdatePatient, isDoctor,
}: {
  patient:         Patient;
  onBack:          () => void;
  onUpdatePatient: (updated: Patient) => void;
  isDoctor:        boolean;
}) {
  const navigate = useNavigate();

  const [selectedRecord, setSelectedRecord]   = useState<Consultation | null>(null);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showVitals, setShowVitals]           = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [medicalRecords, setMedicalRecords]   = useState<Consultation[]>([]);
  const [recordsLoading, setRecordsLoading]   = useState(true);
  const [recordPage, setRecordPage]           = useState(1);
  const [recordsTotalPages, setRecordsTotalPages] = useState(1);

  // Fetch real medical history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setRecordsLoading(true);
        const response = await api.get<{
          data: {
            consultations: Consultation[];
            total:         number;
            totalPages:    number;
          };
        }>(`/v1/patients/${patient._id}/history`);
        setMedicalRecords(response.data.consultations ?? []);
        setRecordsTotalPages(response.data.totalPages || 1);
      } catch (err) {
        console.error("Failed to fetch patient history");
      } finally {
        setRecordsLoading(false);
      }
    };
    fetchHistory();
  }, [patient._id]);

  const RECORDS_PER_PAGE = 9;
  const paginatedRecords = medicalRecords.slice(
    (recordPage - 1) * RECORDS_PER_PAGE,
    recordPage * RECORDS_PER_PAGE
  );

  const infoFields = [
    { label: "Full name",     value: patient.fullName    },
    { label: "Email address", value: patient.email       },
    { label: "Staff Number",  value: patient.staffNumber },
    { label: "Department",    value: patient.department  },
    { label: "Gender",        value: patient.gender      },
    { label: "Age",           value: `${patient.age}yrs` },
    { label: "Phone-number",  value: patient.phoneNumber },
    { label: "Blood group",   value: patient.bloodGroup  },
    { label: "Genotype",      value: patient.genotype    },
    { label: "Weight",        value: `${patient.weight}kg` },
    { label: "Address",       value: patient.address     },
  ];

  const handleUpdate = async (data: any) => {
    setSaving(true);
    try {
      const response = await api.patch<{
        status: boolean;
        data: { patient: Patient };
      }>(`/v1/patients/${patient._id}`, data);
      onUpdatePatient(response.data.patient);
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message ?? "Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  // Check if patient has active consultation
  const activeConsultation = medicalRecords.find(
    (r) => r.status === "in_consultation" || r.status === "waiting"
  );

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit">
        <ArrowLeft size={16} /> Back to patient list
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-500 font-bold flex items-center justify-center text-xl shrink-0">
            {patient.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          {!isDoctor && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-500 transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-5">
          {infoFields.map((field) => (
            <div key={field.label}>
              <p className="text-xs text-slate-400 mb-0.5">{field.label}</p>
              <p className="text-sm font-semibold text-slate-800">{field.value || "—"}</p>
            </div>
          ))}
        </div>

        {/* Last consultation summary — doctor view */}
        {isDoctor && medicalRecords.length > 0 && (
          <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs font-bold text-primary-500 uppercase tracking-wide mb-2">
              Last Consultation
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-medium">Date:</span>{" "}
              {new Date(medicalRecords[0].checkInTime).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-700 mt-1">
              <span className="font-medium">Diagnosis:</span>{" "}
              {medicalRecords[0].diagnosis || "Pending"}
            </p>
            <p className="text-sm text-slate-700 mt-1">
              <span className="font-medium">Status:</span>{" "}
              {medicalRecords[0].status.replace("_", " ")}
            </p>
          </div>
        )}

        {/* Start consultation button — doctor view, only if patient is in queue */}
        {isDoctor && activeConsultation && (
          <div className="mt-4">
            <button
              onClick={() => navigate("/doctor/consultation")}
              className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Start Consultation
            </button>
          </div>
        )}
      </div>

      {/* Medical Records */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5">Medical Records</h2>

        {recordsLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : medicalRecords.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No medical records found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paginatedRecords.map((record) => (
              <div key={record._id} className="border border-slate-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                <p className="text-sm text-slate-600 mb-1">
                  Date: {new Date(record.checkInTime).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  Diagnosis: {record.diagnosis || "Pending"}
                </p>
                <p className="text-sm text-slate-600 mb-1">
                  Complaint: {record.complaint}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <p className="text-sm text-slate-600">Status: </p>
                  <ConsultationStatus status={record.status} />
                </div>
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="text-sm text-primary-500 font-medium hover:underline flex items-center gap-1"
                >
                  View details →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-6">
          {!isDoctor && (
            <button
              onClick={() => setShowVitals(true)}
              className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Record vitals
            </button>
          )}
          {recordsTotalPages > 1 && (
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setRecordPage((p) => Math.max(1, p - 1))} disabled={recordPage === 1} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40">
                <ChevronLeft size={14} /> Previous
              </button>
              {Array.from({ length: recordsTotalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setRecordPage(page)} className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors", page === recordPage ? "bg-primary-500 text-white" : "text-slate-500 hover:bg-slate-100")}>
                  {page}
                </button>
              ))}
              <button onClick={() => setRecordPage((p) => Math.min(recordsTotalPages, p + 1))} disabled={recordPage === recordsTotalPages} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40">
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {!isDoctor && showVitals    && <RecordVitalsModal patient={patient} onClose={() => setShowVitals(false)} />}
      {!isDoctor && showEditModal && (
        <PatientForm
          title="Edit patient"
          initial={patient}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
          submitLabel="Update patient"
          loading={saving}
        />
      )}
      {selectedRecord && (
        <MedicalRecordSlideOver
          record={selectedRecord}
          patient={patient}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function StaffsPage() {
  const location = useLocation();
  const isDoctor = location.pathname.startsWith("/doctor");

  const [patients, setPatients]           = useState<Patient[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [sortField, setSortField]         = useState<SortField>(null);
  const [sortDir, setSortDir]             = useState<"asc" | "desc">("asc");
  const [openDropdown, setOpenDropdown]   = useState<string | null>(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [view, setView]                   = useState<View>("list");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [adding, setAdding]               = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<{
        status: boolean;
        data: {
          patients:    Patient[];
          total:       number;
          totalPages:  number;
        };
      }>(`/v1/patients?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
      setPatients(response.data.patients);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      setError(err.message ?? "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, [currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleClear = () => { setSortField(null); setSearch(""); };

  const processed = useMemo(() => {
    let result = patients.filter((p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.staffNumber.toLowerCase().includes(search.toLowerCase())
    );
    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = sortField === "department" ? a.department : a.staffNumber;
        const valB = sortField === "department" ? b.department : b.staffNumber;
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return result;
  }, [patients, search, sortField, sortDir]);

  const handleAdd = async (data: any) => {
    setAdding(true);
    try {
      const response = await api.post<{
        status: boolean;
        data: { patient: Patient };
      }>("/v1/patients", data);
      setPatients((prev) => [response.data.patient, ...prev]);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message ?? "Failed to add patient");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => p._id === updated._id ? updated : p));
    setSelectedPatient(updated);
  };

  const deleteSingle = async (id: string) => {
    try {
      await api.delete(`/v1/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p._id !== id));
      setOpenDropdown(null);
    } catch (err: any) {
      alert(err.message ?? "Failed to delete patient");
      setOpenDropdown(null);
    }
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : null;

  if (view === "detail" && selectedPatient) {
    return (
      <PatientDetailView
        patient={selectedPatient}
        onBack={() => { setView("list"); setSelectedPatient(null); }}
        onUpdatePatient={handleUpdate}
        isDoctor={isDoctor}
      />
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={fetchPatients} />;

  return (
    <div className="flex flex-col gap-5">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
          <input
            type="search"
            placeholder="Search patient name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>
        <div className="hidden sm:block h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400">
            <SlidersHorizontal size={14} />
            <span>Sort by</span>
          </div>
          <button onClick={() => handleSort("department")} className={cn("font-medium transition-colors", sortField === "department" ? "text-primary-500" : "text-slate-700 hover:text-primary-500")}>
            Department{sortIndicator("department")}
          </button>
          <button onClick={() => handleSort("staffNumber")} className={cn("font-medium transition-colors", sortField === "staffNumber" ? "text-primary-500" : "text-slate-700 hover:text-primary-500")}>
            Staff number{sortIndicator("staffNumber")}
          </button>
          <button onClick={handleClear} className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors">
            Clear <X size={13} />
          </button>
        </div>
      </div>

      {/* Action buttons — nurse only */}
      {!isDoctor && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} /> Add patient
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Patient Name</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Staff Number</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Department</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Age</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-slate-400">No patients found.</td></tr>
            ) : (
              processed.map((patient, index) => (
                <tr key={patient._id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors relative">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{patient.fullName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{patient.staffNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{patient.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{patient.age}yrs</td>
                  <td className="px-6 py-4"><StatusBadge status={patient.status} /></td>
                  <td className="px-6 py-4 relative">
                    {isDoctor ? (
                      <button
                        onClick={() => { setSelectedPatient(patient); setView("detail"); }}
                        className="text-sm font-medium text-slate-700 hover:text-primary-500 transition-colors"
                      >
                        View
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === patient._id ? null : patient._id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openDropdown === patient._id && (
                          <ActionDropdown
                            onView={() => { setSelectedPatient(patient); setView("detail"); setOpenDropdown(null); }}
                            onRecordVitals={() => { setVitalsPatient(patient); setOpenDropdown(null); }}
                            onDelete={() => deleteSingle(patient._id)}
                            onClose={() => setOpenDropdown(null)}
                            openUp={index >= processed.length - 2}
                          />
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40">
            <ChevronLeft size={14} /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors", page === currentPage ? "bg-primary-500 text-white" : "text-slate-500 hover:bg-slate-100")}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {!isDoctor && showAddModal && (
        <PatientForm
          title="Add new patient"
          initial={{}}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
          submitLabel="Register patient"
          loading={adding}
        />
      )}
      {!isDoctor && vitalsPatient && (
        <RecordVitalsModal patient={vitalsPatient} onClose={() => setVitalsPatient(null)} />
      )}
    </div>
  );
}