import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom'
import App from './App';
import Protected from './Protected';
import RedirectIfAuthed from './components/RedirectIfAuthed';
import PageLoader from './components/PageLoader';

// New UI (ported from folder5)
// Route-based code splitting: each page (and the heavier layout shells) is its
// own chunk, only fetched when a user actually navigates there. Previously
// every page's code — MUI, Radix, Recharts, all of it — shipped in one bundle
// loaded on first visit, even for someone who only ever sees the login page.
const AppShell = lazy(() =>
  import('./components/Layout/AppShell').then((m) => ({ default: m.AppShell }))
);
const Landing = lazy(() => import('./pages/Landing/Landing'));
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'));
const OtpVerificationPage = lazy(() => import('./pages/Auth/OtpVerificationPage'));
const PasswordRecovery = lazy(() => import('./pages/Auth/PasswordRecovery'));
const Dashboard = lazy(() => import('./pages/User/Dashboard'));
const Settings = lazy(() => import('./pages/User/Settings'));
const UploadReport = lazy(() => import('./pages/Health/UploadReport'));
const AddVitals = lazy(() => import('./pages/Health/AddVitals'));
const Timeline = lazy(() => import('./pages/Health/Timeline'));
const ReportViewer = lazy(() => import('./pages/Health/ReportViewer'));

// Admin area predates folder5's redesign — folder5 has no admin screens, so this is kept
// as-is for now. Flagged in the migration summary as a design gap to revisit.
const AdminLayout = lazy(() => import('./components/Layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashbaord'));

// Small helper so every lazy route gets the same fallback without repeating
// <Suspense fallback={...}> around each individual element below.
const withSuspense = (element) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes — if a session token already exists, RedirectIfAuthed sends
      // straight to /dashboard instead of showing these again.
      {
        element: <RedirectIfAuthed />,
        children: [
          { path: '/', element: withSuspense(<Landing />) },
          { path: '/auth', element: withSuspense(<AuthPage />) },
          { path: '/forgot-password', element: withSuspense(<PasswordRecovery />) },
          { path: '/reset-password', element: withSuspense(<PasswordRecovery />) },
          { path: '/otp-verification', element: withSuspense(<OtpVerificationPage />) },
        ],
      },

      // Authenticated app (guarded by Protected, shares folder5's AppShell layout)
      {
        element: <Protected />,
        children: [
          {
            element: withSuspense(<AppShell />),
            children: [
              { path: '/dashboard', element: withSuspense(<Dashboard />) },
              { path: '/upload', element: withSuspense(<UploadReport />) },
              { path: '/vitals', element: withSuspense(<AddVitals />) },
              { path: '/timeline', element: withSuspense(<Timeline />) },
              { path: '/reports/:fileId', element: withSuspense(<ReportViewer />) },
              { path: '/settings', element: withSuspense(<Settings />) },
            ],
          },
          {
            element: withSuspense(<AdminLayout />),
            children: [{ path: '/admin-dashboard', element: withSuspense(<AdminDashboard />) }],
          },
        ],
      },
    ],
  },
])