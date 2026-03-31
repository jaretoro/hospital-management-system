import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Users, Calendar, Stethoscope, TrendingUp } from "lucide-react";

const STATS = [
  { label: "Total Patients",     value: "—", icon: <Users       size={20} /> },
  { label: "Appointments Today", value: "—", icon: <Calendar    size={20} /> },
  { label: "Active Doctors",     value: "—", icon: <Stethoscope size={20} /> },
  { label: "Revenue (month)",    value: "—", icon: <TrendingUp  size={20} /> },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="section-title text-xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Recent Appointments</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 text-center py-8">Connect backend API to load appointments.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Patients</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 text-center py-8">Connect backend API to load patients.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}