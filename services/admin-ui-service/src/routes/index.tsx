import { Navigate, RouteObject } from 'react-router-dom'
import DashboardLayout from '../components/layouts/DashboardLayout'
import DashboardHome from '../pages/Dashboard/Home'
import Login from '../pages/Login'
import Logout from '../pages/Logout'
import Roles from '@/pages/Dashboard/Roles/Roles'
import CreateRole from '@/pages/Dashboard/Roles/CreateRole'
import EditRole from '@/pages/Dashboard/Roles/EditRole'
import Permissions from '@/pages/Dashboard/Permissions/Permissions'
import Users from '@/pages/Dashboard/Users/Users'
import { useUser } from '@/context/UserContext'
import LoadingOverlay from '@/components/common/LoadingOverlay'

// Protected Route wrapper
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) {
    return <LoadingOverlay isLoading={true} message="Loading dashboard..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Public routes
export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
]

// Protected dashboard routes
export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      // User Management
      { path: 'users', element: <Users />},
      { path: 'roles', element: <Roles />},
      { path: 'roles/create', element: <CreateRole />},
      { path: 'roles/edit/:id', element: <EditRole />},
      { path: 'permissions', element: <Permissions />},
      // Trade Fair Management
      { path: 'attendees', element: <div>Attendees page coming soon...</div> },
      { path: 'exhibitors', element: <div>Exhibitors page coming soon...</div> },
      { path: 'booths', element: <div>Booths page coming soon...</div> },
      { path: 'staff', element: <div>Staff page coming soon...</div> },
      // System
      { path: 'activity-logs', element: <div>Activity Logs page coming soon...</div> },
    ],
  },
]

// Root route
export const rootRoute: RouteObject = {
  path: '/',
  element: <Navigate to="/dashboard" replace />,
}

// Logout route
export const logoutRoute: RouteObject = {
  path: '/logout',
  element: <Logout />,
}

// Combine all routes
const routes: RouteObject[] = [
  ...publicRoutes,
  ...dashboardRoutes,
  rootRoute,
  logoutRoute,
]

export default routes 