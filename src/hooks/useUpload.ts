import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { uploadApi } from '@/lib/api';
import { UploadResponse } from '@/types';
import { toast } from 'sonner';

export function useUpload() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const upload = async (file: File): Promise<UploadResponse> => {
    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const response = await uploadApi.uploadPDF(file, setProgress);

      if (!response.success || !response.data) {
        throw new Error('Resposta inválida do servidor');
      }

      setResult(response.data);
      // Invalida a lista de catálogos para aparecer o novo
      qc.invalidateQueries({ queryKey: ['catalogs'] });
      toast.success('PDF enviado! Processamento iniciado.');
      return response.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro no upload';
      toast.error(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setProgress(0);
    setResult(null);
  };

  return { upload, progress, uploading, result, reset };
}