import { useState } from "react";
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ConsultationEntry {
  id: number;
  name: string;
  staffNumber: string;
  department: string;
  age: string;
  height: string;
  weight: string;
  status: "In consultation" | "Waiting" | "Completed";
}

interface PrescriptionItem {
  id: number;
  medication: string;
  quantity: string;
  duration: string;
}

interface MedicalRecord {
  symptoms:     string;
  diagnosis:    string;
  prescription: PrescriptionItem[];
  doctorNotes:  string;
  completed:    boolean;
}

type View = "list" | "edit" | "view";

// ── Mock Medications (will come from backend later) ────────────
const AVAILABLE_MEDICATIONS = [
  { name: "Cefuroxime",      stock: 1500 },
  { name: "Arthrocare",      stock: 1500 },
  { name: "Ampiclox",        stock: 1500 },
  { name: "Amatem softgel",  stock: 1500 },
  { name: "Diclofenac",      stock: 1500 },
  { name: "Omeprazole",      stock: 1500 },
  { name: "Erythromycin",    stock: 1500 },
  { name: "Loratidine",      stock: 1500 },
  { name: "Paracetamol",     stock: 1500 },
  { name: "Amoxicillin",     stock: 1500 },
];

// ── Mock Consultation Data ────────────────────────────────────
const INITIAL_CONSULTATIONS: ConsultationEntry[] = [
  { id: 1, name: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", age: "42yrs", height: "171cm", weight: "65.6kg", status: "In consultation" },
  { id: 2, name: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", age: "42yrs", height: "171cm", weight: "65.6kg", status: "Waiting"         },
  { id: 3, name: "Elizabeth Asojo", staffNumber: "SAH-3567", department: "Business Development", age: "32yrs", height: "165cm", weight: "60.0kg", status: "Waiting"         },
  { id: 4, name: "John Okafor",     staffNumber: "SAH-3568", department: "Business Development", age: "45yrs", height: "175cm", weight: "78.0kg", status: "Waiting"         },
  { id: 5, name: "Amaka Obi",       staffNumber: "SAH-3569", department: "Business Development", age: "29yrs", height: "160cm", weight: "55.0kg", status: "Waiting"         },
  { id: 6, name: "Tunde Adeyemi",   staffNumber: "SAH-3570", department: "Business Development", age: "38yrs", height: "180cm", weight: "85.0kg", status: "Waiting"         },
  { id: 7, name: "Glory Nwosu",     staffNumber: "SAH-0001", department: "Business Development", age: "42yrs", height: "171cm", weight: "65.6kg", status: "Completed"       },
];

const ITEMS_PER_PAGE = 7;

// ── Helpers ───────────────────────────────────────────────────
function StaffAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center text-xs shrink-0">
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: ConsultationEntry["status"] }) {
  const styles = {
    "In consultation": "bg-blue-50 text-blue-500",
    "Waiting":         "bg-primary-50 text-primary-500",
    "Completed":       "bg-green-50 text-green-600",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap", styles[status])}>
      {status}
    </span>
  );
}

// ── Success State ─────────────────────────────────────────────
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

