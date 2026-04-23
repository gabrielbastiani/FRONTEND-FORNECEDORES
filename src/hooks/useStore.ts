import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/api';
import { Store } from '@/types';
import { toast } from 'sonner';

export function useStore() {
  return useQuery({
    queryKey: ['store'],
    queryFn:  () => storeApi.get(),
    staleTime: 60_000,
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Store>) => storeApi.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store'] });
      toast.success('Dados da loja atualizados!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUploadStoreLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => storeApi.uploadLogo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store'] });
      toast.success('Logo atualizada!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}