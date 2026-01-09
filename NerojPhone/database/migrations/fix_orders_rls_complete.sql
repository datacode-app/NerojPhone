-- Fix: Create customer record and simplify RLS policy

-- Step 1: Create a customer record for existing auth user
INSERT INTO public.customers (id, email, full_name, phone)
SELECT 
    auth.uid(),
    auth.email(),
    COALESCE(raw_user_meta_data->>'full_name', 'Customer'),
    COALESCE(raw_user_meta_data->>'phone', '')
FROM auth.users
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop the old policy
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;

-- Step 3: Create a simpler INSERT policy that just checks authentication
CREATE POLICY "Authenticated users can create orders" ON public.orders
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Step 4: Ensure the customers table has proper RLS too
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own customer data" ON public.customers;
CREATE POLICY "Users can read own customer data" ON public.customers
    FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own customer data" ON public.customers;
CREATE POLICY "Users can update own customer data" ON public.customers
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Step 5: Create a trigger to auto-create customer records on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (id, email, full_name, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
