import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getCurrentOrganizationId } from '../../lib/org';

type Organization = {
  id: string;
  name: string;
  pin: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  etims_activated: boolean;
};

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setError('');
        const orgId = await getCurrentOrganizationId();
        if (!orgId) {
          setOrg(null);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('organizations')
          .select('id,name,pin,email,phone,address,city,postal_code,country,etims_activated')
          .eq('id', orgId)
          .single();

        if (fetchError) throw fetchError;
        setOrg(data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load organization');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">Manage your organization profile</p>
        </div>
        {org ? (
          <Link
            to="/organizations/settings"
            className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
          >
            Edit settings
          </Link>
        ) : null}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : !org ? (
          <div className="p-8 text-center text-gray-500">
            <p>No organization found for this account.</p>
            <p className="mt-2 text-sm">Finish onboarding (profile/org creation) to unlock the invoicing modules.</p>
          </div>
        ) : (
          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Name</dt>
                <dd className="font-medium text-gray-900">{org.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">KRA PIN</dt>
                <dd className="font-medium text-gray-900">{org.pin || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Email</dt>
                <dd className="font-medium text-gray-900">{org.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Phone</dt>
                <dd className="font-medium text-gray-900">{org.phone || '-'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-600">Address</dt>
                <dd className="font-medium text-gray-900">
                  {[org.address, org.city, org.postal_code, org.country].filter(Boolean).join(', ') || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">eTIMS Activated</dt>
                <dd className="font-medium text-gray-900">{org.etims_activated ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

