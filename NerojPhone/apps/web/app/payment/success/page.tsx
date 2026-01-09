'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PaymentStatusPage() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [error, setError] = useState('');
    const [pollingCount, setPollingCount] = useState(0);

    const orderId = searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            if (!orderId) {
                if (isMounted) setError('Missing order information');
                setLoading(false);
                return;
            }

            try {
                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('order_number', orderId)
                    .single();

                if (orderError) throw orderError;

                if (isMounted) {
                    // MOCK MODE: If this page was opened with mock_payment=true, forcefully show success
                    if (searchParams.get('mock_payment') === 'true') {
                        setOrderDetails({ ...order, status: 'paid' });
                    } else {
                        setOrderDetails(order);
                    }
                }

            } catch (err) {
                console.error('Error fetching order:', err);
                if (isMounted && !orderDetails) setError('Failed to retrieve order details.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkStatus();

        // POLL for status updates if status is 'pending' AND NOT MOCK MODE
        // (If mock mode, we already forced it to 'paid' above, so no need to poll)
        const interval = setInterval(() => {
            if (searchParams.get('mock_payment') !== 'true' && orderDetails && orderDetails.status === 'pending') {
                checkStatus();
                setPollingCount(prev => prev + 1);
            }
        }, 3000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [orderId, orderDetails?.status]); // Re-run effect won't hurt, but setInterval ensures polling 

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Verifying payment status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-red-500/50 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h1 className="text-2xl font-bold text-white mb-2">Error Loading Order</h1>
                    <p className="text-white/80 mb-6">{error}</p>
                    <Link href="/" className="inline-block bg-white/10 text-white font-bold py-3 px-8 rounded-lg hover:bg-white/20 transition">Back to Home</Link>
                </div>
            </div>
        );
    }

    const { status, total_amount, order_number } = orderDetails || {};
    const isPaid = status === 'paid';
    const isFailed = status === 'payment_failed' || status === 'cancelled';
    const isPending = status === 'pending';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
            <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 border max-w-md w-full ${isPaid ? 'border-green-500/50' : isFailed ? 'border-red-500/50' : 'border-yellow-500/50'}`}>

                {/* Status Icon & Title */}
                <div className="text-center mb-6">
                    {isPaid && (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4 animate-bounce">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
                        </>
                    )}
                    {isFailed && (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4">
                                <span className="text-4xl">❌</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
                        </>
                    )}
                    {isPending && (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-4">
                                <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Payment Processing</h1>
                            <p className="text-white/60 text-sm">Please finish payment in the new window...</p>
                        </>
                    )}
                    <p className="text-white/80 mt-2">
                        {isPaid ? 'Your order has been confirmed' : isFailed ? 'Please try again or select another method' : 'Waiting for confirmation...'}
                    </p>
                </div>

                {/* Order Details */}
                <div className="bg-white/5 rounded-xl p-6 mb-6 space-y-3">
                    <div className="flex justify-between text-white/80">
                        <span>Order Number:</span>
                        <span className="font-mono font-bold text-purple-300">{order_number}</span>
                    </div>
                    {(isPaid || isPending) && (
                        <div className="flex justify-between text-white/80">
                            <span>Amount:</span>
                            <span className="font-bold text-green-400">{new Intl.NumberFormat('en-IQ').format(total_amount || 0)} IQD</span>
                        </div>
                    )}
                    <div className="flex justify-between text-white/80">
                        <span>Status:</span>
                        <span className={`text-xs px-3 py-1 rounded-full text-white ${isPaid ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-yellow-500'}`}>
                            {status?.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {isPaid && (
                        <Link href={`/order-confirmation?order=${order_number}`} className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg text-center hover:shadow-lg transition">
                            View Order Details
                        </Link>
                    )}

                    {isFailed && (
                        <Link href="/checkout" className="block w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3 rounded-lg text-center hover:shadow-lg transition">
                            Try Again
                        </Link>
                    )}

                    <Link href="/products" className="block w-full bg-white/10 text-white font-bold py-3 rounded-lg text-center hover:bg-white/20 transition">
                        {isPaid ? 'Continue Shopping' : 'Back to Shop'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
