import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function DoctorsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title text-xl">Doctors</h1>
        <Button size="md"><Plus size={16} />Add Doctor</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Medical Staff</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-12">Doctor directory will render here.</p>
        </CardContent>
      </Card>
    </div>
  );
}