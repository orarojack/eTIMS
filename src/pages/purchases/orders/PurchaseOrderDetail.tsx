import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import Spinner from '../../../components/ui/Spinner';
import StatusBadge from '../../../components/ui/StatusBadge';
import { FieldShell, SelectInput, TextInput, TextareaInput } from '../../../components/ui/forms';
import { getCurrentOrganizationId } from '../../../services/organization';
import { formatMoney, toNumber } from '../../../services/numbers';

type SupplierOption = { id: string; name: string };
type ItemOption = { id: string; item_code: string; name: string; unit_price: number };
type PurchaseOrderStatus = 'draft' | 'sent' | 'received' | 'cancelled';

type PurchaseOrderHeader = {
  id: string;
  supplier_id: string;
  purchase_order_number: string;
  order_date: string;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  terms_and_conditions: string | null;
  status: string;
  created_at: string;
};

type PurchaseOrderItem = {
  id: string;
  item_id: string | null;
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  amount: number;
};

type LineItem = {
  item_id: string;
  product_name: string;
  description: string;
  quantity: string;
  unit_price: string;
};

function toNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function mapToLineItem(li: PurchaseOrderItem): LineItem {
  return {
    item_id: li.item_id || '',
    product_name: li.product_name,
    description: li.description || '',
    quantity: String(li.quantity),
    unit_price: String(li.unit_price),
  };
}

