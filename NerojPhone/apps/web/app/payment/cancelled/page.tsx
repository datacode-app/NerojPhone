'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelledPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/50 max-w-md w-full">
                {/* Warning Icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-4">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
                    <p className="text-white/80">You cancelled the payment process</p>
                </div>

                {/* Order Info */}
                {orderId && (
                    <div className="bg-white/5 rounded-xl p-4 mb-6 text-center">
                        <p className="text-white/60 text-sm mb-1">Order Number</p>
                        <p className="text-purple-300 font-mono font-bold">{orderId}</p>
                    </div>
                )}

                {/* Info Message */}
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div className="text-white/80 text-sm">
                            <p className="font-semibold mb-1">Don't worry!</p>
                            <p>Your order is still saved. You can complete the payment later from your dashboard.</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {orderId && (
                        <Link
                            href={`/order-confirmation?order=${orderId}`}
                            className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg text-center hover:shadow-lg hover:shadow-purple-500/50 transition"
                        >
                            Retry Payment
                        </Link>
                    )}
                    <Link
                        href="/cart"
                        className="block w-full bg-white/10 text-white font-bold py-3 rounded-lg text-center hover:bg-white/20 transition"
                    >
                        Back to Cart
                    </Link>
                    <Link
                        href="/products"
                        className="block w-full text-white/60 text-center py-2 hover:text-white transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
