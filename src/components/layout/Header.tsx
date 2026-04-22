'use client';

import { usePathname } from 'next/navigation';
import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const titles: Record<string, string> = {
  '/':          'Dashboard',
  '/catalogs':  'Catálogos',
  '/suppliers': 'Fornecedores',
  '/upload':    'Upload de PDF',
};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const title =
    Object.entries(titles).find(([path]) =>
      path === '/' ? pathname === '/' : pathname.startsWith(path)
    )?.[1] ?? 'PDF Catalog Extractor';

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}