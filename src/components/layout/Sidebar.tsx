'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Building2,
  Upload, Store, Moon, Sun, ChevronRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/',          label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/catalogs',  label: 'Catálogos',    icon: BookOpen        },
  { href: '/suppliers', label: 'Fornecedores', icon: Building2       },
  { href: '/upload',    label: 'Upload PDF',   icon: Upload          },
  { href: '/store',     label: 'Minha Loja',   icon: Store           },
];

export function Sidebar() {
  const pathname      = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">PDF Catalog</p>
          <p className="text-xs text-muted-foreground">Extractor</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {active && (
                  <ChevronRight className="ml-auto h-3 w-3 opacity-60" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Theme */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          size="sm"
          className="relative w-full justify-start gap-3"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute left-4 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          Alternar tema
        </Button>
      </div>
    </aside>
  );
}