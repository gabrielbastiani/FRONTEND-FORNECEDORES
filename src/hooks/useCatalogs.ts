import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useCatalogs() {
  return useQuery({
    queryKey: ['catalogs'],
    queryFn:  () => catalogsApi.list(),
    refetchInterval: (query) => {
      const catalogs = query.state.data?.data ?? [];
      const hasActive = catalogs.some(
        (c) => c.status === 'PENDING' || c.status === 'PROCESSING'
      );
      return hasActive ? 5000 : false;
    },
    staleTime: 10_000,
  });
}

export function useCatalog(id: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['catalogs', id, page, limit],
    queryFn:  () => catalogsApi.getById(id, page, limit),
    enabled:  !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 3000 : false;
    },
    staleTime: 5_000,
  });
}

export function useLinkSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ catalogId, supplierId }: {
      catalogId: string;
      supplierId: string;
    }) => catalogsApi.linkSupplier(catalogId, supplierId),
    onSuccess: (_, { catalogId }) => {
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      qc.invalidateQueries({ queryKey: ['catalogs', catalogId] });
      toast.success('Fornecedor vinculado com sucesso!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Catálogo deletado com sucesso!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}