import Link from 'next/link';
import { FileCheck2, Building2, Users, Home, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/AdminShell';

interface DashboardStats {
  total_warga: number;
  total_rw: number;
  total_rt: number;
  rw_active: number;
  rw_pending: number;
  rw_shell: number;
  rt_active: number;
  rt_pending: number;
  rt_shell: number;
  pending_pengajuan: number;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('nama')
    .eq('id', user!.id)
    .maybeSingle();

  const { data: statsData } = await supabase.rpc('admin_dashboard_stats');
  const stats = (Array.isArray(statsData) ? statsData[0] : statsData) as
    | DashboardStats
    | undefined;

  return (
    <AdminShell user={{ email: user?.email ?? null, nama: profile?.nama ?? null }}>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Ringkasan struktur RT/RW + antrian persetujuan.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total warga" value={stats?.total_warga ?? 0} icon={Users} tint="purple" />
          <StatCard
            label="Total RW"
            value={stats?.total_rw ?? 0}
            sub={`${stats?.rw_active ?? 0} aktif · ${stats?.rw_pending ?? 0} pending · ${stats?.rw_shell ?? 0} shell`}
            icon={Building2}
            tint="blue"
          />
          <StatCard
            label="Total RT"
            value={stats?.total_rt ?? 0}
            sub={`${stats?.rt_active ?? 0} aktif · ${stats?.rt_pending ?? 0} pending · ${stats?.rt_shell ?? 0} shell`}
            icon={Home}
            tint="emerald"
          />
          <StatCard
            label="Pengajuan ketua"
            value={stats?.pending_pengajuan ?? 0}
            sub="Menunggu approval"
            icon={Clock}
            tint="amber"
            urgent={(stats?.pending_pengajuan ?? 0) > 0}
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            href="/pengajuan"
            icon={FileCheck2}
            title="Tinjau pengajuan ketua"
            desc={`${stats?.pending_pengajuan ?? 0} pengajuan menunggu persetujuan kamu.`}
            tint="amber"
          />
          <ActionCard
            href="/rws"
            icon={Building2}
            title="Browse struktur RW & RT"
            desc="Lihat semua RW, RT di dalamnya, dan warga per RT."
            tint="purple"
          />
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tint,
  urgent = false,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: typeof Users;
  tint: 'purple' | 'blue' | 'emerald' | 'amber';
  urgent?: boolean;
}) {
  const tints: Record<string, { bg: string; text: string }> = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  };
  const t = tints[tint];
  return (
    <div
      className={`bg-white rounded-2xl border ${urgent ? 'border-amber-300 ring-2 ring-amber-100' : 'border-zinc-200'} p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${t.text}`} strokeWidth={1.8} />
        </div>
      </div>
      <p className="text-3xl font-semibold text-zinc-900 tabular-nums">
        {value.toLocaleString('id-ID')}
      </p>
      {sub ? <p className="text-[11px] text-zinc-500 mt-1">{sub}</p> : null}
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  desc,
  tint,
}: {
  href: string;
  icon: typeof FileCheck2;
  title: string;
  desc: string;
  tint: 'amber' | 'purple';
}) {
  const tints: Record<string, { bg: string; text: string }> = {
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };
  const t = tints[tint];
  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition"
    >
      <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${t.text}`} strokeWidth={1.8} />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
    </Link>
  );
}
