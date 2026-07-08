import React from 'react';
import { createBrowserRouter } from 'react-router-dom'
import App from './App';
import Protected from './Protected';
import RedirectIfAuthed from './components/RedirectIfAuthed';

// New UI (ported from folder5)
import { AppShell } from './components/Layout/AppShell';
import Landing from './pages/Landing/Landing';
import AuthPage from './pages/Auth/AuthPage';
import OtpVerificationPage from './pages/Auth/OtpVerificationPage';
import PasswordRecovery from './pages/Auth/PasswordRecovery';
import Dashboard from './pages/User/Dashboard';
import Settings from './pages/User/Settings';
import UploadReport from './pages/Health/UploadReport';
import AddVitals from './pages/Health/AddVitals';
import Timeline from './pages/Health/Timeline';
import ReportViewer from './pages/Health/ReportViewer';

// Admin area predates folder5's redesign — folder5 has no admin screens, so this is kept
// as-is for now. Flagged in the migration summary as a design gap to revisit.
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashbaord';

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
          { path: '/', element: <Landing /> },
          { path: '/auth', element: <AuthPage /> },
          { path: '/forgot-password', element: <PasswordRecovery /> },
          { path: '/reset-password', element: <PasswordRecovery /> },
          { path: '/otp-verification', element: <OtpVerificationPage /> },
        ],
      },

      // Authenticated app (guarded by Protected, shares folder5's AppShell layout)
      {
        element: <Protected />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/dashboard', element: <Dashboard /> },
              { path: '/upload', element: <UploadReport /> },
              { path: '/vitals', element: <AddVitals /> },
              { path: '/timeline', element: <Timeline /> },
              { path: '/reports/:fileId', element: <ReportViewer /> },
              { path: '/settings', element: <Settings /> },
            ],
          },
          {
            element: <AdminLayout />,
            children: [{ path: '/admin-dashboard', element: <AdminDashboard /> }],
          },
        ],
      },
    ],
  },
])
