-- Allow users to view their own orders
-- This fixes the "Failed to retrieve order details" error on the success page

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT
    USING (auth.uid() = customer_id);

-- Also allow users to view their order items
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.customer_id = auth.uid()
        )
    );
