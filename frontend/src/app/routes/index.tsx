import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AdminLayout }  from "@/components/layout/AdminLayout";
import { DoctorLayout } from "@/components/layout/DoctorLayout";

// ── Shared ────────────────────────────────────────────────────
const LoginPage    = lazy(() => import("@/app/pages/LoginPage"));
const NotFoundPage = lazy(() => import("@/app/pages/NotFoundPage"));

// ── Admin pages ───────────────────────────────────────────────
const AdminDashboard    = lazy(() => import("@/app/admin/pages/DashboardPage"));
const AdminStaffs       = lazy(() => import("@/app/admin/pages/StaffsPage"));
const AdminMedications  = lazy(() => import("@/app/admin/pages/MedicationsPage"));
const AdminReports      = lazy(() => import("@/app/admin/pages/ReportsPage"));
const AdminConsultation = lazy(() => import("@/app/admin/pages/ConsultationPage"));
const AdminProfile      = lazy(() => import("@/app/admin/pages/ProfilePage"));

// ── Doctor pages ──────────────────────────────────────────────
const DoctorDashboard    = lazy(() => import("@/app/doctor/pages/DoctorDashboardPage"));
const DoctorConsultation = lazy(() => import("@/app/doctor/pages/DoctorConsultationPage"));
const DoctorProfile      = lazy(() => import("@/app/doctor/pages/DoctorProfilePage"));

// ── Shared pages (same content, different layout) ─────────────
const SharedStaffs      = lazy(() => import("@/app/admin/pages/StaffsPage"));
const SharedMedications = lazy(() => import("@/app/admin/pages/MedicationsPage"));
const SharedReports     = lazy(() => import("@/app/admin/pages/ReportsPage"));

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
  // Root → login
  { path: "/",      element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Wrap><LoginPage /></Wrap>       },

  // ── Admin ─────────────────────────────────────────────────
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true,          element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard",    element: <Wrap><AdminDashboard /></Wrap>    },
      { path: "staffs",       element: <Wrap><AdminStaffs /></Wrap>       },
      { path: "medications",  element: <Wrap><AdminMedications /></Wrap>  },
      { path: "reports",      element: <Wrap><AdminReports /></Wrap>      },
      { path: "consultation", element: <Wrap><AdminConsultation /></Wrap> },
      { path: "profile",      element: <Wrap><AdminProfile /></Wrap>      },
    ],
  },

  // ── Doctor ────────────────────────────────────────────────
  {
    path: "/doctor",
    element: <DoctorLayout />,
    children: [
      { index: true,          element: <Navigate to="/doctor/dashboard" replace /> },
      { path: "dashboard",    element: <Wrap><DoctorDashboard /></Wrap>    },
      { path: "staffs",       element: <Wrap><SharedStaffs /></Wrap>       },
      { path: "medications",  element: <Wrap><SharedMedications /></Wrap>  },
      { path: "reports",      element: <Wrap><SharedReports /></Wrap>      },
      { path: "consultation", element: <Wrap><DoctorConsultation /></Wrap> },
      { path: "profile",      element: <Wrap><DoctorProfile /></Wrap>      },
    ],
  },

  // 404
  { path: "*", element: <Wrap><NotFoundPage /></Wrap> },
]);