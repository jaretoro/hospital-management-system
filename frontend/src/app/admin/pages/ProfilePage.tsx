import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getUser, saveAuth, getToken } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorState";

interface UserProfile {
  _id:         string;
  fullName:    string;
  email:       string;
  role:        string;
  phoneNumber: string;
  isActive:    boolean;
  createdAt:   string;
  updatedAt:   string;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

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
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}) {
  const [form, setForm] = useState({
    fullName:    profile.fullName,
    email:       profile.email,
    phoneNumber: profile.phoneNumber,
    // role is read-only — not editable by the user
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())    e.fullName    = "Full name is required";
    if (!form.email.trim())       e.email       = "Email is required";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const response = await api.patch<{
        status: boolean;
        data: { user: UserProfile };
      }>(`/v1/users/staff/${profile._id}`, {
        fullName:    form.fullName,
        email:       form.email,
        phoneNumber: form.phoneNumber,
        // role intentionally excluded — users cannot change their own role
      });

      // Update localStorage with new details
      const currentUser = getUser();
      const token       = getToken();
      if (currentUser && token) {
        saveAuth(token, {
          ...currentUser,
          name:  form.fullName,
          email: form.email,
        });
      }

      // Fix 2: notify Topbar to re-read name from localStorage
      window.dispatchEvent(new CustomEvent("sahcomed:profile-updated"));

      onSave(response.data.user);
      onClose();
    } catch (error: any) {
      setErrors({ fullName: error.message ?? "Failed to update profile" });
    } finally {
      setLoading(false);
    }
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
          {/* Avatar — upload not available until backend supports it */}
          <div className="flex justify-start mb-2">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-500 font-bold flex items-center justify-center text-2xl shrink-0">
              {initials}
            </div>
          </div>

          <FormField label="Full name" error={errors.fullName}>
            <input className={inputClass(errors.fullName)} placeholder="Enter full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input className={inputClass(errors.email)} placeholder="Enter email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField label="Phone number" error={errors.phoneNumber}>
            <input className={inputClass(errors.phoneNumber)} placeholder="Enter phone number" value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} />
          </FormField>

          {/* Role is read-only — cannot be self-assigned */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-800">Role</label>
            <div className="w-full h-12 px-4 rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-400 flex items-center capitalize">
              {profile.role}
            </div>
            <p className="text-xs text-slate-400">Role can only be changed by an admin.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <><LoadingSpinner size="sm" /> Saving...</> : "Update profile"}
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

export default function ProfilePage() {
  const [profile, setProfile]             = useState<UserProfile | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get<{
        status: boolean;
        data: { user: UserProfile };
      }>("/v1/users/me");
      setProfile(response.data.user);
    } catch (err: any) {
      setError(err.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={fetchProfile} />;
  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex items-center gap-4 mb-8">
          <ProfileAvatar name={profile.fullName} avatarUrl={null} />
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
          <InfoField label="Phone number"  value={profile.phoneNumber} />
          <InfoField label="Role"          value={profile.role}        />
          <InfoField label="Status"        value={profile.isActive ? "Active" : "Inactive"} />
          <InfoField label="Member since"  value={new Date(profile.createdAt).toLocaleDateString()} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <h2 className="text-base font-bold text-slate-800 mb-5">Account activity</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-slate-800">Account Created</p>
              <p className="text-sm text-slate-500">{formatDateTime(profile.createdAt)}</p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              profile.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"
            )}>
              {profile.isActive ? "Active" : "Inactive"}
            </span>
          </div>
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