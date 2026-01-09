'use client';

import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
    const totalPrice = getTotalPrice();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            <Navbar />

            <main className="pt-32 pb-20 px-4 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

                    {cart.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                            <div className="text-6xl mb-4" role="img" aria-label="cart">🛒</div>
                            <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
                            <p className="text-white/70 mb-8">Looks like you haven't added anything to your cart yet.</p>
                            <Link
                                href="/products"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-center gap-6"
                                    >
                                        <div className="relative w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                                            {item.image && item.image.startsWith('http') ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-4xl">{item.image || '📱'}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                                            <p className="text-purple-300 font-bold">{item.price.toLocaleString()} IQD</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition"
                                                >
                                                    -
                                                </button>
                                                <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-md transition"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-400 hover:text-red-300 transition p-2"
                                                title="Remove item"
                                            >
                                                <span role="img" aria-label="remove">🗑️</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-32">
                                    <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-white/70">
                                            <span>Subtotal</span>
                                            <span>{totalPrice.toLocaleString()} IQD</span>
                                        </div>
                                        <div className="flex justify-between text-white/70">
                                            <span>Shipping</span>
                                            <span>5,000 IQD</span>
                                        </div>
                                        <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold text-white">
                                            <span>Total</span>
                                            <span>{(totalPrice + 5000).toLocaleString()} IQD</span>
                                        </div>
                                    </div>

                                    <Link
                                        href="/checkout"
                                        className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition mb-4"
                                    >
                                        Proceed to Checkout
                                    </Link>

                                    <div className="flex justify-center gap-4 text-2xl text-white/50">
                                        <span title="QI Card" role="img" aria-label="QI Card">💳</span>
                                        <span title="Visa" role="img" aria-label="Visa">💳</span>
                                        <span title="Cash on Delivery" role="img" aria-label="Cash on Delivery">💵</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
