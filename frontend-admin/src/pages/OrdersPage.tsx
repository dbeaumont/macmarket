import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { fetchAdminOrders } from '@/lib/api';
import type { AdminOrder } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Eye } from 'lucide-react';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

const ORDER_STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'PENDING_PAYMENT', label: 'En attente' },
  { value: 'PAID', label: 'Paye' },
  { value: 'PROCESSING', label: 'En traitement' },
  { value: 'SHIPPED', label: 'Expedie' },
  { value: 'DELIVERED', label: 'Livre' },
  { value: 'CANCELLED', label: 'Annule' },
] as const;

const columnHelper = createColumnHelper<AdminOrder>();

const columns = [
  columnHelper.accessor('id', {
    header: 'N°',
    cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
  }),
  columnHelper.accessor('total', {
    header: 'Total',
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor('status', {
    header: 'Statut',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('createdAt', {
    header: 'Date',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => (
      <Link to={`/orders/${info.row.original.id}`}>
        <Button variant="ghost" size="icon-xs">
          <Eye className="h-3 w-3" />
        </Button>
      </Link>
    ),
  }),
];

export function OrdersPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', '10');
  if (statusFilter) {
    params.set('status', statusFilter);
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => fetchAdminOrders(params),
  });

  const table = useReactTable({
    data: data?.content ? [...data.content] : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Commandes</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="border-b text-left text-muted-foreground">
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="pb-2 font-medium">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b last:border-0">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data && data.content.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucune commande trouvee</p>
                )}
              </div>

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.number + 1} sur {data.totalPages} ({data.totalElements} commandes)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Precedent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
