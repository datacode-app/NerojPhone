'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface OrderItem {
    id: string;
    product_name: string;
    product_image?: string;
    quantity: number;
    total_price: number;
}

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    order_items?: OrderItem[];
    subtotal?: number;
    shipping_amount?: number;
    total_amount?: number;
    payment_method?: string;
}

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            if (!orderNumber) return;

            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('order_number', orderNumber)
                .single();

            if (!error && data) {
                setOrder(data);
            }
            setLoading(false);
        }

        fetchOrder();
    }, [orderNumber]);

    const status = searchParams.get('status');
    const isSuccess = status === 'success' || !order?.payment_method || order.payment_method === 'cod';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D] flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            <div className="pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Success Animation */}
                    <div className="text-center mb-12">
                        <div className={`inline-block ${isSuccess ? 'bg-green-500/20' : 'bg-yellow-500/20'} rounded-full p-8 mb-6`}>
                            <div className="text-6xl" role="img" aria-label="status">
                                {isSuccess ? '✅' : '⏳'}
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            {isSuccess ? 'Order Placed Successfully!' : 'Payment Pending...'}
                        </h1>
                        <p className="text-white/70 text-lg">
                            {isSuccess
                                ? "Thank you for your order. We've received your payment and will process it immediately."
                                : "Your order has been recorded, but we're waiting for payment confirmation from QI Card."}
                        </p>
                    </div>

                    {/* Order Details */}
                    {order && (
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 space-y-6">
                            {/* Order Number */}
                            <div className="text-center pb-6 border-b border-white/10">
                                <p className="text-white/60 text-sm mb-2">Order Number</p>
                                <p className="text-2xl font-bold text-white">{order.order_number}</p>
                            </div>

                            {/* Shipping Info */}
                            <div>
                                <h3 className="text-white font-semibold mb-3">Shipping Information</h3>
                                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                                    <p className="text-white">{order.customer_name}</p>
                                    <p className="text-white/70">{order.customer_phone}</p>
                                    <p className="text-white/70">{order.shipping_address}</p>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-white font-semibold mb-3">Order Items</h3>
                                <div className="space-y-3">
                                    {order.order_items?.map((item: OrderItem) => (
                                        <div key={item.id} className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
                                            <div className="relative w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                                                {item.product_image && item.product_image.startsWith('http') ? (
                                                    <Image
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-3xl" role="img" aria-label="phone">{item.product_image || '📱'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{item.product_name}</p>
                                                <p className="text-white/60 text-sm">Quantity: {item.quantity}</p>
                                            </div>
                                            <p className="text-purple-300 font-bold">
                                                {item.total_price.toLocaleString()} IQD
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-white/70">
                                        <span>Subtotal</span>
                                        <span>{order.subtotal?.toLocaleString()} IQD</span>
                                    </div>
                                    <div className="flex justify-between text-white/70">
                                        <span>Shipping</span>
                                        <span>{order.shipping_amount?.toLocaleString()} IQD</span>
                                    </div>
                                    <div className="flex justify-between text-white font-bold text-xl pt-3 border-t border-white/10">
                                        <span>Total</span>
                                        <span className="text-purple-300">{order.total_amount?.toLocaleString()} IQD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl" role="img" aria-label="card">💳</span>
                                    <div>
                                        <p className="text-white font-semibold">Payment Method</p>
                                        <p className="text-white/70 text-sm capitalize">{order.payment_method?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/products"
                            className="flex-1 text-center bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/20 transition"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href="/dashboard/customer"
                            className="flex-1 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition"
                        >
                            View My Orders
                        </Link>
                    </div>

                    {/* Help Text */}
                    <div className="mt-8 text-center">
                        <p className="text-white/60 text-sm">
                            Need help with your order?{' '}
                            <Link href="/contact" className="text-purple-400 hover:text-purple-300">
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
