type Status = 'shell' | 'pending' | 'active';

const STYLES: Record<Status, { bg: string; text: string; label: string }> = {
  shell: { bg: 'bg-zinc-100', text: 'text-zinc-600', label: 'Shell' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aktif' },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STYLES[status] ?? STYLES.shell;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
