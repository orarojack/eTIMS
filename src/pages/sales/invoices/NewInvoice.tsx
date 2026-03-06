import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getCurrentOrganizationId } from '../../../services/organization';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import { FieldShell, SelectInput, TextInput, TextareaInput } from '../../../components/ui/forms';

type CustomerOption = { id: string; name: string };
type ItemOption = { id: string; item_code: string; name: string; unit_price: number };

type LineItem = {
  item_id: string;
  product_name: string;
  description: string;
  quantity: string;
  unit_price: string;
};

type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'cancelled';

function makeInvoiceNumber() {
  const ts = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  return `INV-${ts}`;
}

export default function NewInvoice() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [header, setHeader] = useState({
    customer_id: '',
    invoice_number: makeInvoiceNumber(),
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    sale_type: 'B2C',
    tax_type: 'Non-Tax',
    discount_percentage: '0',
    payment_method: '',
    terms_and_conditions: '',
    status: 'draft' as InvoiceStatus,
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item_id: '', product_name: '', description: '', quantity: '1', unit_price: '0' },
  ]);

  useEffect(() => {
    void (async () => {
      try {
        setError('');
        const orgId = await getCurrentOrganizationId();

        const { data, error: fetchError } = await supabase
          .from('customers')
          .select('id,name')
          .eq('organization_id', orgId)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setCustomers((data || []) as CustomerOption[]);

        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('id,item_code,name,unit_price')
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });

        if (itemError) throw itemError;
        setItems((itemData || []) as ItemOption[]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load customers');
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const parsed = lineItems.map((li) => {
      const qty = Number(li.quantity);
      const price = Number(li.unit_price);
      const amount = (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(price) ? price : 0);
      return { ...li, qty, price, amount };
    });

    const subtotal = parsed.reduce((sum, li) => sum + li.amount, 0);
    const discountPct = Number(header.discount_percentage);
    const discountAmount = Number.isFinite(discountPct) ? (subtotal * discountPct) / 100 : 0;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = header.tax_type === 'VAT' ? taxable * 0.16 : 0;
    const total = taxable + taxAmount;

    return { parsed, subtotal, discountPct: discountPct || 0, discountAmount, taxAmount, total };
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const orgId = await getCurrentOrganizationId();
      if (!header.customer_id) throw new Error('Customer is required');
      if (!header.invoice_number.trim()) throw new Error('Invoice number is required');
      if (!header.invoice_date) throw new Error('Invoice date is required');
      if (lineItems.length === 0) throw new Error('Add at least one line item');

      const cleanItems = totals.parsed
        .filter((li) => li.qty > 0 && li.amount >= 0)
        .map((li) => ({
          item_id: li.item_id || null,
          product_name: li.product_name.trim(),
          description: li.description.trim() ? li.description.trim() : null,
          quantity: li.qty,
          unit_price: li.price,
          amount: li.amount,
        }))
        .filter((li) => li.product_name.length > 0);

      if (cleanItems.length === 0) throw new Error('Add at least one valid line item');

      setLoading(true);

      const { data: invoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
        organization_id: orgId,
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
        terms_and_conditions: header.terms_and_conditions.trim() ? header.terms_and_conditions.trim() : null,
        payment_method: header.payment_method.trim() ? header.payment_method.trim() : null,
        status: header.status,
      })
        .select('id')
        .single();

      if (insertError) throw insertError;

      const { error: itemInsertError } = await supabase.from('invoice_items').insert(
        cleanItems.map((li) => ({
          invoice_id: invoice.id,
          ...li,
        }))
      );

      if (itemInsertError) {
        await supabase.from('invoices').delete().eq('id', invoice.id);
        throw itemInsertError;
      }

      navigate(`/sales/invoices/${invoice.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/sales/invoices')} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-1">Add a new sales invoice</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {error ? <ErrorBanner message={error} className="mb-4" /> : null}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  <SelectInput
                    value={header.status}
                    onChange={(e) => setHeader({ ...header, status: e.target.value as InvoiceStatus })}
                  >
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
                            const id = e.target.value;
                            const selected = items.find((it) => it.id === id);
                            updateLine(index, {
                              item_id: id,
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

            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/sales/invoices')}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

