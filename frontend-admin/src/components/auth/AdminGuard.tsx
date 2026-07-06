import { useAuth } from 'react-oidc-context';
import { hasRole } from '@/lib/auth';
import { Navigate } from 'react-router-dom';

interface AdminGuardProps {
  readonly children: React.ReactNode;
  readonly requiredRole?: 'ADMIN';
}

export function AdminGuard({ children, requiredRole }: AdminGuardProps) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect();
    return null;
  }

  const hasAccess = requiredRole === 'ADMIN'
    ? hasRole(auth.user, 'ADMIN')
    : hasRole(auth.user, 'MANAGER', 'ADMIN');

  if (!hasAccess) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
