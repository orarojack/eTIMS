import { supabase } from './supabase';

export async function getCurrentOrganizationId(): Promise<string | null> {
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!userData.user) return null;

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userData.user.id)
    .single();

  if (profileError) throw profileError;
  return userProfile?.organization_id ?? null;
}

