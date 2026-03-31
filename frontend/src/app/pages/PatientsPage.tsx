import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Search } from "lucide-react";

export default function PatientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title text-xl">Patients</h1>
        <Button size="md"><Plus size={16} />Add Patient</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Patients</CardTitle>
          <div className="w-64">
            <Input placeholder="Search patients…" leftIcon={<Search size={14} />} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-12">Patient table will render here once the API is connected.</p>
        </CardContent>
      </Card>
    </div>
  );
}