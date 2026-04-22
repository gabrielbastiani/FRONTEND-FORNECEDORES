'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Package,
  Search,
  BookOpen,
  Loader2,
  AlertCircle,
  Tag,
  Barcode,
  Ruler,
  DollarSign,
  Building2,
  FileText,
  ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCatalog, useLinkSupplier } from '@/hooks/useCatalogs';
import { useSuppliers } from '@/hooks/useSuppliers';
import {
  formatFileSize,
  formatDate,
  formatProcessingTime,
  formatPrice,
  getStatusColor,
  getStatusLabel,
  getImageUrl,
} from '@/lib/utils';
import { Product } from '@/types';

export default function CatalogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useCatalog(id);
  const { data: suppliersData } = useSuppliers();
  const linkSupplier = useLinkSupplier();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const catalog = data?.data;
  const suppliers = suppliersData?.data ?? [];

  const categories = Array.from(
    new Set(
      catalog?.products
        .map((p) => p.category)
        .filter(Boolean) as string[]
    )
  );

  const products = (catalog?.products ?? []).filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.eanCode?.includes(search);
    const matchCategory =
      categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!catalog) return null;

  const isProcessing =
    catalog.status === 'PENDING' || catalog.status === 'PROCESSING';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold leading-tight">
                  {catalog.originalFilename}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatFileSize(catalog.fileSizeBytes)}
                  {catalog.pageCount ? ` · ${catalog.pageCount} páginas` : ''}
                  {catalog.extractionMethod
                    ? ` · método: ${catalog.extractionMethod}`
                    : ''}
                  {' · '}
                  {formatDate(catalog.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={`${getStatusColor(catalog.status)} text-sm`}
              >
                {isProcessing && (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                )}
                {getStatusLabel(catalog.status)}
              </Badge>
            </div>
          </div>

          {/* Vincular fornecedor */}
          {!catalog.supplier && catalog.status === 'COMPLETED' && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="flex-1 text-sm text-muted-foreground">
                Vincular fornecedor
              </p>
              <Select
                onValueChange={(supplierId) =>
                  linkSupplier.mutate({ catalogId: catalog.id, supplierId })
                }
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Selecionar fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {catalog.supplier && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Fornecedor:</span>
              <span className="font-medium">{catalog.supplier.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing */}
      {isProcessing && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="flex items-center gap-4 p-5">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div>
              <p className="font-medium">Processando catálogo...</p>
              <p className="text-sm text-muted-foreground">
                A IA está analisando as páginas. Isso pode levar alguns
                minutos dependendo do tamanho do PDF.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failed */}
      {catalog.status === 'FAILED' && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="flex items-center gap-3 p-5">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-600">Falha no processamento</p>
              <p className="text-sm text-muted-foreground">
                {catalog.errorMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {catalog._stats && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            {
              label: 'Total',
              value: catalog._stats.totalProducts,
              icon: Package,
            },
            {
              label: 'Com EAN',
              value: catalog._stats.withEan,
              icon: Barcode,
            },
            {
              label: 'Com preço',
              value: catalog._stats.withPrice,
              icon: DollarSign,
            },
            {
              label: 'Com descrição',
              value: catalog._stats.withDescription,
              icon: FileText,
            },
            {
              label: 'Com dimensões',
              value: catalog._stats.withDimensions,
              icon: Ruler,
            },
            {
              label: 'Com imagem',
              value: catalog._stats.withImage,
              icon: ImageIcon,
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">


                <stat.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filtros de produtos */}
      {catalog.status === 'COMPLETED' && catalog.products.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, SKU ou EAN..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {categories.length > 0 && (
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-muted-foreground">
            {products.length} produto(s)
          </p>
        </div>
      )}

      {/* Grid de produtos */}
      {catalog.status === 'COMPLETED' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <Card className="overflow-hidden transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30">
                {/* Imagem do produto */}
                <div className="relative flex h-44 items-center justify-center bg-muted/30">
                  {product.images?.[0] ? (
                    <Image
                      src={getImageUrl(product.images[0].imagePath)}
                      alt={product.title}
                      fill
                      className="object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/placeholder-product.png';
                      }}
                    />
                  ) : (
                    <Package className="h-16 w-16 text-muted-foreground/20" />
                  )}
                  {product.pageNumber && (
                    <span className="absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                      Pág. {product.pageNumber}
                    </span>
                  )}
                </div>

                <CardContent className="p-3">
                  <p className="line-clamp-2 text-sm font-medium leading-tight">
                    {product.title}
                  </p>

                  <div className="mt-2 space-y-1">
                    {product.sku && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        {product.sku}
                      </p>
                    )}
                    {product.eanCode && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Barcode className="h-3 w-3" />
                        {product.eanCode}
                      </p>
                    )}
                    {product.dimensions && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Ruler className="h-3 w-3" />
                        <span className="line-clamp-1">{product.dimensions}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {product.price ? (
                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Sem preço
                      </span>
                    )}
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de detalhes do produto */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="leading-tight">
                  {selectedProduct.title}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Imagem */}
                <div className="flex h-56 items-center justify-center rounded-xl bg-muted/30">
                  {selectedProduct.images?.[0] ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={getImageUrl(selectedProduct.images[0].imagePath)}
                        alt={selectedProduct.title}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                  ) : (
                    <Package className="h-20 w-20 text-muted-foreground/20" />
                  )}
                </div>

                {/* Dados */}
                <div className="space-y-3">
                  {selectedProduct.sku && (
                    <div>
                      <p className="text-xs text-muted-foreground">SKU</p>
                      <p className="font-mono text-sm font-medium">
                        {selectedProduct.sku}
                      </p>
                    </div>
                  )}
                  {selectedProduct.eanCode && (
                    <div>
                      <p className="text-xs text-muted-foreground">EAN</p>
                      <p className="font-mono text-sm font-medium">
                        {selectedProduct.eanCode}
                      </p>
                    </div>
                  )}
                  {selectedProduct.brand && (
                    <div>
                      <p className="text-xs text-muted-foreground">Marca</p>
                      <p className="text-sm font-medium">
                        {selectedProduct.brand}
                      </p>
                    </div>
                  )}
                  {selectedProduct.category && (
                    <div>
                      <p className="text-xs text-muted-foreground">Categoria</p>
                      <p className="text-sm font-medium">
                        {selectedProduct.category}
                      </p>
                    </div>
                  )}
                  {selectedProduct.unit && (
                    <div>
                      <p className="text-xs text-muted-foreground">Unidade</p>
                      <p className="text-sm font-medium">
                        {selectedProduct.unit}
                      </p>
                    </div>
                  )}
                  {selectedProduct.price && (
                    <div>
                      <p className="text-xs text-muted-foreground">Preço</p>
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(
                          selectedProduct.price,
                          selectedProduct.currency
                        )}
                        {selectedProduct.priceType && (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({selectedProduct.priceType})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedProduct.pageNumber && (
                    <div>
                      <p className="text-xs text-muted-foreground">Página</p>
                      <p className="text-sm font-medium">
                        {selectedProduct.pageNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dimensões */}
              {selectedProduct.dimensions && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Ruler className="h-3.5 w-3.5" />
                    Dimensões / Especificações
                  </p>
                  <p className="text-sm">{selectedProduct.dimensions}</p>
                </div>
              )}

              {/* Descrição */}
              {selectedProduct.description && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Descrição
                  </p>
                  <p className="text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}