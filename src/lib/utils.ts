import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prefija la ruta de un asset con el basePath de GitHub Pages.
 * Usar SOLO en etiquetas <img> HTML normales o en CSS con url().
 * El componente <Image> de Next.js ya aplica el basePath automáticamente.
 */
export function getAssetPath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  // Asegura que no haya doble slash
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function formatPrice(price: number | string | null | undefined): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice).replace('USD', '$');
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
