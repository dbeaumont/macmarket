import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { oidcConfig } from '@/lib/auth';
import { setTokenProvider } from '@/lib/api';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { ProductFormPage } from '@/pages/ProductFormPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { StatsOverviewPage } from '@/pages/StatsOverviewPage';
import { RevenueStatsPage } from '@/pages/RevenueStatsPage';
import { ProductStatsPage } from '@/pages/ProductStatsPage';
import { CustomerStatsPage } from '@/pages/CustomerStatsPage';
import { OrderStatsPage } from '@/pages/OrderStatsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function TokenSync() {
  const auth = useAuth();

  useEffect(() => {
    setTokenProvider(async () => auth.user?.access_token);
  }, [auth.user]);

  return null;
}

function AdminPage({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'ADMIN' }) {
  return (
    <AdminGuard requiredRole={requiredRole}>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}

export default function App() {
  return (
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter useTransitions={false}>
          <TokenSync />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<HomePage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            <Route path="/dashboard" element={<AdminPage><DashboardPage /></AdminPage>} />
            <Route path="/inventory" element={<AdminPage><InventoryPage /></AdminPage>} />
            <Route path="/inventory/new" element={<AdminPage><ProductFormPage /></AdminPage>} />
            <Route path="/inventory/:id/edit" element={<AdminPage><ProductFormPage /></AdminPage>} />
            <Route path="/orders" element={<AdminPage><OrdersPage /></AdminPage>} />
            <Route path="/orders/:id" element={<AdminPage><OrderDetailPage /></AdminPage>} />
            <Route path="/customers" element={<AdminPage><CustomersPage /></AdminPage>} />
            <Route path="/customers/:userId" element={<AdminPage><CustomerDetailPage /></AdminPage>} />

            <Route path="/stats" element={<AdminPage requiredRole="ADMIN"><StatsOverviewPage /></AdminPage>} />
            <Route path="/stats/revenue" element={<AdminPage requiredRole="ADMIN"><RevenueStatsPage /></AdminPage>} />
            <Route path="/stats/products" element={<AdminPage requiredRole="ADMIN"><ProductStatsPage /></AdminPage>} />
            <Route path="/stats/customers" element={<AdminPage requiredRole="ADMIN"><CustomerStatsPage /></AdminPage>} />
            <Route path="/stats/orders" element={<AdminPage requiredRole="ADMIN"><OrderStatsPage /></AdminPage>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}
