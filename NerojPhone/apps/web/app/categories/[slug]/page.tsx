'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';


interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    category: string;
}

const ALL_PRODUCTS: Product[] = [
    // Mobile Phones
    { id: '1', name: 'iPhone 15 Pro Max', price: 1450000, image: '📱', brand: 'Apple', rating: 4.9, reviews: 234, inStock: true, category: 'mobile-phones' },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', price: 1200000, image: '📱', brand: 'Samsung', rating: 4.8, reviews: 189, inStock: true, category: 'mobile-phones' },
    { id: '3', name: 'Xiaomi 14 Pro', price: 850000, image: '📱', brand: 'Xiaomi', rating: 4.7, reviews: 156, inStock: true, category: 'mobile-phones' },
    { id: '4', name: 'iPhone 14 Pro', price: 1150000, image: '📱', brand: 'Apple', rating: 4.8, reviews: 312, inStock: true, category: 'mobile-phones' },

    // Chargers & Cables
    { id: '5', name: 'Fast Charger 65W', price: 45000, image: '🔌', brand: 'Anker', rating: 4.6, reviews: 523, inStock: true, category: 'chargers-cables' },
    { id: '6', name: 'USB-C Cable 2m', price: 15000, image: '🔌', brand: 'Belkin', rating: 4.5, reviews: 412, inStock: true, category: 'chargers-cables' },
    { id: '7', name: 'Wireless Charger', price: 55000, image: '🔌', brand: 'Samsung', rating: 4.7, reviews: 289, inStock: true, category: 'chargers-cables' },

    // Phone Cases
    { id: '8', name: 'Silicone Case', price: 25000, image: '📦', brand: 'Apple', rating: 4.4, reviews: 678, inStock: true, category: 'phone-cases' },
    { id: '9', name: 'Leather Case', price: 45000, image: '📦', brand: 'Samsung', rating: 4.6, reviews: 445, inStock: true, category: 'phone-cases' },
    { id: '10', name: 'Clear Case', price: 18000, image: '📦', brand: 'Spigen', rating: 4.5, reviews: 892, inStock: true, category: 'phone-cases' },

    // Power Banks
    { id: '11', name: 'Power Bank 20000mAh', price: 65000, image: '🔋', brand: 'Anker', rating: 4.8, reviews: 1234, inStock: true, category: 'power-banks' },
    { id: '12', name: 'Power Bank 10000mAh', price: 45000, image: '🔋', brand: 'Xiaomi', rating: 4.7, reviews: 987, inStock: true, category: 'power-banks' },

    // Headphones
    { id: '13', name: 'AirPods Pro 2', price: 350000, image: '🎧', brand: 'Apple', rating: 4.9, reviews: 567, inStock: true, category: 'headphones-earbuds' },
    { id: '14', name: 'Galaxy Buds 2 Pro', price: 280000, image: '🎧', brand: 'Samsung', rating: 4.7, reviews: 423, inStock: true, category: 'headphones-earbuds' },
    { id: '15', name: 'Sony WH-1000XM5', price: 420000, image: '🎧', brand: 'Sony', rating: 4.9, reviews: 789, inStock: true, category: 'headphones-earbuds' },

    // Screen Protectors
    { id: '16', name: 'Tempered Glass', price: 12000, image: '🛡️', brand: 'Spigen', rating: 4.6, reviews: 1567, inStock: true, category: 'screen-protectors' },
    { id: '17', name: 'Privacy Screen', price: 25000, image: '🛡️', brand: 'Belkin', rating: 4.5, reviews: 678, inStock: true, category: 'screen-protectors' },

    // Accessories
    { id: '18', name: 'Phone Stand', price: 18000, image: '✨', brand: 'Generic', rating: 4.3, reviews: 234, inStock: true, category: 'accessories' },
    { id: '19', name: 'Car Mount', price: 22000, image: '✨', brand: 'iOttie', rating: 4.6, reviews: 456, inStock: true, category: 'accessories' },
    { id: '20', name: 'PopSocket', price: 8000, image: '✨', brand: 'PopSockets', rating: 4.4, reviews: 890, inStock: true, category: 'accessories' },
];

