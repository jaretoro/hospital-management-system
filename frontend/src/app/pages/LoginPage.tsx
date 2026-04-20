import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import medicalStaff from "@/assets/images/medical-staff.jpg";

// ── Types ─────────────────────────────────────────────────────
type View   = "role-select" | "sign-in" | "forgot-password";
type Role   = "admin" | "doctor" | null;

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
      <label className="text-sm font-medium text-slate-700">
        {label}<span className="text-primary-500">*</span>
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// ── Input style ───────────────────────────────────────────────
const inputClass = (error?: string) => cn(
  "w-full h-12 px-4 rounded-xl border text-sm text-slate-700",
  "placeholder:text-slate-400 focus:outline-none focus:ring-2",
  "focus:ring-primary-400 focus:border-transparent transition-colors",
  error ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
);

// ── Left Panel (photo) ────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:block w-1/2 h-screen relative overflow-hidden">
      <img
        src={medicalStaff}
        alt="Medical staff"
        className="w-full h-full object-cover"
      />
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
    </div>
  );
}

// ── Role Select View ──────────────────────────────────────────
function RoleSelectView({
  role,
  setRole,
  onContinue,
}: {
  role: Role;
  setRole: (r: Role) => void;
  onContinue: () => void;
}) {
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!role) { setError("Please select a role to continue"); return; }
    setError("");
    onContinue();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 lg:px-16 max-w-md mx-auto w-full">
      {/* Logo */}
      <div className="mb-10 self-start">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-slate-800">SAHCO</span>
          <span className="text-primary-500">Med</span>
        </span>
      </div>

      <div className="w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Which role are you?
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Let us serve you right!
        </p>

        {/* Role options */}
        <div className="flex flex-col gap-4 mb-8">
          {(["doctor", "admin"] as Role[]).map((r) => (
            <label
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-150",
                role === r
                  ? "border-primary-500 bg-primary-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              {/* Radio */}
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                role === r ? "border-primary-500" : "border-slate-300"
              )}>
                {role === r && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium capitalize transition-colors",
                role === r ? "text-primary-500" : "text-slate-600"
              )}>
                {r}
              </span>
            </label>
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-4">{error}</p>
        )}

        <button
          onClick={handleContinue}
          className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Sign In View ──────────────────────────────────────────────
function SignInView({
  role,
  onBack,
  onForgotPassword,
}: {
  role: Role;
  onBack: () => void;
  onForgotPassword: () => void;
}) {
  const navigate = useNavigate();

  const [form, setForm]     = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim())    e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  };

  const handleSignIn = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);

    // Simulate API call — replace with real auth later
    await new Promise((res) => setTimeout(res, 1000));

    setLoading(false);

    // Navigate based on role
    if (role === "admin")  navigate("/admin/dashboard");
    if (role === "doctor") navigate("/doctor/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 lg:px-16 max-w-md mx-auto w-full">
      {/* Logo */}
      <div className="mb-10 self-start">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-slate-800">SAHCO</span>
          <span className="text-primary-500">Med</span>
        </span>
      </div>

      <div className="w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Welcome back!
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Sign in to your account!
        </p>

        <div className="flex flex-col gap-5">
          {/* Email */}
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass(errors.email)}
              autoComplete="email"
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" error={errors.password}>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className={cn(inputClass(errors.password), "pr-12")}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Forgot password */}
            <button
              onClick={onForgotPassword}
              className="self-end text-xs text-slate-500 hover:text-primary-500 transition-colors mt-1"
            >
              Forgot password?
            </button>
          </FormField>

          {/* Sign in button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Back to role select */}
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-center"
          >
            ← Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Forgot Password View ──────────────────────────────────────
function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email.trim())               { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }

    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 lg:px-16 max-w-md mx-auto w-full">
      {/* Logo */}
      <div className="mb-10 self-start">
        <span className="text-2xl font-bold tracking-tight">
          <span className="text-slate-800">SAHCO</span>
          <span className="text-primary-500">Med</span>
        </span>
      </div>

      <div className="w-full">
        {submitted ? (
          // Success state
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Check your email!</h2>
            <p className="text-sm text-slate-500 max-w-xs">
              We've sent a password reset link to <span className="font-medium text-slate-700">{email}</span>. Check your inbox and follow the instructions.
            </p>
            <button
              onClick={onBack}
              className="mt-4 text-sm text-primary-500 font-medium hover:underline"
            >
              ← Back to sign in
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Forgot password?
            </h1>
            <p className="text-sm text-slate-500 mb-8">
              Enter your email and we'll send you a reset link.
            </p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Email<span className="text-primary-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className={inputClass(error)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <button
                onClick={onBack}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors text-center"
              >
                ← Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const [view, setView] = useState<View>("role-select");
  const [role, setRole] = useState<Role>(null);

  return (
    <div className="min-h-screen flex">
      {/* Left — medical staff photo */}
      <LeftPanel />

      {/* Right — forms */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center bg-white">
        {view === "role-select" && (
          <RoleSelectView
            role={role}
            setRole={setRole}
            onContinue={() => setView("sign-in")}
          />
        )}
        {view === "sign-in" && (
          <SignInView
            role={role}
            onBack={() => setView("role-select")}
            onForgotPassword={() => setView("forgot-password")}
          />
        )}
        {view === "forgot-password" && (
          <ForgotPasswordView
            onBack={() => setView("sign-in")}
          />
        )}
      </div>
    </div>
  );
}