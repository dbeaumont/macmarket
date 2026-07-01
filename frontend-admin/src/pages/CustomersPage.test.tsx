import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CustomerSummary, PageResponse } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  fetchCustomers: vi.fn(),
}));

import { fetchCustomers } from '@/lib/api';
import { CustomersPage } from './CustomersPage';

const mockedFetchCustomers = vi.mocked(fetchCustomers);

function renderWithProviders(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CustomersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CustomersPage', () => {
  beforeEach(() => {
    mockedFetchCustomers.mockReset();
  });

  it('renders an Actions column with a link to the customer detail page for each row', async () => {
    const page: PageResponse<CustomerSummary> = {
      content: [
        { userId: 'user-abc-123', orderCount: 3, totalSpent: 450.5, lastOrderDate: '2026-06-20T10:00:00Z' },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    };
    mockedFetchCustomers.mockResolvedValue(page);

    renderWithProviders();

    const link = await screen.findByRole('link');
    expect(link).toHaveAttribute('href', '/customers/user-abc-123');
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