const CATEGORY_INFO: Record<string, { name: string; name_ar: string; icon: string; description: string }> = {
    'mobile-phones': { name: 'Mobile Phones', name_ar: 'الهواتف المحمولة', icon: '📱', description: 'Latest smartphones from top brands' },
    'chargers-cables': { name: 'Chargers & Cables', name_ar: 'الشواحن والكابلات', icon: '🔌', description: 'Fast chargers and durable cables' },
    'phone-cases': { name: 'Phone Cases', name_ar: 'حافظات الهاتف', icon: '📦', description: 'Protective cases for all phone models' },
    'power-banks': { name: 'Power Banks', name_ar: 'بنوك الطاقة', icon: '🔋', description: 'Portable chargers for on-the-go' },
    'headphones-earbuds': { name: 'Headphones & Earbuds', name_ar: 'سماعات الرأس والأذن', icon: '🎧', description: 'Premium audio accessories' },
    'screen-protectors': { name: 'Screen Protectors', name_ar: 'واقيات الشاشة', icon: '🛡️', description: 'Keep your screen scratch-free' },
    'accessories': { name: 'Accessories', name_ar: 'الإكسسوارات', icon: '✨', description: 'Essential phone accessories' },
};

export default function CategoryPage() {
    const params = useParams();
    const categorySlug = params.slug as string;
    const [sortBy, setSortBy] = useState<string>('featured');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { addToCart, getTotalItems } = useCart();

    const categoryInfo = CATEGORY_INFO[categorySlug];
    const categoryProducts = ALL_PRODUCTS.filter(p => p.category === categorySlug);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IQ').format(price);
    };

    const handleAddToCart = (product: Product) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            brand: product.brand,
            category: product.category,
        });
    };

    if (!categoryInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-white text-3xl font-bold mb-2">Category Not Found</h1>
                    <p className="text-white/60 mb-6">The category you're looking for doesn't exist</p>
                    <Link href="/" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
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

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/products" className="text-white/80 hover:text-white transition">
                                Products
                            </Link>
                            <Link href="/" className="text-white/80 hover:text-white transition">
                                Categories
                            </Link>
                            <Link href="/about" className="text-white/80 hover:text-white transition">
                                About
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link href="/cart" className="text-white/80 hover:text-white transition relative">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {getTotalItems() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {getTotalItems()}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition text-sm"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Link href="/" className="text-white/60 hover:text-white transition">Home</Link>
                            <span className="text-white/40">/</span>
                            <Link href="/" className="text-white/60 hover:text-white transition">Categories</Link>
                            <span className="text-white/40">/</span>
                            <span className="text-white">{categoryInfo.name}</span>
                        </div>
                    </div>

                    {/* Category Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-6xl">{categoryInfo.icon}</div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    {categoryInfo.name}
                                </h1>
                                <p className="text-white/70 text-lg">{categoryInfo.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <p className="text-white/70">
                                Showing <span className="text-white font-semibold">{categoryProducts.length}</span> products
                            </p>

                            <div className="flex items-center gap-4">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded-lg transition ${viewMode === 'grid'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded-lg transition ${viewMode === 'list'
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                        {categoryProducts.map(product => (
                            <div
                                key={product.id}
                                className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition group ${viewMode === 'list' ? 'flex gap-6 p-4' : 'p-6'
                                    }`}
                            >
                                <div className={viewMode === 'list' ? 'w-32 flex-shrink-0' : 'mb-4'}>
                                    <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-6xl group-hover:scale-105 transition">
                                        {product.image}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-white/60 text-sm mb-1">{product.brand}</p>
                                            <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                        ? 'text-yellow-400'
                                                        : 'text-white/20'
                                                        }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-white/60 text-sm">
                                            {product.rating} ({product.reviews})
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-300 text-2xl font-bold">
                                                {formatPrice(product.price)}
                                                <span className="text-sm ml-1">IQD</span>
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition active:scale-95"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {categoryProducts.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-white text-2xl font-bold mb-2">No products yet</h3>
                            <p className="text-white/60 mb-6">Check back soon for new items in this category</p>
                            <Link
                                href="/products"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition inline-block"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
