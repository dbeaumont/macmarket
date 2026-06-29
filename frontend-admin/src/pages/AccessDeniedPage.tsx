import { useAuth } from 'react-oidc-context';
import { Button } from '@/components/ui/button';
import { ShieldX, LogOut, ExternalLink } from 'lucide-react';

export function AccessDeniedPage() {
  const auth = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-6">
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <ShieldX className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Acces refuse</h1>
        <p className="mt-3 text-slate-500">
          Vous n'avez pas les droits necessaires pour acceder au backoffice.
          Seuls les gestionnaires (MANAGER) et administrateurs (ADMIN) y ont acces.
        </p>
        {auth.user?.profile?.email && (
          <p className="mt-2 text-sm text-slate-400">
            Connecte en tant que : {auth.user.profile.email}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <Button variant="outline" onClick={() => auth.signoutRedirect()}>
            <LogOut className="mr-2 h-4 w-4" /> Se deconnecter
          </Button>
          <a
            href="http://localhost:3000"
            className="inline-flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="h-4 w-4" /> Aller sur la boutique
          </a>
        </div>
      </div>
    </div>
  );
}
