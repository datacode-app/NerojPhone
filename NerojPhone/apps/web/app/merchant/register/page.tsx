'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering to avoid prerendering during build
export const dynamic = 'force-dynamic';

interface MerchantFormData {
    storeName: string;
    category: string;
    ownerName: string;
    phone: string;
    address: string;
    email: string;
    password: string;
}

export default function MerchantRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<MerchantFormData>({
        storeName: '',
        category: '',
        ownerName: '',
        phone: '',
        address: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!formData.storeName || !formData.category || !formData.ownerName ||
            !formData.phone || !formData.address || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up the user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.ownerName,
                        phone: formData.phone,
                        role: 'merchant',
                        business_name: formData.storeName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // 2. Create merchant profile in database
            if (authData.user) {
                const { error: merchantError } = await supabase
                    .from('merchants')
                    .insert([
                        {
                            user_id: authData.user.id,
                            business_name: formData.storeName,
                            owner_name: formData.ownerName,
                            email: formData.email,
                            phone: formData.phone,
                            address: formData.address,
                            category: formData.category,
                            status: 'pending', // Will be approved by admin
                        },
                    ]);

                if (merchantError) {
                    console.error('Merchant profile creation error:', merchantError);
                    // Continue anyway since user is created
                }
            }

            setSuccess(true);

            // Redirect after success
            setTimeout(() => {
                router.push('/dashboard/merchant');
            }, 2000);

        } catch (err) {
            console.error('Registration error:', err);
            setError((err as Error).message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            <Navbar />

            <main className="pt-20 md:pt-32 pb-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8 md:mb-12">
                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 md:mb-6 inline-block">
                            For Business
                        </span>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                            Become a Merchant on NerojPhone
                        </h1>
                        <p className="text-white/70 text-base md:text-lg px-4">
                            Start selling your products to thousands of customers across Iraq.
                            Join the fastest-growing mobile marketplace today.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 border-b border-white/10 pb-4">
                            Merchant Registration
                        </h2>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
                                ✅ Registration successful! Please check your email to confirm your account. Redirecting...
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-white/70 mb-2 text-sm font-medium">Store Name *</label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                                        placeholder="Enter your shop name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 mb-2 text-sm font-medium">Business Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition [&>option]:text-black"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="repairs">Repairs & Services</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-white/70 mb-2 text-sm font-medium">Owner Name *</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                                        placeholder="Full Business Owner Name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 mb-2 text-sm font-medium">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                                        placeholder="07XX XXX XXXX"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-white/70 mb-2 text-sm font-medium">Business Address *</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition h-24 resize-none"
                                    placeholder="City, Street, Building Number"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="block text-white/70 mb-2 text-sm font-medium">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                                        placeholder="business@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-white/70 mb-2 text-sm font-medium">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
                                        placeholder="••••••••"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 md:py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? 'Submitting...' : success ? 'Application Submitted!' : 'Submit Application'}
                                </button>

                                {/* Login Link for Existing Merchants */}
                                <div className="text-center mt-4">
                                    <p className="text-white/70 text-sm">
                                        Already have a merchant account?{' '}
                                        <Link
                                            href="/login"
                                            className="text-purple-400 hover:text-purple-300 font-semibold underline"
                                        >
                                            Login here
                                        </Link>
                                    </p>
                                </div>

                                <p className="text-white/50 text-xs md:text-sm text-center mt-4 px-2">
                                    By registering, you agree to our{' '}
                                    <Link
                                        href="/merchant/terms"
                                        target="_blank"
                                        className="text-purple-400 hover:text-purple-300 underline"
                                    >
                                        Merchant Terms & Conditions
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
