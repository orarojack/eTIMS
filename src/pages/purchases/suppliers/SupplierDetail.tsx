import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import Spinner from '../../../components/ui/Spinner';
import { FieldShell, TextInput, TextareaInput } from '../../../components/ui/forms';

type Supplier = {
  id: string;
  pin: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  created_at: string;
};

type SupplierForm = {
  pin: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
};

function fromSupplierToForm(s: Supplier): SupplierForm {
  return {
    pin: s.pin,
    name: s.name,
    email: s.email || '',
    phone: s.phone || '',
    address: s.address || '',
    city: s.city || '',
    postal_code: s.postal_code || '',
    country: s.country || 'Kenya',
  };
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export default function SupplierDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<SupplierForm | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) throw new Error('Missing supplier id');
        const { data, error: fetchError } = await supabase
          .from('suppliers')
          .select('id,pin,name,email,phone,address,city,postal_code,country,created_at')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setSupplier(data);
        setForm(fromSupplierToForm(data));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load supplier');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    if (!form) return;
    if (!form.pin.trim()) {
      setError('Supplier PIN is required');
      return;
    }
    if (!form.name.trim()) {
      setError('Supplier name is required');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        pin: form.pin.trim(),
        name: form.name.trim(),
        email: toNullable(form.email),
        phone: toNullable(form.phone),
        address: toNullable(form.address),
        city: toNullable(form.city),
        postal_code: toNullable(form.postal_code),
        country: form.country.trim() || 'Kenya',
      };

      const { data, error: updateError } = await supabase
        .from('suppliers')
        .update(payload)
        .eq('id', id)
        .select('id,pin,name,email,phone,address,city,postal_code,country,created_at')
        .single();

      if (updateError) throw updateError;
      setSupplier(data);
      setForm(fromSupplierToForm(data));
      setMode('view');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update supplier');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Delete this supplier? This cannot be undone.');
    if (!ok) return;

    setDeleting(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('suppliers').delete().eq('id', id);
      if (deleteError) throw deleteError;
      navigate('/purchases/suppliers');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete supplier');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/purchases/suppliers')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Supplier' : 'Supplier'}</h1>
            <p className="text-gray-600 mt-1">
              {mode === 'edit' ? 'Update supplier information' : 'View supplier information'}
            </p>
          </div>
        </div>

        {!loading && supplier ? (
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
                    if (supplier) setForm(fromSupplierToForm(supplier));
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
        ) : !supplier ? (
          <div className="p-8 text-center text-gray-500">Supplier not found.</div>
        ) : mode === 'edit' && form ? (
          <form
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldShell label="PIN" required>
                <TextInput value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} />
              </FieldShell>
              <FieldShell label="Name" required>
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
              <FieldShell label="Postal Code">
                <TextInput
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                />
              </FieldShell>
              <FieldShell label="Country" required>
                <TextInput value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </FieldShell>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Name</dt>
                <dd className="font-medium text-gray-900">{supplier.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">PIN</dt>
                <dd className="font-medium text-gray-900">{supplier.pin}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Email</dt>
                <dd className="font-medium text-gray-900">{supplier.email || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Phone</dt>
                <dd className="font-medium text-gray-900">{supplier.phone || '-'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-600">Address</dt>
                <dd className="font-medium text-gray-900">
                  {[supplier.address, supplier.city, supplier.postal_code, supplier.country].filter(Boolean).join(', ') ||
                    '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Created</dt>
                <dd className="font-medium text-gray-900">{new Date(supplier.created_at).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

