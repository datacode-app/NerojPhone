'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block mb-6">
                        <span className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold border border-amber-500/30">
                            🏆 Iraq's #1 Mobile Marketplace
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        About <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">NerojPhone</span>
                    </h1>

                    <p className="text-xl text-white/70 leading-relaxed mb-8">
                        Your trusted destination for premium mobile phones and gadgets in Iraq.
                        We're committed to bringing you the latest technology with secure payments and fast delivery.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
                            <div className="space-y-4 text-white/70 text-lg">
                                <p>
                                    Founded with a vision to revolutionize mobile shopping in Iraq, NerojPhone has become
                                    the go-to platform for tech enthusiasts and everyday users alike.
                                </p>
                                <p>
                                    We understand the Iraqi market's unique needs and have built a platform that offers
                                    secure payment options including QI Card, Visa, and Cash on Delivery.
                                </p>
                                <p>
                                    Our commitment to quality, authenticity, and customer satisfaction has made us
                                    Iraq's most trusted mobile marketplace.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { number: '10,000+', label: 'Happy Customers' },
                                    { number: '500+', label: 'Products' },
                                    { number: '50+', label: 'Brands' },
                                    { number: '24/7', label: 'Support' },
                                ].map((stat, idx) => (
                                    <div key={idx} className="text-center">
                                        <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                                            {stat.number}
                                        </div>
                                        <div className="text-white/60 text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-20 px-4 bg-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
                        <p className="text-white/70 text-lg">What makes us different</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🔒',
                                title: 'Trust & Security',
                                description: 'Every transaction is secure. We verify all merchants and products to ensure authenticity.'
                            },
                            {
                                icon: '⚡',
                                title: 'Speed & Reliability',
                                description: 'Fast delivery across Iraq with real-time tracking. We value your time.'
                            },
                            {
                                icon: '💎',
                                title: 'Quality First',
                                description: 'Only genuine products from authorized dealers. No compromises on quality.'
                            },
                        ].map((value, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition"
                            >
                                <div className="text-5xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                                <p className="text-white/70">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Why Choose NerojPhone?</h2>
                        <p className="text-white/70 text-lg">We're more than just a marketplace</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                title: 'Verified Merchants',
                                description: 'All sellers are thoroughly vetted and verified by our team'
                            },
                            {
                                title: 'Secure Payments',
                                description: 'Multiple payment options with manual verification for safety'
                            },
                            {
                                title: 'Fast Delivery',
                                description: 'Quick delivery to all Iraqi cities with tracking'
                            },
                            {
                                title: 'Quality Guarantee',
                                description: 'Only authentic products with warranty support'
                            },
                            {
                                title: '24/7 Customer Support',
                                description: 'Our team is always ready to help you'
                            },
                            {
                                title: 'Best Prices',
                                description: 'Competitive pricing with regular deals and discounts'
                            },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:bg-white/10 transition"
                            >
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-xl rounded-3xl p-12 border border-amber-500/20">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Ready to Start Shopping?
                        </h2>
                        <p className="text-white/70 text-lg mb-8">
                            Join thousands of happy customers across Iraq
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/products"
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition transform hover:scale-105"
                            >
                                Browse Products
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
