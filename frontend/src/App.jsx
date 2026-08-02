import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import GuardLayout from './layouts/GuardLayout.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { ToastProvider } from './components/ui/toast.jsx'
import Landing from './pages/Landing.jsx'
import SystemInfo from './pages/SystemInfo.jsx'
import TCGC from './pages/TCGC.jsx'
import Legal from './pages/Legal.jsx'
import PublicVisitorRegistration from './pages/VisitorRegistration.jsx'
import Login from './pages/auth/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Records from './pages/admin/Records.jsx'
import Violations from './pages/admin/Violations.jsx'
import Users from './pages/admin/users/Users.jsx'
import ViolationTypes from './pages/admin/violation-types/ViolationTypes.jsx'
import Visitors from './pages/admin/visitors/Visitors.jsx'
import GuardVisitors from './pages/guard/visitors/Visitors.jsx'
import GuardVisitorRegistration from './pages/guard/visitors/VisitorRegistration.jsx'
import Attendance from './pages/admin/Attendance.jsx'
import VisitorScanner from './pages/guard/visitor-scanner/VisitorScanner.jsx'
import GuardDashboard from './pages/guard/GuardDashboard.jsx'
import ViolationForm from './pages/guard/ViolationForm.jsx'
import VisitorRegistration from './pages/guard/VisitorRegistration.jsx'
import Profile from './pages/Profile.jsx'

function SessionSplash() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 dot-grid">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      <span className="font-mono text-xs text-muted-foreground tracking-widest">
        VERIFYING SESSION…
      </span>
    </div>
  )
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <SessionSplash />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/guard/dashboard'} replace />
  }

  return children
}

function LoginRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <SessionSplash />
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/guard/dashboard'} replace />
  }

  return <Login />
}

function ModulePlaceholder({ title, description }) {
  return (
    <div className="px-6 lg:px-10 py-8">
      <div className="border border-border bg-card rounded-lg p-8">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <p className="mt-4 text-xs font-mono text-info">MODULE UNDER CONSTRUCTION</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/system" element={<SystemInfo />} />
          <Route path="/tcgc" element={<TCGC />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/visitor-registration" element={<PublicVisitorRegistration />} />
        </Route>

        {/* Auth routes (full-screen, no public chrome) */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="records" element={<Records />} />
          <Route path="violations" element={<Violations />} />
          <Route path="users" element={<Users />} />
          <Route path="violation-types" element={<ViolationTypes />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="reports"
            element={<ModulePlaceholder title="Reports" description="Report generation and export center." />}
          />
          <Route
            path="compliance"
            element={<ModulePlaceholder title="Compliance" description="Office and facility compliance monitoring." />}
          />
          <Route
            path="visitors"
            element={<Visitors />}
          />
        </Route>

        {/* Guard routes */}
        <Route
          path="/guard"
          element={
            <ProtectedRoute role="guard">
              <GuardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/guard/visitor/scan" replace />} />
          <Route path="visitor" element={<GuardVisitors />} />
          <Route path="visitor/scan" element={<VisitorScanner />} />
          <Route path="visitor/register" element={<GuardVisitorRegistration />} />
          <Route path="dashboard" element={<GuardDashboard />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/guard/violation"
          element={
            <ProtectedRoute role="guard">
              <ViolationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guard/visitor-register"
          element={
            <ProtectedRoute role="guard">
              <VisitorRegistration />
            </ProtectedRoute>
          }
        />
      </Routes>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
