import { useState, useMemo } from "react";
import {
  Search,
  Trash2,
  Plus,
  MoreVertical,
  Pencil,
  X,
  CalendarIcon,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface Medication {
  id: number;
  name: string;
  category: string;
  quantity: string;
  status: "Normal" | "Low";
  expiryDate: string;
}

type SortField = "name" | "category" | null;
type SortDir   = "asc" | "desc";

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_MEDICATIONS: Medication[] = [
  { id: 1, name: "Cefuroxime",     category: "Antibiotic",   quantity: "1500 pieces", status: "Normal", expiryDate: "05-08-2029" },
  { id: 2, name: "Arthrocare",     category: "Analgesic",    quantity: "1500 pieces", status: "Low",    expiryDate: "05-08-2029" },
  { id: 3, name: "Ampiclox",       category: "Antibiotic",   quantity: "1500 pieces", status: "Normal", expiryDate: "05-08-2029" },
  { id: 4, name: "Amatem softgel", category: "Anti-malaria", quantity: "1500 pieces", status: "Low",    expiryDate: "05-08-2029" },
  { id: 5, name: "Diclofenac",     category: "Analgesic",    quantity: "1500 pieces", status: "Normal", expiryDate: "05-08-2029" },
  { id: 6, name: "Omeprazole",     category: "PUD",          quantity: "1500 pieces", status: "Low",    expiryDate: "05-08-2029" },
  { id: 7, name: "Erythromycin",   category: "URTI",         quantity: "1500 pieces", status: "Low",    expiryDate: "05-08-2029" },
];

const CATEGORIES = ["Antibiotic", "Analgesic", "Anti-malaria", "PUD", "URTI"];
const ITEMS_PER_PAGE = 7;

// ── Medication Icon ───────────────────────────────────────────
function MedIcon() {
  return (
    <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="#FF7221" strokeWidth="2" />
        <line x1="9"  y1="12" x2="15" y2="12" stroke="#FF7221" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="9"  x2="12" y2="15" stroke="#FF7221" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: "Normal" | "Low" }) {
  return status === "Normal" ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
      ↑ Normal
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">
      ↓ Low
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────
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

// ── Form Field ────────────────────────────────────────────────
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Add Medication Modal ──────────────────────────────────────
function AddMedicationModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (med: Omit<Medication, "id">) => void;
}) {
  const [form, setForm] = useState({
    name: "", quantity: "", expiryDate: "", category: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputClass = (field: string) => cn(
    "w-full h-12 px-4 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors",
    errors[field] ? "border-red-400" : "border-slate-200"
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())       e.name       = "Medication name is required";
    if (!form.quantity.trim())   e.quantity   = "Quantity is required";
    if (!form.expiryDate.trim()) e.expiryDate = "Expiry date is required";
    if (!form.category.trim())   e.category   = "Category is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAdd({
      name:       form.name,
      category:   form.category,
      quantity:   form.quantity,
      expiryDate: form.expiryDate,
      status:     "Normal",
    });
    onClose();
  };

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Add new medication</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={18} className="text-slate-500" />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-5">
        <FormField label="Medication name" error={errors.name}>
          <input
            className={inputClass("name")}
            placeholder="e.g. Cefuroxime"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </FormField>

        <FormField label="Quantity" error={errors.quantity}>
          <input
            className={inputClass("quantity")}
            placeholder="e.g. 300 pieces"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
          />
        </FormField>

        <FormField label="Expiry date" error={errors.expiryDate}>
          <div className="relative">
            <input
              className={inputClass("expiryDate")}
              placeholder="e.g. 05-08-2029"
              value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
            />
            <CalendarIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </FormField>

        <FormField label="Category" error={errors.category}>
          <select
            className={inputClass("category")}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2"
        >
          Add medication
        </button>
      </div>
    </Modal>
  );
}

// ── Edit Medication Modal ─────────────────────────────────────
function EditMedicationModal({
  medication,
  onClose,
  onUpdate,
}: {
  medication: Medication;
  onClose: () => void;
  onUpdate: (updated: Medication) => void;
}) {
  const [form, setForm] = useState({
    newQuantity: "",
    expiryDate:  medication.expiryDate,
    category:    medication.category,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputClass = (field: string) => cn(
    "w-full h-12 px-4 rounded-xl border text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors",
    errors[field] ? "border-red-400" : "border-slate-200"
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.newQuantity.trim()) e.newQuantity = "New quantity is required";
    if (!form.expiryDate.trim())  e.expiryDate  = "Expiry date is required";
    if (!form.category.trim())    e.category    = "Category is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onUpdate({
      ...medication,
      quantity:   form.newQuantity,
      expiryDate: form.expiryDate,
      category:   form.category,
    });
    onClose();
  };

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Edit medication</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <X size={18} className="text-slate-500" />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Medication</p>
          <p className="text-sm text-slate-500 px-1">{medication.name}</p>
        </div>

        <FormField label="Current quantity" error={undefined}>
          <input
            className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
            value={medication.quantity}
            disabled
          />
        </FormField>

        <FormField label="New quantity" error={errors.newQuantity}>
          <input
            className={inputClass("newQuantity")}
            placeholder="e.g. 300 pieces"
            value={form.newQuantity}
            onChange={(e) => set("newQuantity", e.target.value)}
          />
        </FormField>

        <FormField label="Expiry date" error={errors.expiryDate}>
          <div className="relative">
            <input
              className={inputClass("expiryDate")}
              value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
            />
            <CalendarIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </FormField>

        <FormField label="Category" error={errors.category}>
          <select
            className={inputClass("category")}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>

        <button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2"
        >
          Update medication
        </button>
      </div>
    </Modal>
  );
}

