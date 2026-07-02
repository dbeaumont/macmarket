import { useCategories } from '@/hooks/use-products';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Plus récents' },
  { value: 'price,asc', label: 'Prix croissant' },
  { value: 'price,desc', label: 'Prix décroissant' },
  { value: 'name,asc', label: 'Nom A-Z' },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  MACBOOK_AIR: 'MacBook Air',
  MACBOOK_PRO: 'MacBook Pro',
  IMAC: 'iMac',
  MAC_MINI: 'Mac Mini',
  MAC_STUDIO: 'Mac Studio',
  MAC_PRO: 'Mac Pro',
};

interface Props {
  readonly search: string;
  readonly category: string;
  readonly sort: string;
  readonly onSearchChange: (v: string) => void;
  readonly onCategoryChange: (v: string) => void;
  readonly onSortChange: (v: string) => void;
  readonly onReset: () => void;
}

export function ProductFilters({ search, category, sort, onSearchChange, onCategoryChange, onSortChange, onReset }: Props) {
  const { data: categories } = useCategories();
  const hasFilters = search || category || sort !== 'createdAt,desc';

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un Mac..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' || !v ? '' : v)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Categorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les categories</SelectItem>
          {categories?.map((c) => (
            <SelectItem key={c.category} value={c.category}>
              {CATEGORY_LABELS[c.category] ?? c.category} ({c.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort} onValueChange={(v) => v && onSortChange(v)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Trier par">
            {SORT_OPTIONS.find((o) => o.value === sort.replace(';', ','))?.label ?? sort}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" /> Effacer
        </Button>
      )}
    </div>
  );
}
