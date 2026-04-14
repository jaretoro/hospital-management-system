import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const LoginPage          = lazy(() => import("@/app/pages/LoginPage"));
const DashboardPage      = lazy(() => import("@/app/pages/DashboardPage"));
const StaffsPage         = lazy(() => import("@/app/pages/StaffsPage"));
const MedicationsPage    = lazy(() => import("@/app/pages/MedicationsPage"));
const ReportsPage        = lazy(() => import("@/app/pages/ReportsPage"));
const ConsultationPage   = lazy(() => import("@/app/pages/ConsultationPage"));
const ProfilePage        = lazy(() => import("@/app/pages/ProfilePage"));
const NotFoundPage       = lazy(() => import("@/app/pages/NotFoundPage"));
const DoctorDashboard    = lazy(() => import("@/app/doctors/pages/DoctorDashboard"))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <Wrap><LoginPage /></Wrap> },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true,             element: <Wrap><DashboardPage /></Wrap>    },
      { path: "dashboard",       element: <Wrap><DashboardPage /></Wrap>    },
      { path: "staffs",          element: <Wrap><StaffsPage /></Wrap>       },
      { path: "medications",     element: <Wrap><MedicationsPage /></Wrap>  },
      { path: "reports",         element: <Wrap><ReportsPage /></Wrap>      },
      { path: "consultation",    element: <Wrap><ConsultationPage /></Wrap> },
      { path: "profile",         element: <Wrap><ProfilePage /></Wrap>      },
      { path: "doctor-dashboard",element: <Wrap><DoctorDashboard /></Wrap>  },
    ],
  },
  { path: "*", element: <Wrap><NotFoundPage /></Wrap> },
]);