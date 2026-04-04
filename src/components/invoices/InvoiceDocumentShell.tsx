import { forwardRef } from 'react';

/** Shared wrapper so View Template, public QR page, and print/PDF output match pixel-for-pixel. */
export const INVOICE_DOCUMENT_SHELL_CLASS =
  'bg-white p-8 max-w-4xl mx-auto rounded-lg shadow print:shadow-none print:p-0';

export const InvoiceDocumentShell = forwardRef<HTMLDivElement, React.PropsWithChildren>(
  function InvoiceDocumentShell({ children }, ref) {
    return (
      <div ref={ref} className={INVOICE_DOCUMENT_SHELL_CLASS}>
        {children}
      </div>
    );
  }
);
