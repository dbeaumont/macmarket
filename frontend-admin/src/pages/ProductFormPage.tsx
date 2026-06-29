import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, createProduct, updateProduct } from '@/lib/api';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'MACBOOK_AIR',
  'MACBOOK_PRO',
  'IMAC',
  'MAC_MINI',
  'MAC_STUDIO',
  'MAC_PRO',
] as const;

type Category = typeof CATEGORIES[number];

interface SpecEntry {
  readonly key: string;
  readonly value: string;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function ProductFormPage() {
  const { id } = useParams<{ readonly id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('MACBOOK_AIR');
  const [imageUrl, setImageUrl] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [specs, setSpecs] = useState<readonly SpecEntry[]>([]);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  const { data: productsPage } = useQuery({
    queryKey: ['product-edit', id],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('size', '1000');
      return fetchProducts(params);
    },
    enabled: isEdit,
  });

  const existingProduct: Product | undefined = productsPage?.content.find((p) => p.id === id);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setSlug(existingProduct.slug);
      setDescription(existingProduct.description);
      setShortDesc(existingProduct.shortDesc);
      setPrice(String(existingProduct.price));
      setCategory(existingProduct.category as Category);
      setImageUrl(existingProduct.imageUrl);
      setStockQuantity(String(existingProduct.stockQuantity));
      const specEntries: readonly SpecEntry[] = Object.entries(existingProduct.specs).map(
        ([key, value]) => ({ key, value })
      );
      setSpecs(specEntries);
      setAutoSlug(false);
    }
  }, [existingProduct]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/inventory');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductRequest) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/inventory');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  function handleNameChange(newName: string): void {
    setName(newName);
    if (autoSlug) {
      setSlug(toSlug(newName));
    }
  }

  function handleAddSpec(): void {
    setSpecs([...specs, { key: '', value: '' }]);
  }

  function handleRemoveSpec(index: number): void {
    setSpecs([...specs.slice(0, index), ...specs.slice(index + 1)]);
  }

  function handleSpecChange(index: number, field: 'key' | 'value', newValue: string): void {
    setSpecs(
      specs.map((entry, i) =>
        i === index ? { ...entry, [field]: newValue } : entry
      )
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const specsRecord: Record<string, string> = {};
    for (const entry of specs) {
      if (entry.key.trim()) {
        specsRecord[entry.key.trim()] = entry.value;
      }
    }

    const data = {
      name,
      slug,
      description,
      shortDesc,
      price: Number(price),
      category,
      imageUrl,
      stockQuantity: Number(stockQuantity),
      specs: specsRecord,
    };

    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations generales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description courte</label>
                <input
                  type="text"
                  required
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prix (EUR)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de l'image</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantite en stock</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Specifications</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddSpec}>
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {specs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune specification ajoutee</p>
              ) : (
                <div className="space-y-2">
                  {specs.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Cle"
                        value={entry.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="text"
                        placeholder="Valeur"
                        value={entry.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveSpec(index)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Enregistrement...'
              : isEdit
                ? 'Mettre a jour'
                : 'Creer le produit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
