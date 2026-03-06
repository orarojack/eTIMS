import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorBanner from '../../components/ui/ErrorBanner';
import Spinner from '../../components/ui/Spinner';
import { FieldShell, SelectInput, TextInput, TextareaInput } from '../../components/ui/forms';

type Item = {
  id: string;
  item_code: string;
  name: string;
  description: string | null;
  item_type: string;
  unit_price: number;
  currency: string;
  tax_type: string;
  created_at: string;
};

type ItemForm = {
  item_code: string;
  name: string;
  description: string;
  item_type: string;
  unit_price: string;
  currency: string;
  tax_type: string;
};

function fromItemToForm(item: Item): ItemForm {
  return {
    item_code: item.item_code,
    name: item.name,
    description: item.description || '',
    item_type: item.item_type || 'product',
    unit_price: String(item.unit_price ?? ''),
    currency: item.currency || 'KES',
    tax_type: item.tax_type || 'Non-Tax',
  };
}

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export default function ItemDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [item, setItem] = useState<Item | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<ItemForm | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setError('');
        if (!id) throw new Error('Missing item id');

        const { data, error: fetchError } = await supabase
          .from('items')
          .select('id,item_code,name,description,item_type,unit_price,currency,tax_type,created_at')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setItem(data);
        setForm(fromItemToForm(data));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load item');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    if (!form) return;
    if (!form.name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!form.item_code.trim()) {
      setError('Item code is required');
      return;
    }

    const unitPrice = Number(form.unit_price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      setError('Unit price must be a valid number');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        item_code: form.item_code.trim(),
        name: form.name.trim(),
        description: toNullable(form.description),
        item_type: form.item_type,
        unit_price: unitPrice,
        currency: form.currency,
        tax_type: form.tax_type,
      };

      const { data, error: updateError } = await supabase
        .from('items')
        .update(payload)
        .eq('id', id)
        .select('id,item_code,name,description,item_type,unit_price,currency,tax_type,created_at')
        .single();

      if (updateError) throw updateError;
      setItem(data);
      setForm(fromItemToForm(data));
      setMode('view');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Delete this item? This cannot be undone.');
    if (!ok) return;

    setDeleting(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('items').delete().eq('id', id);
      if (deleteError) throw deleteError;
      navigate('/items');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/items')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mode === 'edit' ? 'Edit Item' : 'Item Details'}</h1>
            <p className="text-gray-600 mt-1">
              {mode === 'edit' ? 'Update product or service information' : 'View product or service information'}
            </p>
          </div>
        </div>

        {!loading && item ? (
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
                    if (item) setForm(fromItemToForm(item));
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
        ) : !item ? (
          <div className="p-8 text-center text-gray-500">Item not found.</div>
        ) : mode === 'edit' && form ? (
          <form
            className="p-6 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldShell label="Product Name" required>
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FieldShell>
              <FieldShell label="Product Code" required>
                <TextInput
                  value={form.item_code}
                  onChange={(e) => setForm({ ...form, item_code: e.target.value })}
                />
              </FieldShell>
              <FieldShell label="Item Type" required>
                <SelectInput value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })}>
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </SelectInput>
              </FieldShell>
              <FieldShell label="Tax Type" required>
                <SelectInput value={form.tax_type} onChange={(e) => setForm({ ...form, tax_type: e.target.value })}>
                  <option value="Non-Tax">Non-Tax</option>
                  <option value="VAT">VAT</option>
                  <option value="Exempt">Exempt</option>
                </SelectInput>
              </FieldShell>
              <FieldShell label="Unit Price" required>
                <div className="flex gap-2">
                  <TextInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.unit_price}
                    onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  />
                  <SelectInput
                    className="w-28"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </SelectInput>
                </div>
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="Description">
                  <TextareaInput
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </FieldShell>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600">Name</dt>
                <dd className="font-medium text-gray-900">{item.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Item Code</dt>
                <dd className="font-medium text-gray-900">{item.item_code}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Type</dt>
                <dd className="font-medium text-gray-900">{item.item_type}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Unit Price</dt>
                <dd className="font-medium text-gray-900">
                  {item.currency} {item.unit_price.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Tax Type</dt>
                <dd className="font-medium text-gray-900">{item.tax_type}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Created</dt>
                <dd className="font-medium text-gray-900">{new Date(item.created_at).toLocaleString()}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-gray-600">Description</dt>
                <dd className="font-medium text-gray-900">{item.description || '-'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

