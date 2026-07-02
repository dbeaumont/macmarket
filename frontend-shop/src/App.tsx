import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { useEffect } from 'react';
import { oidcConfig } from '@/lib/auth';
import { setTokenProvider } from '@/lib/api';
import { ShopHeader } from '@/components/layout/ShopHeader';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GuestCartMerge } from '@/components/auth/GuestCartMerge';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from '@/pages/HomePage';
import { ProductListPage } from '@/pages/ProductListPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { AccountPage } from '@/pages/AccountPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderHistoryPage } from '@/pages/OrderHistoryPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';
import { ChatWidget } from '@/components/chat/ChatWidget';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function TokenSync() {
  const auth = useAuth();
  useEffect(() => {
    setTokenProvider(async () => {
      if (!auth.user) return undefined;
      if (auth.user.expired) {
        try {
          const refreshed = await auth.signinSilent();
          return refreshed?.access_token;
        } catch {
          return undefined;
        }
      }
      return auth.user.access_token;
    });
  }, [auth]);
  return null;
}

export default function App() {
  return (
    <AuthProvider {...oidcConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TokenSync />
          <GuestCartMerge />
          <div className="flex min-h-screen flex-col">
            <ShopHeader />
            <main className="flex-1">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/auth/callback" element={<HomePage />} />
                  <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
            <ChatWidget />
            <Toaster richColors position="bottom-right" />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}
