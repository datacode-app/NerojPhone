import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, rating } = body;

        if (!productId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value, ...options });
                        } catch (error) {
                            // Handle cookies in server components/actions error
                        }
                    },
                    remove(name: string, options: CookieOptions) {
                        try {
                            cookieStore.set({ name, value: '', ...options });
                        } catch (error) {
                            // Handle cookies in server components/actions error
                        }
                    },
                },
            }
        );

        // Get User from Auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Please login to rate.' }, { status: 401 });
        }

        // 1. Insert or Update Review
        const { error: reviewError } = await supabase
            .from('reviews')
            .upsert({
                product_id: productId,
                user_id: user.id, // Securely from session
                rating: rating
            }, { onConflict: 'user_id, product_id' });

        if (reviewError) {
            console.error('Review Insert Error:', reviewError);
            return NextResponse.json({ error: reviewError.message }, { status: 500 });
        }

        // 2. Fetch updated product stats
        const { data: productData, error: productError } = await supabase
            .from('products')
            .select('rating, review_count')
            .eq('id', productId)
            .single();

        if (productError) {
            return NextResponse.json({ error: productError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            newRating: productData.rating,
            newCount: productData.review_count
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
