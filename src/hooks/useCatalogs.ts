import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { catalogsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useCatalogs() {
  return useQuery({
    queryKey: ['catalogs'],
    queryFn: () => catalogsApi.list(),
    refetchInterval: (query) => {
      const catalogs = query.state.data?.data ?? [];
      const hasProcessing = catalogs.some(
        (c) => c.status === 'PENDING' || c.status === 'PROCESSING'
      );
      return hasProcessing ? 5000 : false;
    },
  });
}

export function useCatalog(id: string) {
  return useQuery({
    queryKey: ['catalogs', id],
    queryFn: () => catalogsApi.getById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 3000 : false;
    },
  });
}

export function useLinkSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      catalogId,
      supplierId,
    }: {
      catalogId: string;
      supplierId: string;
    }) => catalogsApi.linkSupplier(catalogId, supplierId),
    onSuccess: (_, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['catalogs', catalogId] });
      queryClient.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Fornecedor vinculado com sucesso!');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}