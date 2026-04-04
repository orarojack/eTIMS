/*
  Proforma public share link (qr_code) + RPC for anonymous template view (same payload shape as sales invoice).
*/

ALTER TABLE public.proforma_invoices
  ADD COLUMN IF NOT EXISTS qr_code text;

UPDATE public.proforma_invoices
SET qr_code = gen_random_uuid()::text
WHERE qr_code IS NULL OR trim(qr_code) = '';

CREATE UNIQUE INDEX IF NOT EXISTS proforma_invoices_qr_code_unique
  ON public.proforma_invoices (qr_code)
  WHERE qr_code IS NOT NULL AND trim(qr_code) <> '';

CREATE OR REPLACE FUNCTION public.get_public_proforma(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  t text;
BEGIN
  t := trim(p_token);
  IF t IS NULL OR t = '' THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'invoice', jsonb_build_object(
      'id', p.id,
      'invoice_number', p.proforma_number,
      'invoice_date', p.proforma_date::text,
      'due_date', NULL::text,
      'sale_type', p.sale_type,
      'tax_type', p.tax_type,
      'subtotal', p.subtotal,
      'discount_percentage', p.discount_percentage,
      'discount_amount', p.discount_amount,
      'tax_amount', p.tax_amount,
      'total', p.total,
      'terms_and_conditions', p.terms_and_conditions,
      'payment_method', p.payment_method,
      'status', p.status
    ),
    'organization', jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'pin', o.pin,
      'email', o.email,
      'phone', o.phone,
      'address', o.address,
      'city', o.city,
      'postal_code', o.postal_code,
      'country', o.country,
      'logo_url', o.logo_url
    ),
    'customer', CASE
      WHEN c.id IS NULL THEN NULL::jsonb
      ELSE jsonb_build_object(
        'name', c.name,
        'pin', c.pin,
        'email', c.email,
        'phone', c.phone,
        'address', c.address,
        'city', c.city,
        'postal_code', c.postal_code,
        'country', c.country
      )
    END,
    'items', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', pi.id,
            'product_name', pi.product_name,
            'description', pi.description,
            'quantity', pi.quantity,
            'unit_price', pi.unit_price,
            'amount', pi.amount
          )
          ORDER BY pi.created_at
        )
        FROM public.proforma_items pi
        WHERE pi.proforma_id = p.id
      ),
      '[]'::jsonb
    )
  )
  INTO result
  FROM public.proforma_invoices p
  LEFT JOIN public.organizations o ON o.id = p.organization_id
  LEFT JOIN public.customers c ON c.id = p.customer_id
  WHERE p.qr_code = t;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_proforma(text) TO anon, authenticated;
