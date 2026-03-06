import { supabase } from '../lib/supabase';

let cachedOrgId: string | null | undefined;

export function clearCachedOrganizationId() {
  cachedOrgId = undefined;
}

export async function getCurrentOrganizationId(): Promise<string> {
  if (cachedOrgId !== undefined) {
    if (!cachedOrgId) throw new Error('No organization found for current user');
    return cachedOrgId;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userData.user.id)
    .single();

  if (error) throw error;

  cachedOrgId = data?.organization_id ?? null;
  if (!cachedOrgId) throw new Error('No organization found for current user');

  return cachedOrgId;
}

