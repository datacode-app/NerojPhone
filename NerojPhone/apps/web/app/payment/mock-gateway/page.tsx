'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MockGatewayPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get('order_id');
    const amount = searchParams.get('amount') || '0';

    const [cardNumber, setCardNumber] = useState('');
    const [cvv, setCvv] = useState('');
    const [expiry, setExpiry] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Validate Test Card
        const cleanCard = cardNumber.replace(/\D/g, '');
        if (cleanCard === '5213720304238582' && cvv === '642') {
            // Success!
            router.push(`/payment/success?order_id=${orderId}&mock_payment=true`);
        } else {
            setError('Transaction Declined: Invalid Card Details. Please use the Test Card provided.');
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full">
                {/* Header */}
                <div className="bg-[#522978] p-6 text-white flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-lg">QI Card Secure Payment</h1>
                        <p className="text-white/70 text-sm">Rafidain Bank</p>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-xl font-bold">{parseInt(amount).toLocaleString()} IQD</div>
                        <div className="text-xs text-white/60">Order: {orderId}</div>
                    </div>
                </div>

                {/* Timer Bar */}
                <div className="bg-yellow-100 px-6 py-2 flex items-center gap-2 text-yellow-800 text-sm font-medium">
                    <span>⏱️ Session expires in:</span>
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>

                {/* Form */}
                <form onSubmit={handlePayment} className="p-8 space-y-6">
                    {/* Card Logos */}
                    <div className="flex gap-2 mb-4 justify-center grayscale opacity-70">
                        {/* Placeholder for Card Logos */}
                        <div className="h-8 w-12 bg-gray-200 rounded"></div>
                        <div className="h-8 w-12 bg-gray-200 rounded"></div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Card Number</label>
                        <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            className="w-full border border-gray-300 rounded-lg p-3 font-mono text-lg focus:ring-2 focus:ring-[#522978] focus:border-transparent outline-none transition"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Expiration</label>
                            <input
                                type="text"
                                placeholder="MM-YYYY"
                                className="w-full border border-gray-300 rounded-lg p-3 font-mono text-lg focus:ring-2 focus:ring-[#522978] focus:border-transparent outline-none transition"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">CVV</label>
                            <input
                                type="text"
                                placeholder="123"
                                className="w-full border border-gray-300 rounded-lg p-3 font-mono text-lg focus:ring-2 focus:ring-[#522978] focus:border-transparent outline-none transition"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value)}
                                maxLength={3}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#522978] hover:bg-[#422161] text-white font-bold py-4 rounded-lg transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            'Pay Now'
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-xs text-gray-400 mt-4">
                            Secured by QI Card Gateway. Your data is encrypted.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
