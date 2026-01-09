'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/app/context/AuthContext';
import Logo from '@/app/components/Logo';
import { supabase } from '@/lib/supabase';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    merchant_id: string;
}

interface DatabaseProduct {
    id: string;
    name: string;
    price: number;
    images: string | string[];
    brands?: { name: string };
    rating?: number;
    review_count?: number;
    stock_quantity?: number;
    merchant_id: string;
}

export default function ProductsPage() {
    const { addToCart, getTotalItems } = useCart();
    const { user, signOut } = useAuth();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState<string[]>(['all']);

    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('featured');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

    // Fetch Wishlist
    useEffect(() => {
        if (!user) {
            setWishlistIds(new Set());
            return;
        }

        async function fetchWishlist() {
            try {
                const res = await fetch('/api/wishlist');
                const data = await res.json();
                if (data.wishlist) {
                    setWishlistIds(new Set(data.wishlist.map((p: any) => p.id)));
                }
            } catch (err) {
                console.error('Failed to fetch wishlist', err);
            }
        }
        fetchWishlist();
    }, [user]);

    const handleToggleWishlist = async (productId: string) => {
        if (!user) {
            alert('Please login to use the wishlist!');
            return;
        }

        // Optimistic Update
        const next = new Set(wishlistIds);
        if (next.has(productId)) {
            next.delete(productId);
        } else {
            next.add(productId);
        }
        setWishlistIds(next);

        try {
            await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId })
            });
        } catch (err) {
            console.error('Failed to toggle wishlist', err);
            // Revert on error would go here
        }
    };

    // Fetch Data from Supabase
    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Fetch Products
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*, brands(name)')
                    .eq('status', 'active'); // Changed from 'approved' to 'active'

                if (productsError) throw productsError;

                // 2. Fetch Brands
                const { data: brandsData } = await supabase
                    .from('brands')
                    .select('name')
                    .order('name');

                if (brandsData) {
                    setBrands(['all', ...brandsData.map(b => b.name)]);
                }

                // 3. Map to UI Model
                const mappedProducts: Product[] = (productsData || []).map((item: DatabaseProduct) => {
                    // Handle image: check if it's already an array or needs parsing
                    let imageUrl = '📱'; // Default
                    if (Array.isArray(item.images) && item.images.length > 0) {
                        imageUrl = item.images[0];
                    } else if (typeof item.images === 'string') {
                        try {
                            const parsed = JSON.parse(item.images);
                            if (Array.isArray(parsed)) imageUrl = parsed[0];
                        } catch { /* ignore */ }
                    }

                    return {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: imageUrl,
                        brand: item.brands?.name || 'Unknown',
                        rating: Number(item.rating) || 0,
                        reviews: item.review_count || 0,
                        inStock: (item.stock_quantity || 0) > 0,
                        merchant_id: item.merchant_id,
                    };
                });

                setProducts(mappedProducts);
            } catch (err) {
                console.error('Error loading products:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const handleAddToCart = (product: Product) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            brand: product.brand,
            category: 'mobile-phones',
            merchant_id: product.merchant_id,
        });
    };

    const handleRateProduct = async (productId: string, rating: number) => {
        if (!user) {
            alert('Please login to rate products!');
            return;
        }

        // Optimistic UI Update
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                // Simple optimistic calculation: New Average approx (Old * Count + New) / (Count + 1)
                // This is just visual feedback - the API returns the real calculation
                const newCount = p.reviews + 1;
                const newRating = ((p.rating * p.reviews) + rating) / newCount;
                return { ...p, rating: newRating, reviews: newCount };
            }
            return p;
        }));

        try {
            const res = await fetch('/api/products/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    userId: user.id,
                    rating
                })
            });

            const data = await res.json();

            if (data.success) {
                // Update with server-authoritative data
                setProducts(prev => prev.map(p =>
                    p.id === productId
                        ? { ...p, rating: data.newRating, reviews: data.newCount }
                        : p
                ));
            } else {
                if (data.error?.includes('duplicate key')) {
                    alert('You have already rated this product!');
                    // Revert optimistic update? Or just leave it?
                    // For now, we refresh the data to be safe in a real app, but here we can just leave it or revert.
                } else {
                    console.error('Rating failed:', data.error);
                }
            }

        } catch (err) {
            console.error('Rating error:', err);
        }
    };

    const filteredProducts = products.filter(product => {
        if (selectedBrand !== 'all' && product.brand !== selectedBrand) return false;

        if (priceRange === 'under-500k' && product.price >= 500000) return false;
        if (priceRange === '500k-1m' && (product.price < 500000 || product.price >= 1000000)) return false;
        if (priceRange === 'over-1m' && product.price < 1000000) return false;

        return true;
    });

    // Sorting
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IQ', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading Store...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-[#0D0144] backdrop-blur-lg border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Logo size="md" showText={true} variant="navbar" />

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/products" className="text-white font-semibold">
                                Products
                            </Link>
                            <Link href="/categories" className="text-white/80 hover:text-white transition">
                                Categories
                            </Link>
                            <Link href="/about" className="text-white/80 hover:text-white transition">
                                About
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button className="text-white/80 hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
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

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="text-white/80 text-sm hidden md:block">
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={signOut}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition text-sm"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition text-sm"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Mobile Phones
                        </h1>
                        <p className="text-white/70 text-lg">
                            Browse our collection of premium smartphones
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-24">
                                <h3 className="text-white font-bold text-lg mb-6">Filters</h3>

                                {/* Brand Filter */}
                                <div className="mb-6">
                                    <label className="text-white/70 text-sm font-semibold mb-3 block">
                                        Brand
                                    </label>
                                    <div className="space-y-2">
                                        {brands.map(brand => (
                                            <button
                                                key={brand}
                                                onClick={() => setSelectedBrand(brand)}
                                                className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedBrand === brand
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                    }`}
                                            >
                                                {brand === 'all' ? 'All Brands' : brand}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <label className="text-white/70 text-sm font-semibold mb-3 block">
                                        Price Range
                                    </label>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'all', label: 'All Prices' },
                                            { value: 'under-500k', label: 'Under 500,000 IQD' },
                                            { value: '500k-1m', label: '500,000 - 1,000,000 IQD' },
                                            { value: 'over-1m', label: 'Over 1,000,000 IQD' },
                                        ].map(range => (
                                            <button
                                                key={range.value}
                                                onClick={() => setPriceRange(range.value)}
                                                className={`w-full text-left px-4 py-2 rounded-lg transition text-sm ${priceRange === range.value
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                    }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <button
                                    onClick={() => {
                                        setSelectedBrand('all');
                                        setPriceRange('all');
                                    }}
                                    className="w-full bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                            {/* Toolbar */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mb-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <p className="text-white/70">
                                        Showing <span className="text-white font-semibold">{filteredProducts.length}</span> products
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

                            {/* Products */}
                            <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                                {sortedProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/10 transition group ${viewMode === 'list' ? 'flex gap-6 p-4' : 'p-6'
                                            }`}
                                    >
                                        <div className={viewMode === 'list' ? 'w-32 flex-shrink-0' : 'mb-4'}>
                                            <div className="relative aspect-square bg-white rounded-xl flex items-center justify-center overflow-hidden">
                                                {/* Use img tag for external URLs if not configured in Next.js, or handle with placeholder */}
                                                {product.image.startsWith('http') ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover group-hover:scale-110 transition duration-500"
                                                    />
                                                ) : (
                                                    <span className="text-6xl" role="img" aria-label="product image">{product.image}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="text-white/60 text-sm mb-1">{product.brand}</p>
                                                    <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
                                                </div>
                                                {!product.inStock && (
                                                    <span className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs">
                                                        Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mb-3 group/rating">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => {
                                                        const starValue = i + 1;
                                                        return (
                                                            <button
                                                                key={i}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleRateProduct(product.id, starValue);
                                                                }}
                                                                className={`w-4 h-4 transition-transform hover:scale-125 focus:outline-none ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-white/20 hover:text-yellow-400'
                                                                    }`}
                                                                disabled={!user}
                                                                title={user ? `Rate ${starValue} Stars` : 'Login to rate'}
                                                            >
                                                                <svg fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <span className="text-white/60 text-sm">
                                                    {product.rating > 0 ? product.rating.toFixed(1) : 0} ({product.reviews} reviews)
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-purple-300 text-2xl font-bold">
                                                        {formatPrice(product.price)}
                                                        <span className="text-sm ml-1">IQD</span>
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggleWishlist(product.id)}
                                                        className={`p-2 rounded-lg transition border ${wishlistIds.has(product.id)
                                                            ? 'bg-pink-500/20 border-pink-500 text-pink-500'
                                                            : 'border-white/20 text-white/40 hover:text-white hover:border-white'
                                                            }`}
                                                        title={wishlistIds.has(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                                    >
                                                        <svg className="w-6 h-6" fill={wishlistIds.has(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={!product.inStock}
                                                        className={`px-4 py-2 rounded-lg font-semibold transition active:scale-95 ${product.inStock
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50'
                                                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {sortedProducts.length === 0 && !loading && (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4" role="img" aria-label="no results">😔</div>
                                    <h3 className="text-white text-2xl font-bold mb-2">No products found</h3>
                                    <p className="text-white/60 mb-6">Try adjusting your filters</p>
                                    <button
                                        onClick={() => {
                                            setSelectedBrand('all');
                                            setPriceRange('all');
                                        }}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
