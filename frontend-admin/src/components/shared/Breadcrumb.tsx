import { Link, useLocation } from 'react-router-dom';

const PATH_LABELS: Readonly<Record<string, string>> = {
  dashboard: 'Dashboard',
  inventory: 'Inventaire',
  orders: 'Commandes',
  customers: 'Clients',
  stats: 'Statistiques',
  revenue: 'Revenus',
  products: 'Produits',
  new: 'Nouveau',
  edit: 'Modifier',
} as const;

interface BreadcrumbSegment {
  readonly label: string;
  readonly path: string;
}

function buildSegments(pathname: string): readonly BreadcrumbSegment[] {
  const parts = pathname.split('/').filter(Boolean);

  return parts.reduce<readonly BreadcrumbSegment[]>((segments, part, i) => {
    const path = '/' + parts.slice(0, i + 1).join('/');
    const label = PATH_LABELS[part];

    return label !== undefined ? [...segments, { label, path }] : segments;
  }, []);
}

export function Breadcrumb() {
  const location = useLocation();
  const segments = buildSegments(location.pathname);

  if (segments.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Fil d'Ariane" className="mb-4">
      <ol className="flex items-center gap-1 text-sm text-muted-foreground">
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <li key={segment.path} className="flex items-center gap-1">
              {index > 0 && <span className="mx-1">/</span>}
              {isLast ? (
                <span className="font-medium text-foreground">{segment.label}</span>
              ) : (
                <Link
                  to={segment.path}
                  className="hover:text-foreground transition-colors"
                >
                  {segment.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
