/*
  Extend get_public_sales_invoice: full customer block + organization logo_url for invoice template.
*/

CREATE OR REPLACE FUNCTION public.get_public_sales_invoice(p_token text)
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
      'id', i.id,
      'invoice_number', i.invoice_number,
      'invoice_date', i.invoice_date::text,
      'due_date', CASE WHEN i.due_date IS NULL THEN NULL ELSE i.due_date::text END,
      'sale_type', i.sale_type,
      'tax_type', i.tax_type,
      'subtotal', i.subtotal,
      'discount_percentage', i.discount_percentage,
      'discount_amount', i.discount_amount,
      'tax_amount', i.tax_amount,
      'total', i.total,
      'terms_and_conditions', i.terms_and_conditions,
      'payment_method', i.payment_method,
      'status', i.status
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
            'id', ii.id,
            'product_name', ii.product_name,
            'description', ii.description,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'amount', ii.amount
          )
          ORDER BY ii.created_at
        )
        FROM public.invoice_items ii
        WHERE ii.invoice_id = i.id
      ),
      '[]'::jsonb
    )
  )
  INTO result
  FROM public.invoices i
  LEFT JOIN public.organizations o ON o.id = i.organization_id
  LEFT JOIN public.customers c ON c.id = i.customer_id
  WHERE i.qr_code = t;

  RETURN result;
END;
$$;
