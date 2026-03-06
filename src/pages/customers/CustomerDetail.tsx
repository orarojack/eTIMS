import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Spinner from '../../components/ui/Spinner';
import { FieldShell, SelectInput, TextInput, TextareaInput } from '../../components/ui/forms';

type Customer = {
  id: string;
  pin: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  kra_pin: string | null;
  currency: string;
  website: string | null;
  reference: string | null;
  created_at: string;
};

type CustomerForm = {
  name: string;
  pin: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  kra_pin: string;
  currency: string;
  website: string;
  reference: string;
};

function fromCustomerToForm(customer: Customer): CustomerForm {
  return {
    name: customer.name,
    pin: customer.pin || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    postal_code: customer.postal_code || '',
    country: customer.country || 'Kenya',
    kra_pin: customer.kra_pin || '',
    currency: customer.currency || 'KES',
    website: customer.website || '',
    reference: customer.reference || '',
  };
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export default function CustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<CustomerForm | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setError('');
        if (!id) throw new Error('Missing customer id');

        const { data, error: fetchError } = await supabase
          .from('customers')
          .select(
            'id,pin,name,email,phone,address,city,postal_code,country,kra_pin,currency,website,reference,created_at'
          )
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setCustomer(data);
        setForm(fromCustomerToForm(data));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    if (!form) return;
    if (!form.name.trim()) {
      setError('Customer name is required');
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
        kra_pin: toNullable(form.kra_pin),
        currency: form.currency || 'KES',
        website: toNullable(form.website),
        reference: toNullable(form.reference),
      };

      const { data, error: updateError } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', id)
        .select(
          'id,pin,name,email,phone,address,city,postal_code,country,kra_pin,currency,website,reference,created_at'
        )
        .single();

      if (updateError) throw updateError;
      setCustomer(data);
      setForm(fromCustomerToForm(data));
      setMode('view');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Delete this customer? This cannot be undone.');
    if (!ok) return;

    setDeleting(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('customers').delete().eq('id', id);
      if (deleteError) throw deleteError;
      navigate('/sales/customers');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/sales/customers')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
            </h1>
            <p className="text-gray-600 mt-1">
              {mode === 'edit' ? 'Update customer information' : 'View customer information'}
            </p>
          </div>
        </div>

        {!loading && customer ? (
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <>
                <button
                  onClick={() => setMode('edit')}
                  className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    if (customer) setForm(fromCustomerToForm(customer));
                    setMode('view');
                    setError('');
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
              </>
            )}
          </div>
        ) : null}
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block">
              <Spinner />
            </div>
          </div>
        ) : !customer ? (
          <div className="p-8 text-center text-gray-500">Customer not found.</div>
        ) : mode === 'edit' && form ? (
          <form
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldShell label="Name" required>
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FieldShell>
              <FieldShell label="PIN">
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
              <FieldShell label="KRA PIN">
                <TextInput value={form.kra_pin} onChange={(e) => setForm({ ...form, kra_pin: e.target.value })} />
              </FieldShell>
              <FieldShell label="Currency" required>
                <SelectInput value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </SelectInput>
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
              <FieldShell label="Postal Code">
                <TextInput
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                />
              </FieldShell>
              <FieldShell label="Country" required>
                <TextInput value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </FieldShell>
              <FieldShell label="Website">
                <TextInput value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </FieldShell>
              <FieldShell label="Reference">
                <TextInput value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              </FieldShell>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Name</dt>
                <dd className="font-medium text-gray-900">{customer.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">PIN</dt>
                <dd className="font-medium text-gray-900">{customer.pin || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Email</dt>
                <dd className="font-medium text-gray-900">{customer.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Phone</dt>
                <dd className="font-medium text-gray-900">{customer.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">KRA PIN</dt>
                <dd className="font-medium text-gray-900">{customer.kra_pin || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Currency</dt>
                <dd className="font-medium text-gray-900">{customer.currency}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-600">Address</dt>
                <dd className="font-medium text-gray-900">
                  {[customer.address, customer.city, customer.postal_code, customer.country].filter(Boolean).join(', ') ||
                    '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Website</dt>
                <dd className="font-medium text-gray-900">{customer.website || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Reference</dt>
                <dd className="font-medium text-gray-900">{customer.reference || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Created</dt>
                <dd className="font-medium text-gray-900">{new Date(customer.created_at).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

