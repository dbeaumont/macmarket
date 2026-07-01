import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AdminOrder } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  fetchCustomerOrders: vi.fn(),
}));

import { fetchCustomerOrders } from '@/lib/api';
import { CustomerDetailPage } from './CustomerDetailPage';

const mockedFetchCustomerOrders = vi.mocked(fetchCustomerOrders);

function renderWithProviders(userId: string): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/customers/${userId}`]}>
        <Routes>
          <Route path="/customers/:userId" element={<CustomerDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CustomerDetailPage', () => {
  beforeEach(() => {
    mockedFetchCustomerOrders.mockReset();
  });

  it("shows the customer's order history with a working link to each order detail page", async () => {
    const orders: readonly AdminOrder[] = [
      {
        id: 'order-1111', userId: 'user-abc-123', status: 'PAID', total: 199.99, itemCount: 1,
        shippingName: 'Alice Dupont', shippingAddress: '1 rue de Paris', shippingEmail: 'alice@test.fr',
        createdAt: '2026-06-20T10:00:00Z',
      },
      {
        id: 'order-2222', userId: 'user-abc-123', status: 'DELIVERED', total: 89.5, itemCount: 2,
        shippingName: 'Alice Dupont', shippingAddress: '2 rue de Lyon', shippingEmail: 'alice@test.fr',
        createdAt: '2026-06-25T10:00:00Z',
      },
    ];
    mockedFetchCustomerOrders.mockResolvedValue(orders);

    renderWithProviders('user-abc-123');

    expect(await screen.findByText('user-abc-123')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getByText('2')).toBeInTheDocument(); // nb commandes

    // coordonnees affichees d'apres la commande la plus recente (2 rue de Lyon)
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
    expect(screen.getByText('alice@test.fr')).toBeInTheDocument();
    expect(screen.getByText('2 rue de Lyon')).toBeInTheDocument();
    expect(screen.queryByText('1 rue de Paris')).not.toBeInTheDocument();
  });

  it('shows an empty state when the customer has no orders', async () => {
    mockedFetchCustomerOrders.mockResolvedValue([]);

    renderWithProviders('user-no-orders');

    expect(await screen.findByText('Aucune commande trouvee')).toBeInTheDocument();
  });
});
