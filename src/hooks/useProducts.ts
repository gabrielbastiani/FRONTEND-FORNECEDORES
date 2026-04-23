import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { toast } from 'sonner';

export function useProducts(params: {
  catalogId?: string;
  page?:      number;
  limit?:     number;
  search?:    string;
  category?:  string;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn:  () => productsApi.list(params),
    enabled:  !!params.catalogId,
    staleTime: 10_000,
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Produto atualizado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Produto deletado!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useBulkDeleteProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => productsApi.bulkDelete(ids),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success(
        `${data.data?.deletedCount ?? 0} produto(s) deletado(s)!`
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAddProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      productsApi.addImage(productId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Imagem adicionada!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, file }: { imageId: string; file: File }) =>
      productsApi.updateImage(imageId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Imagem atualizada!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(imageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('Imagem removida!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}