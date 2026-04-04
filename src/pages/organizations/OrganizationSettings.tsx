import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Spinner from '../../components/ui/Spinner';
import { FieldShell, TextInput, TextareaInput } from '../../components/ui/forms';
import { supabase } from '../../lib/supabase';
import { getCurrentOrganizationId } from '../../services/organization';

export default function OrganizationSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const [orgId, setOrgId] = useState<string | null>(null);
  const [org, setOrg] = useState<{
    id: string;
    name: string;
    pin: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string;
    logo_url: string | null;
    etims_activated: boolean;
    created_at: string;
    updated_at: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: '',
    pin: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Kenya',
    logo_url: '',
  });

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const id = await getCurrentOrganizationId();
        setOrgId(id);

        const { data, error: fetchError } = await supabase
          .from('organizations')
          .select('id,name,pin,email,phone,address,city,postal_code,country,logo_url,etims_activated,created_at,updated_at')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setOrg(data);
        setForm({
          name: data.name,
          pin: data.pin || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || '',
          country: data.country || 'Kenya',
          logo_url: data.logo_url || '',
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load organization');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toNullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };

  const handleSave = async () => {
    if (!orgId) return;
    if (!form.name.trim()) {
      setError('Organization name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        pin: toNullable(form.pin),
        email: toNullable(form.email),
        phone: toNullable(form.phone),
        address: toNullable(form.address),
        city: toNullable(form.city),
        postal_code: toNullable(form.postal_code),
        country: form.country.trim() || 'Kenya',
        logo_url: toNullable(form.logo_url),
      };

      const { data, error: updateError } = await supabase
        .from('organizations')
        .update(payload)
        .eq('id', orgId)
        .select('id,name,pin,email,phone,address,city,postal_code,country,logo_url,etims_activated,created_at,updated_at')
        .single();

      if (updateError) throw updateError;
      setOrg(data);
      setMode('view');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/organizations"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Organizations
        </Link>
      </div>
      <PageHeader
        title="Organization"
        subtitle="Manage your organization profile"
        actions={
          !loading && org ? (
            mode === 'view' ? (
              <button
                onClick={() => setMode('edit')}
                className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
              >
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (org) {
                      setForm({
                        name: org.name,
                        pin: org.pin || '',
                        email: org.email || '',
                        phone: org.phone || '',
                        address: org.address || '',
                        city: org.city || '',
                        postal_code: org.postal_code || '',
                        country: org.country || 'Kenya',
                        logo_url: org.logo_url || '',
                      });
                    }
                    setError('');
                    setMode('view');
                  }}
                  disabled={saving}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )
          ) : null
        }
      />

      {error ? <ErrorBanner message={error} /> : null}

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block">
              <Spinner />
            </div>
          </div>
        ) : !org ? (
          <div className="p-8 text-center text-gray-600">
            No organization found for this account. Please sign up again or ensure your profile was created correctly.
          </div>
        ) : mode === 'edit' ? (
          <form
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldShell label="Organization name" required>
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FieldShell>
              <FieldShell label="KRA PIN">
                <TextInput value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} />
              </FieldShell>
              <FieldShell label="Email">
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </FieldShell>
              <FieldShell label="Phone">
                <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="Address">
                  <TextareaInput
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </FieldShell>
              </div>
              <FieldShell label="City">
                <TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </FieldShell>
              <FieldShell label="Postal code">
                <TextInput
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                />
              </FieldShell>
              <FieldShell label="Country" required>
                <TextInput value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </FieldShell>
              <FieldShell label="Logo URL">
                <TextInput value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
              </FieldShell>
            </div>
          </form>
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
                <dt className="text-sm text-gray-600">Logo URL</dt>
                <dd className="font-medium text-gray-900">{org.logo_url || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">eTIMS Activated</dt>
                <dd className="font-medium text-gray-900">{org.etims_activated ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Created</dt>
                <dd className="font-medium text-gray-900">{new Date(org.created_at).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Updated</dt>
                <dd className="font-medium text-gray-900">{new Date(org.updated_at).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

