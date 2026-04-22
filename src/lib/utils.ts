import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: string): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelativeDate(date: string): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
}

export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

export function formatPrice(price: number | null, currency = 'BRL'): string {
  if (price === null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    COMPLETED: 'bg-green-500/10 text-green-600 border-green-500/20',
    FAILED: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return map[status] ?? 'bg-gray-500/10 text-gray-600 border-gray-500/20';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Processando',
    COMPLETED: 'Concluído',
    FAILED: 'Falhou',
  };
  return map[status] ?? status;
}

export function getImageUrl(imagePath: string): string {
  // Converte path do Windows/Linux para URL acessível
  const normalized = imagePath.replace(/\\/g, '/');
  const relative = normalized.split('uploads/')[1];
  return relative
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${relative}`
    : '/placeholder-product.png';
}