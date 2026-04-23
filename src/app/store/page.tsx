'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  Store, Mail, Phone, Globe, MapPin,
  Loader2, Upload, SplinePointer, User, Palette, FileText,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore, useUpdateStore, useUploadStoreLogo } from '@/hooks/useStore';
import { Store as StoreType } from '@/types';
import { getImageUrl } from '@/lib/utils';

export default function StorePage() {
  const { data, isLoading } = useStore();
  const updateStore  = useUpdateStore();
  const uploadLogo   = useUploadStoreLogo();

  const store = data?.data;

  const [form, setForm] = useState<Partial<StoreType>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    if (store) {
      setForm({
        name:         store.name         ?? '',
        ownerName:    store.ownerName    ?? '',
        cnpj:         store.cnpj         ?? '',
        email:        store.email        ?? '',
        phone:        store.phone        ?? '',
        whatsapp:     store.whatsapp     ?? '',
        address:      store.address      ?? '',
        city:         store.city         ?? '',
        state:        store.state        ?? '',
        zipCode:      store.zipCode      ?? '',
        website:      store.website      ?? '',
        instagram:    store.instagram    ?? '',
        facebook:     store.facebook     ?? '',
        description:  store.description  ?? '',
        primaryColor: store.primaryColor ?? '#3b82f6',
      });
    }
  }, [store]);

  const onDropLogo = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setLogoUploading(true);
    const preview = URL.createObjectURL(files[0]);
    setLogoPreview(preview);
    try {
      await uploadLogo.mutateAsync(files[0]);
    } finally {
      setLogoUploading(false);
    }
  }, [uploadLogo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:   { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    maxFiles: 1,
    disabled: logoUploading,
    onDropAccepted: onDropLogo,
  });

  const handleChange = (field: keyof StoreType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateStore.mutateAsync(form);
  };

  const logoUrl = logoPreview ?? (store?.logoPath ? getImageUrl(store.logoPath) : null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Dados da Loja</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure as informações da sua empresa.
        </p>
      </div>

      {/* ── Logo ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4" />
            Logomarca
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          {/* Preview */}
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo da loja"
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <FileText className="h-10 w-10 text-muted-foreground/30" />
            )}
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <input {...getInputProps()} />
            {logoUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive
                    ? 'Solte a logo aqui'
                    : 'Arraste ou clique para enviar a logo'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG, WebP ou SVG até 5MB
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Dados principais ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome / Responsável */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Nome da Loja *</Label>
              <Input
                value={form.name ?? ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Minha Loja"
              />
            </div>
            <div className="space-y-1">
              <Label>Nome do Responsável</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={form.ownerName ?? ''}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  placeholder="João Silva"
                />
              </div>
            </div>
          </div>

          {/* CNPJ */}
          <div className="space-y-1">
            <Label>CNPJ</Label>
            <Input
              value={form.cnpj ?? ''}
              onChange={(e) => handleChange('cnpj', e.target.value)}
              placeholder="00.000.000/0001-00"
              className="max-w-xs"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <Label>Descrição / Slogan</Label>
            <div className="relative">
              <Textarea
                rows={2}
                value={form.description ?? ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Breve descrição da sua empresa..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Contato ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4" />
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  className="pl-9"
                  value={form.email ?? ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contato@loja.com.br"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={form.phone ?? ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(11) 3333-3333"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={form.whatsapp ?? ''}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={form.website ?? ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="www.loja.com.br"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Instagram</Label>
              <div className="relative">
                <SplinePointer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={form.instagram ?? ''}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@minhaloja"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Facebook</Label>
              <div className="relative">
                <SplinePointer className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={form.facebook ?? ''}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  placeholder="facebook.com/minhaloja"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Endereço ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Endereço completo</Label>
            <Input
              value={form.address ?? ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Rua, número, complemento"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="col-span-2 space-y-1">
              <Label>Cidade</Label>
              <Input
                value={form.city ?? ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="São Paulo"
              />
            </div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Input
                value={form.state ?? ''}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="SP"
                maxLength={2}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>CEP</Label>
            <Input
              value={form.zipCode ?? ''}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              placeholder="00000-000"
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Personalização ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Personalização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label>Cor principal</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor ?? '#3b82f6'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="h-10 w-16 cursor-pointer rounded border border-border bg-transparent"
                />
                <Input
                  value={form.primaryColor ?? '#3b82f6'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="w-36 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Salvar ────────────────────────────────────────── */}
      <div className="flex justify-end pb-6">
        <Button
          size="lg"
          onClick={handleSave}
          disabled={updateStore.isPending}
        >
          {updateStore.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
          ) : (
            'Salvar dados da loja'
          )}
        </Button>
      </div>
    </div>
  );
}