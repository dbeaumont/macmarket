import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/use-products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ArrowRight } from 'lucide-react';

export function HomePage() {
  const params = new URLSearchParams({ size: '4', sort: 'createdAt,desc' });
  const { data } = useProducts(params);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Le meilleur du <span className="text-blue-400">Mac</span>,
            <br />au meilleur prix.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            MacBook Air, MacBook Pro, iMac, Mac Mini, Mac Studio, Mac Pro —
            decouvrez toute la gamme Apple et trouvez le Mac qui vous correspond.
          </p>
          <div className="mt-8">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-slate-100 transition-colors"
            >
              Voir le catalogue <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Nouveautes</h2>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data && <ProductGrid products={data.content} />}
      </section>
    </div>
  );
}
