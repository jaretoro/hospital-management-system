import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <p className="text-7xl font-bold text-slate-200">404</p>
      <h1 className="text-xl font-semibold text-slate-700">Page not found</h1>
      <p className="text-sm text-slate-500">This page doesn't exist or has been moved.</p>
      <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
    </div>
  );
}