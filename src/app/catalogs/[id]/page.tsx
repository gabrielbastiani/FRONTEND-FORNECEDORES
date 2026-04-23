'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  Package, Search, BookOpen, Loader2, AlertCircle,
  Tag, Barcode, Ruler, DollarSign, Building2, FileText,
  ImageIcon, Pencil, Trash2, Plus, ChevronLeft, ChevronRight,
  ExternalLink, Upload, MessageCircle, CheckSquare, Square,
  X as XIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label }    from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductImage } from '@/components/ui/ProductImage';
import { useCatalog, useLinkSupplier, useDeleteCatalog } from '@/hooks/useCatalogs';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useStore } from '@/hooks/useStore';
import {
  useUpdateProduct, useDeleteProduct, useBulkDeleteProducts,
  useAddProductImage, useUpdateProductImage, useDeleteProductImage,
} from '@/hooks/useProducts';
import {
  formatFileSize, formatDate, formatProcessingTime,
  formatPrice, getStatusColor, getStatusLabel,
} from '@/lib/utils';
import { Product, Pagination } from '@/types';

const LIMIT = 20;

export default function CatalogDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedIds, setSelectedIds]       = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode]   = useState(false);

  const { data, isLoading }             = useCatalog(id, page, LIMIT);
  const { data: suppliersData }         = useSuppliers();
  const { data: storeData }             = useStore();
  const linkSupplier    = useLinkSupplier();
  const deleteCatalog   = useDeleteCatalog();
  const updateProduct   = useUpdateProduct();
  const deleteProduct   = useDeleteProduct();
  const bulkDelete      = useBulkDeleteProducts();
  const addImage        = useAddProductImage();
  const updateImage     = useUpdateProductImage();
  const deleteImage     = useDeleteProductImage();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editProduct,     setEditProduct]     = useState<Product | null>(null);
  const [deleteConfirm,   setDeleteConfirm]   = useState<Product | null>(null);
  const [deleteCatalogConfirm, setDeleteCatalogConfirm] = useState(false);
  const [bulkDeleteConfirm,    setBulkDeleteConfirm]    = useState(false);

  const catalog   = data?.data;
  const suppliers = suppliersData?.data ?? [];
  const store     = storeData?.data;
  const pagination = catalog?._pagination as Pagination | undefined;

  const categories = Array.from(
    new Set(
      (catalog?.products ?? [])
        .map((p) => p.category)
        .filter((c): c is string => !!c)
    )
  );

  const products = (catalog?.products ?? []).filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.title.toLowerCase().includes(q) ||
      (p.sku?.toLowerCase().includes(q) ?? false) ||
      (p.eanCode?.includes(search) ?? false);
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // ── WhatsApp ──────────────────────────────────────────────
  function buildWhatsAppUrl(product: Product): string | null {
    const supplierPhone = catalog?.supplier?.phone ?? catalog?.supplier?.whatsapp;
    if (!supplierPhone) return null;

    const phone = supplierPhone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;

    const ownerName  = store?.ownerName ?? store?.name ?? 'Comprador';
    const storeName  = store?.name ?? 'nossa loja';
    const supplierName = catalog?.supplier?.name ?? 'fornecedor';

    const msg = `Olá, me chamo ${ownerName}, falo da loja ${storeName}, tudo bem? Estamos interessados em saber o valor mínimo de pedido conforme as políticas de compras da ${supplierName}, pois temos interesse em adquirir seu produto "${product.title}".`;

    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
  }

  // ── Seleção em massa ──────────────────────────────────────
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  function cancelSelection() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  // ── PDF URL ───────────────────────────────────────────────
  function getPdfUrl(): string {
    const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api')
      .replace(/\/api\/?$/, '');
    if (!catalog?.filePath) return '';
    const normalized = catalog.filePath.replace(/\\/g, '/');
    const match      = normalized.match(/uploads\/.+/);
    return match ? `${BASE}/${match[0]}` : '';
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  if (!catalog) return null;

  const isProcessing =
    catalog.status === 'PENDING' || catalog.status === 'PROCESSING';

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
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
                  {catalog.processingTimeMs
                    ? ` · ${formatProcessingTime(catalog.processingTimeMs)}`
                    : ''}
                  {' · '}{formatDate(catalog.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {getPdfUrl() && (
                <a href={getPdfUrl()} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Ver PDF
                  </Button>
                </a>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteCatalogConfirm(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Deletar catálogo
              </Button>
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

          {/* Fornecedor */}
          {catalog.supplier ? (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Fornecedor:</span>
              <span className="font-medium">{catalog.supplier.name}</span>
              {catalog.supplier.phone && (
                <span className="text-xs text-muted-foreground">
                  · {catalog.supplier.phone}
                </span>
              )}
            </div>
          ) : catalog.status === 'COMPLETED' && suppliers.length > 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-dashed p-3">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="flex-1 text-sm text-muted-foreground">
                Vincular fornecedor
              </p>
              <Select
                onValueChange={(supplierId) =>
                  linkSupplier.mutate({ catalogId: catalog.id, supplierId })
                }
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* ── Stats ──────────────────────────────────────────── */}
      {catalog._stats && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Total',        value: catalog._stats.totalProducts,   icon: Package    },
            { label: 'Com EAN',       value: catalog._stats.withEan,         icon: Barcode    },
            { label: 'Com preço',     value: catalog._stats.withPrice,       icon: DollarSign },
            { label: 'Com descrição', value: catalog._stats.withDescription, icon: FileText   },
            { label: 'Com dimensões', value: catalog._stats.withDimensions,  icon: Ruler      },
            { label: 'Com imagem',    value: catalog._stats.withImage,       icon: ImageIcon  },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <s.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Toolbar de produtos ────────────────────────────── */}
      {catalog.status === 'COMPLETED' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          {categories.length > 0 && (
            <Select
              value={categoryFilter}
              onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Seleção em massa */}
          {!selectionMode ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectionMode(true)}
            >
              <CheckSquare className="mr-1.5 h-4 w-4" />
              Selecionar
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
              >
              {selectedIds.size === products.length ? 'Desmarcar todos' : 'Selecionar todos'}
              </Button>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteConfirm(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Deletar ({selectedIds.size})
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelSelection}
              >
                <XIcon className="mr-1.5 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}

          {pagination && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} produto(s)
            </p>
          )}
        </div>
      )}

      {/* ── Grid de produtos ───────────────────────────────── */}
      {catalog.status === 'COMPLETED' && products.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <Package className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <p>Nenhum produto encontrado</p>
        </div>
      )}

      {catalog.status === 'COMPLETED' && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => {
            const isSelected = selectedIds.has(product.id);
            const whatsappUrl = buildWhatsAppUrl(product);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
              >
                <Card
                  className={`overflow-hidden transition-all hover:shadow-md ${
                    isSelected
                      ? 'ring-2 ring-primary'
                      : 'hover:ring-1 hover:ring-primary/30'
                  }`}
                >
                  {/* Imagem */}
                  <div
                    className="relative flex h-44 cursor-pointer items-center justify-center bg-muted/30"
                    onClick={() => {
                      if (selectionMode) {
                        toggleSelect(product.id);
                      } else {
                        setSelectedProduct(product);
                      }
                    }}
                  >
                    <ProductImage
                      imagePath={product.images?.[0]?.imagePath ?? null}
                      alt={product.title}
                      className="h-full w-full object-contain p-2"
                    />

                    {/* Checkbox de seleção */}
                    {selectionMode && (
                      <div className="absolute left-2 top-2">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-primary drop-shadow" />
                        ) : (
                          <Square className="h-5 w-5 text-white drop-shadow" />
                        )}
                      </div>
                    )}

                    {product.pageNumber && (
                      <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                        Pág. {product.pageNumber}
                      </span>
                    )}
                  </div>

                  <CardContent className="p-3">
                    <p
                      className="line-clamp-2 cursor-pointer text-sm font-medium leading-tight"
                      onClick={() => {
                        if (selectionMode) {
                          toggleSelect(product.id);
                        } else {
                          setSelectedProduct(product);
                        }
                      }}
                    >
                      {product.title}
                    </p>

                    <div className="mt-2 space-y-1">
                      {product.sku && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3 shrink-0" />
                          {product.sku}
                        </p>
                      )}
                      {product.eanCode && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Barcode className="h-3 w-3 shrink-0" />
                          {product.eanCode}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-1">
                      {product.price != null ? (
                        <span className="text-sm font-semibold text-primary">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem preço
                        </span>
                      )}

                      {!selectionMode && (
                        <div className="flex items-center gap-1">
                          {/* WhatsApp */}
                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Contatar fornecedor via WhatsApp"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-600 hover:text-green-700"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                          {/* Editar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditProduct(product)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {/* Deletar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(product)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Paginação ──────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Modal: Detalhes do produto ──────────────────────── */}
      <ProductDetailDialog
        product={selectedProduct}
        store={store ?? null}
        supplierPhone={
          catalog?.supplier?.phone ??
          catalog?.supplier?.whatsapp ??
          null
        }
        supplierName={catalog?.supplier?.name ?? null}
        onClose={() => setSelectedProduct(null)}
        onEdit={(p) => {
          setSelectedProduct(null);
          setEditProduct(p);
        }}
        onAddImage={async (productId, file) => {
          await addImage.mutateAsync({ productId, file });
        }}
        onUpdateImage={async (imageId, file) => {
          await updateImage.mutateAsync({ imageId, file });
        }}
        onDeleteImage={async (imageId) => {
          await deleteImage.mutateAsync(imageId);
        }}
      />

      {/* ── Modal: Editar produto ───────────────────────────── */}
      <ProductEditDialog
        product={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={async (data) => {
          if (!editProduct) return;
          await updateProduct.mutateAsync({ id: editProduct.id, data });
          setEditProduct(null);
        }}
        saving={updateProduct.isPending}
      />

      {/* ── Confirm: Deletar produto individual ─────────────── */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar produto?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto{' '}
              <strong>&quot;{deleteConfirm?.title}&quot;</strong> e todas
              as suas imagens serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteConfirm) return;
                await deleteProduct.mutateAsync(deleteConfirm.id);
                setDeleteConfirm(null);
              }}
            >
              {deleteProduct.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Deletar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Confirm: Deletar em massa ───────────────────────── */}
      <AlertDialog
        open={bulkDeleteConfirm}
        onOpenChange={setBulkDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Deletar {selectedIds.size} produto(s)?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Todos os produtos selecionados e suas imagens serão removidos
              permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await bulkDelete.mutateAsync(Array.from(selectedIds));
                setBulkDeleteConfirm(false);
                cancelSelection();
              }}
            >
              {bulkDelete.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Deletar ${selectedIds.size} produto(s)`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Confirm: Deletar catálogo ───────────────────────── */}
      <AlertDialog
        open={deleteCatalogConfirm}
        onOpenChange={setDeleteCatalogConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar catálogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os produtos, imagens e o arquivo PDF serão removidos
              permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await deleteCatalog.mutateAsync(catalog.id);
                router.push('/catalogs');
              }}
            >
              {deleteCatalog.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Deletar catálogo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Modal: Detalhes do produto com WhatsApp
// ────────────────────────────────────────────────────────────────
interface ProductDetailDialogProps {
  product:       Product | null;
  store:         { name: string; ownerName?: string | null } | null;
  supplierPhone: string | null;
  supplierName:  string | null;
  onClose:       () => void;
  onEdit:        (p: Product) => void;
  onAddImage:    (productId: string, file: File) => Promise<void>;
  onUpdateImage: (imageId: string, file: File) => Promise<void>;
  onDeleteImage: (imageId: string) => Promise<void>;
}

function ProductDetailDialog({
  product,
  store,
  supplierPhone,
  supplierName,
  onClose,
  onEdit,
  onAddImage,
  onUpdateImage,
  onDeleteImage,
}: ProductDetailDialogProps) {
  const [uploading, setUploading] = useState(false);

  const onDropNew = useCallback(
    async (files: File[]) => {
      if (!product || !files[0]) return;
      setUploading(true);
      try {
        await onAddImage(product.id, files[0]);
      } finally {
        setUploading(false);
      }
    },
    [product, onAddImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:         { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles:       1,
    disabled:       uploading,
    onDropAccepted: onDropNew,
  });

  if (!product) return null;

  // Monta URL do WhatsApp
  const whatsappUrl = (() => {
    if (!supplierPhone) return null;
    const phone     = supplierPhone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const ownerName = store?.ownerName ?? store?.name ?? 'Comprador';
    const storeName = store?.name ?? 'nossa loja';
    const supplier  = supplierName ?? 'fornecedor';
    const msg = `Olá, me chamo ${ownerName}, falo da loja ${storeName}, tudo bem? Estamos interessados em saber o valor mínimo de pedido conforme as políticas de compras da ${supplier}, pois temos interesse em adquirir seu produto "${product.title}".`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
  })();

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 leading-tight">
            {product.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Imagens */}
          <div>
            <p className="mb-2 text-sm font-medium">
              Imagens ({product.images?.length ?? 0})
            </p>
            <div className="flex flex-wrap gap-3">
              {(product.images ?? []).map((img) => (
                <ImageThumb
                  key={img.id}
                  img={img}
                  productTitle={product.title}
                  onUpdate={onUpdateImage}
                  onDelete={onDeleteImage}
                />
              ))}

              {/* Adicionar imagem */}
              <div
                {...getRootProps()}
                className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed text-xs text-muted-foreground transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="mb-1 h-5 w-5" />
                    <span>Adicionar</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dados do produto */}
          <div className="grid gap-3 sm:grid-cols-2">
            {product.sku && (
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="font-mono text-sm font-medium">{product.sku}</p>
              </div>
            )}
            {product.eanCode && (
              <div>
                <p className="text-xs text-muted-foreground">EAN</p>
                <p className="font-mono text-sm font-medium">
                  {product.eanCode}
                </p>
              </div>
            )}
            {product.brand && (
              <div>
                <p className="text-xs text-muted-foreground">Marca</p>
                <p className="text-sm font-medium">{product.brand}</p>
              </div>
            )}
            {product.category && (
              <div>
                <p className="text-xs text-muted-foreground">Categoria</p>
                <p className="text-sm font-medium">{product.category}</p>
              </div>
            )}
            {product.unit && (
              <div>
                <p className="text-xs text-muted-foreground">Unidade</p>
                <p className="text-sm font-medium">{product.unit}</p>
              </div>
            )}
            {product.price != null && (
              <div>
                <p className="text-xs text-muted-foreground">Preço</p>
                <p className="text-sm font-semibold text-primary">
                  {formatPrice(product.price, product.currency)}
                  {product.priceType && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({product.priceType})
                    </span>
                  )}
                </p>
              </div>
            )}
            {product.pageNumber && (
              <div>
                <p className="text-xs text-muted-foreground">Página</p>
                <p className="text-sm font-medium">{product.pageNumber}</p>
              </div>
            )}
          </div>

          {/* Dimensões */}
          {product.dimensions && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Ruler className="h-3.5 w-3.5" />
                Dimensões / Especificações
              </p>
              <p className="text-sm leading-relaxed">{product.dimensions}</p>
            </div>
          )}

          {/* Descrição */}
          {product.description && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                Descrição
              </p>
              <p className="text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Aviso quando não há telefone do fornecedor */}
          {!supplierPhone && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Para habilitar o contato via WhatsApp, cadastre o telefone do
                fornecedor vinculado a este catálogo.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>

          {/* WhatsApp */}
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" />
                Contatar via WhatsApp
              </Button>
            </a>
          )}

          <Button onClick={() => onEdit(product)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Editar produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────
// Thumb de imagem com substituição e remoção
// ────────────────────────────────────────────────────────────────
function ImageThumb({
  img,
  productTitle,
  onUpdate,
  onDelete,
}: {
  img:          { id: string; imagePath: string; isPrimary: boolean };
  productTitle: string;
  onUpdate:     (imageId: string, file: File) => Promise<void>;
  onDelete:     (imageId: string) => Promise<void>;
}) {
  const [editing,  setEditing]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onDropReplace = useCallback(
    async (files: File[]) => {
      if (!files[0]) return;
      setEditing(true);
      try {
        await onUpdate(img.id, files[0]);
      } finally {
        setEditing(false);
      }
    },
    [img.id, onUpdate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:         { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles:       1,
    disabled:       editing,
    onDropAccepted: onDropReplace,
  });

  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-xl border bg-muted/30">
      <ProductImage
        imagePath={img.imagePath}
        alt={productTitle}
        className="h-full w-full object-contain"
      />

      {img.isPrimary && (
        <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
          Principal
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between from-black/70 to-transparent px-1.5 py-1.5">
        {/* Substituir */}
        <button
          type="button"
          title="Substituir imagem"
          className="flex items-center gap-1 text-[10px] text-white/90 hover:text-white"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {editing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          Trocar
        </button>

        {/* Remover */}
        <button
          type="button"
          title="Remover imagem"
          className="flex items-center gap-0.5 text-[10px] text-red-300 hover:text-red-200"
          onClick={async () => {
            setDeleting(true);
            try {
              await onDelete(img.id);
            } finally {
              setDeleting(false);
            }
          }}
        >
          {deleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      </div>

      {isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-[10px] text-white">
          Solte aqui
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Modal de edição completa de produto
// ────────────────────────────────────────────────────────────────
function ProductEditDialog({
  product,
  onClose,
  onSave,
  saving,
}: {
  product: Product | null;
  onClose: () => void;
  onSave:  (data: Partial<Product>) => Promise<void>;
  saving:  boolean;
}) {
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setForm({
        title:       product.title,
        description: product.description  ?? '',
        dimensions:  product.dimensions   ?? '',
        eanCode:     product.eanCode      ?? '',
        sku:         product.sku          ?? '',
        brand:       product.brand        ?? '',
        category:    product.category     ?? '',
        unit:        product.unit         ?? '',
        price:       product.price        ?? null,
        priceType:   product.priceType    ?? '',
        currency:    product.currency     ?? 'BRL',
        pageNumber:  product.pageNumber   ?? null,
      });
    } else {
      setForm({});
    }
  }, [product]);

  if (!product) return null;

  const handleChange = (
    field: keyof Product,
    value: string | number | null
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave({
      ...form,
      description: (form.description as string)?.trim() || null,
      dimensions:  (form.dimensions  as string)?.trim() || null,
      eanCode:     (form.eanCode     as string)?.trim() || null,
      sku:         (form.sku         as string)?.trim() || null,
      brand:       (form.brand       as string)?.trim() || null,
      category:    (form.category    as string)?.trim() || null,
      unit:        (form.unit        as string)?.trim() || null,
      priceType:   (form.priceType   as string)?.trim() || null,
      price:
        form.price === null || form.price === '' || form.price === undefined
          ? null
          : Number(form.price),
      pageNumber:
        form.pageNumber === null || form.pageNumber === '' || form.pageNumber === undefined
          ? null
          : Number(form.pageNumber),
    });
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar produto</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Título *</Label>
            <Input
              value={form.title ?? ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>SKU</Label>
              <Input
                value={form.sku ?? ''}
                onChange={(e) => handleChange('sku', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>EAN</Label>
              <Input
                value={form.eanCode ?? ''}
                onChange={(e) => handleChange('eanCode', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Marca</Label>
              <Input
                value={form.brand ?? ''}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <Input
                value={form.category ?? ''}
                onChange={(e) => handleChange('category', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Unidade de venda</Label>
              <Input
                value={form.unit ?? ''}
                onChange={(e) => handleChange('unit', e.target.value)}
                placeholder="UN, CX, PCT..."
              />
            </div>
            <div className="space-y-1">
              <Label>Página</Label>
              <Input
                type="number"
                value={form.pageNumber ?? ''}
                onChange={(e) =>
                  handleChange('pageNumber', e.target.value || null)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Preço</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.price ?? ''}
                onChange={(e) =>
                  handleChange('price', e.target.value === '' ? null : e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Tipo de preço</Label>
              <Input
                value={form.priceType ?? ''}
                onChange={(e) => handleChange('priceType', e.target.value)}
                placeholder="varejo, atacado..."
              />
            </div>
            <div className="space-y-1">
              <Label>Moeda</Label>
              <Input
                value={form.currency ?? 'BRL'}
                onChange={(e) => handleChange('currency', e.target.value)}
                maxLength={3}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Dimensões / Especificações</Label>
            <Textarea
              rows={2}
              value={form.dimensions ?? ''}
              onChange={(e) => handleChange('dimensions', e.target.value)}
              placeholder="Ex: 255mm x 29mm, diâmetro 11mm"
            />
          </div>

          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea
              rows={4}
              value={form.description ?? ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Características, usos, materiais..."
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !form.title?.trim()}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}