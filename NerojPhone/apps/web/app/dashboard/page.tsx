'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Smart Dashboard Router
 * Redirects users to their specific dashboard based on their role/profile
 */
export default function DashboardRouter() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        async function routeUser() {
            if (loading) return;

            if (!user) {
                router.push('/login');
                return;
            }

            try {
                // 1. Check if user is an Admin
                // We'll check if their email domain or a specific metadata field exists
                // For now, let's check a hypothetical admins table or metadata
                const isAdmin = user.app_metadata?.role === 'admin' || user.email?.endsWith('@nerojphone.com');

                if (isAdmin) {
                    router.push('/dashboard/admin');
                    return;
                }

                // 2. Check if user is a Merchant
                const { data: merchantData } = await supabase
                    .from('merchants')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (merchantData) {
                    router.push('/dashboard/merchant');
                    return;
                }

                // 3. Default to Customer Dashboard
                router.push('/dashboard/customer');

            } catch (error) {
                console.error('Error routing to dashboard:', error);
                router.push('/');
            }
        }

        routeUser();
    }, [user, loading, router]);

    return (
        <div className="min-h-screen bg-[#0D0144] flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-white text-xl font-semibold">Redirecting to your dashboard...</h1>
                <p className="text-white/60 text-sm mt-2">Checking your account details</p>
            </div>
        </div>
    );
}