export default function PurchaseOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);

  const [doc, setDoc] = useState<PurchaseOrderHeader | null>(null);
  const [docItems, setDocItems] = useState<PurchaseOrderItem[]>([]);

  const [header, setHeader] = useState({
    supplier_id: '',
    purchase_order_number: '',
    order_date: new Date().toISOString().slice(0, 10),
    discount_percentage: '0',
    tax_type: 'Non-Tax',
    terms_and_conditions: '',
    status: 'draft' as PurchaseOrderStatus,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item_id: '', product_name: '', description: '', quantity: '1', unit_price: '0' },
  ]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) throw new Error('Missing purchase order id');
        const orgId = await getCurrentOrganizationId();

        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('id,name')
          .eq('organization_id', orgId)
          .order('name', { ascending: true });
        if (supplierError) throw supplierError;
        setSuppliers((supplierData || []) as SupplierOption[]);

        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('id,item_code,name,unit_price')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });
        if (itemError) throw itemError;
        setItems((itemData || []) as ItemOption[]);

        const { data: docData, error: docError } = await supabase
          .from('purchase_orders')
          .select(
            'id,supplier_id,purchase_order_number,order_date,subtotal,discount_percentage,discount_amount,tax_amount,total,terms_and_conditions,status,created_at'
          )
          .eq('id', id)
          .single();
        if (docError) throw docError;

        const { data: itemsData, error: itemsError } = await supabase
          .from('purchase_order_items')
          .select('id,item_id,product_name,description,quantity,unit_price,amount')
          .eq('purchase_order_id', id)
          .order('created_at', { ascending: true });
        if (itemsError) throw itemsError;

        setDoc(docData as PurchaseOrderHeader);
        setDocItems((itemsData || []) as PurchaseOrderItem[]);

        setHeader({
          supplier_id: docData.supplier_id,
          purchase_order_number: docData.purchase_order_number,
          order_date: docData.order_date,
          discount_percentage: String(docData.discount_percentage ?? 0),
          tax_type: docData.tax_amount > 0 ? 'VAT' : 'Non-Tax',
          terms_and_conditions: docData.terms_and_conditions || '',
          status: (docData.status || 'draft') as PurchaseOrderStatus,
        });
        setLineItems(((itemsData || []) as PurchaseOrderItem[]).map(mapToLineItem));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load purchase order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totals = useMemo(() => {
    const parsed = lineItems.map((li) => {
      const qty = toNumber(li.quantity, 0);
      const price = toNumber(li.unit_price, 0);
      const amount = qty * price;
      return { ...li, qty, price, amount };
    });

    const subtotal = parsed.reduce((sum, li) => sum + li.amount, 0);
    const discountPct = toNumber(header.discount_percentage, 0);
    const discountAmount = (subtotal * discountPct) / 100;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = header.tax_type === 'VAT' ? taxable * 0.16 : 0;
    const total = taxable + taxAmount;

    return { parsed, subtotal, discountPct, discountAmount, taxAmount, total };
  }, [header.discount_percentage, header.tax_type, lineItems]);

  const updateLine = (index: number, patch: Partial<LineItem>) => {
    setLineItems((prev) => prev.map((li, i) => (i === index ? { ...li, ...patch } : li)));
  };

  const addLine = () => {
    setLineItems((prev) => [...prev, { item_id: '', product_name: '', description: '', quantity: '1', unit_price: '0' }]);
  };

  const removeLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!id) return;
    setError('');
    if (!header.supplier_id) return setError('Supplier is required');
    if (!header.purchase_order_number.trim()) return setError('PO number is required');

    const cleanItems = totals.parsed
      .filter((li) => li.qty > 0)
      .map((li) => ({
        item_id: li.item_id || null,
        product_name: li.product_name.trim(),
        description: li.description.trim() ? li.description.trim() : null,
        quantity: li.qty,
        unit_price: li.price,
        amount: li.amount,
      }))
      .filter((li) => li.product_name.length > 0);

    if (cleanItems.length === 0) return setError('Add at least one valid line item');

    setSaving(true);
    try {
      const { data: updated, error: updateError } = await supabase
        .from('purchase_orders')
        .update({
          supplier_id: header.supplier_id,
          purchase_order_number: header.purchase_order_number.trim(),
          order_date: header.order_date,
          subtotal: totals.subtotal,
          discount_percentage: totals.discountPct,
          discount_amount: totals.discountAmount,
          tax_amount: totals.taxAmount,
          total: totals.total,
          terms_and_conditions: toNullable(header.terms_and_conditions),
          status: header.status,
        })
        .eq('id', id)
        .select(
          'id,supplier_id,purchase_order_number,order_date,subtotal,discount_percentage,discount_amount,tax_amount,total,terms_and_conditions,status,created_at'
        )
        .single();
      if (updateError) throw updateError;

      const { error: deleteItemsError } = await supabase.from('purchase_order_items').delete().eq('purchase_order_id', id);
      if (deleteItemsError) throw deleteItemsError;

      const { error: insertItemsError } = await supabase.from('purchase_order_items').insert(
        cleanItems.map((li) => ({
          purchase_order_id: id,
          ...li,
        }))
      );
      if (insertItemsError) throw insertItemsError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('id,item_id,product_name,description,quantity,unit_price,amount')
        .eq('purchase_order_id', id)
        .order('created_at', { ascending: true });
      if (itemsError) throw itemsError;

      setDoc(updated as PurchaseOrderHeader);
      setDocItems((itemsData || []) as PurchaseOrderItem[]);
      setMode('view');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update purchase order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Delete this purchase order? This cannot be undone.');
    if (!ok) return;
    setDeleting(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('purchase_orders').delete().eq('id', id);
      if (deleteError) throw deleteError;
      navigate('/purchases/orders');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete purchase order');
    } finally {
      setDeleting(false);
    }
  };

  const supplierName = useMemo(() => {
    if (!doc) return '';
    return suppliers.find((s) => s.id === doc.supplier_id)?.name || doc.supplier_id;
  }, [doc, suppliers]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/purchases/orders')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Purchase Order' : doc?.purchase_order_number || 'Purchase Order'}
            </h1>
            <p className="text-gray-600 mt-1">{mode === 'edit' ? 'Update purchase order' : `Supplier: ${supplierName}`}</p>
          </div>
        </div>

        {!loading && doc ? (
          <div className="flex items-center gap-2">
            {mode === 'view' ? (
              <>
                <button onClick={() => setMode('edit')} className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800">
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
                    if (doc) {
                      setHeader({
                        supplier_id: doc.supplier_id,
                        purchase_order_number: doc.purchase_order_number,
                        order_date: doc.order_date,
                        discount_percentage: String(doc.discount_percentage ?? 0),
                        tax_type: doc.tax_amount > 0 ? 'VAT' : 'Non-Tax',
                        terms_and_conditions: doc.terms_and_conditions || '',
                        status: (doc.status || 'draft') as PurchaseOrderStatus,
                      });
                      setLineItems(docItems.map(mapToLineItem));
                    }
                    setError('');
                    setMode('view');
                  }}
                  disabled={saving}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-50">
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
        ) : !doc ? (
          <div className="p-8 text-center text-gray-500">Purchase order not found.</div>
        ) : mode === 'edit' ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FieldShell label="Supplier" required>
                  <SelectInput value={header.supplier_id} onChange={(e) => setHeader({ ...header, supplier_id: e.target.value })}>
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>
              </div>
              <FieldShell label="PO Number" required>
                <TextInput value={header.purchase_order_number} onChange={(e) => setHeader({ ...header, purchase_order_number: e.target.value })} />
              </FieldShell>
              <FieldShell label="Order Date" required>
                <TextInput type="date" value={header.order_date} onChange={(e) => setHeader({ ...header, order_date: e.target.value })} />
              </FieldShell>
              <FieldShell label="Discount (%)">
                <TextInput type="number" min="0" step="0.01" value={header.discount_percentage} onChange={(e) => setHeader({ ...header, discount_percentage: e.target.value })} />
              </FieldShell>
              <FieldShell label="Tax Type" required>
                <SelectInput value={header.tax_type} onChange={(e) => setHeader({ ...header, tax_type: e.target.value })}>
                  <option value="Non-Tax">Non-Tax</option>
                  <option value="VAT">VAT</option>
                  <option value="Exempt">Exempt</option>
                </SelectInput>
              </FieldShell>
              <div className="md:col-span-2">
                <FieldShell label="Terms and Conditions">
                  <TextareaInput rows={3} value={header.terms_and_conditions} onChange={(e) => setHeader({ ...header, terms_and_conditions: e.target.value })} />
                </FieldShell>
              </div>
              <div className="md:col-span-2">
                <FieldShell label="Status">
                  <SelectInput value={header.status} onChange={(e) => setHeader({ ...header, status: e.target.value as PurchaseOrderStatus })}>
                    <option value="draft">draft</option>
                    <option value="sent">sent</option>
                    <option value="received">received</option>
                    <option value="cancelled">cancelled</option>
                  </SelectInput>
                </FieldShell>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="font-medium text-gray-900">Line Items</div>
                <button type="button" onClick={addLine} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add line
                </button>
              </div>
              <div className="p-4 space-y-4">
                {lineItems.map((li, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-3">
                      <FieldShell label="Item">
                        <SelectInput
                          value={li.item_id}
                          onChange={(e) => {
                            const itemId = e.target.value;
                            const selected = items.find((it) => it.id === itemId);
                            updateLine(index, {
                              item_id: itemId,
                              product_name: selected ? selected.name : li.product_name,
                              unit_price: selected ? String(selected.unit_price) : li.unit_price,
                            });
                          }}
                        >
                          <option value="">Custom</option>
                          {items.map((it) => (
                            <option key={it.id} value={it.id}>
                              {it.item_code} - {it.name}
                            </option>
                          ))}
                        </SelectInput>
                      </FieldShell>
                    </div>
                    <div className="md:col-span-3">
                      <FieldShell label="Product name" required>
                        <TextInput value={li.product_name} onChange={(e) => updateLine(index, { product_name: e.target.value })} />
                      </FieldShell>
                    </div>
                    <div className="md:col-span-2">
                      <FieldShell label="Qty" required>
                        <TextInput type="number" min="0" step="0.01" value={li.quantity} onChange={(e) => updateLine(index, { quantity: e.target.value })} />
                      </FieldShell>
                    </div>
                    <div className="md:col-span-2">
                      <FieldShell label="Unit price" required>
                        <TextInput type="number" min="0" step="0.01" value={li.unit_price} onChange={(e) => updateLine(index, { unit_price: e.target.value })} />
                      </FieldShell>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        Amount: <span className="font-medium text-gray-900">{Number(totals.parsed[index]?.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <button type="button" onClick={() => removeLine(index)} disabled={lineItems.length === 1} className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="md:col-span-12">
                      <FieldShell label="Description">
                        <TextareaInput rows={2} value={li.description} onChange={(e) => updateLine(index, { description: e.target.value })} />
                      </FieldShell>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Subtotal</div>
                  <div className="font-medium text-gray-900">{totals.subtotal.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Discount</div>
                  <div className="font-medium text-gray-900">{totals.discountAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Tax</div>
                  <div className="font-medium text-gray-900">{totals.taxAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Total</div>
                  <div className="font-semibold text-gray-900">{totals.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Status</div>
                <div className="mt-1">
                  <StatusBadge status={doc.status} />
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Date</div>
                <div className="font-medium text-gray-900 mt-1">{new Date(doc.order_date).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Supplier</div>
                <div className="font-medium text-gray-900 mt-1">{supplierName}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total</div>
                <div className="font-semibold text-gray-900 mt-1">{formatMoney(doc.total, 'KES')}</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {docItems.map((li) => (
                    <tr key={li.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{li.product_name}</div>
                        {li.description ? <div className="text-gray-600 text-xs mt-1">{li.description}</div> : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{li.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatMoney(li.unit_price, 'KES')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatMoney(li.amount, 'KES')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

