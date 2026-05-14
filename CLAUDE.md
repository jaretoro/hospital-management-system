# SAHCOMed HMS — Project Context

## Stack
React 18 + TypeScript + Vite + Tailwind CSS v3 + React Router v6 + Recharts + date-fns + lucide-react. Primary color #FF7221. Path alias @ maps to src/.

## Roles
- nurse → /admin/* (clinic manager)
- doctor → /doctor/*
- admin → super admin (future)

## API
Base URL: https://sahmed-api.onrender.com/api
All responses: { status, message, data }
Backend uses _id not id
Status values: in_stock, low_stock, out_of_stock, in_consultation, waiting, completed

## Key Files
- frontend/src/lib/api.ts → fetch wrapper
- frontend/src/lib/auth.ts → token management
- frontend/src/components/common/ProtectedRoute.tsx
- frontend/src/components/ui/LoadingSpinner.tsx
- frontend/src/components/ui/ErrorState.tsx
- frontend/src/components/ui/EmptyState.tsx

## Connected Endpoints
- POST /v1/users/login ✅
- POST /v1/users/register ✅
- GET /v1/users/me ✅
- PATCH /v1/users/staff/{id} ✅
- GET/POST/PATCH/DELETE /v1/patients ✅
- GET/POST/PATCH/DELETE /v1/medications ✅
- GET /v1/consultations ✅
- POST /v1/consultations/check-in ✅
- PATCH /v1/consultations/{id}/vitals ✅
- PATCH /v1/consultations/{id}/send-to-doctor ✅
- PATCH /v1/consultations/{id}/diagnose ✅
- PATCH /v1/consultations/{id}/administer ✅

## Pending
- Reports (backend not ready)
- Notifications (backend not ready)
- Patient delete bug (backend)
- Pagination broken (backend)

## Rules
- Proposal-first always
- Sidebar icons always orange
- Active nav: solid orange bg + white text
- Pure white background
- Never push directly to main