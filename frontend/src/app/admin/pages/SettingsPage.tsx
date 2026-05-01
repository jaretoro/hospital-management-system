import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Toggle Component ──────────────────────────────────────────
function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0",
        enabled ? "bg-primary-500" : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          enabled ? "translate-x-6" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ── Section Header ────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <span className="text-slate-600 mt-0.5">{icon}</span>
      <div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ── Password Input ────────────────────────────────────────────
function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Enter"}
          className={cn(
            "w-full h-12 px-4 pr-12 rounded-xl border text-sm text-slate-700",
            "placeholder:text-slate-300 focus:outline-none focus:ring-2",
            "focus:ring-primary-400 transition-colors",
            error ? "border-red-400" : "border-slate-200"
          )}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate();

  // ── Notification toggles ──────────────────────────────────
  const [notifications, setNotifications] = useState({
    email:        true,
    inApp:        false,
    lowStock:     false,
    consultation: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((p) => ({ ...p, [key]: !p[key] }));
  };

  // ── Password form ─────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    current:  "",
    newPw:    "",
    confirm:  "",
  });
  const [pwErrors, setPwErrors]   = useState<Record<string, string>>({});
  const [pwSuccess, setPwSuccess] = useState(false);

  const setPassword = (field: string, value: string) => {
    setPasswords((p) => ({ ...p, [field]: value }));
    setPwErrors((p) => ({ ...p, [field]: "" }));
    setPwSuccess(false);
  };

  const validatePassword = () => {
    const e: Record<string, string> = {};
    if (!passwords.current.trim())  e.current = "Current password is required";
    if (!passwords.newPw.trim())    e.newPw   = "New password is required";
    else if (passwords.newPw.length < 8) e.newPw = "Password must be at least 8 characters";
    if (!passwords.confirm.trim())  e.confirm = "Please confirm your new password";
    else if (passwords.newPw !== passwords.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSavePassword = () => {
    const e = validatePassword();
    if (Object.keys(e).length > 0) { setPwErrors(e); return; }
    // Backend will handle actual password change
    setPwSuccess(true);
    setPasswords({ current: "", newPw: "", confirm: "" });
  };

  // ── Log out ───────────────────────────────────────────────
  const handleLogout = () => {
    // Backend will clear JWT token
    navigate("/login");
  };

  const NOTIFICATION_ITEMS = [
    {
      key:      "email" as const,
      title:    "Email notification",
      subtitle: "Receive notification via email",
    },
    {
      key:      "inApp" as const,
      title:    "In-app notification",
      subtitle: "Receive in app push notification",
    },
    {
      key:      "lowStock" as const,
      title:    "Low stock alerts",
      subtitle: "Get notified when medication stock is low",
    },
    {
      key:      "consultation" as const,
      title:    "Consultation alerts",
      subtitle: "Receive updates on consultation status changes",
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* ── Notification Settings ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <SectionHeader
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
          title="Notification settings"
          subtitle="Manage how you receive notifications"
        />

        <div className="flex flex-col divide-y divide-slate-50">
          {NOTIFICATION_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-400 mt-0.5">{item.subtitle}</p>
              </div>
              <Toggle
                enabled={notifications[item.key]}
                onToggle={() => toggleNotification(item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Security ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <SectionHeader
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          }
          title="Security"
          subtitle="Manage your account security"
        />

        <div className="border border-slate-100 rounded-xl p-5">
          <p className="text-sm font-semibold text-slate-700 mb-5">
            Change password
          </p>

          <div className="flex flex-col gap-4">
            <PasswordInput
              label="Current password"
              value={passwords.current}
              onChange={(v) => setPassword("current", v)}
              placeholder="Enter current password"
              error={pwErrors.current}
            />
            <PasswordInput
              label="Enter new password"
              value={passwords.newPw}
              onChange={(v) => setPassword("newPw", v)}
              placeholder="Enter"
              error={pwErrors.newPw}
            />
            <PasswordInput
              label="Confirm new password"
              value={passwords.confirm}
              onChange={(v) => setPassword("confirm", v)}
              placeholder="Enter"
              error={pwErrors.confirm}
            />

            {pwSuccess && (
              <p className="text-sm text-green-600 font-medium">
                ✅ Password updated successfully!
              </p>
            )}

            <button
              onClick={handleSavePassword}
              className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors mt-2"
            >
              Save password
            </button>
          </div>
        </div>
      </div>

      {/* ── Log out ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <SectionHeader
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          }
          title="Log out"
          subtitle="End your session securely"
        />

        <button
          onClick={handleLogout}
          className="w-40 h-12 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
        >
          Log out
        </button>
      </div>

    </div>
  );
}