import { useState, useMemo } from "react";
import {
  Search, Trash2, Plus, MoreVertical,
  Pencil, X, CalendarIcon, SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────
interface Medication {
  id: number;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
}

type SortField = "name" | "category" | null;

// ── Stock threshold logic ─────────────────────────────────────
function getStockStatus(quantity: number): "In stock" | "Low stock" | "Out of stock" {
  if (quantity <= 0)  return "Out of stock";
  if (quantity < 500) return "Low stock";
  return "In stock";
}

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_MEDICATIONS: Medication[] = [
  { id: 1, name: "Cefuroxime",     category: "Antibiotic",   quantity: 1500, expiryDate: "05-08-2029" },
  { id: 2, name: "Arthrocare",     category: "Analgesic",    quantity: 300,  expiryDate: "05-08-2029" },
  { id: 3, name: "Ampiclox",       category: "Antibiotic",   quantity: 0,    expiryDate: "05-08-2029" },
  { id: 4, name: "Amatem softgel", category: "Anti-malaria", quantity: 1500, expiryDate: "05-08-2029" },
  { id: 5, name: "Diclofenac",     category: "Analgesic",    quantity: 200,  expiryDate: "05-08-2029" },
  { id: 6, name: "Omeprazole",     category: "PUD",          quantity: 0,    expiryDate: "05-08-2029" },
  { id: 7, name: "Erythromycin",   category: "URTI",         quantity: 800,  expiryDate: "05-08-2029" },
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
function StatusBadge({ quantity }: { quantity: number }) {
  const status = getStockStatus(quantity);
  const styles = {
    "In stock":     "bg-green-50 text-green-600",
    "Low stock":    "bg-orange-50 text-orange-500",
    "Out of stock": "bg-red-50 text-red-500",
  };
  const icons = {
    "In stock":     "↑",
    "Low stock":    "↓",
    "Out of stock": "↓",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium",
      styles[status]
    )}>
      {icons[status]} {status}
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
function FormField({ label, error, children }: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass = (error?: string) => cn(
  "w-full h-12 px-4 rounded-xl border text-sm text-slate-700",
  "focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors",
  error ? "border-red-400" : "border-slate-200"
);

// ── Add Medication Modal ──────────────────────────────────────
function AddMedicationModal({
  onClose, onAdd,
}: {
  onClose: () => void;
  onAdd: (med: Omit<Medication, "id">) => void;
}) {
  const [form, setForm]     = useState({ name: "", quantity: "", expiryDate: "", category: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name     = "Medication name is required";
    if (!form.quantity.trim()) e.quantity = "Quantity is required";
    else if (isNaN(Number(form.quantity)) || Number(form.quantity) < 0)
      e.quantity = "Enter a valid quantity";
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
      quantity:   Number(form.quantity),
      expiryDate: form.expiryDate,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Add new medication</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
          <X size={18} className="text-slate-500" />
        </button>
      </div>
      <div className="p-6 flex flex-col gap-5">
        <FormField label="Medication" error={errors.name}>
          <input
            className={inputClass(errors.name)}
            placeholder="e.g. Cefuroxime"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </FormField>
        <FormField label="Quantity" error={errors.quantity}>
          <input
            className={inputClass(errors.quantity)}
            placeholder="e.g. 300"
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => set("quantity", e.target.value)}
          />
        </FormField>
        <FormField label="Expiry date" error={errors.expiryDate}>
          <div className="relative">
            <input
              className={inputClass(errors.expiryDate)}
              placeholder="e.g. 05-08-2029"
              value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
            />
            <CalendarIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </FormField>
        <FormField label="Category" error={errors.category}>
          <select
            className={inputClass(errors.category)}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
  medication, onClose, onUpdate,
}: {
  medication: Medication;
  onClose: () => void;
  onUpdate: (updated: Medication) => void;
}) {
  const [form, setForm] = useState({
    newQuantity:    "",
    reduceQuantity: "",
    expiryDate:     medication.expiryDate,
    category:       medication.category,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  // Live preview
  const previewQuantity = useMemo(() => {
    let qty = medication.quantity;
    if (form.newQuantity.trim() && !isNaN(Number(form.newQuantity)))
      qty += Number(form.newQuantity);
    if (form.reduceQuantity.trim() && !isNaN(Number(form.reduceQuantity)))
      qty = Math.max(0, qty - Number(form.reduceQuantity));
    return qty;
  }, [form.newQuantity, form.reduceQuantity, medication.quantity]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.expiryDate.trim()) e.expiryDate = "Expiry date is required";
    if (!form.category.trim())   e.category   = "Category is required";
    if (form.newQuantity && isNaN(Number(form.newQuantity)))
      e.newQuantity = "Enter a valid number";
    if (form.reduceQuantity) {
      if (isNaN(Number(form.reduceQuantity)))
        e.reduceQuantity = "Enter a valid number";
      else if (Number(form.reduceQuantity) > medication.quantity)
        e.reduceQuantity = `Cannot reduce more than current stock (${medication.quantity})`;
    }
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onUpdate({
      ...medication,
      quantity:   previewQuantity,
      expiryDate: form.expiryDate,
      category:   form.category,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Edit medication</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
          <X size={18} className="text-slate-500" />
        </button>
      </div>
      <div className="p-6 flex flex-col gap-5">

        {/* Name — read only */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-1">Medication</p>
          <p className="text-sm text-slate-500 px-1">{medication.name}</p>
        </div>

        {/* Current quantity — read only */}
        <FormField label="Current quantity" error={undefined}>
          <div className="flex items-center gap-3">
            <input
              className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
              value={`${medication.quantity} pieces`}
              disabled
            />
            <StatusBadge quantity={medication.quantity} />
          </div>
        </FormField>

        {/* New quantity — ADDS */}
        <FormField label="New quantity (adds to stock)" error={errors.newQuantity}>
          <input
            className={inputClass(errors.newQuantity)}
            placeholder="e.g. 300"
            type="number"
            min="0"
            value={form.newQuantity}
            onChange={(e) => set("newQuantity", e.target.value)}
          />
        </FormField>

        {/* Reduce quantity — SUBTRACTS */}
        <FormField label="Reduce quantity (subtracts from stock)" error={errors.reduceQuantity}>
          <input
            className={inputClass(errors.reduceQuantity)}
            placeholder="e.g. 5"
            type="number"
            min="0"
            value={form.reduceQuantity}
            onChange={(e) => set("reduceQuantity", e.target.value)}
          />
        </FormField>

        {/* Live preview */}
        {(form.newQuantity || form.reduceQuantity) && (
          <div className={cn(
            "flex items-center justify-between px-4 py-3 rounded-xl border text-sm",
            previewQuantity <= 0   ? "bg-red-50 border-red-100"
            : previewQuantity < 500 ? "bg-orange-50 border-orange-100"
            : "bg-green-50 border-green-100"
          )}>
            <span className="text-slate-600">Stock after update:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{previewQuantity} pieces</span>
              <StatusBadge quantity={previewQuantity} />
            </div>
          </div>
        )}

        {/* Expiry date */}
        <FormField label="Expiry date" error={errors.expiryDate}>
          <div className="relative">
            <input
              className={inputClass(errors.expiryDate)}
              value={form.expiryDate}
              onChange={(e) => set("expiryDate", e.target.value)}
            />
            <CalendarIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </FormField>

        {/* Category */}
        <FormField label="Category" error={errors.category}>
          <select
            className={inputClass(errors.category)}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
  onEdit, onDelete, onClose,
}: {
  onEdit: () => void; onDelete: () => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-8 z-20 bg-white rounded-xl shadow-card-lg border border-slate-100 py-1 w-36">
        <button onClick={onEdit} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <Pencil size={15} className="text-slate-400" /> Edit
        </button>
        <button onClick={onDelete} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MedicationsPage() {
  const location = useLocation();
  const isDoctor = location.pathname.startsWith("/doctor");

  const [medications, setMedications]   = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [selected, setSelected]         = useState<number[]>([]);
  const [search, setSearch]             = useState("");
  const [sortField, setSortField]       = useState<SortField>(null);
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("asc");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [editingMed, setEditingMed]     = useState<Medication | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage]  = useState(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
    setCurrentPage(1);
  };

  const handleClear = () => { setSortField(null); setSearch(""); setCurrentPage(1); };

  const processed = useMemo(() => {
    let result = medications.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
    );
    if (sortField) {
      result = [...result].sort((a, b) => {
        const valA = sortField === "name" ? a.name : a.category;
        const valB = sortField === "name" ? b.name : b.category;
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return result;
  }, [medications, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(processed.length / ITEMS_PER_PAGE));
  const paginated  = processed.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAdd = (med: Omit<Medication, "id">) => {
    setMedications((p) => [{ ...med, id: Date.now() }, ...p]);
  };

  const handleUpdate = (updated: Medication) => {
    setMedications((p) => p.map((m) => m.id === updated.id ? updated : m));
  };

  const deleteSelected = () => {
    setMedications((p) => p.filter((m) => !selected.includes(m.id)));
    setSelected([]);
  };

  const deleteSingle = (id: number) => {
    setMedications((p) => p.filter((m) => m.id !== id));
    setSelected((p) => p.filter((i) => i !== id));
    setOpenDropdown(null);
  };

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : null;

  return (
    <div className="flex flex-col gap-5">

      {/* Toolbar */}
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
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <SlidersHorizontal size={14} />
            <span>Sort by</span>
          </div>
          <button
            onClick={() => handleSort("name")}
            className={cn("font-medium transition-colors", sortField === "name" ? "text-primary-500" : "text-slate-700 hover:text-primary-500")}
          >
            Medication name{sortIndicator("name")}
          </button>
          <button
            onClick={() => handleSort("category")}
            className={cn("font-medium transition-colors", sortField === "category" ? "text-primary-500" : "text-slate-700 hover:text-primary-500")}
          >
            Category{sortIndicator("category")}
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
            <Plus size={16} /> Add medication
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
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Medication</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Category</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Quantity</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Status</th>
              <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Expiry Date</th>
              {!isDoctor && (
                <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-4 py-4">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={isDoctor ? 5 : 6} className="text-center py-12 text-sm text-slate-400">
                  No medications found.
                </td>
              </tr>
            ) : (
              paginated.map((med) => (
                <tr key={med.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors relative">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <MedIcon />
                      <span className="text-sm font-medium text-slate-700">{med.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{med.category}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{med.quantity} pieces</td>
                  <td className="px-4 py-4"><StatusBadge quantity={med.quantity} /></td>
                  <td className="px-4 py-4 text-sm text-slate-500">{med.expiryDate}</td>
                  {!isDoctor && (
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
                  )}
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40"
          >
            ‹ Previous
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      </div>

      {/* Modals — admin only */}
      {!isDoctor && showAddModal && (
        <AddMedicationModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}
      {!isDoctor && editingMed && (
        <EditMedicationModal
          medication={editingMed}
          onClose={() => setEditingMed(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}