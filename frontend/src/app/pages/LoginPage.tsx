import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import medicalStaff from "@/assets/images/medical-staff.jpg";

// ── Types ─────────────────────────────────────────────────────
type View = "role-select" | "sign-in" | "sign-up" | "forgot-password";
type Role = "doctor" | "admin" | null;

// ── Left Panel ────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden lg:block w-1/2 h-screen sticky top-0">
      <img
        src={medicalStaff}
        alt="Medical staff"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// ── Password Input ────────────────────────────────────────────
function PasswordInput({
  label, value, onChange, placeholder, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-800">
        {label}<span className="text-primary-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Enter password"}
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

// ── Text Input ────────────────────────────────────────────────
function TextInput({
  label, value, onChange, placeholder, type = "text", error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-800">
        {label}<span className="text-primary-500">*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-12 px-4 rounded-xl border text-sm text-slate-700",
          "placeholder:text-slate-300 focus:outline-none focus:ring-2",
          "focus:ring-primary-400 transition-colors",
          error ? "border-red-400" : "border-slate-200"
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Orange Button ─────────────────────────────────────────────
function OrangeButton({
  label, onClick, loading = false,
}: {
  label: string; onClick: () => void; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full h-12 rounded-full bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? "Please wait..." : label}
    </button>
  );
}

// ── Role Select View ──────────────────────────────────────────
function RoleSelectView({
  role, setRole, onContinue,
}: {
  role: Role; setRole: (r: Role) => void; onContinue: () => void;
}) {
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!role) { setError("Please select a role to continue"); return; }
    setError("");
    onContinue();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 lg:px-16 max-w-lg mx-auto w-full">
      {/* Logo — centered, large */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-slate-800">SAHCO</span>
          <span className="text-primary-500">Med</span>
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          How would you like to use sachomed?
        </p>
      </div>

      {/* Role options */}
      <div className="flex flex-col gap-4 w-full mb-8">
        {(["doctor", "admin"] as Role[]).map((r) => (
          <label
            key={r}
            onClick={() => setRole(r)}
            className={cn(
              "flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all duration-150",
              role === r ? "border-primary-400 bg-white" : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            {/* Radio circle */}
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
              role === r ? "border-primary-500" : "border-slate-300"
            )}>
              {role === r && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
            </div>
            <span className={cn(
              "text-sm font-medium capitalize",
              role === r ? "text-slate-800" : "text-slate-500"
            )}>
              {r}
            </span>
          </label>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 mb-4 self-start">{error}</p>}

      <OrangeButton label="Continue" onClick={handleContinue} />
    </div>
  );
}

// ── Sign In View ──────────────────────────────────────────────
function SignInView({
  role, onBack, onForgotPassword, onGoToSignUp,
}: {
  role: Role; onBack: () => void;
  onForgotPassword: () => void; onGoToSignUp: () => void;
}) {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

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
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    if (role === "admin")  navigate("/admin/dashboard");
    if (role === "doctor") navigate("/doctor/dashboard");
  };

  return (
    <div className="flex flex-col justify-center h-full px-8 lg:px-16 max-w-lg mx-auto w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back!</h1>
        <p className="text-sm text-slate-500">Sign in to your account!</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Email */}
        <TextInput
          label="Email"
          type="email"
          placeholder="Enter email address"
          value={form.email}
          onChange={(v) => set("email", v)}
          error={errors.email}
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-800">
            Password<span className="text-primary-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => { set("password", e.target.value); }}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              className={cn(
                "w-full h-12 px-4 pr-12 rounded-xl border text-sm text-slate-700",
                "placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors",
                errors.password ? "border-red-400" : "border-slate-200"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          {/* Forgot password */}
          <button
            onClick={onForgotPassword}
            className="self-end text-xs text-slate-500 hover:text-primary-500 transition-colors mt-0.5"
          >
            Forgot password?
          </button>
        </div>

        <OrangeButton label="Sign in" onClick={handleSignIn} loading={loading} />

        {/* Sign up link */}
        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <button
            onClick={onGoToSignUp}
            className="text-primary-500 font-semibold hover:underline"
          >
            Sign up
          </button>
        </p>

        {/* Back */}
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors text-center"
        >
          ← Back to role selection
        </button>
      </div>
    </div>
  );
}

// ── Sign Up View ──────────────────────────────────────────────
function SignUpView({
  role, onGoToSignIn,
}: {
  role: Role; onGoToSignIn: () => void;
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", department: "",
    role: role ?? "", address: "", password: "", confirm: "",
  });
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim())   e.fullName   = "Full name is required";
    if (!form.email.trim())      e.email      = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.department.trim()) e.department = "Department is required";
    if (!form.role.trim())       e.role       = "Role is required";
    if (!form.address.trim())    e.address    = "Address is required";
    if (!form.password.trim())   e.password   = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (!form.confirm.trim())    e.confirm    = "Please confirm your password";
    else if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    return e;
  };

  const handleSignUp = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    // Backend will handle real account creation
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    // After sign up → go to dashboard
    if (role === "admin")  navigate("/admin/dashboard");
    if (role === "doctor") navigate("/doctor/dashboard");
  };

  return (
    <div className="flex flex-col justify-center min-h-full py-12 px-8 lg:px-16 max-w-lg mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1 text-center">
          Get Started
        </h1>
        <p className="text-sm text-slate-500 text-center">
          Let's help you set up your account!
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <TextInput
          label="Full name"
          placeholder="Enter full name"
          value={form.fullName}
          onChange={(v) => set("fullName", v)}
          error={errors.fullName}
        />
        <TextInput
          label="Email"
          type="email"
          placeholder="Enter email"
          value={form.email}
          onChange={(v) => set("email", v)}
          error={errors.email}
        />
        <TextInput
          label="Department"
          placeholder="Enter department"
          value={form.department}
          onChange={(v) => set("department", v)}
          error={errors.department}
        />
        <TextInput
          label="Role"
          placeholder="Enter role"
          value={form.role}
          onChange={(v) => set("role", v)}
          error={errors.role}
        />
        <TextInput
          label="Address"
          placeholder="Enter address"
          value={form.address}
          onChange={(v) => set("address", v)}
          error={errors.address}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter password"
          value={form.password}
          onChange={(v) => set("password", v)}
          error={errors.password}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="Enter password"
          value={form.confirm}
          onChange={(v) => set("confirm", v)}
          error={errors.confirm}
        />

        <OrangeButton label="Sign up" onClick={handleSignUp} loading={loading} />

        {/* Sign in link */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            onClick={onGoToSignIn}
            className="text-primary-500 font-semibold hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Forgot Password View ──────────────────────────────────────
function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [email, setEmail]         = useState("");
  const [error, setError]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async () => {
    if (!email.trim())               { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col justify-center h-full px-8 lg:px-16 max-w-lg mx-auto w-full">
      {submitted ? (
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Check your email!</h2>
          <p className="text-sm text-slate-500 max-w-xs">
            We've sent a password reset link to{" "}
            <span className="font-medium text-slate-700">{email}</span>.
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
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Forgot password?</h1>
            <p className="text-sm text-slate-500">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-800">
                Email<span className="text-primary-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={cn(
                  "w-full h-12 px-4 rounded-xl border text-sm text-slate-700",
                  "placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors",
                  error ? "border-red-400" : "border-slate-200"
                )}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <OrangeButton
              label="Send reset link"
              onClick={handleSubmit}
              loading={loading}
            />

            <button
              onClick={onBack}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors text-center"
            >
              ← Back to sign in
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const [view, setView] = useState<View>("role-select");
  const [role, setRole] = useState<Role>(null);

  return (
    <div className="min-h-screen flex">
      {/* Left photo */}
      <LeftPanel />

      {/* Right forms */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center bg-white overflow-y-auto">
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
            onGoToSignUp={() => setView("sign-up")}
          />
        )}
        {view === "sign-up" && (
          <SignUpView
            role={role}
            onGoToSignIn={() => setView("sign-in")}
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