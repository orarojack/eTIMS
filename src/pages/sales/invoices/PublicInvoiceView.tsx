import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import Spinner from '../../../components/ui/Spinner';
import { InvoiceDocumentShell } from '../../../components/invoices/InvoiceDocumentShell';
import { getPublicInvoiceViewUrl } from '../../../services/publicInvoiceUrl';
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

function normalizeShareToken(raw: string | undefined): string {
  if (!raw?.trim()) return '';
  const t = raw.trim();
  try {
    return decodeURIComponent(t);
  } catch {
    return t;
  }
}

function parseRpcJson(raw: unknown): RpcPayload | null {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return typeof parsed === 'object' && parsed !== null ? (parsed as RpcPayload) : null;
    } catch {
      return null;
    }
  }
  if (typeof raw === 'object') {
    return raw as RpcPayload;
  }
  return null;
}

function getErrorMessage(e: unknown): string {
  if (e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message;
  }
  return 'Failed to load invoice';
}

export default function PublicInvoiceView() {
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams<{ token: string }>();

  const resolvedToken = useMemo(() => {
    const fromQuery = searchParams.get('token') ?? searchParams.get('t');
    return normalizeShareToken(fromQuery ?? pathToken);
  }, [searchParams, pathToken]);

  const printRef = useRef<HTMLDivElement>(null);
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
        if (!resolvedToken) {
          setError('Invalid link');
          return;
        }
        const { data: raw, error: rpcError } = await supabase.rpc('get_public_sales_invoice', {
          p_token: resolvedToken,
        });
        if (rpcError) {
          setError(
            [rpcError.message, rpcError.details].filter(Boolean).join(' — ') || 'Could not load invoice from server'
          );
          return;
        }
        const p = parseRpcJson(raw);
        if (!p) {
          setError('Invoice not found');
          return;
        }
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
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedToken]);

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

  const qrUrl = resolvedToken ? getPublicInvoiceViewUrl(resolvedToken) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="no-print mx-auto mb-4 flex max-w-4xl justify-end px-0">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>
      <InvoiceDocumentShell ref={printRef}>
        <InvoiceDocumentTemplate
          organization={payload.organization}
          customer={payload.customer}
          invoice={payload.invoice}
          invoiceItems={payload.items}
          qrUrl={qrUrl}
        />
      </InvoiceDocumentShell>
    </div>
  );
}
