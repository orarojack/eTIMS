/*
  # KRA eTIMS Invoicing System - Proforma and Quotation Tables

  1. New Tables
    - `proforma_invoices` - Proforma invoices
    - `proforma_items` - Line items for proforma invoices
    - `quotations` - Quotations
    - `quotation_items` - Line items for quotations

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control
*/

-- Create proforma_invoices table
CREATE TABLE IF NOT EXISTS proforma_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  proforma_number text NOT NULL,
  proforma_date date NOT NULL,
  sale_type text DEFAULT 'B2C',
  tax_type text DEFAULT 'Non-Tax',
  subtotal decimal NOT NULL,
  discount_percentage decimal DEFAULT 0,
  discount_amount decimal DEFAULT 0,
  tax_amount decimal DEFAULT 0,
  total decimal NOT NULL,
  terms_and_conditions text,
  payment_method text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create proforma_items table
CREATE TABLE IF NOT EXISTS proforma_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proforma_id uuid REFERENCES proforma_invoices(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id),
  product_name text NOT NULL,
  description text,
  quantity decimal NOT NULL,
  unit_price decimal NOT NULL,
  amount decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  quotation_number text NOT NULL,
  quotation_date date NOT NULL,
  sale_type text DEFAULT 'B2C',
  tax_type text DEFAULT 'Non-Tax',
  subtotal decimal NOT NULL,
  discount_percentage decimal DEFAULT 0,
  discount_amount decimal DEFAULT 0,
  tax_amount decimal DEFAULT 0,
  total decimal NOT NULL,
  terms_and_conditions text,
  payment_method text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id),
  product_name text NOT NULL,
  description text,
  quantity decimal NOT NULL,
  unit_price decimal NOT NULL,
  amount decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE proforma_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE proforma_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proforma_invoices
CREATE POLICY "Users can view proforma invoices in their organization"
  ON proforma_invoices FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create proforma invoices in their organization"
  ON proforma_invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update proforma invoices in their organization"
  ON proforma_invoices FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete proforma invoices in their organization"
  ON proforma_invoices FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for proforma_items
CREATE POLICY "Users can view proforma items"
  ON proforma_items FOR SELECT
  TO authenticated
  USING (
    proforma_id IN (
      SELECT id FROM proforma_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create proforma items"
  ON proforma_items FOR INSERT
  TO authenticated
  WITH CHECK (
    proforma_id IN (
      SELECT id FROM proforma_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update proforma items"
  ON proforma_items FOR UPDATE
  TO authenticated
  USING (
    proforma_id IN (
      SELECT id FROM proforma_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    proforma_id IN (
      SELECT id FROM proforma_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete proforma items"
  ON proforma_items FOR DELETE
  TO authenticated
  USING (
    proforma_id IN (
      SELECT id FROM proforma_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for quotations
CREATE POLICY "Users can view quotations in their organization"
  ON quotations FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create quotations in their organization"
  ON quotations FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotations in their organization"
  ON quotations FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quotations in their organization"
  ON quotations FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for quotation_items
CREATE POLICY "Users can view quotation items"
  ON quotation_items FOR SELECT
  TO authenticated
  USING (
    quotation_id IN (
      SELECT id FROM quotations WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create quotation items"
  ON quotation_items FOR INSERT
  TO authenticated
  WITH CHECK (
    quotation_id IN (
      SELECT id FROM quotations WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update quotation items"
  ON quotation_items FOR UPDATE
  TO authenticated
  USING (
    quotation_id IN (
      SELECT id FROM quotations WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    quotation_id IN (
      SELECT id FROM quotations WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete quotation items"
  ON quotation_items FOR DELETE
  TO authenticated
  USING (
    quotation_id IN (
      SELECT id FROM quotations WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );