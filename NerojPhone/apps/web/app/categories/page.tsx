'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const categories = [
    {
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        icon: '📱',
        count: 250,
        description: 'Latest smartphones from top brands',
        image: 'bg-gradient-to-br from-blue-500 to-purple-500'
    },
    {
        name: 'Chargers & Cables',
        slug: 'chargers-cables',
        icon: '🔌',
        count: 180,
        description: 'Fast chargers and durable cables',
        image: 'bg-gradient-to-br from-green-500 to-teal-500'
    },
    {
        name: 'Phone Cases',
        slug: 'phone-cases',
        icon: '📦',
        count: 320,
        description: 'Protective cases for all models',
        image: 'bg-gradient-to-br from-orange-500 to-red-500'
    },
    {
        name: 'Power Banks',
        slug: 'power-banks',
        icon: '🔋',
        count: 95,
        description: 'Portable charging solutions',
        image: 'bg-gradient-to-br from-yellow-500 to-orange-500'
    },
    {
        name: 'Headphones',
        slug: 'headphones',
        icon: '🎧',
        count: 140,
        description: 'Wireless and wired headphones',
        image: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
        name: 'Screen Protectors',
        slug: 'screen-protectors',
        icon: '🛡️',
        count: 200,
        description: 'Tempered glass and film protectors',
        image: 'bg-gradient-to-br from-cyan-500 to-blue-500'
    },
    {
        name: 'Smart Watches',
        slug: 'smart-watches',
        icon: '⌚',
        count: 75,
        description: 'Fitness and smart watches',
        image: 'bg-gradient-to-br from-indigo-500 to-purple-500'
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        icon: '✨',
        count: 400,
        description: 'All other mobile accessories',
        image: 'bg-gradient-to-br from-pink-500 to-rose-500'
    },
];

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block mb-6">
                        <span className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold border border-amber-500/30">
                            🏪 Browse by Category
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Shop by <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Category</span>
                    </h1>

                    <p className="text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
                        Find exactly what you're looking for. Browse our carefully organized categories
                        featuring the latest mobile phones and accessories.
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.slug}
                                href={`/categories/${category.slug}`}
                                className="group"
                            >
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20">
                                    <div className={`${category.image} w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <span className="text-4xl">{category.icon}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                                        {category.name}
                                    </h3>

                                    <p className="text-white/60 text-sm mb-4">
                                        {category.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-amber-400 font-semibold text-sm">
                                            {category.count}+ products
                                        </span>
                                        <span className="text-white/40 group-hover:text-amber-400 transition">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-20 px-4 bg-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">Popular Categories</h2>
                        <p className="text-white/70 text-lg">Most searched categories this month</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {categories.slice(0, 3).map((category) => (
                            <Link
                                key={category.slug}
                                href={`/categories/${category.slug}`}
                                className="group"
                            >
                                <div className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all hover:scale-105">
                                    <div className={`${category.image} h-48 flex items-center justify-center`}>
                                        <span className="text-8xl group-hover:scale-110 transition-transform">
                                            {category.icon}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/60 mb-4">{category.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-amber-400 font-semibold">
                                                {category.count}+ products
                                            </span>
                                            <span className="text-white/40 group-hover:text-amber-400 transition text-lg">
                                                Browse →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-xl rounded-3xl p-12 border border-amber-500/20">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Can't Find What You're Looking For?
                        </h2>
                        <p className="text-white/70 text-lg mb-8">
                            Browse all products or contact our support team for assistance
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/products"
                                className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition transform hover:scale-105"
                            >
                                View All Products
                            </Link>
                            <Link
                                href="/contact"
                                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
