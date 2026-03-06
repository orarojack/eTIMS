/*
  # KRA eTIMS Invoicing System - Purchase Tables

  1. New Tables
    - `purchase_orders` - Purchase orders
    - `purchase_order_items` - Line items for purchase orders
    - `purchase_invoices` - Purchase invoices/bills
    - `purchase_invoice_items` - Line items for purchase invoices

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control
*/

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) NOT NULL,
  purchase_order_number text NOT NULL,
  order_date date NOT NULL,
  subtotal decimal NOT NULL,
  discount_percentage decimal DEFAULT 0,
  discount_amount decimal DEFAULT 0,
  tax_amount decimal DEFAULT 0,
  total decimal NOT NULL,
  terms_and_conditions text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id),
  product_name text NOT NULL,
  description text,
  quantity decimal NOT NULL,
  unit_price decimal NOT NULL,
  amount decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create purchase_invoices table
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) NOT NULL,
  bill_number text NOT NULL,
  bill_date date NOT NULL,
  due_date date,
  subtotal decimal NOT NULL,
  discount_percentage decimal DEFAULT 0,
  discount_amount decimal DEFAULT 0,
  tax_amount decimal DEFAULT 0,
  total decimal NOT NULL,
  terms_and_conditions text,
  status text DEFAULT 'unpaid',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_invoice_items table
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_invoice_id uuid REFERENCES purchase_invoices(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id),
  product_name text NOT NULL,
  description text,
  quantity decimal NOT NULL,
  unit_price decimal NOT NULL,
  amount decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_orders
CREATE POLICY "Users can view purchase orders in their organization"
  ON purchase_orders FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create purchase orders in their organization"
  ON purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update purchase orders in their organization"
  ON purchase_orders FOR UPDATE
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

CREATE POLICY "Users can delete purchase orders in their organization"
  ON purchase_orders FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for purchase_order_items
CREATE POLICY "Users can view purchase order items"
  ON purchase_order_items FOR SELECT
  TO authenticated
  USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create purchase order items"
  ON purchase_order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    purchase_order_id IN (
      SELECT id FROM purchase_orders WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update purchase order items"
  ON purchase_order_items FOR UPDATE
  TO authenticated
  USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    purchase_order_id IN (
      SELECT id FROM purchase_orders WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete purchase order items"
  ON purchase_order_items FOR DELETE
  TO authenticated
  USING (
    purchase_order_id IN (
      SELECT id FROM purchase_orders WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for purchase_invoices
CREATE POLICY "Users can view purchase invoices in their organization"
  ON purchase_invoices FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create purchase invoices in their organization"
  ON purchase_invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update purchase invoices in their organization"
  ON purchase_invoices FOR UPDATE
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

CREATE POLICY "Users can delete purchase invoices in their organization"
  ON purchase_invoices FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policies for purchase_invoice_items
CREATE POLICY "Users can view purchase invoice items"
  ON purchase_invoice_items FOR SELECT
  TO authenticated
  USING (
    purchase_invoice_id IN (
      SELECT id FROM purchase_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create purchase invoice items"
  ON purchase_invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    purchase_invoice_id IN (
      SELECT id FROM purchase_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update purchase invoice items"
  ON purchase_invoice_items FOR UPDATE
  TO authenticated
  USING (
    purchase_invoice_id IN (
      SELECT id FROM purchase_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    purchase_invoice_id IN (
      SELECT id FROM purchase_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete purchase invoice items"
  ON purchase_invoice_items FOR DELETE
  TO authenticated
  USING (
    purchase_invoice_id IN (
      SELECT id FROM purchase_invoices WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );