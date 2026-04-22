import { useState } from 'react';
import { uploadApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { UploadResponse } from '@/types';
import { toast } from 'sonner';

export function useUpload() {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const response = await uploadApi.uploadPDF(file, setProgress);
      setResult(response.data);
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

  return { upload, progress, uploading, result };
}