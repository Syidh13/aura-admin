'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, FileCheck2, Building2, LogOut, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/**
 * App shell for all authenticated admin pages: sidebar + content area.
 * Sidebar items: Dashboard, Pengajuan, RW/RT. Logout at bottom.
 */
export function AdminShell({
  user,
  children,
}: {
  user: { email: string | null; nama: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  const nav: { href: string; label: string; icon: typeof LayoutDashboard; matchPrefix?: string }[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pengajuan', label: 'Pengajuan', icon: FileCheck2, matchPrefix: '/pengajuan' },
    { href: '/rws', label: 'RW & RT', icon: Building2, matchPrefix: '/rws' },
  ];

  return (
    <div className="flex flex-1 min-h-0">
      <aside className="w-60 shrink-0 bg-white border-r border-zinc-200 flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-purple-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 leading-tight">Aura Admin</p>
              <p className="text-[10px] text-zinc-500">Super admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-zinc-100 space-y-2">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-zinc-900 truncate">{user.nama ?? 'Super admin'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user.email ?? ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
