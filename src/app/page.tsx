'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Building2, Package, Upload,
  CheckCircle2, Clock, AlertCircle, Loader2,
  TrendingUp, ArrowRight,
} from 'lucide-react';
import { useCatalogs } from '@/hooks/useCatalogs';
import { useSuppliers } from '@/hooks/useSuppliers';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatFileSize, formatProcessingTime, formatRelativeDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function DashboardPage() {
  const { data: catalogsData, isLoading: catalogsLoading } = useCatalogs();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();

  const catalogs  = catalogsData?.data  ?? [];
  const suppliers = suppliersData?.data ?? [];

  const stats = useMemo(() => {
    const completed  = catalogs.filter((c) => c.status === 'COMPLETED');
    const processing = catalogs.filter(
      (c) => c.status === 'PROCESSING' || c.status === 'PENDING'
    );
    const failed     = catalogs.filter((c) => c.status === 'FAILED');
    const totalProds = completed.reduce(
      (acc, c) => acc + (c._count?.products ?? 0), 0
    );

    return {
      totalCatalogs:    catalogs.length,
      completedCount:   completed.length,
      processingCount:  processing.length,
      failedCount:      failed.length,
      totalSuppliers:   suppliers.length,
      totalProducts:    totalProds,
    };
  }, [catalogs, suppliers]);

  // Dados para o gráfico
  const chartData = useMemo(() => {
    return catalogs
      .filter((c) => c.status === 'COMPLETED' && c._count?.products)
      .slice(0, 8)
      .map((c) => ({
        name: c.originalFilename.replace('.pdf', '').substring(0, 15),
        produtos: c._count?.products ?? 0,
      }))
      .reverse();
  }, [catalogs]);

  const statCards = [
    {
      label: 'Catálogos',
      value: stats.totalCatalogs,
      icon: BookOpen,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      href: '/catalogs',
    },
    {
      label: 'Produtos',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      href: '/catalogs',
    },
    {
      label: 'Fornecedores',
      value: stats.totalSuppliers,
      icon: Building2,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      href: '/suppliers',
    },
    {
      label: 'Processando',
      value: stats.processingCount,
      icon: Loader2,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      href: '/catalogs',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={card.href}>
              <Card className="transition-colors hover:bg-accent/30">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    {catalogsLoading || suppliersLoading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <p className="text-2xl font-bold">{card.value}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico */}
        {chartData.length > 0 && (
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Produtos por Catálogo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="produtos"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Status rápido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status dos Catálogos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: 'Concluídos',
                  value: stats.completedCount,
                  icon: CheckCircle2,
                  color: 'text-green-500',
                },
                {
                  label: 'Processando',
                  value: stats.processingCount,
                  icon: Clock,
                  color: 'text-yellow-500',
                },
                {
                  label: 'Com falha',
                  value: stats.failedCount,
                  icon: AlertCircle,
                  color: 'text-red-500',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    {item.label}
                  </div>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Catálogos recentes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Catálogos Recentes</CardTitle>
            <Link href="/catalogs">
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {catalogsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : catalogs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm">Nenhum catálogo ainda</p>
                <Link href="/upload">
                  <Button size="sm" className="mt-3">
                    <Upload className="mr-2 h-3 w-3" />
                    Fazer upload
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {catalogs.slice(0, 5).map((catalog) => (
                  <Link key={catalog.id} href={`/catalogs/${catalog.id}`}>
                    <div className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-accent/30">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {catalog.originalFilename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(catalog.fileSizeBytes)}
                            {catalog.processingTimeMs
                              ? ` · ${formatProcessingTime(catalog.processingTimeMs)}`
                              : ''}
                            {' · '}
                            {formatRelativeDate(catalog.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {catalog._count && (
                          <span className="text-xs text-muted-foreground">
                            {catalog._count.products} produtos
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(catalog.status)}`}
                        >
                          {getStatusLabel(catalog.status)}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}