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

type CustomerOption = { id: string; name: string };
type ItemOption = { id: string; item_code: string; name: string; unit_price: number };

type InvoiceHeader = {
  id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  sale_type: string;
  tax_type: string;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  terms_and_conditions: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
};

type InvoiceItem = {
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

function mapInvoiceItemToLineItem(li: InvoiceItem): LineItem {
  return {
    item_id: li.item_id || '',
    product_name: li.product_name,
    description: li.description || '',
    quantity: String(li.quantity),
    unit_price: String(li.unit_price),
  };
}

export default function InvoiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);

  const [invoice, setInvoice] = useState<InvoiceHeader | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  const [header, setHeader] = useState({
    customer_id: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    sale_type: 'B2C',
    tax_type: 'Non-Tax',
    discount_percentage: '0',
    payment_method: '',
    terms_and_conditions: '',
    status: 'draft',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item_id: '', product_name: '', description: '', quantity: '1', unit_price: '0' },
  ]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        if (!id) throw new Error('Missing invoice id');
        const orgId = await getCurrentOrganizationId();

        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id,name')
          .eq('organization_id', orgId)
          .order('name', { ascending: true });
        if (customersError) throw customersError;
        setCustomers((customersData || []) as CustomerOption[]);

        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('id,item_code,name,unit_price')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });
        if (itemError) throw itemError;
        setItems((itemData || []) as ItemOption[]);

        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select(
            'id,customer_id,invoice_number,invoice_date,due_date,sale_type,tax_type,subtotal,discount_percentage,discount_amount,tax_amount,total,terms_and_conditions,payment_method,status,created_at'
          )
          .eq('id', id)
          .single();
        if (invoiceError) throw invoiceError;

        const { data: itemsData, error: itemsError } = await supabase
          .from('invoice_items')
          .select('id,item_id,product_name,description,quantity,unit_price,amount')
          .eq('invoice_id', id)
          .order('created_at', { ascending: true });
        if (itemsError) throw itemsError;

        setInvoice(invoiceData as InvoiceHeader);
        setInvoiceItems((itemsData || []) as InvoiceItem[]);

        setHeader({
          customer_id: invoiceData.customer_id,
          invoice_number: invoiceData.invoice_number,
          invoice_date: invoiceData.invoice_date,
          due_date: invoiceData.due_date || '',
          sale_type: invoiceData.sale_type || 'B2C',
          tax_type: invoiceData.tax_type || 'Non-Tax',
          discount_percentage: String(invoiceData.discount_percentage ?? 0),
          payment_method: invoiceData.payment_method || '',
          terms_and_conditions: invoiceData.terms_and_conditions || '',
          status: invoiceData.status || 'draft',
        });
        setLineItems(((itemsData || []) as InvoiceItem[]).map(mapInvoiceItemToLineItem));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load invoice');
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
    if (!header.customer_id) {
      setError('Customer is required');
      return;
    }
    if (!header.invoice_number.trim()) {
      setError('Invoice number is required');
      return;
    }

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

    if (cleanItems.length === 0) {
      setError('Add at least one valid line item');
      return;
    }

    setSaving(true);
    try {
      const { error: updateError, data: updated } = await supabase
        .from('invoices')
        .update({
          customer_id: header.customer_id,
          invoice_number: header.invoice_number.trim(),
          invoice_date: header.invoice_date,
          due_date: header.due_date || null,
          sale_type: header.sale_type,
          tax_type: header.tax_type,
          subtotal: totals.subtotal,
          discount_percentage: totals.discountPct,
          discount_amount: totals.discountAmount,
          tax_amount: totals.taxAmount,
          total: totals.total,
          terms_and_conditions: toNullable(header.terms_and_conditions),
          payment_method: toNullable(header.payment_method),
          status: header.status,
        })
        .eq('id', id)
        .select(
          'id,customer_id,invoice_number,invoice_date,due_date,sale_type,tax_type,subtotal,discount_percentage,discount_amount,tax_amount,total,terms_and_conditions,payment_method,status,created_at'
        )
        .single();

      if (updateError) throw updateError;

      const { error: deleteItemsError } = await supabase.from('invoice_items').delete().eq('invoice_id', id);
      if (deleteItemsError) throw deleteItemsError;

      const { error: insertItemsError } = await supabase.from('invoice_items').insert(
        cleanItems.map((li) => ({
          invoice_id: id,
          ...li,
        }))
      );
      if (insertItemsError) throw insertItemsError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('id,item_id,product_name,description,quantity,unit_price,amount')
        .eq('invoice_id', id)
        .order('created_at', { ascending: true });
      if (itemsError) throw itemsError;

      setInvoice(updated as InvoiceHeader);
      setInvoiceItems((itemsData || []) as InvoiceItem[]);
      setMode('view');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Delete this invoice? This cannot be undone.');
    if (!ok) return;

    setDeleting(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('invoices').delete().eq('id', id);
      if (deleteError) throw deleteError;
      navigate('/sales/invoices');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete invoice');
    } finally {
      setDeleting(false);
    }
  };

  const customerName = useMemo(() => {
    if (!invoice) return '';
    return customers.find((c) => c.id === invoice.customer_id)?.name || invoice.customer_id;
  }, [customers, invoice]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/sales/invoices')} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Invoice' : invoice?.invoice_number || 'Invoice'}
            </h1>
            <p className="text-gray-600 mt-1">{mode === 'edit' ? 'Update invoice' : `Customer: ${customerName}`}</p>
          </div>
        </div>

        {!loading && invoice ? (
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
                    if (invoice) {
                      setHeader({
                        customer_id: invoice.customer_id,
                        invoice_number: invoice.invoice_number,
                        invoice_date: invoice.invoice_date,
                        due_date: invoice.due_date || '',
                        sale_type: invoice.sale_type || 'B2C',
                        tax_type: invoice.tax_type || 'Non-Tax',
                        discount_percentage: String(invoice.discount_percentage ?? 0),
                        payment_method: invoice.payment_method || '',
                        terms_and_conditions: invoice.terms_and_conditions || '',
                        status: invoice.status || 'draft',
                      });
                      setLineItems(invoiceItems.map(mapInvoiceItemToLineItem));
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
        ) : !invoice ? (
          <div className="p-8 text-center text-gray-500">Invoice not found.</div>
        ) : mode === 'edit' ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FieldShell label="Customer" required>
                  <SelectInput
                    required
                    value={header.customer_id}
                    onChange={(e) => setHeader({ ...header, customer_id: e.target.value })}
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </SelectInput>
                </FieldShell>
              </div>

              <FieldShell label="Invoice Number" required>
                <TextInput
                  required
                  value={header.invoice_number}
                  onChange={(e) => setHeader({ ...header, invoice_number: e.target.value })}
                />
              </FieldShell>

              <FieldShell label="Invoice Date" required>
                <TextInput
                  required
                  type="date"
                  value={header.invoice_date}
                  onChange={(e) => setHeader({ ...header, invoice_date: e.target.value })}
                />
              </FieldShell>

              <FieldShell label="Due Date">
                <TextInput
                  type="date"
                  value={header.due_date}
                  onChange={(e) => setHeader({ ...header, due_date: e.target.value })}
                />
              </FieldShell>

              <FieldShell label="Sale Type" required>
                <SelectInput value={header.sale_type} onChange={(e) => setHeader({ ...header, sale_type: e.target.value })}>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                </SelectInput>
              </FieldShell>

              <FieldShell label="Tax Type" required>
                <SelectInput value={header.tax_type} onChange={(e) => setHeader({ ...header, tax_type: e.target.value })}>
                  <option value="Non-Tax">Non-Tax</option>
                  <option value="VAT">VAT</option>
                  <option value="Exempt">Exempt</option>
                </SelectInput>
              </FieldShell>

              <FieldShell label="Discount (%)">
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  value={header.discount_percentage}
                  onChange={(e) => setHeader({ ...header, discount_percentage: e.target.value })}
                />
              </FieldShell>

              <FieldShell label="Payment Method">
                <TextInput value={header.payment_method} onChange={(e) => setHeader({ ...header, payment_method: e.target.value })} />
              </FieldShell>

              <div className="md:col-span-2">
                <FieldShell label="Terms and Conditions">
                  <TextareaInput
                    rows={3}
                    value={header.terms_and_conditions}
                    onChange={(e) => setHeader({ ...header, terms_and_conditions: e.target.value })}
                  />
                </FieldShell>
              </div>

              <div className="md:col-span-2">
                <FieldShell label="Status">
                  <SelectInput value={header.status} onChange={(e) => setHeader({ ...header, status: e.target.value })}>
                    <option value="draft">draft</option>
                    <option value="issued">issued</option>
                    <option value="paid">paid</option>
                    <option value="cancelled">cancelled</option>
                  </SelectInput>
                </FieldShell>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="font-medium text-gray-900">Line Items</div>
                <button
                  type="button"
                  onClick={addLine}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm inline-flex items-center gap-2"
                >
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
                        <TextInput
                          required
                          value={li.product_name}
                          onChange={(e) => updateLine(index, { product_name: e.target.value })}
                        />
                      </FieldShell>
                    </div>
                    <div className="md:col-span-2">
                      <FieldShell label="Qty" required>
                        <TextInput
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={li.quantity}
                          onChange={(e) => updateLine(index, { quantity: e.target.value })}
                        />
                      </FieldShell>
                    </div>
                    <div className="md:col-span-2">
                      <FieldShell label="Unit price" required>
                        <TextInput
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={li.unit_price}
                          onChange={(e) => updateLine(index, { unit_price: e.target.value })}
                        />
                      </FieldShell>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        Amount:{' '}
                        <span className="font-medium text-gray-900">
                          {Number(totals.parsed[index]?.amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        disabled={lineItems.length === 1}
                        className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        title="Remove line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="md:col-span-12">
                      <FieldShell label="Description">
                        <TextareaInput
                          rows={2}
                          value={li.description}
                          onChange={(e) => updateLine(index, { description: e.target.value })}
                        />
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
                  <StatusBadge status={invoice.status} />
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Invoice Date</div>
                <div className="font-medium text-gray-900 mt-1">{new Date(invoice.invoice_date).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Customer</div>
                <div className="font-medium text-gray-900 mt-1">{customerName}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">Total</div>
                <div className="font-semibold text-gray-900 mt-1">{formatMoney(invoice.total, 'KES')}</div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoiceItems.map((li) => (
                    <tr key={li.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{li.product_name}</div>
                        {li.description ? <div className="text-gray-600 text-xs mt-1">{li.description}</div> : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{li.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatMoney(li.unit_price, 'KES')}
                      </td>
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

