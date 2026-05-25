import Link from 'next/link';
import { Building2, ChevronRight, Users, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

interface RwRow {
  id: string;
  nomor: string;
  status: 'shell' | 'pending' | 'active';
  skor: number;
  warga_count: number;
  ketua_id: string | null;
  kelurahan_id: string | null;
  rt_count: number;
}

export default async function RwsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama')
    .eq('id', user!.id)
    .maybeSingle();

  // Direct query: rws is public-read. Embed rts(count) for nested RT count.
  const { data, error } = await supabase
    .from('rws')
    .select('id, nomor, status, skor, warga_count, ketua_id, kelurahan_id, rts(count)')
    .order('nomor', { ascending: true });

  const rows: RwRow[] = (Array.isArray(data) ? data : []).map((r) => {
    const row = r as unknown as Record<string, unknown>;
    const rtsAgg = row.rts as { count: number }[] | undefined;
    return {
      id: row.id as string,
      nomor: row.nomor as string,
      status: (row.status as RwRow['status']) ?? 'shell',
      skor: Number(row.skor ?? 0),
      warga_count: Number(row.warga_count ?? 0),
      ketua_id: (row.ketua_id as string | null) ?? null,
      kelurahan_id: (row.kelurahan_id as string | null) ?? null,
      rt_count: Number(rtsAgg?.[0]?.count ?? 0),
    };
  });

  return (
    <AdminShell user={{ email: user?.email ?? null, nama: profile?.nama ?? null }}>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">RW & RT</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Browse hierarki: pilih RW untuk lihat RT-nya, lalu pilih RT untuk lihat warga.
          </p>
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">Gagal memuat: {error.message}</p>
          </div>
        ) : null}

        {rows.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
            <Building2 className="w-8 h-8 text-zinc-400 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-900">Belum ada RW</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  <th className="px-5 py-3">RW</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">RT</th>
                  <th className="px-5 py-3 text-right">Warga</th>
                  <th className="px-5 py-3 text-right">Skor</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((rw) => (
                  <tr key={rw.id} className="hover:bg-zinc-50 transition">
                    <td className="px-5 py-4">
                      <Link
                        href={`/rws/${rw.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600" strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 group-hover:text-purple-700">
                            RW {rw.nomor}
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            {rw.ketua_id ? 'Punya ketua' : 'Belum ada ketua'}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={rw.status} />
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Home className="w-3 h-3 text-zinc-400" />
                        {rw.rt_count}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-400" />
                        {rw.warga_count}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-zinc-700">
                      {rw.skor.toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/rws/${rw.id}`}
                        className="inline-flex items-center text-purple-600 hover:text-purple-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
