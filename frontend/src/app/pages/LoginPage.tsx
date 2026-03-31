import { Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
            <Activity size={20} />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">SAHCOMed</span>
        </div>
        <div className="card-md">
          <h1 className="text-xl font-semibold text-slate-800 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-6">Sign in to your account to continue</p>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <Input label="Email address" type="email" placeholder="you@hospital.com" autoComplete="email" />
            <Input label="Password" type="password" placeholder="••••••••" autoComplete="current-password" />
            <Button className="w-full mt-2" size="lg">Sign in</Button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">SAHCOMed Hospital Management System</p>
      </div>
    </div>
  );
}