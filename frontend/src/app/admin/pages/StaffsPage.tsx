import { useState, useMemo } from "react";
import {
  Search, Plus, Trash2, MoreVertical,
  Pencil, X, SlidersHorizontal, ChevronLeft,
  ChevronRight, ArrowLeft, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────
interface Patient {
  id: number;
  fullName: string;
  staffNumber: string;
  department: string;
  age: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  genotype: string;
  height: string;
  weight: string;
  status: "Active" | "In-active";
}

interface MedicalRecord {
  id: number;
  patientId: number;
  date: string;
  diagnosis: string;
  dateOfVisitation: string;
  status: "Waiting" | "In Consultation" | "Completed";
}

interface Vitals {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  height: string;
  weight: string;
}

type SortField = "department" | "staffNumber" | null;
type View = "list" | "detail";

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_PATIENTS: Patient[] = [
  { id: 1, fullName: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", age: "42yrs", gender: "Female", email: "glorynwosu@sahcoplc",     phone: "08156257812", address: "Ikeja city",    bloodGroup: "O+",  genotype: "AS", height: "171cm", weight: "65.6", status: "Active"    },
  { id: 2, fullName: "Elizabeth Asojo", staffNumber: "SAH-3567", department: "Internal Control",     age: "32yrs", gender: "Female", email: "elizabeth@sahcoplc",      phone: "08123456789", address: "Lagos",         bloodGroup: "A+",  genotype: "AA", height: "165cm", weight: "60.0", status: "In-active" },
  { id: 3, fullName: "John Okafor",     staffNumber: "SAH-3568", department: "Clinic",               age: "45yrs", gender: "Male",   email: "johnokafor@sahcoplc",     phone: "08134567890", address: "Abuja",         bloodGroup: "B+",  genotype: "AA", height: "175cm", weight: "78.0", status: "Active"    },
  { id: 4, fullName: "Amaka Obi",       staffNumber: "SAH-3569", department: "Finance",              age: "29yrs", gender: "Female", email: "amakaobi@sahcoplc",       phone: "08145678901", address: "Port Harcourt", bloodGroup: "O-",  genotype: "AS", height: "160cm", weight: "55.0", status: "In-active" },
  { id: 5, fullName: "Tunde Adeyemi",   staffNumber: "SAH-3570", department: "MTCE",                 age: "38yrs", gender: "Male",   email: "tundeadeyemi@sahcoplc",   phone: "08156789012", address: "Ibadan",        bloodGroup: "AB+", genotype: "AA", height: "180cm", weight: "85.0", status: "Active"    },
  { id: 6, fullName: "Ngozi Eze",       staffNumber: "SAH-3571", department: "Business Development", age: "35yrs", gender: "Female", email: "ngozieze@sahcoplc",       phone: "08167890123", address: "Enugu",         bloodGroup: "A-",  genotype: "AS", height: "163cm", weight: "58.0", status: "Active"    },
  { id: 7, fullName: "Emeka Nwachukwu", staffNumber: "SAH-3572", department: "Internal Control",     age: "41yrs", gender: "Male",   email: "emekanwachukwu@sahcoplc", phone: "08178901234", address: "Onitsha",       bloodGroup: "O+",  genotype: "AA", height: "172cm", weight: "72.0", status: "Active"    },
];

const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  { id: 1,  patientId: 1, date: "05-03-2027", diagnosis: "Allergic Rhinitis, Malaria",  dateOfVisitation: "05-03-2027", status: "Waiting"         },
  { id: 2,  patientId: 1, date: "05-03-2027", diagnosis: "Typhoid Fever",               dateOfVisitation: "05-03-2027", status: "In Consultation" },
  { id: 3,  patientId: 1, date: "05-03-2027", diagnosis: "Malaria",                     dateOfVisitation: "05-03-2027", status: "Completed"       },
  { id: 4,  patientId: 1, date: "05-03-2027", diagnosis: "Hypertension",                dateOfVisitation: "05-03-2027", status: "Completed"       },
  { id: 5,  patientId: 1, date: "05-03-2027", diagnosis: "Diabetes checkup",            dateOfVisitation: "05-03-2027", status: "Completed"       },
  { id: 6,  patientId: 1, date: "05-03-2027", diagnosis: "Allergic Rhinitis",           dateOfVisitation: "05-03-2027", status: "Completed"       },
  { id: 7,  patientId: 1, date: "05-03-2027", diagnosis: "Malaria, Typhoid",            dateOfVisitation: "05-03-2027", status: "Completed"       },
  { id: 8,  patientId: 1, date: "05-03-2027", diagnosis: "UTI",                         dateOfVisitation: "05-03-2027", status: "Completed"       },
  { id: 9,  patientId: 1, date: "05-03-2027", diagnosis: "Anaemia",                     dateOfVisitation: "05-03-2027", status: "Completed"       },
  { id: 10, patientId: 2, date: "10-03-2027", diagnosis: "Malaria",                     dateOfVisitation: "10-03-2027", status: "Completed"       },
  { id: 11, patientId: 2, date: "10-03-2027", diagnosis: "Typhoid Fever",               dateOfVisitation: "10-03-2027", status: "Waiting"         },
  { id: 12, patientId: 3, date: "12-03-2027", diagnosis: "Hypertension",                dateOfVisitation: "12-03-2027", status: "Completed"       },
  { id: 13, patientId: 4, date: "14-03-2027", diagnosis: "Diabetes checkup",            dateOfVisitation: "14-03-2027", status: "In Consultation" },
  { id: 14, patientId: 5, date: "15-03-2027", diagnosis: "Malaria",                     dateOfVisitation: "15-03-2027", status: "Completed"       },
];

const DEPARTMENTS = ["Business Development", "Internal Control", "Clinic", "MTCE", "Finance"];
const ITEMS_PER_PAGE   = 7;
const RECORDS_PER_PAGE = 9;

// ── Helpers ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: "Active" | "In-active" }) {
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-medium",
      status === "Active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"
    )}>
      {status}
    </span>
  );
}

