import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, BarChart3, UserCheck, ClipboardList } from 'lucide-react';

const STATS_CARDS = [
  {
    title: 'Revenus',
    description: 'Analyse du chiffre d\'affaires, revenus par categorie et top produits',
    icon: TrendingUp,
    to: '/stats/revenue',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Produits',
    description: 'Top ventes, repartition par categorie et niveaux de stock',
    icon: BarChart3,
    to: '/stats/products',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Clients',
    description: 'Meilleurs clients par total depense',
    icon: UserCheck,
    to: '/stats/customers',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Commandes',
    description: 'Volume quotidien et repartition des statuts',
    icon: ClipboardList,
    to: '/stats/orders',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
] as const;

export function StatsOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistiques</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {STATS_CARDS.map((card) => (
          <Link key={card.to} to={card.to} className="group">
            <Card className="transition-shadow group-hover:shadow-md h-full">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription className="mt-1">{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-blue-600 group-hover:underline">
                  Voir les details
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
