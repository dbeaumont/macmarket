import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Mail, Shield } from 'lucide-react';

export function AccountPage() {
  const auth = useAuth();
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: auth.isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-40 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mon compte</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {(user?.name || user?.email || '?')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{user?.name || 'Utilisateur'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Roles :</span>
              {user?.roles?.filter(r => !r.startsWith('default-')).map(role => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => auth.signoutRedirect()}
            >
              <LogOut className="mr-2 h-4 w-4" /> Se deconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
