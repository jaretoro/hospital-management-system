import { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileData {
  fullName:    string;
  email:       string;
  staffNumber: string;
  department:  string;
  gender:      string;
  phone:       string;
  role:        string;
  address:     string;
  avatarUrl:   string | null;
}

const INITIAL_PROFILE: ProfileData = {
  fullName:    "Bolanle Olatunji",
  email:       "bolanle@sahcoplc",
  staffNumber: "SAH-0001",
  department:  "Clinic",
  gender:      "Male",
  phone:       "08156257812",
  role:        "Doctor",
  address:     "Ikeja city",
  avatarUrl:   null,
};

const ACCOUNT_ACTIVITY = [
  { id: 1, title: "Last Login",      date: "March 13, 2026 at 9:30 AM", ipAddress: "From 192.168.11.1" },
  { id: 2, title: "Account Created", date: "January 25, 2026",          ipAddress: "From 192.168.11.1" },
];

function ProfileAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return avatarUrl ? (
    <img src={avatarUrl} alt={name} className="w-20 h-20 rounded-full object-cover" />
  ) : (
    <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-500 font-bold flex items-center justify-center text-2xl shrink-0">
      {initials}
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-800">
        {label}<span className="text-primary-500">*</span>
      </label>
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

function EditProfileModal({
  profile, onClose, onSave,
}: {
  profile: ProfileData;
  onClose: () => void;
  onSave: (updated: ProfileData) => void;
}) {
  const [form, setForm] = useState({
    fullName:   profile.fullName,
    email:      profile.email,
    department: profile.department,
    role:       profile.role,
    address:    profile.address,
    avatarUrl:  profile.avatarUrl,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef        = useRef<HTMLInputElement>(null);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, avatarUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())   e.fullName   = "Full name is required";
    if (!form.email.trim())      e.email      = "Email is required";
    if (!form.department.trim()) e.department = "Department is required";
    if (!form.role.trim())       e.role       = "Role is required";
    if (!form.address.trim())    e.address    = "Address is required";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave({ ...profile, ...form });
    onClose();
  };

  const initials = form.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Edit profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          {/* Photo upload */}
          <div className="flex justify-start mb-2">
            <div className="relative w-20 h-20">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-500 font-bold flex items-center justify-center text-2xl">
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <Camera size={13} className="text-slate-600" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>

          <FormField label="Full name" error={errors.fullName}>
            <input className={inputClass(errors.fullName)} placeholder="Enter full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input className={inputClass(errors.email)} placeholder="Enter email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField label="Department" error={errors.department}>
            <input className={inputClass(errors.department)} placeholder="Enter department" value={form.department} onChange={(e) => set("department", e.target.value)} />
          </FormField>
          <FormField label="Role" error={errors.role}>
            <input className={inputClass(errors.role)} placeholder="Enter role" value={form.role} onChange={(e) => set("role", e.target.value)} />
          </FormField>
          <FormField label="Address" error={errors.address}>
            <input className={inputClass(errors.address)} placeholder="Enter address" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </FormField>

          <button onClick={handleSave} className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2">
            Update profile
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function DoctorProfilePage() {
  const [profile, setProfile]             = useState<ProfileData>(INITIAL_PROFILE);
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex items-center gap-4 mb-8">
          <ProfileAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} />
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-500 transition-colors"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
          <InfoField label="Full name"     value={profile.fullName}    />
          <InfoField label="Email address" value={profile.email}       />
          <InfoField label="Staff Number"  value={profile.staffNumber} />
          <InfoField label="Department"    value={profile.department}  />
          <InfoField label="Gender"        value={profile.gender}      />
          <InfoField label="Address"       value={profile.address}     />
          <InfoField label="Phone-number"  value={profile.phone}       />
          <InfoField label="Role"          value={profile.role}        />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-base font-bold text-slate-800 mb-5">Account activity</h2>
        <div className="flex flex-col gap-4">
          {ACCOUNT_ACTIVITY.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                <p className="text-sm text-slate-500">{activity.date}</p>
              </div>
              <p className="text-sm text-slate-400">{activity.ipAddress}</p>
            </div>
          ))}
        </div>
      </div>

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