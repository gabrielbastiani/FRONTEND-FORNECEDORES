import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { suppliersApi } from '@/lib/api';
import { Supplier } from '@/types';
import { toast } from 'sonner';

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.list(),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Supplier>) => suppliersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornecedor criado com sucesso!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      suppliersApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['suppliers', id] });
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornecedor atualizado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suppliersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornecedor removido!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}