'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { approvePengajuanAction, rejectPengajuanAction } from './actions';

export interface PengajuanItem {
  id: string;
  kind: string; // 'rt' | 'rw'
  target_id: string;
  target_nomor: string | null;
  rw_nomor: string | null;
  kelurahan_nama: string | null;
  target_status: string | null;
  target_warga_count: number;
  target_skor: number;
  status: string; // 'pending' | 'escalated' | 'approved' | 'rejected'
  reason: string | null;
  created_at: string;
  escalation_at: string | null;
  applicant_id: string;
  applicant_nama: string | null;
  applicant_avatar_url: string | null;
}

export function PengajuanRow({ item }: { item: PengajuanItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const isActionable = item.status === 'pending' || item.status === 'escalated';
  const initials = (item.applicant_nama ?? '?').trim().charAt(0).toUpperCase();

  const handleApprove = () => {
    if (!confirm(`Approve ${item.applicant_nama ?? 'pengaju'} sebagai ketua ${item.kind.toUpperCase()} ${item.target_nomor ?? ''}?`)) return;
    startTransition(async () => {
      const res = await approvePengajuanAction(item.id);
      setFeedback(res);
      if (res.ok) router.refresh();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectPengajuanAction(item.id, reason || 'Tidak ada alasan');
      setFeedback(res);
      if (res.ok) {
        setShowReject(false);
        setReason('');
        router.refresh();
      }
    });
  };

  const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    escalated: { bg: 'bg-red-100', text: 'text-red-700', label: 'Eskalasi' },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Disetujui' },
    rejected: { bg: 'bg-zinc-200', text: 'text-zinc-700', label: 'Ditolak' },
  };
  const sty = statusStyle[item.status] ?? statusStyle.pending;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        {item.applicant_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.applicant_avatar_url}
            alt={item.applicant_nama ?? ''}
            className="w-12 h-12 rounded-full object-cover bg-zinc-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-base font-medium text-purple-700">{initials}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-zinc-900">
              {item.applicant_nama ?? 'Tanpa nama'}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${sty.bg} ${sty.text}`}
            >
              {sty.label}
            </span>
            <span className="text-xs text-zinc-400">
              {new Date(item.created_at).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm text-zinc-700 mt-1">
            Apply jadi <span className="font-medium">Ketua {item.kind.toUpperCase()}</span>
            {item.target_nomor ? ` ${item.target_nomor}` : ''}
            {item.kind === 'rt' && item.rw_nomor ? ` (RW ${item.rw_nomor})` : ''}
            {item.kelurahan_nama ? ` · ${item.kelurahan_nama}` : ''}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            Status {item.kind.toUpperCase()}-nya saat ini:{' '}
            <span className="font-medium">{item.target_status ?? '—'}</span> · Warga:{' '}
            <span className="tabular-nums">{item.target_warga_count}</span> · Skor:{' '}
            <span className="tabular-nums">{item.target_skor.toLocaleString('id-ID')}</span>
          </p>
          {item.reason ? (
            <p className="text-[11px] text-zinc-500 mt-2 italic">Alasan tolak: {item.reason}</p>
          ) : null}
        </div>

        {isActionable ? (
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleApprove}
              disabled={pending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Approve
            </button>
            <button
              onClick={() => setShowReject((v) => !v)}
              disabled={pending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-50"
            >
              <X className="w-3.5 h-3.5" />
              Tolak
            </button>
          </div>
        ) : null}
      </div>

      {showReject ? (
        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2">
          <label className="text-xs font-medium text-zinc-700">Alasan tolak (opsional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Alasan tolak akan dikirim ke pengaju via notifikasi"
            className="w-full text-sm rounded-lg border border-zinc-200 p-2 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowReject(false)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Batal
            </button>
            <button
              onClick={handleReject}
              disabled={pending}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
            >
              Konfirmasi tolak
            </button>
          </div>
        </div>
      ) : null}

      {feedback ? (
        <div
          className={`mt-3 flex items-start gap-2 p-2 rounded-lg text-xs ${
            feedback.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{feedback.message}</span>
        </div>
      ) : null}
    </div>
  );
}
