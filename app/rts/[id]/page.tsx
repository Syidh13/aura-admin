import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Home, User as UserIcon, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

interface WargaRow {
  id: string;
  nama: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string | null;
  skor: number;
  last_active: string | null;
  joined_at: string | null;
}

function roleLabel(role: string | null): string {
  switch (role) {
    case 'ketua_rt':
      return 'Ketua RT';
    case 'ketua_rw':
      return 'Ketua RW';
    case 'super_admin':
      return 'Super Admin';
    default:
      return 'Warga';
  }
}

function roleBadgeStyle(role: string | null): { bg: string; text: string } {
  switch (role) {
    case 'ketua_rt':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    case 'ketua_rw':
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    case 'super_admin':
      return { bg: 'bg-purple-100', text: 'text-purple-700' };
    default:
      return { bg: 'bg-zinc-100', text: 'text-zinc-600' };
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diffSec = Math.floor((Date.now() - then) / 1000);
  if (diffSec < 60) return 'baru aja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hr lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default async function RtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama')
    .eq('id', user!.id)
    .maybeSingle();

  // RT header
  const { data: rtData } = await supabase
    .from('rts')
    .select(
      'id, nomor, status, skor, warga_count, rw_id, rw:rw_id(nomor), ketua:ketua_id(nama)',
    )
    .eq('id', id)
    .maybeSingle();

  if (!rtData) return notFound();

  const rt = rtData as unknown as {
    id: string;
    nomor: string;
    status: 'shell' | 'pending' | 'active';
    skor: number;
    warga_count: number;
    rw_id: string | null;
    rw: { nomor: string | null } | null;
    ketua: { nama: string | null } | null;
  };

  // Warga list via admin RPC (super_admin only)
  const { data: wargaData, error: wargaErr } = await supabase.rpc('admin_list_warga_in_rt', {
    p_rt_id: id,
  });
  const warga = (Array.isArray(wargaData) ? wargaData : []) as WargaRow[];

  return (
    <AdminShell user={{ email: user?.email ?? null, nama: profile?.nama ?? null }}>
      <div className="space-y-6">
        <Link
          href={rt.rw_id ? `/rws/${rt.rw_id}` : '/rws'}
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {rt.rw?.nomor ? `RW ${rt.rw.nomor}` : 'RW & RT'}
        </Link>

        <header className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Home className="w-6 h-6 text-emerald-600" strokeWidth={1.6} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">
                  RT {rt.nomor}
                  {rt.rw?.nomor ? (
                    <span className="text-zinc-400 font-normal text-lg ml-2">
                      · RW {rt.rw.nomor}
                    </span>
                  ) : null}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={rt.status} />
                  {rt.ketua?.nama ? (
                    <span className="text-xs text-zinc-500">
                      Ketua: <span className="font-medium text-zinc-700">{rt.ketua.nama}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-500">Belum ada ketua</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Total warga</p>
                <p className="text-xl font-semibold text-zinc-900 tabular-nums">
                  {rt.warga_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Skor agregat</p>
                <p className="text-xl font-semibold text-purple-700 tabular-nums">
                  {rt.skor.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-3">
            Warga di RT ini ({warga.length})
          </h2>
          {wargaErr ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">Gagal memuat warga: {wargaErr.message}</p>
            </div>
          ) : warga.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <UserIcon className="w-8 h-8 text-zinc-400 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-zinc-900">Belum ada warga di RT ini</p>
              <p className="text-xs text-zinc-500 mt-1">
                Warga yang gabung di RT ini akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    <th className="px-5 py-3">Nama</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 text-right">Skor</th>
                    <th className="px-5 py-3">Last active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {warga.map((w) => {
                    const r = roleBadgeStyle(w.role);
                    const initials = (w.nama ?? '?').trim().charAt(0).toUpperCase();
                    return (
                      <tr key={w.id} className="hover:bg-zinc-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {w.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={w.avatar_url}
                                alt={w.nama ?? ''}
                                className="w-8 h-8 rounded-full object-cover bg-zinc-100"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xs font-medium text-purple-700">
                                  {initials}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-zinc-900">{w.nama ?? '—'}</p>
                              {w.joined_at ? (
                                <p className="text-[10px] text-zinc-500">
                                  Join {new Date(w.joined_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-zinc-700 text-xs">{w.email ?? '—'}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${r.bg} ${r.text}`}
                          >
                            {w.role && w.role !== 'warga' ? (
                              <ShieldCheck className="w-3 h-3" strokeWidth={2} />
                            ) : null}
                            {roleLabel(w.role)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-zinc-700">
                          {w.skor.toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-4 text-zinc-500 text-xs">
                          {relativeTime(w.last_active)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