// ── Action Dropdown ───────────────────────────────────────────
function ActionDropdown({
  onEdit,
  onDelete,
  onClose,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-8 z-20 bg-white rounded-xl shadow-card-lg border border-slate-100 py-1 w-36">
        <button
          onClick={onEdit}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Pencil size={15} className="text-slate-400" /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MedicationsPage() {
  const [medications, setMedications]   = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [selected, setSelected]         = useState<number[]>([]);
  const [search, setSearch]             = useState("");
  const [sortField, setSortField]       = useState<SortField>(null);
  const [sortDir, setSortDir]           = useState<SortDir>("asc");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editingMed, setEditingMed]     = useState<Medication | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage]  = useState(1);

  // ── Sort handler ─────────────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  // ── Clear sort ───────────────────────────────────────────────
  const handleClear = () => {
    setSortField(null);
    setSortDir("asc");
    setSearch("");
    setCurrentPage(1);
  };

  // ── Filtered + sorted data ───────────────────────────────────
  const processed = useMemo(() => {
    let result = medications.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    );
    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = sortField === "name" ? a.name : a.category;
        const valB = sortField === "name" ? b.name : b.category;
        return sortDir === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }
    return result;
  }, [medications, search, sortField, sortDir]);

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE));
  const paginated  = processed.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Select all (current page) ────────────────────────────────
  const pageIds       = paginated.map((m) => m.id);
  const allSelected   = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const someSelected  = pageIds.some((id) => selected.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ── Add medication ───────────────────────────────────────────
  const handleAdd = (med: Omit<Medication, "id">) => {
    const newMed: Medication = {
      ...med,
      id: Date.now(),
    };
    setMedications((prev) => [newMed, ...prev]);
  };

  // ── Update medication ────────────────────────────────────────
  const handleUpdate = (updated: Medication) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m))
    );
  };

  // ── Delete selected ──────────────────────────────────────────
  const deleteSelected = () => {
    setMedications((prev) => prev.filter((m) => !selected.includes(m.id)));
    setSelected([]);
  };

  // ── Delete single ────────────────────────────────────────────
  const deleteSingle = (id: number) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setSelected((prev) => prev.filter((i) => i !== id));
    setOpenDropdown(null);
  };

  // ── Sort indicator ───────────────────────────────────────────
  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" />
          <input
            type="search"
            placeholder="Search medications"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full h-10 pl-10 pr-4 rounded-full border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-1.5 text-slate-400">
            <SlidersHorizontal size={14} />
            <span>Sort by</span>
          </div>
          <button
            onClick={() => handleSort("name")}
            className={cn(
              "font-medium transition-colors",
              sortField === "name" ? "text-primary-500" : "text-slate-700 hover:text-primary-500"
            )}
          >
            Medication name{sortIndicator("name")}
          </button>
          <button
            onClick={() => handleSort("category")}
            className={cn(
              "font-medium transition-colors",
              sortField === "category" ? "text-primary-500" : "text-slate-700 hover:text-primary-500"
            )}
          >
            Category{sortIndicator("category")}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Action buttons ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} /> Add medication
        </button>
        <button
          onClick={deleteSelected}
          disabled={selected.length === 0}
          className={cn(
            "flex items-center gap-2 h-10 px-5 rounded-lg border text-sm font-medium transition-colors",
            selected.length > 0
              ? "border-red-200 text-red-500 hover:bg-red-50"
              : "border-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          <Trash2 size={15} />
          Delete {selected.length > 0 && `(${selected.length})`}
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {/* Select all checkbox */}
              <th className="w-12 px-6 py-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 accent-primary-500 cursor-pointer"
                />
              </th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Medication</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Category</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Quantity</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Status</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Expiry Date</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-slate-400">
                  No medications found.
                </td>
              </tr>
            ) : (
              paginated.map((med) => (
                <tr
                  key={med.id}
                  className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors relative"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(med.id)}
                      onChange={() => toggleSelect(med.id)}
                      className="w-4 h-4 rounded border-slate-300 accent-primary-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <MedIcon />
                      <span className="text-sm font-medium text-slate-700">{med.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{med.category}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{med.quantity}</td>
                  <td className="px-4 py-4"><StatusBadge status={med.status} /></td>
                  <td className="px-4 py-4 text-sm text-slate-500">{med.expiryDate}</td>
                  <td className="px-4 py-4 relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === med.id ? null : med.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openDropdown === med.id && (
                      <ActionDropdown
                        onEdit={() => { setEditingMed(med); setOpenDropdown(null); }}
                        onDelete={() => deleteSingle(med.id)}
                        onClose={() => setOpenDropdown(null)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ──────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40 transition-colors"
          >
            ‹ Previous
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
            Next ›
          </button>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────── */}
      {showAddModal && (
        <AddMedicationModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {editingMed && (
        <EditMedicationModal
          medication={editingMed}
          onClose={() => setEditingMed(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}