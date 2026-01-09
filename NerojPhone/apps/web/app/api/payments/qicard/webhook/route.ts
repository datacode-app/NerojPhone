import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

/**
 * QI Card Webhook Handler
 * Receives payment status updates from QI Card
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-signature') || '';
        const publicKey = process.env.QICARD_PUBLIC_KEY;

        // Verify webhook signature using RSA-2048 (important for security)
        if (publicKey && signature) {
            try {
                const verifier = crypto.createVerify('RSA-SHA256');
                verifier.update(body);
                verifier.end();

                // Decode base64 signature
                const signatureBuffer = Buffer.from(signature, 'base64');

                // Verify signature with QI Card's public key
                const isValid = verifier.verify(publicKey, signatureBuffer);

                if (!isValid) {
                    console.error('Invalid webhook signature');
                    return NextResponse.json(
                        { error: 'Invalid signature' },
                        { status: 401 }
                    );
                }
            } catch (error) {
                console.error('Signature verification error:', error);
                return NextResponse.json(
                    { error: 'Signature verification failed' },
                    { status: 401 }
                );
            }
        }

        // Parse webhook data
        const webhookData = JSON.parse(body);

        // QI Card webhook payload format:
        // {
        //   "requestId": "merchant_order_id",
        //   "paymentId": "qicard_payment_id",
        //   "status": "SUCCESS" | "FAILED",
        //   "amount": 10000,
        //   "currency": "IQD",
        //   "creationDate": "2025-01-13T21:25:19"
        // }

        const {
            requestId,     // Our order ID
            paymentId,     // QI Card's payment ID
            status,        // SUCCESS, FAILED, etc.
            amount,
            creationDate
        } = webhookData;

        console.log('QI Card webhook received:', {
            requestId,
            paymentId,
            status
        });

        // Handle different status values from QI Card
        if (status === 'SUCCESS') {
            // Payment succeeded - Update order status to paid
            const { error: successError } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    payment_status: 'completed',
                    payment_reference: paymentId,
                    transaction_id: paymentId, // Use paymentId as transaction ID
                    paid_at: creationDate || new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('order_number', requestId);

            if (successError) {
                console.error('Failed to update order:', successError);
                return NextResponse.json(
                    { error: 'Database update failed' },
                    { status: 500 }
                );
            }

            // Future Implementation:
            // 1. Send order confirmation email to customer
            // 2. Notify merchant via SMS or Email
            // 3. Trigger inventory reduction logic (if separate from order creation)

        } else if (status === 'FAILED' || status === 'FAILURE') {
            // Payment failed
            await supabase
                .from('orders')
                .update({
                    status: 'payment_failed',
                    payment_status: 'failed',
                    updated_at: new Date().toISOString()
                })
                .eq('order_number', requestId);

        } else if (status === 'CANCELLED' || status === 'CANCELED') {
            // Payment cancelled
            await supabase
                .from('orders')
                .update({
                    status: 'cancelled',
                    payment_status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('order_number', requestId);

        } else {
            console.log('Unhandled payment status:', status);
        }

        // Acknowledge webhook receipt
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

// Handle GET requests (for webhook verification during setup)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const challenge = searchParams.get('challenge');

    if (challenge) {
        // QI Card webhook verification
        return NextResponse.json({ challenge });
    }

    return NextResponse.json({
        message: 'QI Card webhook endpoint is active',
        timestamp: new Date().toISOString()
    });
}