// ── Medical Record View (read-only for completed) ─────────────
function MedicalRecordView({
  entry,
  record,
  onBack,
}: {
  entry: ConsultationEntry;
  record: MedicalRecord;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit">
        <ArrowLeft size={16} /> Go back
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">Medical Record</h2>

        {/* Meta */}
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-500">Date: <span className="font-medium text-slate-700">05-03-2026</span></p>
            <p className="text-sm text-slate-500 mt-1">Doctor: <span className="font-medium text-slate-700">Olatunji Bolanle</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Age: <span className="font-medium text-slate-700">{entry.age}</span></p>
            <p className="text-sm text-slate-500 mt-1">Time: <span className="font-medium text-slate-700">12:56pm</span></p>
          </div>
        </div>

        {/* Vitals */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-4">❤️ Vitals</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Blood pressure", value: "121/78mmhg" },
              { label: "Heart rate",     value: "56bpm"       },
              { label: "Temperature",    value: "32.5 C"      },
              { label: "Height",         value: entry.height  },
              { label: "Weight",         value: entry.weight  },
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
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Symptoms</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {record.symptoms || "—"}
          </p>
        </div>

        {/* Diagnosis */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Diagnosis</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {record.diagnosis || "—"}
          </p>
        </div>

        {/* Prescription */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">💊 Prescription</h3>
          {record.prescription.length === 0 ? (
            <p className="text-sm text-slate-400">No prescription recorded.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {record.prescription.map((item) => (
                <p key={item.id} className="text-sm text-slate-600">
                  {item.duration} {item.medication} {item.quantity}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Notes */}
        <div className="border border-slate-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3">📋 Doctor Notes</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {record.doctorNotes || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Medical Record Edit (doctor fills in) ─────────────────────
function MedicalRecordEdit({
  entry,
  onBack,
  onComplete,
}: {
  entry: ConsultationEntry;
  onBack: () => void;
  onComplete: (record: MedicalRecord, medications: typeof AVAILABLE_MEDICATIONS) => void;
}) {
  const [symptoms,    setSymptoms]    = useState("");
  const [diagnosis,   setDiagnosis]   = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);
  const [medications, setMedications]   = useState(AVAILABLE_MEDICATIONS);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  // Add a new prescription line
  const addPrescriptionLine = () => {
    setPrescription((p) => [
      ...p,
      { id: Date.now(), medication: "", quantity: "", duration: "" },
    ]);
  };

  // Update a prescription line
  const updatePrescriptionLine = (id: number, field: keyof PrescriptionItem, value: string) => {
    setPrescription((p) =>
      p.map((item) => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  // Remove a prescription line
  const removePrescriptionLine = (id: number) => {
    setPrescription((p) => p.filter((item) => item.id !== id));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!symptoms.trim())    e.symptoms    = "Symptoms are required";
    if (!diagnosis.trim())   e.diagnosis   = "Diagnosis is required";
    if (!doctorNotes.trim()) e.doctorNotes = "Doctor notes are required";

    // Validate prescription lines
    prescription.forEach((item) => {
      if (!item.medication) e[`med_${item.id}`]      = "Select a medication";
      if (!item.quantity)   e[`qty_${item.id}`]      = "Enter quantity";
      if (!item.duration)   e[`duration_${item.id}`] = "Enter duration";
    });

    return e;
  };

  const handleComplete = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    // ── Reduce medication stock ───────────────────────────────
    // For each prescribed medication, reduce its stock
    const updatedMedications = medications.map((med) => {
      const prescribed = prescription.find(
        (p) => p.medication === med.name
      );
      if (prescribed) {
        // Extract number from quantity string e.g. "5 tablets" → 5
        const qty = parseInt(prescribed.quantity) || 0;
        return { ...med, stock: Math.max(0, med.stock - qty) };
      }
      return med;
    });

    setMedications(updatedMedications);
    setShowSuccess(true);
  };

  const textareaClass = (field: string) => cn(
    "w-full px-4 py-3 rounded-xl border text-sm text-slate-700",
    "placeholder:text-slate-300 focus:outline-none focus:ring-2",
    "focus:ring-primary-400 transition-colors resize-none",
    errors[field] ? "border-red-400" : "border-slate-200"
  );

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-primary-500 font-medium text-sm hover:underline w-fit">
        <ArrowLeft size={16} /> Go back
      </button>

      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 text-center mb-8">Medical Record</h2>

        {/* Meta */}
        <div className="flex justify-between mb-6 pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm text-slate-500">Date: <span className="font-medium text-slate-700">05-03-2026</span></p>
            <p className="text-sm text-slate-500 mt-1">Doctor: <span className="font-medium text-slate-700">Olatunji Bolanle</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Age: <span className="font-medium text-slate-700">{entry.age}</span></p>
            <p className="text-sm text-slate-500 mt-1">Time: <span className="font-medium text-slate-700">12:56pm</span></p>
          </div>
        </div>

        {/* Vitals — pre-filled, read only */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-4">❤️ Vitals</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Blood pressure", value: "121/78mmhg" },
              { label: "Heart rate",     value: "56bpm"       },
              { label: "Temperature",    value: "32.5 C"      },
              { label: "Height",         value: entry.height  },
              { label: "Weight",         value: entry.weight  },
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
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Symptoms</h3>
          <textarea
            rows={5}
            placeholder="Describe the patient's symptoms..."
            value={symptoms}
            onChange={(e) => { setSymptoms(e.target.value); setErrors((p) => ({ ...p, symptoms: "" })); }}
            className={textareaClass("symptoms")}
          />
          {errors.symptoms && <p className="text-xs text-red-500 mt-1">{errors.symptoms}</p>}
        </div>

        {/* Diagnosis */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">🧠 Diagnosis</h3>
          <textarea
            rows={5}
            placeholder="Enter diagnosis..."
            value={diagnosis}
            onChange={(e) => { setDiagnosis(e.target.value); setErrors((p) => ({ ...p, diagnosis: "" })); }}
            className={textareaClass("diagnosis")}
          />
          {errors.diagnosis && <p className="text-xs text-red-500 mt-1">{errors.diagnosis}</p>}
        </div>

        {/* Prescription */}
        <div className="border border-slate-100 rounded-xl p-5 mb-4">
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
              Click "Add medication" to prescribe medications
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {prescription.map((item) => (
                <div key={item.id} className="flex items-start gap-3">

                  {/* Medication dropdown */}
                  <div className="flex flex-col gap-1 flex-1">
                    <select
                      value={item.medication}
                      onChange={(e) => updatePrescriptionLine(item.id, "medication", e.target.value)}
                      className={cn(
                        "h-11 px-3 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white",
                        errors[`med_${item.id}`] ? "border-red-400" : "border-slate-200"
                      )}
                    >
                      <option value="">Select medication</option>
                      {medications.map((med) => (
                        <option key={med.name} value={med.name}>
                          {med.name} (stock: {med.stock})
                        </option>
                      ))}
                    </select>
                    {errors[`med_${item.id}`] && (
                      <p className="text-xs text-red-500">{errors[`med_${item.id}`]}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex flex-col gap-1 w-32">
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updatePrescriptionLine(item.id, "quantity", e.target.value)}
                      className={cn(
                        "h-11 px-3 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400",
                        errors[`qty_${item.id}`] ? "border-red-400" : "border-slate-200"
                      )}
                    />
                    {errors[`qty_${item.id}`] && (
                      <p className="text-xs text-red-500">{errors[`qty_${item.id}`]}</p>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-1 w-36">
                    <input
                      placeholder="e.g. 5/7 tabs"
                      value={item.duration}
                      onChange={(e) => updatePrescriptionLine(item.id, "duration", e.target.value)}
                      className={cn(
                        "h-11 px-3 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400",
                        errors[`duration_${item.id}`] ? "border-red-400" : "border-slate-200"
                      )}
                    />
                    {errors[`duration_${item.id}`] && (
                      <p className="text-xs text-red-500">{errors[`duration_${item.id}`]}</p>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removePrescriptionLine(item.id)}
                    className="mt-2 p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Notes */}
        <div className="border border-slate-100 rounded-xl p-5 mb-8">
          <h3 className="text-sm font-bold text-slate-700 mb-3">📋 Doctor Notes</h3>
          <textarea
            rows={5}
            placeholder="Additional notes..."
            value={doctorNotes}
            onChange={(e) => { setDoctorNotes(e.target.value); setErrors((p) => ({ ...p, doctorNotes: "" })); }}
            className={textareaClass("doctorNotes")}
          />
          {errors.doctorNotes && <p className="text-xs text-red-500 mt-1">{errors.doctorNotes}</p>}
        </div>

        {/* Complete button */}
        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            className="h-12 px-16 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
          >
            Complete consultation
          </button>
        </div>
      </div>

      {/* Success state */}
      {showSuccess && (
        <SuccessState
          onClose={() => onComplete(
            { symptoms, diagnosis, prescription, doctorNotes, completed: true },
            medications
          )}
        />
      )}
    </div>
  );
}

// ── Main Doctor Consultation Page ─────────────────────────────
export default function DoctorConsultationPage() {
  const [consultations, setConsultations] = useState<ConsultationEntry[]>(INITIAL_CONSULTATIONS);
  const [view, setView]                   = useState<View>("list");
  const [selected, setSelected]           = useState<ConsultationEntry | null>(null);
  const [records, setRecords]             = useState<Record<number, MedicalRecord>>({});
  const [currentPage, setCurrentPage]     = useState(1);

  const totalPages = Math.max(1, Math.ceil(consultations.length / ITEMS_PER_PAGE));
  const paginated  = consultations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Complete consultation → save record + update status
  const handleComplete = (
    entry: ConsultationEntry,
    record: MedicalRecord,
  ) => {
    // Save the medical record
    setRecords((p) => ({ ...p, [entry.id]: record }));

    // Update consultation status to Completed
    setConsultations((p) =>
      p.map((c) => c.id === entry.id ? { ...c, status: "Completed" } : c)
    );

    // Go back to list
    setView("list");
    setSelected(null);
  };

  // ── Detail views ─────────────────────────────────────────────
  if (view === "edit" && selected) {
    return (
      <MedicalRecordEdit
        entry={selected}
        onBack={() => { setView("list"); setSelected(null); }}
        onComplete={(record, _meds) => handleComplete(selected, record)}
      />
    );
  }

  if (view === "view" && selected) {
    const record = records[selected.id] ?? {
      symptoms: "", diagnosis: "", prescription: [], doctorNotes: "", completed: true,
    };
    return (
      <MedicalRecordView
        entry={selected}
        record={record}
        onBack={() => { setView("list"); setSelected(null); }}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Staff Name</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Staff Number</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Department</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <StaffAvatar name={entry.name} />
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{entry.staffNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{entry.department}</td>
                <td className="px-6 py-4"><StatusBadge status={entry.status} /></td>
                <td className="px-6 py-4">
                  {entry.status === "Completed" ? (
                    <button
                      onClick={() => { setSelected(entry); setView("view"); }}
                      className="text-sm font-medium text-slate-700 hover:text-primary-500 transition-colors"
                    >
                      View
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSelected(entry); setView("edit"); }}
                      className="h-8 px-5 rounded-lg bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                    >
                      Start
                    </button>
                  )}
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
    </div>
  );
}