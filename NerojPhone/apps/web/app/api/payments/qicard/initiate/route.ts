import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * QI Card Payment Initiation API
 * Creates a payment session and returns the payment URL
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, amount, customerEmail, customerPhone, isTestMode } = body;

        if (!orderId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get QI Card credentials from environment or use sandbox-gate defaults
        const username = process.env.QICARD_USERNAME || '600000'; // Sandbox username
        const password = process.env.QICARD_PASSWORD || 'Password123!'; // Sandbox password
        const terminalId = process.env.QICARD_TERMINAL_ID || '1000101'; // Sandbox terminal
        const apiUrl = process.env.QICARD_API_URL || 'https://uat-sandbox-3ds-api.qi.iq/api/v1'; // Correct Sandbox URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // MOCK MODE HANDLER: If test mode is requested
        if (isTestMode) {
            console.log('Using Mock Payment Flow as requested');
            return NextResponse.json({
                success: true,
                // Redirect to our internal Mock Gateway instead of instant success
                payment_url: `${appUrl}/payment/mock-gateway?order_id=${orderId}&amount=${amount}`,
                payment_id: 'MOCK-' + Date.now(),
                status: 'CREATED',
            });
        }

        // Create Basic Auth header
        const authString = Buffer.from(`${username}:${password}`).toString('base64');

        // Prepare payment data for QI Card API (matching official docs)
        const paymentData = {
            requestId: orderId, // Unique merchant-side identifier
            amount: amount, // Numeric value (e.g., 256.50)
            currency: 'IQD', // 3-character ISO code
            finishPaymentUrl: `${appUrl}/payment/success?order_id=${orderId}`, // Success/Cancel redirect
            notificationUrl: `${appUrl}/api/payments/qicard/webhook`, // Webhook endpoint
            customerInfo: {
                firstName: customerEmail?.split('@')[0] || 'Customer',
                lastName: 'User',
                email: customerEmail || '',
                phone: customerPhone || '',
            },
        };

        // Make actual API call to QI Card
        const response = await fetch(`${apiUrl}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`,
                'X-Terminal-Id': terminalId, // Required for all requests
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('QI Card API error:', response.status, errorText);
            // Return the upstream error for debugging
            return NextResponse.json(
                { error: `Upstream API Error (${response.status}): ${errorText}` },
                { status: response.status }
            );
        }

        const qicardResponse = await response.json();

        // Response format from QI Card:
        // {
        //   "paymentId": "qicard_payment_id",
        //   "status": "CREATED",
        //   "formUrl": "https://payment-url-to-redirect-customer"
        // }

        // Update order with payment information
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                payment_link: qicardResponse.formUrl || qicardResponse.redirectUrl || qicardResponse.actionUrl, // Flexibly handle variations
                payment_reference: qicardResponse.paymentId || qicardResponse.id,
                updated_at: new Date().toISOString()
            })
            .eq('order_number', orderId);

        if (updateError) {
            console.error('Failed to update order:', updateError);
        }

        if (!qicardResponse.formUrl && !qicardResponse.redirectUrl && !qicardResponse.actionUrl) {
            console.error('Unexpected Response Structure:', qicardResponse);
        }

        return NextResponse.json({
            success: true,
            payment_url: qicardResponse.formUrl || qicardResponse.redirectUrl || qicardResponse.actionUrl,
            payment_id: qicardResponse.paymentId,
            status: qicardResponse.status,
        });

    } catch (error: any) {
        console.error('QI Card initiation error:', error);
        return NextResponse.json(
            { error: `Failed to initiate payment: ${error.message || error}` },
            { status: 500 }
        );
    }
}
