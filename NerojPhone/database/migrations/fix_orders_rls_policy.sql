-- Fix RLS Policy for Orders Table
-- This allows authenticated customers to insert their own orders

-- First, let's check if the policy exists and drop it if needed
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;

-- Create a proper INSERT policy for orders
CREATE POLICY "Customers can create orders" ON public.orders
    FOR INSERT 
    WITH CHECK (
        -- User must be authenticated
        auth.uid() IS NOT NULL
        -- The customer_id must match a customer record linked to the authenticated user
        AND customer_id IN (
            SELECT id FROM public.customers WHERE id = auth.uid()
        )
    );

-- Also ensure UPDATE policy exists for order status updates from webhooks
DROP POLICY IF EXISTS "System can update orders" ON public.orders;

CREATE POLICY "System can update orders" ON public.orders
    FOR UPDATE 
    USING (true)  -- Allow service role to update any order
    WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON public.orders TO authenticated;
GRANT UPDATE ON public.orders TO service_role;
GRANT UPDATE ON public.orders TO authenticated;
