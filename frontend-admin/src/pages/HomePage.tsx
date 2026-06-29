import { useAuth } from 'react-oidc-context';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export function HomePage() {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center text-white max-w-md px-6">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">MacMarket</h1>
        <h2 className="text-xl text-slate-300 mt-1">Espace Gestionnaire</h2>
        <p className="mt-4 text-slate-400 text-sm">
          Acces reserve aux gestionnaires et administrateurs autorises.
        </p>
        <Button
          size="lg"
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => auth.signinRedirect()}
        >
          Se connecter
        </Button>
      </div>
    </div>
  );
}