function RecordStatus({ status }: { status: MedicalRecord["status"] }) {
  const styles = {
    "Waiting":         "text-primary-500",
    "In Consultation": "text-blue-500",
    "Completed":       "text-green-600",
  };
  return <span className={cn("text-sm font-medium", styles[status])}>{status}</span>;
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

function DashedLines({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2 mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-t border-dashed border-slate-200 w-full" />
      ))}
    </div>
  );
}

// ── Patient Form (Admin only) ─────────────────────────────────
function PatientForm({
  title, initial, onClose, onSubmit, submitLabel,
}: {
  title: string;
  initial: Partial<Patient>;
  onClose: () => void;
  onSubmit: (data: Omit<Patient, "id" | "status">) => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState({
    fullName: initial.fullName ?? "", age: initial.age ?? "",
    gender: initial.gender ?? "", staffNumber: initial.staffNumber ?? "",
    department: initial.department ?? "", phone: initial.phone ?? "",
    email: initial.email ?? "", address: initial.address ?? "",
    bloodGroup: initial.bloodGroup ?? "", genotype: initial.genotype ?? "",
    height: initial.height ?? "", weight: initial.weight ?? "",
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
    if (!form.phone.trim())       e.phone       = "Phone number is required";
    if (!form.email.trim())       e.email       = "Email is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSubmit(form);
    onClose();
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
            <input className={inputClass(errors.age)} placeholder="42yrs" value={form.age} onChange={(e) => set("age", e.target.value)} />
          </FormField>
          <FormField label="Gender" error={errors.gender}>
            <select className={inputClass(errors.gender)} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
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
        <FormField label="Phone-number" error={errors.phone}>
          <input className={inputClass(errors.phone)} placeholder="+234 80 8000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
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
          <FormField label="Height" error={undefined}>
            <input className={inputClass()} placeholder="171cm" value={form.height} onChange={(e) => set("height", e.target.value)} />
          </FormField>
          <FormField label="Weight" error={undefined}>
            <input className={inputClass()} placeholder="65.6" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </FormField>
        </div>
        <button onClick={handleSubmit} className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2">
          {submitLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── Record Vitals Modal (Admin only) ──────────────────────────
function RecordVitalsModal({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  const [form, setForm] = useState<Vitals>({
    bloodPressure: "120/78", heartRate: "78",
    temperature: "35.5", height: patient.height, weight: patient.weight,
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.bloodPressure.trim()) e.bloodPressure = "Required";
    if (!form.heartRate.trim())     e.heartRate     = "Required";
    if (!form.temperature.trim())   e.temperature   = "Required";
    if (!form.height.trim())        e.height        = "Required";
    if (!form.weight.trim())        e.weight        = "Required";
    return e;
  };

  const handleSendToDoctor = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSuccess(true);
    setTimeout(() => onClose(), 2500);
  };

  if (success) {
    return (
      <Modal onClose={onClose}>
        <div className="p-12 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-24 h-24 bg-primary-500 rounded-[40%] rotate-12 flex items-center justify-center">
            <svg className="-rotate-12" width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-slate-700 font-medium text-base max-w-xs">
            You have successfully sent the patient's vitals!
          </p>
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
        <FormField label="Blood pressure (mm/hg)" error={errors.bloodPressure}>
          <input className={inputClass(errors.bloodPressure)} value={form.bloodPressure} onChange={(e) => set("bloodPressure", e.target.value)} />
        </FormField>
        <FormField label="Heart rate (bpm)" error={errors.heartRate}>
          <input className={inputClass(errors.heartRate)} value={form.heartRate} onChange={(e) => set("heartRate", e.target.value)} />
        </FormField>
        <FormField label="Temperature (F)" error={errors.temperature}>
          <input className={inputClass(errors.temperature)} value={form.temperature} onChange={(e) => set("temperature", e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Height" error={errors.height}>
            <input className={inputClass(errors.height)} value={form.height} onChange={(e) => set("height", e.target.value)} />
          </FormField>
          <FormField label="Weight" error={errors.weight}>
            <input className={inputClass(errors.weight)} value={form.weight} onChange={(e) => set("weight", e.target.value)} />
          </FormField>
        </div>
        <button onClick={handleSendToDoctor} className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2">
          Send to doctor
        </button>
        <button onClick={onClose} className="w-full h-12 rounded-xl bg-primary-50 text-primary-500 font-semibold text-sm border border-primary-100 hover:bg-primary-100 transition-colors">
          Save vitals
        </button>
      </div>
    </Modal>
  );
}

// ── Action Dropdown (Admin only) ──────────────────────────────
function ActionDropdown({
  onView, onRecordVitals, onDelete, onClose,
}: {
  onView: () => void;
  onRecordVitals: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-8 z-20 bg-white rounded-xl shadow-card-lg border border-slate-100 py-1 w-40">
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
  record: MedicalRecord;
  patient: Patient;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl z-50 bg-white shadow-2xl overflow-y-auto">
        <div className="p-8">
          <button onClick={onClose} className="flex items-center gap-2 text-primary-500 font-medium text-sm mb-6 hover:underline">
            <ArrowLeft size={16} /> Go back
          </button>
          <h2 className="text-xl font-bold text-slate-800 text-center mb-8">Medical Record</h2>
          <div className="flex justify-between mb-8">
            <div>
              <p className="text-sm text-slate-500">Date: <span className="text-slate-700 font-medium">{record.date}</span></p>
              <p className="text-sm text-slate-500 mt-1">Doctor: <span className="text-slate-700 font-medium">Olatunji Bolanle</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Age: <span className="text-slate-700 font-medium">{patient.age}</span></p>
              <p className="text-sm text-slate-500 mt-1">Time: <span className="text-slate-700 font-medium">12:56pm</span></p>
            </div>
          </div>
          <div className="border border-slate-100 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">❤️ Vitals</h3>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: "Blood pressure", value: "121/78mmhg" },
                { label: "Heart rate",     value: "56bpm"       },
                { label: "Temperature",    value: "32.5 C"      },
                { label: "Height",         value: patient.height },
                { label: "Weight",         value: `${patient.weight}kg` },
              ].map((v) => (
                <div key={v.label}>
                  <p className="text-xs text-slate-400">{v.label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{v.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-slate-100 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Diagnosis</h3>
            <p className="text-sm text-slate-600">{record.diagnosis}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-500">Status:</span>
              <RecordStatus status={record.status} />
            </div>
            <DashedLines count={5} />
          </div>
          <div className="border border-slate-100 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-1">🧠 Symptoms</h3>
            <DashedLines count={5} />
          </div>
          <div className="border border-slate-100 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-bold text-slate-700 mb-1">💊 Prescription</h3>
            <DashedLines count={7} />
          </div>
          <div className="border border-slate-100 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-1">🩺 Doctor Notes</h3>
            <DashedLines count={7} />
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
  patient: Patient;
  onBack: () => void;
  onUpdatePatient: (updated: Patient) => void;
  isDoctor: boolean;
}) {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showVitals, setShowVitals]         = useState(false);
  const [recordPage, setRecordPage]         = useState(1);

  const patientRecords   = MOCK_MEDICAL_RECORDS.filter((r) => r.patientId === patient.id);
  const totalRecordPages = Math.max(1, Math.ceil(patientRecords.length / RECORDS_PER_PAGE));
  const paginatedRecords = patientRecords.slice(
    (recordPage - 1) * RECORDS_PER_PAGE,
    recordPage * RECORDS_PER_PAGE
  );

  // Doctor sees more clinical fields, admin sees management fields
  const infoFields = isDoctor ? [
    { label: "Full name",     value: patient.fullName    },
    { label: "Email address", value: patient.email       },
    { label: "Staff Number",  value: patient.staffNumber },
    { label: "Department",    value: patient.department  },
    { label: "Gender",        value: patient.gender      },
    { label: "Age",           value: patient.age         },
    { label: "Phone-number",  value: patient.phone       },
    { label: "Blood group",   value: patient.bloodGroup  },
    { label: "Genotype",      value: patient.genotype    },
    { label: "Weight",        value: patient.weight      },
    { label: "Address",       value: patient.address     },
  ] : [
    { label: "Full name",     value: patient.fullName    },
    { label: "Email address", value: patient.email       },
    { label: "Staff Number",  value: patient.staffNumber },
    { label: "Department",    value: patient.department  },
    { label: "Gender",        value: patient.gender      },
    { label: "Age",           value: patient.age         },
    { label: "Phone-number",  value: patient.phone       },
    { label: "Blood group",   value: patient.bloodGroup  },
    { label: "Genotype",      value: patient.genotype    },
    { label: "Weight",        value: patient.weight      },
    { label: "Address",       value: patient.address     },
  ];

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
          {/* Admin can edit, doctor cannot */}
          {!isDoctor && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-500 transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5">
          {infoFields.map((field) => (
            <div key={field.label}>
              <p className="text-xs text-slate-400 mb-0.5">{field.label}</p>
              <p className="text-sm font-semibold text-slate-800">{field.value || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Records */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5">Medical Records</h2>
        {paginatedRecords.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No medical records found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paginatedRecords.map((record) => (
              <div key={record.id} className="border border-slate-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                <p className="text-sm text-slate-600 mb-1">Date: {record.date}</p>
                <p className="text-sm text-slate-600 mb-1">Diagnosis: {record.diagnosis}</p>
                <p className="text-sm text-slate-600 mb-1">Date of visitation: {record.dateOfVisitation}</p>
                <div className="flex items-center gap-1 mb-2">
                  <p className="text-sm text-slate-600">Status: </p>
                  <RecordStatus status={record.status} />
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

        {/* Bottom bar — admin shows Record vitals, doctor shows nothing */}
        <div className="flex items-center justify-between mt-6">
          {!isDoctor && (
            <button
              onClick={() => setShowVitals(true)}
              className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Record vitals
            </button>
          )}
          {totalRecordPages > 1 && (
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => setRecordPage((p) => Math.max(1, p - 1))} disabled={recordPage === 1} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40">
                <ChevronLeft size={14} /> Previous
              </button>
              {Array.from({ length: totalRecordPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setRecordPage(page)} className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors", page === recordPage ? "bg-primary-500 text-white" : "text-slate-500 hover:bg-slate-100")}>
                  {page}
                </button>
              ))}
              <button onClick={() => setRecordPage((p) => Math.min(totalRecordPages, p + 1))} disabled={recordPage === totalRecordPages} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 disabled:opacity-40">
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals — admin only */}
      {!isDoctor && showVitals    && <RecordVitalsModal patient={patient} onClose={() => setShowVitals(false)} />}
      {!isDoctor && showEditModal && (
        <PatientForm
          title="Edit patient"
          initial={patient}
          onClose={() => setShowEditModal(false)}
          onSubmit={(data) => { onUpdatePatient({ ...patient, ...data }); setShowEditModal(false); }}
          submitLabel="Update patient"
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

  const [patients, setPatients]           = useState<Patient[]>(INITIAL_PATIENTS);
  const [search, setSearch]               = useState("");
  const [sortField, setSortField]         = useState<SortField>(null);
  const [sortDir, setSortDir]             = useState<"asc" | "desc">("asc");
  const [openDropdown, setOpenDropdown]   = useState<number | null>(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [vitalsPatient, setVitalsPatient] = useState<Patient | null>(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [view, setView]                   = useState<View>("list");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selected, setSelected]           = useState<number[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const handleClear = () => { setSortField(null); setSearch(""); setCurrentPage(1); };

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

  const totalPages = Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE));
  const paginated  = processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAdd    = (p: Omit<Patient, "id" | "status">) => setPatients((prev) => [{ ...p, id: Date.now(), status: "Active" }, ...prev]);
  const handleUpdate = (updated: Patient) => { setPatients((prev) => prev.map((p) => p.id === updated.id ? updated : p)); setSelectedPatient(updated); };
  const deleteSingle = (id: number) => { setPatients((prev) => prev.filter((p) => p.id !== id)); setOpenDropdown(null); };
  const deleteSelected = () => { setPatients((prev) => prev.filter((p) => !selected.includes(p.id))); setSelected([]); };

  const sortIndicator = (field: SortField) => sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : null;

  // ── Detail view ───────────────────────────────────────────────
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

  // ── List view ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
          <input
            type="search"
            placeholder="Search patient name"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-3 text-sm">
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

      {/* Action buttons — admin only */}
      {!isDoctor && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            <Plus size={16} /> Add patient
          </button>
          <button
            onClick={deleteSelected}
            disabled={selected.length === 0}
            className={cn(
              "flex items-center gap-2 h-10 px-5 rounded-lg border text-sm font-medium transition-colors",
              selected.length > 0 ? "border-red-200 text-red-500 hover:bg-red-50" : "border-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <Trash2 size={15} />
            Delete {selected.length > 0 && `(${selected.length})`}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
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
            {paginated.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-slate-400">No patients found.</td></tr>
            ) : (
              paginated.map((patient) => (
                <tr key={patient.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors relative">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{patient.fullName}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{patient.staffNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{patient.department}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{patient.age}</td>
                  <td className="px-6 py-4"><StatusBadge status={patient.status} /></td>
                  <td className="px-6 py-4 relative">
                    {/* Doctor sees plain View link, admin sees ⋮ dropdown */}
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
                          onClick={() => setOpenDropdown(openDropdown === patient.id ? null : patient.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openDropdown === patient.id && (
                          <ActionDropdown
                            onView={() => { setSelectedPatient(patient); setView("detail"); setOpenDropdown(null); }}
                            onRecordVitals={() => { setVitalsPatient(patient); setOpenDropdown(null); }}
                            onDelete={() => deleteSingle(patient.id)}
                            onClose={() => setOpenDropdown(null)}
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

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40">
            <ChevronLeft size={14} /> Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors", page === currentPage ? "bg-primary-500 text-white" : "text-slate-500 hover:bg-slate-100")}>
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Admin only modals */}
      {!isDoctor && showAddModal  && <PatientForm title="Add new patient" initial={{}} onClose={() => setShowAddModal(false)} onSubmit={handleAdd} submitLabel="Register patient" />}
      {!isDoctor && vitalsPatient && <RecordVitalsModal patient={vitalsPatient} onClose={() => setVitalsPatient(null)} />}
    </div>
  );
}