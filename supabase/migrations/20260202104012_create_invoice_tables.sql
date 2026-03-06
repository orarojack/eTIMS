/*
  # KRA eTIMS Invoicing System - Invoice Tables

  1. New Tables
    - `invoices` - Sales invoices
    - `invoice_items` - Line items for invoices
    - `credit_notes` - Credit notes for invoice cancellations
    - `credit_note_items` - Line items for credit notes

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  invoice_number text NOT NULL,
  invoice_date date NOT NULL,
  due_date date,
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
  etims_cu_invoice_number text,
  qr_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id),
  product_name text NOT NULL,
  description text,
  quantity decimal NOT NULL,
  unit_price decimal NOT NULL,
  amount decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create credit_notes table
CREATE TABLE IF NOT EXISTS credit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  invoice_id uuid REFERENCES invoices(id) NOT NULL,
  customer_id uuid REFERENCES customers(id) NOT NULL,
  credit_note_number text NOT NULL,
  credit_note_date date NOT NULL,
  credit_type text DEFAULT 'full',
  subtotal decimal NOT NULL,
  discount_percentage decimal DEFAULT 0,
  discount_amount decimal DEFAULT 0,
  tax_amount decimal DEFAULT 0,
  total decimal NOT NULL,
  etims_credit_note_number text,
  qr_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credit_note_items table
CREATE TABLE IF NOT EXISTS credit_note_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_note_id uuid REFERENCES credit_notes(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id),
  product_name text NOT NULL,
  description text,
  quantity decimal NOT NULL,
  unit_price decimal NOT NULL,
  amount decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_note_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices in their organization"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices in their organization"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update invoices in their organization"
  ON invoices FOR UPDATE
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

CREATE POLICY "Users can delete invoices in their organization"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for invoice_items
CREATE POLICY "Users can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create invoice items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update invoice items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete invoice items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for credit_notes
CREATE POLICY "Users can view credit notes in their organization"
  ON credit_notes FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create credit notes in their organization"
  ON credit_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update credit notes in their organization"
  ON credit_notes FOR UPDATE
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

CREATE POLICY "Users can delete credit notes in their organization"
  ON credit_notes FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for credit_note_items
CREATE POLICY "Users can view credit note items"
  ON credit_note_items FOR SELECT
  TO authenticated
  USING (
    credit_note_id IN (
      SELECT id FROM credit_notes WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create credit note items"
  ON credit_note_items FOR INSERT
  TO authenticated
  WITH CHECK (
    credit_note_id IN (
      SELECT id FROM credit_notes WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update credit note items"
  ON credit_note_items FOR UPDATE
  TO authenticated
  USING (
    credit_note_id IN (
      SELECT id FROM credit_notes WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    credit_note_id IN (
      SELECT id FROM credit_notes WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete credit note items"
  ON credit_note_items FOR DELETE
  TO authenticated
  USING (
    credit_note_id IN (
      SELECT id FROM credit_notes WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );