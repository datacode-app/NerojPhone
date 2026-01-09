'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getTotalPrice, clearCart } = useCart();
    const { user, loading: authLoading } = useAuth();

    const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
    const [loading, setLoading] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        province: '',
        notes: '',
    });

    const [paymentMethod, setPaymentMethod] = useState('qi_card');

    const subtotal = getTotalPrice();
    const shippingFee = 5000;
    const total = subtotal + shippingFee;

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?message=Please login to checkout');
        }
    }, [user, authLoading, router]);
    const [useMockPayment, setUseMockPayment] = useState(false);
    const [checkoutError, setCheckoutError] = useState('');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IQ').format(price);
    };

    const handlePlaceOrder = async () => {
        setCheckoutError(''); // Clear previous errors

        if (!user) {
            alert('Your session has expired. Please login again.');
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            const customerId = user.id;

            // 1. Customer Sync
            try {
                await supabase.from('customers').upsert({
                    id: customerId,
                    email: user.email,
                    full_name: shippingInfo.fullName,
                    phone: shippingInfo.phone
                }, { onConflict: 'id' });
            } catch (custError) {
                console.error('Customer Sync Error:', custError);
            }

            // 2. Merchant ID
            let merchantId = cart[0]?.merchant_id;

            // Try to get from product
            if (!merchantId && cart[0]?.id) {
                const { data: pData } = await supabase.from('products').select('merchant_id').eq('id', cart[0].id).single();
                if (pData?.merchant_id) merchantId = pData.merchant_id;
            }

            // Fallback: Get ANY valid merchant ID from the DB to avoid FK constraint error
            if (!merchantId) {
                const { data: mData } = await supabase.from('merchants').select('id').limit(1).single();
                if (mData?.id) {
                    merchantId = mData.id;
                } else {
                    // If NO merchants exist at all, we are stuck. But this is unlikely in a working app.
                    // We really shouldn't use a random UUID if it doesn't exist.
                    throw new Error('System Error: No valid Merchant found to process this order.');
                }
            }

            const orderNumber = `ORD-${Date.now()}`;

            // 3. Create Order
            const { error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_id: customerId,
                    merchant_id: merchantId,
                    order_number: orderNumber,
                    status: 'pending',
                    total_amount: total,
                    subtotal: subtotal,
                    shipping_amount: shippingFee,
                    payment_method: paymentMethod,
                    shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.province}`,
                    customer_name: shippingInfo.fullName,
                    customer_phone: shippingInfo.phone,
                    notes: shippingInfo.notes,
                });

            if (orderError) throw new Error(`Order DB Error: ${orderError.message}`);

            // 4. Order Items
            const { data: orderData } = await supabase
                .from('orders')
                .select('id')
                .eq('order_number', orderNumber)
                .single();

            if (orderData) {
                const orderItems = cart.map(item => ({
                    order_id: orderData.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                }));
                await supabase.from('order_items').insert(orderItems);
            }

            // 5. Payment
            if (['qi_card', 'fastpay', 'visa', 'mastercard', 'zaincash'].includes(paymentMethod)) {
                // eslint-disable-next-line no-console
                console.log('Initiating Payment...');

                const paymentResponse = await fetch('/api/payments/qicard/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderNumber,
                        amount: total,
                        customerEmail: user.email,
                        customerPhone: shippingInfo.phone,
                        isTestMode: useMockPayment // Pass the test mode flag
                    }),
                });

                if (paymentResponse.ok) {
                    const paymentData = await paymentResponse.json();

                    if (!paymentData.payment_url) {
                        // eslint-disable-next-line no-console
                        console.error('MISSING URL IN RESPONSE:', paymentData);
                        throw new Error(`Payment System Error: No redirect URL provided. Debug: ${JSON.stringify(paymentData)}`);
                    }

                    clearCart();
                    // Optional: alert('Redirecting to payment gateway...');
                    window.location.href = paymentData.payment_url;
                    return;
                } else {
                    const text = await paymentResponse.text();
                    // eslint-disable-next-line no-console
                    console.error('API Error:', text);

                    // Parse error JSON if possible
                    let cleanError = text;
                    try {
                        const errJson = JSON.parse(text);
                        if (errJson.error) cleanError = errJson.error;
                    } catch (e) { }

                    throw new Error(cleanError);
                }
            }

            // 6. Complete Order (Only for COD)
            clearCart();
            router.push(`/order-confirmation?order=${orderNumber}`);

        } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error('Checkout Final Error:', error);
            setCheckoutError(error.message || 'An unexpected error occurred during checkout.');
            // Only alert if the user might miss the red box (optional)
            // alert(`Order Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const paymentMethods = [
        { id: 'qi_card', name: 'QI Card', name_ar: 'بطاقة كي', icon: '💳', popular: true },
        { id: 'visa', name: 'Visa', name_ar: 'فيزا', icon: '💳', popular: false },
        { id: 'mastercard', name: 'MasterCard', name_ar: 'ماستركارد', icon: '💳', popular: false },
        { id: 'fastpay', name: 'FastPay', name_ar: 'فاست باي', icon: '📱', popular: false },
        { id: 'zaincash', name: 'ZainCash', name_ar: 'زين كاش', icon: '📱', popular: false },
        { id: 'cod', name: 'Cash on Delivery', name_ar: 'الدفع عند الاستلام', icon: '💵', popular: true },
    ];

    const provinces = [
        'Anbar', 'Babil', 'Baghdad', 'Basra', 'Dhi Qar', 'Diyala', 'Duhok',
        'Erbil', 'Halabja', 'Karbala', 'Kirkuk', 'Maysan', 'Muthanna', 'Najaf',
        'Nineveh', 'Qadisiyah', 'Salah Al-Din', 'Sulaymaniyah', 'Wasit'
    ];

    if (authLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-lg border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">N</span>
                            </div>
                            <span className="text-white font-bold text-xl hidden sm:block">NerojPhone</span>
                        </Link>

                        <div className="text-white/60 text-sm">
                            Secure Checkout 🔒
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Progress Steps */}
                    <div className="mb-12">
                        <div className="flex items-center justify-center">
                            {[
                                { id: 'shipping', label: 'Shipping', icon: '📦' },
                                { id: 'payment', label: 'Payment', icon: '💳' },
                                { id: 'review', label: 'Review', icon: '✅' },
                            ].map((s, idx) => (
                                <div key={s.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition ${step === s.id
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                                : 'bg-white/10'
                                                }`}
                                        >
                                            <span role="img" aria-label={s.label}>{s.icon}</span>
                                        </div>
                                        <span className="text-white text-sm mt-2 hidden sm:block">{s.label}</span>
                                    </div>
                                    {idx < 2 && (
                                        <div className="w-16 sm:w-32 h-1 bg-white/10 mx-2"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Shipping Information */}
                            {step === 'shipping' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                                    <h2 className="text-2xl font-bold text-white mb-6">Shipping Information</h2>

                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-white/80 mb-2 font-medium">
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={shippingInfo.fullName}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Ahmed Ali"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-white/80 mb-2 font-medium">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={shippingInfo.phone}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="+964 XXX XXX XXXX"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-white/80 mb-2 font-medium">
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                value={shippingInfo.address}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Street name, building number"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-white/80 mb-2 font-medium">
                                                    Province
                                                </label>
                                                <select
                                                    value={shippingInfo.province}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, province: e.target.value })}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-[#0D0144] [&>option]:text-white"
                                                    required
                                                >
                                                    <option value="" className="bg-[#0D0144] text-white">Select Province</option>
                                                    {provinces.map((province) => (
                                                        <option key={province} value={province} className="bg-[#0D0144] text-white">
                                                            {province}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-white/80 mb-2 font-medium">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    value={shippingInfo.city}
                                                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    placeholder="Enter your city"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-white/80 mb-2 font-medium">
                                                Delivery Notes (Optional)
                                            </label>
                                            <textarea
                                                value={shippingInfo.notes}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                                                placeholder="Any special instructions for delivery..."
                                            />
                                        </div>

                                        <button
                                            onClick={() => setStep('payment')}
                                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Payment Method */}
                            {step === 'payment' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                                    <h2 className="text-2xl font-bold text-white mb-6">Payment Method</h2>

                                    <div className="space-y-4 mb-8">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition ${paymentMethod === method.id
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="text-3xl"><span role="img" aria-label={method.name}>{method.icon}</span></div>
                                                    <div className="text-left">
                                                        <div className="text-white font-semibold">{method.name}</div>
                                                        <div className="text-white/60 text-sm">{method.name_ar}</div>
                                                    </div>
                                                </div>
                                                {method.popular && (
                                                    <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                                                        Popular
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {paymentMethod === 'qi_card' && (
                                        <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4 mb-6">
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl"><span role="img" aria-label="info">ℹ️</span></div>
                                                <div>
                                                    <h4 className="text-white font-semibold mb-1">QI Card Payment Process</h4>
                                                    <p className="text-white/80 text-sm">
                                                        You will be redirected to QI Card's secure payment page.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep('shipping')}
                                            className="flex-1 bg-white/10 text-white font-bold py-4 rounded-lg hover:bg-white/20 transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={() => setStep('review')}
                                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
                                        >
                                            Review Order
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Review Order */}
                            {step === 'review' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                                    <h2 className="text-2xl font-bold text-white mb-6">Review Your Order</h2>

                                    {/* Shipping Details */}
                                    <div className="mb-6 pb-6 border-b border-white/10">
                                        <h3 className="text-white font-semibold mb-3">Shipping To:</h3>
                                        <div className="text-white/80 space-y-1">
                                            <p>{shippingInfo.fullName}</p>
                                            <p>{shippingInfo.phone}</p>
                                            <p>{shippingInfo.address}</p>
                                            <p>{shippingInfo.city}, {shippingInfo.province}</p>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="mb-6 pb-6 border-b border-white/10">
                                        <h3 className="text-white font-semibold mb-3">Payment Method:</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {paymentMethods.find(m => m.id === paymentMethod)?.icon}
                                            </span>
                                            <span className="text-white">
                                                {paymentMethods.find(m => m.id === paymentMethod)?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <h3 className="text-white font-semibold mb-3">Order Items:</h3>
                                        <div className="space-y-3">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-lg p-3">
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                                                        {item.image && item.image.startsWith('http') ? (
                                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                        ) : (
                                                            <span className="text-2xl">{item.image || '📱'}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-white font-medium">{item.name}</div>
                                                        <div className="text-white/60 text-sm">Qty: {item.quantity}</div>
                                                    </div>
                                                    <div className="text-purple-300 font-bold">
                                                        {formatPrice(item.price)} IQD
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Error Display */}
                                    {checkoutError && (
                                        <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                                            <span className="text-xl">⚠️</span>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Checkout Error</h4>
                                                <p className="text-white/80 text-sm">{checkoutError}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Debug / Test Mode Toggle */}
                                    <div className="mb-4 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="mockPayment"
                                            checked={useMockPayment}
                                            onChange={(e) => setUseMockPayment(e.target.checked)}
                                            className="rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                                        />
                                        <label htmlFor="mockPayment" className="text-white/60 text-sm cursor-pointer select-none">
                                            Use Test/Mock Payment (No Real Money)
                                        </label>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep('payment')}
                                            className="flex-1 bg-white/10 text-white font-bold py-4 rounded-lg hover:bg-white/20 transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={loading}
                                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                            {loading ? 'Processing...' : 'Place Order'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 sticky top-24">
                                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                                                {item.image && item.image.startsWith('http') ? (
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                ) : (
                                                    <span className="text-xl">{item.image || '📱'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white text-sm">{item.name}</div>
                                                <div className="text-white/60 text-xs">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="text-white text-sm">
                                                {formatPrice(item.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/10">
                                    <div className="flex justify-between text-white/80">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)} IQD</span>
                                    </div>
                                    <div className="flex justify-between text-white/80">
                                        <span>Shipping</span>
                                        <span>{formatPrice(shippingFee)} IQD</span>
                                    </div>
                                    <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/10">
                                        <span>Total</span>
                                        <span className="text-purple-300">{formatPrice(total)} IQD</span>
                                    </div>
                                </div>

                                <div className="mt-6 bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg" role="img" aria-label="secure">🔒</span>
                                        <div className="text-white/80 text-xs">
                                            Your payment information is secure and encrypted
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
