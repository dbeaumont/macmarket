import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { hasRole, getUserRoles } from '@/lib/auth';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  TrendingUp, BarChart3, UserCheck, ClipboardList,
  LogOut, Shield, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

const managerNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventaire', icon: Package },
  { to: '/orders', label: 'Commandes', icon: ShoppingCart },
  { to: '/customers', label: 'Clients', icon: Users },
] as const;

const adminNav = [
  { to: '/stats/revenue', label: 'Revenus', icon: TrendingUp },
  { to: '/stats/products', label: 'Produits', icon: BarChart3 },
  { to: '/stats/customers', label: 'Clients', icon: UserCheck },
  { to: '/stats/orders', label: 'Commandes', icon: ClipboardList },
] as const;

export function AdminLayout({ children }: { readonly children: React.ReactNode }) {
  const auth = useAuth();
  const location = useLocation();
  const isAdmin = hasRole(auth.user, 'ADMIN');
  const roles = getUserRoles(auth.user).filter(r => !r.startsWith('default-'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-slate-700">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg" onClick={closeMobileSidebar}>
          <Shield className="h-5 w-5 text-blue-400" />
          MacMarket Admin
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {managerNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={closeMobileSidebar}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              location.pathname === item.to || location.pathname.startsWith(item.to + '/')
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Statistiques
              </span>
            </div>
            {adminNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMobileSidebar}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  location.pathname === item.to
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            {(auth.user?.profile?.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{auth.user?.profile?.email}</p>
            <p className="text-xs text-slate-400">{roles.join(', ')}</p>
          </div>
          <button
            onClick={() => auth.signoutRedirect()}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={closeMobileSidebar}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Mobile header with hamburger */}
        <header className="md:hidden flex items-center gap-3 bg-white border-b px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            MacMarket Admin
          </div>
        </header>

        <main className="flex-1 bg-slate-50 p-6 overflow-auto">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
