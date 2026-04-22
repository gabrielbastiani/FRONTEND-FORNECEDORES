'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useCatalogs } from '@/hooks/useCatalogs';
import {
  formatFileSize,
  formatRelativeDate,
  formatProcessingTime,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils';
import { CatalogStatus } from '@/types';

export default function CatalogsPage() {
  const { data, isLoading, refetch } = useCatalogs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const catalogs = (data?.data ?? []).filter((c) => {
    const matchSearch = c.originalFilename
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar catálogos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PENDING">Pendente</SelectItem>
            <SelectItem value="PROCESSING">Processando</SelectItem>
            <SelectItem value="COMPLETED">Concluído</SelectItem>
            <SelectItem value="FAILED">Falhou</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Link href="/upload">
          <Button>Upload PDF</Button>
        </Link>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : catalogs.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <p className="text-lg">Nenhum catálogo encontrado</p>
          <Link href="/upload">
            <Button className="mt-4">Fazer upload</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {catalogs.map((catalog, i) => (
            <motion.div
              key={catalog.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/catalogs/${catalog.id}`}>
                <Card className="transition-colors hover:bg-accent/30">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium leading-tight">
                          {catalog.originalFilename}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatFileSize(catalog.fileSizeBytes)}
                          {catalog.pageCount
                            ? ` · ${catalog.pageCount} páginas`
                            : ''}
                          {catalog.supplier
                            ? ` · ${catalog.supplier.name}`
                            : ''}
                          {' · '}
                          {formatRelativeDate(catalog.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden text-right md:block">
                        <p className="text-sm font-medium">
                          {catalog._count?.products ?? 0} produtos
                        </p>
                        {catalog.processingTimeMs && (
                          <p className="text-xs text-muted-foreground">
                            {formatProcessingTime(catalog.processingTimeMs)}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(catalog.status)}
                      >
                        {getStatusLabel(catalog.status)}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}