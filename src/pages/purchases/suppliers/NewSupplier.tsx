import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import { FieldShell, TextInput, TextareaInput } from '../../../components/ui/forms';
import { supabase } from '../../../lib/supabase';
import { getCurrentOrganizationId } from '../../../services/organization';

export default function NewSupplier() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    pin: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Kenya',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.pin.trim()) {
      setError('Supplier PIN is required');
      return;
    }
    if (!form.name.trim()) {
      setError('Supplier name is required');
      return;
    }

    setLoading(true);
    try {
      const orgId = await getCurrentOrganizationId();
      const { error: insertError } = await supabase.from('suppliers').insert({
        organization_id: orgId,
        pin: form.pin.trim(),
        name: form.name.trim(),
        email: form.email.trim() ? form.email.trim() : null,
        phone: form.phone.trim() ? form.phone.trim() : null,
        address: form.address.trim() ? form.address.trim() : null,
        city: form.city.trim() ? form.city.trim() : null,
        postal_code: form.postal_code.trim() ? form.postal_code.trim() : null,
        country: form.country.trim() || 'Kenya',
      });

      if (insertError) throw insertError;
      navigate('/purchases/suppliers');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add supplier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/purchases/suppliers')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <PageHeader title="New Supplier" subtitle="Add a new supplier" />
      </div>

      {error ? <ErrorBanner message={error} /> : null}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/purchases/suppliers')}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

