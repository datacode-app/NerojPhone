-- Migration: Add Payment Reference Fields to Orders Table
-- This migration adds fields needed for QI Card payment integration

-- Add payment reference fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255), -- QI Card payment ID
ADD COLUMN IF NOT EXISTS payment_link TEXT, -- Generated payment URL
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255); -- Final transaction ID from QI Card

-- Add index for payment_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference);

-- Add comment to document the fields
COMMENT ON COLUMN public.orders.payment_reference IS 'QI Card payment session ID';
COMMENT ON COLUMN public.orders.payment_link IS 'Generated QI Card payment URL for customer';
COMMENT ON COLUMN public.orders.transaction_id IS 'Final transaction ID after payment completion';

-- Update existing payment_status enum if needed
-- Note: The enum already exists in schema.sql, this is just for documentation
-- payment_status values: 'pending', 'uploaded', 'verified', 'failed', 'refunded'

-- Add new status value for completed payments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = 'payment_status'::regtype) THEN
        ALTER TYPE payment_status ADD VALUE 'completed';
    END IF;
END$$;

-- Add new status value for payment_failed orders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'payment_failed' AND enumtypid = 'order_status'::regtype) THEN
        ALTER TYPE order_status ADD VALUE 'payment_failed';
    END IF;
END$$;
