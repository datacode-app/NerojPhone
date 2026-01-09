import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization - only create client if credentials are available
// This prevents build-time errors when env vars are not set
let _supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (!supabaseUrl || !supabaseKey) {
        // eslint-disable-next-line no-console
        console.warn(
            'Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
        );
        // Return a dummy client to prevent crashes
        return {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signOut: async () => ({ error: null }),
            },
            from: () => ({
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: null, error: null }),
                    }),
                }),
            }),
        } as unknown as SupabaseClient;
    }

    if (!_supabaseClient) {
        _supabaseClient = createBrowserClient(supabaseUrl, supabaseKey);
    }

    return _supabaseClient;
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop: string | symbol) {
        const client = getSupabaseClient();

        // Handle symbol properties (like Symbol.toStringTag)
        if (typeof prop === 'symbol') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (client as any)[prop];
        }

        // Type-safe property access
        if (prop in client) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = (client as any)[prop];
            return typeof value === 'function' ? value.bind(client) : value;
        }

        return undefined;
    }
});
