import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k     = 1024;
  const sizes  = ['B', 'KB', 'MB', 'GB'];
  const i      = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: string): string {
  try {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatRelativeDate(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return '—';
  }
}

export function formatProcessingTime(ms: number | null): string {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

export function formatPrice(
  price: number | string | null,
  currency = 'BRL'
): string {
  if (price === null || price === undefined) return '—';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style:    'currency',
    currency,
  }).format(num);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING:    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    COMPLETED:  'bg-green-500/10 text-green-600 border-green-500/20',
    FAILED:     'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return map[status] ?? 'bg-gray-500/10 text-gray-600 border-gray-500/20';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:    'Pendente',
    PROCESSING: 'Processando',
    COMPLETED:  'Concluído',
    FAILED:     'Falhou',
  };
  return map[status] ?? status;
}

// ─────────────────────────────────────────────────────────────
// Monta URL pública da imagem a partir do path salvo no banco
// Suporta paths do Windows (C:\...) e Linux (/home/...)
// Backend roda na porta 3333
// ─────────────────────────────────────────────────────────────
export function getImageUrl(imagePath: string | null | undefined): string {
  const PLACEHOLDER = '/placeholder-product.png';

  if (!imagePath || imagePath.trim() === '') return PLACEHOLDER;

  // Já é uma URL HTTP completa — retorna sem modificar
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Base do backend — remove /api do final se existir
  const BASE = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api'
  )
    .replace(/\/api\/?$/, '')   // remove sufixo /api
    .replace(/\/$/, '');        // remove barra final

  // Normaliza barras invertidas do Windows → /
  const normalized = imagePath.replace(/\\/g, '/');

  // Remove drive do Windows (ex: C:/ D:/ E:/)
  const withoutDrive = normalized.replace(/^[A-Za-z]:\//, '/');

  // Extrai o segmento a partir de "uploads/"
  const match = withoutDrive.match(/uploads\/.+/);
  if (!match) return PLACEHOLDER;

  return `${BASE}/${match[0]}`;
}