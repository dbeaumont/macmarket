import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import type { CustomerSummary } from '@/lib/api';
import { useCustomers } from '@/hooks/use-customers';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR');
}

const columnHelper = createColumnHelper<CustomerSummary>();

const columns = [
  columnHelper.accessor('userId', {
    header: 'ID',
    cell: (info) => <span className="font-mono text-xs">{info.getValue().slice(0, 8)}</span>,
  }),
  columnHelper.accessor('orderCount', {
    header: 'Nb commandes',
  }),
  columnHelper.accessor('totalSpent', {
    header: 'Total depense',
    cell: (info) => formatCurrency(info.getValue()),
  }),
  columnHelper.accessor('lastOrderDate', {
    header: 'Derniere commande',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: (info) => (
      <Link to={`/customers/${info.row.original.userId}`}>
        <Button variant="ghost" size="icon-xs">
          <Eye className="h-3 w-3" />
        </Button>
      </Link>
    ),
  }),
];

export function CustomersPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading } = useCustomers(page);

  const table = useReactTable({
    data: data?.content ? [...data.content] : [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clients</h1>

      <Card>
        <CardHeader />
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
                  <p className="text-center text-muted-foreground py-8">Aucun client trouve</p>
                )}
              </div>

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.number + 1} sur {data.totalPages} ({data.totalElements} clients)
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
