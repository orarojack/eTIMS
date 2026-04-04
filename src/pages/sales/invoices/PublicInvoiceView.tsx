import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import Spinner from '../../../components/ui/Spinner';
import InvoiceDocumentTemplate, {
  type InvoiceDocumentCustomer,
  type InvoiceDocumentHeader,
  type InvoiceDocumentLine,
  type InvoiceDocumentOrganization,
} from '../../../components/invoices/InvoiceDocumentTemplate';

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

type RpcPayload = {
  invoice: Record<string, unknown>;
  organization: Record<string, unknown> | null;
  customer: Record<string, unknown> | null;
  items?: unknown[];
};

export default function PublicInvoiceView() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState<{
    invoice: InvoiceDocumentHeader;
    organization: InvoiceDocumentOrganization | null;
    customer: InvoiceDocumentCustomer | null;
    items: InvoiceDocumentLine[];
  } | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      setPayload(null);
      try {
        if (!token?.trim()) {
          setError('Invalid link');
          return;
        }
        const decoded = decodeURIComponent(token);
        const { data: raw, error: rpcError } = await supabase.rpc('get_public_sales_invoice', {
          p_token: decoded,
        });
        if (rpcError) throw rpcError;
        if (raw == null || typeof raw !== 'object') {
          setError('Invoice not found');
          return;
        }
        const p = raw as RpcPayload;
        const inv = p.invoice;
        if (!inv || typeof inv !== 'object') {
          setError('Invoice not found');
          return;
        }

        const invoice: InvoiceDocumentHeader = {
          invoice_number: String(inv.invoice_number ?? ''),
          invoice_date: String(inv.invoice_date ?? ''),
          due_date: inv.due_date != null ? String(inv.due_date) : null,
          tax_type: String(inv.tax_type ?? 'Non-Tax'),
          subtotal: num(inv.subtotal),
          discount_percentage: num(inv.discount_percentage),
          discount_amount: num(inv.discount_amount),
          tax_amount: num(inv.tax_amount),
          total: num(inv.total),
          terms_and_conditions: inv.terms_and_conditions != null ? String(inv.terms_and_conditions) : null,
          status: String(inv.status ?? 'draft'),
        };

        const orgRaw = p.organization;
        let organization: InvoiceDocumentOrganization | null = null;
        if (orgRaw && typeof orgRaw === 'object') {
          organization = {
            name: String(orgRaw.name ?? 'Company'),
            pin: orgRaw.pin != null ? String(orgRaw.pin) : null,
            email: orgRaw.email != null ? String(orgRaw.email) : null,
            phone: orgRaw.phone != null ? String(orgRaw.phone) : null,
            address: orgRaw.address != null ? String(orgRaw.address) : null,
            city: orgRaw.city != null ? String(orgRaw.city) : null,
            postal_code: orgRaw.postal_code != null ? String(orgRaw.postal_code) : null,
            country: String(orgRaw.country ?? ''),
            logo_url: orgRaw.logo_url != null ? String(orgRaw.logo_url) : null,
          };
        }

        let customer: InvoiceDocumentCustomer | null = null;
        const custRaw = p.customer;
        if (custRaw && typeof custRaw === 'object' && custRaw !== null) {
          const c = custRaw as Record<string, unknown>;
          customer = {
            name: String(c.name ?? ''),
            pin: c.pin != null ? String(c.pin) : null,
            email: c.email != null ? String(c.email) : null,
            phone: c.phone != null ? String(c.phone) : null,
            address: c.address != null ? String(c.address) : null,
            city: c.city != null ? String(c.city) : null,
            postal_code: c.postal_code != null ? String(c.postal_code) : null,
            country: String(c.country ?? ''),
          };
        }

        const itemsRaw = Array.isArray(p.items) ? p.items : [];
        const items: InvoiceDocumentLine[] = itemsRaw.map((row, i) => {
          const r = row as Record<string, unknown>;
          return {
            id: String(r.id ?? `line-${i}`),
            product_name: String(r.product_name ?? ''),
            description: r.description != null ? String(r.description) : null,
            quantity: num(r.quantity),
            unit_price: num(r.unit_price),
            amount: num(r.amount),
          };
        });

        setPayload({
          invoice,
          organization,
          customer,
          items,
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-700">{error || 'Invoice not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 print:bg-white">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-lg print:shadow-none md:p-10 print:p-6">
        <InvoiceDocumentTemplate
          organization={payload.organization}
          customer={payload.customer}
          invoice={payload.invoice}
          invoiceItems={payload.items}
        />
      </div>
    </div>
  );
}
