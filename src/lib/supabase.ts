import { createClient } from '@supabase/supabase-js';

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

type Numeric = number;

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  referencedRelation: string;
  referencedColumns: string[];
  isOneToOne?: boolean;
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          pin: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          logo_url: string | null;
          etims_activated: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          pin?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          logo_url?: string | null;
          etims_activated?: boolean;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          pin?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          logo_url?: string | null;
          etims_activated?: boolean;
          created_by?: string | null;
        };
        Relationships: Relationship[];
      };
      users: {
        Row: {
          id: string;
          organization_id: string | null;
          full_name: string;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id?: string | null;
          full_name: string;
          email: string;
          role?: string;
        };
        Update: {
          organization_id?: string | null;
          full_name?: string;
          email?: string;
          role?: string;
        };
        Relationships: Relationship[];
      };
      customers: {
        Row: {
          id: string;
          organization_id: string;
          pin: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          kra_pin: string | null;
          currency: string;
          website: string | null;
          reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          pin?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          kra_pin?: string | null;
          currency?: string;
          website?: string | null;
          reference?: string | null;
        };
        Update: {
          pin?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          kra_pin?: string | null;
          currency?: string;
          website?: string | null;
          reference?: string | null;
        };
        Relationships: Relationship[];
      };
      suppliers: {
        Row: {
          id: string;
          organization_id: string;
          pin: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          pin: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
        };
        Update: {
          pin?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
        };
        Relationships: Relationship[];
      };
      items: {
        Row: {
          id: string;
          organization_id: string;
          item_code: string;
          name: string;
          description: string | null;
          item_type: string;
          unit_price: Numeric;
          currency: string;
          tax_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          item_code: string;
          name: string;
          description?: string | null;
          item_type?: string;
          unit_price: Numeric;
          currency?: string;
          tax_type?: string;
        };
        Update: {
          item_code?: string;
          name?: string;
          description?: string | null;
          item_type?: string;
          unit_price?: Numeric;
          currency?: string;
          tax_type?: string;
        };
        Relationships: Relationship[];
      };
      invoices: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          invoice_number: string;
          invoice_date: string;
          due_date: string | null;
          sale_type: string;
          tax_type: string;
          subtotal: Numeric;
          discount_percentage: Numeric;
          discount_amount: Numeric;
          tax_amount: Numeric;
          total: Numeric;
          terms_and_conditions: string | null;
          payment_method: string | null;
          status: string;
          etims_cu_invoice_number: string | null;
          qr_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          customer_id: string;
          invoice_number: string;
          invoice_date: string;
          due_date?: string | null;
          sale_type?: string;
          tax_type?: string;
          subtotal: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total: Numeric;
          terms_and_conditions?: string | null;
          payment_method?: string | null;
          status?: string;
          etims_cu_invoice_number?: string | null;
          qr_code?: string | null;
        };
        Update: {
          customer_id?: string;
          invoice_number?: string;
          invoice_date?: string;
          due_date?: string | null;
          sale_type?: string;
          tax_type?: string;
          subtotal?: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total?: Numeric;
          terms_and_conditions?: string | null;
          payment_method?: string | null;
          status?: string;
          etims_cu_invoice_number?: string | null;
          qr_code?: string | null;
        };
        Relationships: Relationship[];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          item_id: string | null;
          product_name: string;
          description: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
          created_at: string;
        };
        Insert: {
          invoice_id: string;
          item_id?: string | null;
          product_name: string;
          description?: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
        };
        Update: {
          item_id?: string | null;
          product_name?: string;
          description?: string | null;
          quantity?: Numeric;
          unit_price?: Numeric;
          amount?: Numeric;
        };
        Relationships: Relationship[];
      };
      credit_notes: {
        Row: {
          id: string;
          organization_id: string;
          invoice_id: string;
          customer_id: string;
          credit_note_number: string;
          credit_note_date: string;
          credit_type: string;
          subtotal: Numeric;
          discount_percentage: Numeric;
          discount_amount: Numeric;
          tax_amount: Numeric;
          total: Numeric;
          etims_credit_note_number: string | null;
          qr_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          invoice_id: string;
          customer_id: string;
          credit_note_number: string;
          credit_note_date: string;
          credit_type?: string;
          subtotal: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total: Numeric;
          etims_credit_note_number?: string | null;
          qr_code?: string | null;
        };
        Update: {
          credit_note_number?: string;
          credit_note_date?: string;
          credit_type?: string;
          subtotal?: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total?: Numeric;
          etims_credit_note_number?: string | null;
          qr_code?: string | null;
        };
        Relationships: Relationship[];
      };
      credit_note_items: {
        Row: {
          id: string;
          credit_note_id: string;
          item_id: string | null;
          product_name: string;
          description: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
          created_at: string;
        };
        Insert: {
          credit_note_id: string;
          item_id?: string | null;
          product_name: string;
          description?: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
        };
        Update: {
          item_id?: string | null;
          product_name?: string;
          description?: string | null;
          quantity?: Numeric;
          unit_price?: Numeric;
          amount?: Numeric;
        };
        Relationships: Relationship[];
      };
      proforma_invoices: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          proforma_number: string;
          proforma_date: string;
          sale_type: string;
          tax_type: string;
          subtotal: Numeric;
          discount_percentage: Numeric;
          discount_amount: Numeric;
          tax_amount: Numeric;
          total: Numeric;
          terms_and_conditions: string | null;
          payment_method: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          customer_id: string;
          proforma_number: string;
          proforma_date: string;
          sale_type?: string;
          tax_type?: string;
          subtotal: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total: Numeric;
          terms_and_conditions?: string | null;
          payment_method?: string | null;
          status?: string;
        };
        Update: {
          customer_id?: string;
          proforma_number?: string;
          proforma_date?: string;
          sale_type?: string;
          tax_type?: string;
          subtotal?: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total?: Numeric;
          terms_and_conditions?: string | null;
          payment_method?: string | null;
          status?: string;
        };
        Relationships: Relationship[];
      };
      proforma_items: {
        Row: {
          id: string;
          proforma_id: string;
          item_id: string | null;
          product_name: string;
          description: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
          created_at: string;
        };
        Insert: {
          proforma_id: string;
          item_id?: string | null;
          product_name: string;
          description?: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
        };
        Update: {
          item_id?: string | null;
          product_name?: string;
          description?: string | null;
          quantity?: Numeric;
          unit_price?: Numeric;
          amount?: Numeric;
        };
        Relationships: Relationship[];
      };
      quotations: {
        Row: {
          id: string;
          organization_id: string;
          customer_id: string;
          quotation_number: string;
          quotation_date: string;
          sale_type: string;
          tax_type: string;
          subtotal: Numeric;
          discount_percentage: Numeric;
          discount_amount: Numeric;
          tax_amount: Numeric;
          total: Numeric;
          terms_and_conditions: string | null;
          payment_method: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          customer_id: string;
          quotation_number: string;
          quotation_date: string;
          sale_type?: string;
          tax_type?: string;
          subtotal: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total: Numeric;
          terms_and_conditions?: string | null;
          payment_method?: string | null;
          status?: string;
        };
        Update: {
          customer_id?: string;
          quotation_number?: string;
          quotation_date?: string;
          sale_type?: string;
          tax_type?: string;
          subtotal?: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total?: Numeric;
          terms_and_conditions?: string | null;
          payment_method?: string | null;
          status?: string;
        };
        Relationships: Relationship[];
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          item_id: string | null;
          product_name: string;
          description: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
          created_at: string;
        };
        Insert: {
          quotation_id: string;
          item_id?: string | null;
          product_name: string;
          description?: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
        };
        Update: {
          item_id?: string | null;
          product_name?: string;
          description?: string | null;
          quantity?: Numeric;
          unit_price?: Numeric;
          amount?: Numeric;
        };
        Relationships: Relationship[];
      };
      purchase_orders: {
        Row: {
          id: string;
          organization_id: string;
          supplier_id: string;
          purchase_order_number: string;
          order_date: string;
          subtotal: Numeric;
          discount_percentage: Numeric;
          discount_amount: Numeric;
          tax_amount: Numeric;
          total: Numeric;
          terms_and_conditions: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          supplier_id: string;
          purchase_order_number: string;
          order_date: string;
          subtotal: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total: Numeric;
          terms_and_conditions?: string | null;
          status?: string;
        };
        Update: {
          supplier_id?: string;
          purchase_order_number?: string;
          order_date?: string;
          subtotal?: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total?: Numeric;
          terms_and_conditions?: string | null;
          status?: string;
        };
        Relationships: Relationship[];
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          item_id: string | null;
          product_name: string;
          description: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
          created_at: string;
        };
        Insert: {
          purchase_order_id: string;
          item_id?: string | null;
          product_name: string;
          description?: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
        };
        Update: {
          item_id?: string | null;
          product_name?: string;
          description?: string | null;
          quantity?: Numeric;
          unit_price?: Numeric;
          amount?: Numeric;
        };
        Relationships: Relationship[];
      };
      purchase_invoices: {
        Row: {
          id: string;
          organization_id: string;
          supplier_id: string;
          bill_number: string;
          bill_date: string;
          due_date: string | null;
          subtotal: Numeric;
          discount_percentage: Numeric;
          discount_amount: Numeric;
          tax_amount: Numeric;
          total: Numeric;
          terms_and_conditions: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          supplier_id: string;
          bill_number: string;
          bill_date: string;
          due_date?: string | null;
          subtotal: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total: Numeric;
          terms_and_conditions?: string | null;
          status?: string;
        };
        Update: {
          supplier_id?: string;
          bill_number?: string;
          bill_date?: string;
          due_date?: string | null;
          subtotal?: Numeric;
          discount_percentage?: Numeric;
          discount_amount?: Numeric;
          tax_amount?: Numeric;
          total?: Numeric;
          terms_and_conditions?: string | null;
          status?: string;
        };
        Relationships: Relationship[];
      };
      purchase_invoice_items: {
        Row: {
          id: string;
          purchase_invoice_id: string;
          item_id: string | null;
          product_name: string;
          description: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
          created_at: string;
        };
        Insert: {
          purchase_invoice_id: string;
          item_id?: string | null;
          product_name: string;
          description?: string | null;
          quantity: Numeric;
          unit_price: Numeric;
          amount: Numeric;
        };
        Update: {
          item_id?: string | null;
          product_name?: string;
          description?: string | null;
          quantity?: Numeric;
          unit_price?: Numeric;
          amount?: Numeric;
        };
        Relationships: Relationship[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_public_sales_invoice: {
        Args: { p_token: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
