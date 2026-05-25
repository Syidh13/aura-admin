import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, Users, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function RwDetailPage({
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

  // RW header info — join to ketua profile for ketua nama.
  const { data: rwData } = await supabase
    .from('rws')
    .select('id, nomor, status, skor, warga_count, ketua:ketua_id(nama, avatar_url)')
    .eq('id', id)
    .maybeSingle();

  if (!rwData) return notFound();

  const rw = rwData as unknown as {
    id: string;
    nomor: string;
    status: 'shell' | 'pending' | 'active';
    skor: number;
    warga_count: number;
    ketua: { nama: string | null; avatar_url: string | null } | null;
  };

  // RTs in this RW, with warga count.
  const { data: rtsData } = await supabase
    .from('rts')
    .select('id, nomor, status, skor, warga_count, ketua:ketua_id(nama)')
    .eq('rw_id', id)
    .order('nomor', { ascending: true });

  const rts = (Array.isArray(rtsData) ? rtsData : []).map((r) => {
    const row = r as unknown as Record<string, unknown>;
    const ketua = row.ketua as { nama: string | null } | null;
    return {
      id: row.id as string,
      nomor: row.nomor as string,
      status: (row.status as 'shell' | 'pending' | 'active') ?? 'shell',
      skor: Number(row.skor ?? 0),
      warga_count: Number(row.warga_count ?? 0),
      ketua_nama: ketua?.nama ?? null,
    };
  });

  return (
    <AdminShell user={{ email: user?.email ?? null, nama: profile?.nama ?? null }}>
      <div className="space-y-6">
        <Link
          href="/rws"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Semua RW
        </Link>

        <header className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" strokeWidth={1.6} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">RW {rw.nomor}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={rw.status} />
                  {rw.ketua?.nama ? (
                    <span className="text-xs text-zinc-500">
                      Ketua: <span className="font-medium text-zinc-700">{rw.ketua.nama}</span>
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
                  {rw.warga_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Skor agregat</p>
                <p className="text-xl font-semibold text-purple-700 tabular-nums">
                  {rw.skor.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-3">
            RT di RW ini ({rts.length})
          </h2>
          {rts.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <Home className="w-8 h-8 text-zinc-400 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-zinc-900">Belum ada RT di RW ini</p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    <th className="px-5 py-3">RT</th>
                    <th className="px-5 py-3">Ketua</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Warga</th>
                    <th className="px-5 py-3 text-right">Skor</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rts.map((rt) => (
                    <tr key={rt.id} className="hover:bg-zinc-50 transition">
                      <td className="px-5 py-4">
                        <Link
                          href={`/rts/${rt.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Home className="w-4 h-4 text-emerald-600" strokeWidth={1.8} />
                          </div>
                          <p className="font-medium text-zinc-900 group-hover:text-purple-700">
                            RT {rt.nomor}
                          </p>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-zinc-700">
                        {rt.ketua_nama ?? <span className="text-zinc-400 italic">Belum ada</span>}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={rt.status} />
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3 h-3 text-zinc-400" />
                          {rt.warga_count}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-zinc-700">
                        {rt.skor.toLocaleString('id-ID')}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/rts/${rt.id}`}
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
        </section>
      </div>
    </AdminShell>
  );
}
