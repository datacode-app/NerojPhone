'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
    const { user, signOut } = useAuth();

    return (
        <nav className="fixed top-0 w-full bg-[#0D0144] backdrop-blur-lg border-b border-white/10 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Logo size="md" showText={true} variant="navbar" />

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/products" className="text-white/80 hover:text-white transition">
                            Products
                        </Link>
                        <Link href="/categories" className="text-white/80 hover:text-white transition">
                            Categories
                        </Link>
                        <Link href="/about" className="text-white/80 hover:text-white transition">
                            About
                        </Link>
                        <Link href="/contact" className="text-white/80 hover:text-white transition">
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link href="/cart" className="relative p-2 text-white/80 hover:text-white transition">
                            <span className="text-2xl" role="img" aria-label="cart">🛒</span>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="text-white/80 hover:text-white transition flex items-center gap-2 mr-2"
                                >
                                    <span className="text-xl" role="img" aria-label="dashboard">👤</span>
                                    <span className="hidden lg:block">My Dashboard</span>
                                </Link>
                                <span className="text-white/80 text-sm hidden lg:block">
                                    {user.email}
                                </span>
                                <button
                                    onClick={signOut}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-white/80 hover:text-white transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
