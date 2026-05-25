'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Server actions wrapping the existing approve_pengajuan_ketua +
 * reject_pengajuan_ketua RPCs. revalidatePath('/pengajuan') refreshes the
 * list right after the mutation so the row disappears / status updates
 * without a hard reload.
 */

export async function approvePengajuanAction(pengajuanId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Sesi habis. Login ulang.' };

  const { data, error } = await supabase.rpc('approve_pengajuan_ketua', {
    p_pengajuan_id: pengajuanId,
    p_approver_id: user.id,
  });
  if (error) return { ok: false, message: error.message };

  const row = (Array.isArray(data) ? data[0] : data) as
    | { success: boolean; message: string }
    | undefined;

  revalidatePath('/pengajuan');
  revalidatePath('/');
  return { ok: row?.success ?? false, message: row?.message ?? 'Diproses' };
}

export async function rejectPengajuanAction(pengajuanId: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Sesi habis. Login ulang.' };

  const { data, error } = await supabase.rpc('reject_pengajuan_ketua', {
    p_pengajuan_id: pengajuanId,
    p_approver_id: user.id,
    p_reason: reason,
  });
  if (error) return { ok: false, message: error.message };

  const row = (Array.isArray(data) ? data[0] : data) as
    | { success: boolean; message: string }
    | undefined;

  revalidatePath('/pengajuan');
  revalidatePath('/');
  return { ok: row?.success ?? false, message: row?.message ?? 'Diproses' };
}
