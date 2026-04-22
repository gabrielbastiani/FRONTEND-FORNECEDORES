'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import {
  Upload, FileText, X, Loader2,
  CheckCircle2, AlertCircle,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUpload } from '@/hooks/useUpload';
import { formatFileSize } from '@/lib/utils';

export default function UploadPage() {
  const { upload, progress, uploading, result } = useUpload();
  const [file, setFile]   = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    disabled: uploading,
    onDropAccepted: ([f]) => { setFile(f); setError(null); },
    onDropRejected: ([r]) => {
      const msg = r.errors[0]?.code === 'file-too-large'
        ? 'Arquivo muito grande. Máximo 100MB.'
        : 'Apenas arquivos PDF são aceitos.';
      setError(msg);
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    try {
      await upload(file);
    } catch {
      setError('Falha no upload. Tente novamente.');
    }
  };

  const handleReset = () => { setFile(null); setError(null); };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Upload de Catálogo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie um PDF para extração automática de produtos via IA.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Upload realizado!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Processamento iniciado. Acompanhe o status abaixo.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href={`/catalogs/${result.catalogId}`}>
                    <Button>Acompanhar processamento</Button>
                  </Link>
                  <Button variant="outline" onClick={handleReset}>
                    Novo upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive
                  ? 'Solte o arquivo aqui'
                  : 'Arraste um PDF ou clique para selecionar'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF até 100MB</p>
            </div>

            {file && !uploading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {uploading && (
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </CardContent>
              </Card>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" />Enviar PDF</>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          {[
            '1. Faça upload do catálogo PDF do fornecedor',
            '2. O sistema extrai texto e renderiza cada página',
            '3. GPT-4o mini analisa cada página e identifica produtos',
            '4. Dados são salvos automaticamente no banco de dados',
            '5. Imagens dos produtos são recortadas automaticamente',
          ].map((s) => <p key={s}>{s}</p>)}
        </CardContent>
      </Card>
    </div>
  );
}