import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────
interface ProfileData {
  fullName:    string;
  email:       string;
  staffNumber: string;
  department:  string;
  gender:      string;
  age:         string;
  phone:       string;
  role:        string;
  address:     string;
}

// ── Mock Data ─────────────────────────────────────────────────
const INITIAL_PROFILE: ProfileData = {
  fullName:    "Glory Nwosu",
  email:       "glorynwosu@sahcoplc",
  staffNumber: "SAH-0001",
  department:  "Clinic",
  gender:      "Female",
  age:         "32yrs",
  phone:       "08156257812",
  role:        "Clinic manager",
  address:     "Ikeja city",
};

const ACCOUNT_ACTIVITY = [
  {
    id:        1,
    title:     "Last Login",
    date:      "March 13, 2026 at 9:30 AM",
    ipAddress: "From 192.168.11.1",
  },
  {
    id:        2,
    title:     "Account Created",
    date:      "January 25, 2026",
    ipAddress: "From 192.168.11.1",
  },
];

// ── Avatar ────────────────────────────────────────────────────
function ProfileAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-500 font-bold flex items-center justify-center text-2xl shrink-0">
      {initials}
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

const inputClass = (error?: string) =>
  cn(
    "w-full h-12 px-4 rounded-xl border text-sm text-slate-700",
    "focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors",
    error ? "border-red-400" : "border-slate-200"
  );

// ── Edit Profile Modal ────────────────────────────────────────
function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: ProfileData;
  onClose: () => void;
  onSave: (updated: ProfileData) => void;
}) {
  const [form, setForm]     = useState<ProfileData>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: keyof ProfileData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.trim())    e.email    = "Email is required";
    if (!form.phone.trim())    e.phone    = "Phone number is required";
    if (!form.address.trim())  e.address  = "Address is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 z-10 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Edit profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-5">
          <FormField label="Full name" error={errors.fullName}>
            <input
              className={inputClass(errors.fullName)}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="Enter full name"
            />
          </FormField>

          <FormField label="Email address" error={errors.email}>
            <input
              className={inputClass(errors.email)}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="Enter email"
              type="email"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Age" error={undefined}>
              <input
                className={inputClass()}
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="e.g. 32yrs"
              />
            </FormField>
            <FormField label="Gender" error={undefined}>
              <select
                className={inputClass()}
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </FormField>
          </div>

          <FormField label="Phone number" error={errors.phone}>
            <input
              className={inputClass(errors.phone)}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </FormField>

          <FormField label="Address" error={errors.address}>
            <input
              className={inputClass(errors.address)}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Enter address"
            />
          </FormField>

          <FormField label="Department" error={undefined}>
            <input
              className={inputClass()}
              value={form.department}
              onChange={(e) => set("department", e.target.value)}
              placeholder="Enter department"
            />
          </FormField>

          {/* Role — read only */}
          <FormField label="Role" error={undefined}>
            <input
              className={cn(inputClass(), "bg-slate-50 text-slate-400 cursor-not-allowed")}
              value={form.role}
              disabled
            />
          </FormField>

          <button
            onClick={handleSave}
            className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Info Field ────────────────────────────────────────────────
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────
export default function ProfilePage() {
  const [profile, setProfile]         = useState<ProfileData>(INITIAL_PROFILE);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Profile card ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">

        {/* Avatar + Edit */}
        <div className="flex items-center gap-4 mb-8">
          <ProfileAvatar name={profile.fullName} />
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-500 transition-colors"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
          <InfoField label="Full name"     value={profile.fullName}    />
          <InfoField label="Email address" value={profile.email}       />
          <InfoField label="Staff Number"  value={profile.staffNumber} />
          <InfoField label="Department"    value={profile.department}  />
          <InfoField label="Gender"        value={profile.gender}      />
          <InfoField label="Age"           value={profile.age}         />
          <InfoField label="Phone-number"  value={profile.phone}       />
          <InfoField label="Role"          value={profile.role}        />
          <InfoField label="Address"       value={profile.address}     />
        </div>
      </div>

      {/* ── Account activity ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-base font-bold text-slate-800 mb-5">
          Account activity
        </h2>

        <div className="flex flex-col gap-4">
          {ACCOUNT_ACTIVITY.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-800">
                  {activity.title}
                </p>
                <p className="text-sm text-slate-500">{activity.date}</p>
              </div>
              <p className="text-sm text-slate-400">{activity.ipAddress}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => setProfile(updated)}
        />
      )}
    </div>
  );
}