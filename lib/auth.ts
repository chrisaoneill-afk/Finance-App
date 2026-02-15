import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function requireUser() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return { supabase, user };
}
