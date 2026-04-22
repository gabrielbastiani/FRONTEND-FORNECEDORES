'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  Globe,
  MapPin,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSuppliers, useDeleteSupplier } from '@/hooks/useSuppliers';
import { Supplier } from '@/types';
import { SupplierFormDialog } from '@/components/suppliers/SupplierForm';

export default function SuppliersPage() {
  const { data, isLoading } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);

  const suppliers = (data?.data ?? []).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.cnpj?.includes(search) ||
      s.city?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (s: Supplier) => {
    setEditTarget(s);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedores..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <Building2 className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <p className="text-lg">Nenhum fornecedor encontrado</p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            Cadastrar fornecedor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {suppliers.map((supplier, i) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group relative overflow-hidden">
                  <CardContent className="p-4">
                    {/* Actions */}
                    <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(supplier)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Header */}
                    <div className="flex items-start gap-3 pr-16">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold leading-tight">
                          {supplier.name}
                        </p>
                        {supplier.cnpj && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            CNPJ: {supplier.cnpj}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="mt-3 space-y-1.5">
                      {supplier.email && (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{supplier.email}</span>
                        </p>
                      )}
                      {supplier.phone && (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {supplier.phone}
                        </p>
                      )}
                      {supplier.website && (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{supplier.website}</span>
                        </p>
                      )}
                      {(supplier.city || supplier.state) && (
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {[supplier.city, supplier.state]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Dialog */}
      <SupplierFormDialog
        open={formOpen}
        supplier={editTarget}
        onClose={handleCloseForm}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover fornecedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O fornecedor{' '}
              <strong>{deleteTarget?.name}</strong> será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteSupplier.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}