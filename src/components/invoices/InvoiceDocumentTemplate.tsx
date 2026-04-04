import { QRCodeSVG } from 'qrcode.react';
import { formatMoney } from '../../services/numbers';

export type InvoiceDocumentOrganization = {
  name: string;
  pin: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  logo_url?: string | null;
};

export type InvoiceDocumentCustomer = {
  name: string;
  pin: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
};

export type InvoiceDocumentLine = {
  id: string;
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  amount: number;
};

export type InvoiceDocumentHeader = {
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  tax_type: string;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  terms_and_conditions: string | null;
  status: string;
};

type Props = {
  organization: InvoiceDocumentOrganization | null;
  customer: InvoiceDocumentCustomer | null;
  /** @deprecated prefer `customer` */
  customerName?: string;
  invoice: InvoiceDocumentHeader;
  invoiceItems: InvoiceDocumentLine[];
  /** When set, shows a QR that opens this URL (public invoice view). */
  qrUrl?: string | null;
};

function joinParts(parts: (string | null | undefined)[]): string {
  return parts
    .map((p) => (p != null ? String(p).trim() : ''))
    .filter(Boolean)
    .join(', ');
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function InvoiceDocumentTemplate({
  organization,
  customer,
  customerName,
  invoice,
  invoiceItems,
  qrUrl,
}: Props) {
  const buyerName = customer?.name?.trim() || customerName?.trim() || 'Customer';
  const org = organization;

  const fromAddress = joinParts([org?.address, org?.city, org?.postal_code, org?.country]);
  const toAddress = joinParts([
    customer?.address,
    customer?.city,
    customer?.postal_code,
    customer?.country,
  ]);

  return (
    <div className="print:block relative text-slate-800">
      {/* KRA-style watermark */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 opacity-[0.06]">
            <div className="h-40 w-40 rounded-full border-[10px] border-slate-500" />
            <p className="max-w-md text-center text-2xl font-bold uppercase tracking-[0.2em] text-slate-600 md:text-4xl">
              Kenya Revenue Authority
            </p>
          </div>
        </div>
      </div>

      {/* Decorative top accent */}
      <div
        className="absolute left-0 right-0 top-0 h-2 opacity-40"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgb(244 63 94 / 0.35) 0px, rgb(244 63 94 / 0.35) 24px, transparent 24px, transparent 48px)',
        }}
        aria-hidden
      />

      <div className="relative z-10 pt-4">
        {/* Title row + QR */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">INVOICE</h1>
            {org?.logo_url ? (
              <div className="mt-4">
                <img
                  src={org.logo_url}
                  alt=""
                  className="h-14 max-w-[200px] object-contain object-left"
                />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col items-center sm:items-end">
            {qrUrl ? (
              <>
                <QRCodeSVG value={qrUrl} size={112} level="M" includeMargin className="rounded-lg bg-white p-1" />
                <p className="mt-2 text-center text-xs font-medium text-slate-600 sm:text-right">
                  Invoice ID: <span className="font-semibold text-slate-800">{invoice.invoice_number}</span>
                </p>
              </>
            ) : (
              <p className="text-xs font-medium text-slate-600">
                Invoice ID: <span className="font-semibold text-slate-800">{invoice.invoice_number}</span>
              </p>
            )}
          </div>
        </div>

        {/* Three columns */}
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          <div>
            <div className="mb-3 inline-block rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              Invoice from
            </div>
            <div className="space-y-1 text-sm leading-relaxed">
              <p className="text-base font-bold text-slate-900">{org?.name || 'Company'}</p>
              {org?.pin ? (
                <p>
                  <span className="text-slate-500">PIN:</span> {org.pin}
                </p>
              ) : null}
              {org?.email ? <p>{org.email}</p> : null}
              {fromAddress ? <p>{fromAddress}</p> : null}
              {org?.phone ? <p>{org.phone}</p> : null}
            </div>
          </div>

          <div>
            <div className="mb-3 inline-block rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              Invoice to
            </div>
            <div className="space-y-1 text-sm leading-relaxed">
              <p className="text-base font-bold text-slate-900">{buyerName}</p>
              {customer?.pin ? (
                <p>
                  <span className="text-slate-500">PIN:</span> {customer.pin}
                </p>
              ) : null}
              {customer?.email ? <p>{customer.email}</p> : null}
              {toAddress ? <p>{toAddress}</p> : null}
              {customer?.phone ? <p>{customer.phone}</p> : null}
            </div>
          </div>

          <div>
            <div className="mb-3 inline-block rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              Invoice details
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="mb-1 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  Invoice number
                </span>
                <p className="mt-1 font-semibold text-slate-900">N°: {invoice.invoice_number}</p>
              </div>
              <div>
                <span className="mb-1 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  Invoice date
                </span>
                <p className="mt-1 font-semibold text-slate-900">{formatDisplayDate(invoice.invoice_date)}</p>
              </div>
              {invoice.due_date ? (
                <div>
                  <span className="mb-1 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    Due date
                  </span>
                  <p className="mt-1 font-semibold text-slate-900">{formatDisplayDate(invoice.due_date)}</p>
                </div>
              ) : null}
              <p className="text-xs text-slate-500">
                Status: <span className="font-medium capitalize text-slate-700">{invoice.status}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="mb-10 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="w-20 px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((li) => (
                <tr key={li.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 align-top">
                    <div className="font-semibold text-slate-900">{li.product_name}</div>
                    {li.description ? (
                      <div className="mt-1 text-xs text-slate-500">{li.description}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-right align-top text-slate-800">{formatMoney(li.unit_price, 'KES')}</td>
                  <td className="px-4 py-4 text-right align-top text-slate-800">{li.quantity}</td>
                  <td className="px-4 py-4 text-right align-top font-semibold text-slate-900">
                    {formatMoney(li.amount, 'KES')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Terms + totals */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-12">
          <div className="max-w-xl flex-1 space-y-6 text-sm">
            {invoice.terms_and_conditions ? (
              <div>
                <h3 className="mb-2 font-bold text-slate-900">Terms &amp; Conditions</h3>
                <p className="leading-relaxed text-slate-600 whitespace-pre-wrap">{invoice.terms_and_conditions}</p>
              </div>
            ) : null}
          </div>

          <div className="w-full shrink-0 space-y-2 text-sm lg:w-80">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{formatMoney(invoice.subtotal, 'KES')}</span>
            </div>
            {invoice.discount_amount > 0 ? (
              <div className="flex justify-between text-slate-600">
                <span>
                  Discount
                  {invoice.discount_percentage > 0 ? ` (${Number(invoice.discount_percentage)}%)` : ''}
                </span>
                <span className="font-medium text-slate-900">{formatMoney(-invoice.discount_amount, 'KES')}</span>
              </div>
            ) : null}
            {invoice.tax_amount > 0 ? (
              <div className="flex justify-between text-slate-600">
                <span>TAX {invoice.tax_type ? `(${invoice.tax_type})` : ''}</span>
                <span className="font-medium text-slate-900">{formatMoney(invoice.tax_amount, 'KES')}</span>
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-100/90 px-4 py-4 shadow-sm">
              <span className="font-semibold text-slate-800">Invoice total</span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {formatMoney(invoice.total, 'KES')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
