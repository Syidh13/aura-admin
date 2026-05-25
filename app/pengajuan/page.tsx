import { Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';
import { PengajuanRow, type PengajuanItem } from './PengajuanRow';

export const dynamic = 'force-dynamic';

export default async function PengajuanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama')
    .eq('id', user!.id)
    .maybeSingle();

  const { data, error } = await supabase.rpc('get_pengajuan_for_approver');
  const items = (Array.isArray(data) ? data : []) as PengajuanItem[];

  const pending = items.filter((it) => it.status === 'pending' || it.status === 'escalated');
  const decided = items.filter((it) => it.status === 'approved' || it.status === 'rejected');

  return (
    <AdminShell user={{ email: user?.email ?? null, nama: profile?.nama ?? null }}>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">Pengajuan ketua</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Approve atau tolak calon ketua RT/RW yang sudah daftar.
          </p>
        </header>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">Gagal memuat: {error.message}</p>
          </div>
        ) : null}

        <section>
          <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-3">
            Menunggu approval ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-zinc-900">Tidak ada pengajuan pending</p>
              <p className="text-xs text-zinc-500 mt-1">
                Semua pengajuan ketua sudah ditinjau. Mantap.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((item) => (
                <PengajuanRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {decided.length > 0 ? (
          <section>
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-3">
              Riwayat ({decided.length})
            </h2>
            <div className="space-y-3">
              {decided.slice(0, 20).map((item) => (
                <PengajuanRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
