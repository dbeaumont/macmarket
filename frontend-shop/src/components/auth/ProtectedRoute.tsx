import { useAuth } from 'react-oidc-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect();
    return null;
  }

  return <>{children}</>;
}
