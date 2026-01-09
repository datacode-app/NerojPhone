'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface OrderData {
    id: string;
    orderNumber: string;
    date: string;
    total: number;
    status: string;
    items: unknown[];
}

export default function CustomerDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'profile'>('overview');
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Fetch Orders
    useEffect(() => {
        async function fetchOrders() {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(id)')
                    .eq('customer_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setOrders(data.map(o => ({
                        id: o.id,
                        orderNumber: o.order_number,
                        date: new Date(o.created_at).toLocaleDateString(),
                        total: o.total_amount || 0,
                        status: o.status,
                        items: o.order_items || []
                    })));
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoadingOrders(false);
            }
        }

        fetchOrders();
    }, [user]);

    const [wishlist, setWishlist] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        async function fetchWishlist() {
            try {
                const res = await fetch('/api/wishlist');
                const data = await res.json();
                if (data.wishlist) {
                    // Handle image parsing similar to Products page if needed, 
                    // but usually the DB returns standard format.
                    // Assuming API returns clean product objects
                    setWishlist(data.wishlist.map((p: any) => {
                        // Quick parse for images if stringified
                        let img = p.images;
                        if (typeof img === 'string' && img.startsWith('[')) {
                            try { img = JSON.parse(img)[0]; } catch { }
                        } else if (Array.isArray(img)) {
                            img = img[0];
                        }
                        return { ...p, image: img || '📱' };
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch wishlist', err);
            }
        }
        fetchWishlist();
    }, [user]);

    const removeFromWishlist = async (id: string) => {
        // Optimistic update
        setWishlist(prev => prev.filter(item => item.id !== id));

        try {
            await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: id })
            });
        } catch (err) {
            console.error('Failed to remove from wishlist', err);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IQ').format(price);
    };

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
            paid: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
            processing: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
            shipped: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50',
            delivered: 'bg-green-500/20 text-green-300 border-green-500/50',
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

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

                        <div className="flex items-center space-x-4">
                            <Link href="/products" className="text-white/80 hover:text-white transition">
                                Shop
                            </Link>
                            <button className="text-white/80 hover:text-white transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">{user?.email?.[0].toUpperCase()}</span>
                                </div>
                                <span className="text-white text-sm hidden md:block">{user?.user_metadata?.full_name || user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">My Dashboard</h1>
                        <p className="text-white/70">Welcome back, {user?.user_metadata?.full_name || 'User'}!</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-24">
                                <nav className="space-y-2">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: '📊' },
                                        { id: 'orders', label: 'My Orders', icon: '📦' },
                                        { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
                                        { id: 'profile', label: 'Profile', icon: '👤' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'text-white/70 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-xl">{tab.icon}</span>
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>

                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 transition"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Overview */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Stats */}
                                    <div className="grid sm:grid-cols-3 gap-6">
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-3xl">📦</div>
                                                <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                                                    New
                                                </div>
                                            </div>
                                            <div className="text-white/60 text-sm mb-1">Total Orders</div>
                                            <div className="text-white text-3xl font-bold">{loadingOrders ? '...' : orders.length}</div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-3xl">💰</div>
                                                <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                                                    Saved
                                                </div>
                                            </div>
                                            <div className="text-white/60 text-sm mb-1">Total Spent</div>
                                            <div className="text-white text-2xl font-bold">{loadingOrders ? '...' : formatPrice(totalSpent)} IQD</div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-3xl">❤️</div>
                                                <div className="bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full text-sm">
                                                    {wishlist.length}
                                                </div>
                                            </div>
                                            <div className="text-white/60 text-sm mb-1">Wishlist Items</div>
                                            <div className="text-white text-3xl font-bold">{wishlist.length}</div>
                                        </div>
                                    </div>

                                    {/* Recent Orders */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-6">Recent Orders</h3>
                                        <div className="space-y-4">
                                            {orders.slice(0, 3).map((order) => (
                                                <div key={order.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div>
                                                            <div className="text-white font-semibold mb-1">{order.orderNumber}</div>
                                                            <div className="text-white/60 text-sm">{order.date} • {order.items.length} items</div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <div className="text-purple-300 font-bold">{formatPrice(order.total)} IQD</div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {orders.length === 0 && !loadingOrders && (
                                                <div className="text-white/60 text-center py-4">No orders yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Orders */}
                            {activeTab === 'orders' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6">My Orders</h3>
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <div className="text-white font-bold text-lg mb-1">{order.orderNumber}</div>
                                                        <div className="text-white/60 text-sm">Placed on {order.date}</div>
                                                    </div>
                                                    <span className={`px-4 py-2 rounded-lg text-sm border font-semibold ${getStatusColor(order.status)}`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                    <div>
                                                        <div className="text-white/60 text-sm mb-1">Total Amount</div>
                                                        <div className="text-purple-300 font-bold text-xl">{formatPrice(order.total)} IQD</div>
                                                    </div>
                                                    <Link
                                                        href={`/order-confirmation?order=${order.orderNumber}`}
                                                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                        {orders.length === 0 && !loadingOrders && (
                                            <div className="text-white/60 text-center py-10">Start shopping to see your orders here!</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Wishlist */}
                            {activeTab === 'wishlist' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6">My Wishlist</h3>
                                    {wishlist.length === 0 ? (
                                        <div className="text-white/60 text-center py-10 col-span-2">
                                            Your wishlist is empty. Start browsing to save your favorite items!
                                            <div className="mt-4">
                                                <Link href="/products" className="text-purple-300 hover:text-white underline">
                                                    Browse Products
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            {wishlist.map((item) => (
                                                <div key={item.id} className="bg-white/5 rounded-xl p-6 border border-white/10 group hover:bg-white/10 transition">
                                                    <div className="relative aspect-square w-full mb-4 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                                                        {item.image?.startsWith('http') ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition duration-500"
                                                            />
                                                        ) : (
                                                            <span className="text-6xl group-hover:scale-110 transition transform block select-none">
                                                                {item.image || '📱'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-white font-semibold mb-2">{item.name}</h4>
                                                    <div className="text-purple-300 font-bold text-xl mb-4">{formatPrice(item.price)} IQD</div>
                                                    <div className="flex gap-2">
                                                        <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition">
                                                            Add to Cart
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromWishlist(item.id)}
                                                            className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Profile */}
                            {activeTab === 'profile' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6">Profile Settings</h3>
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-white/80 mb-2 font-medium">Full Name</label>
                                                <input
                                                    type="text"
                                                    defaultValue={user?.user_metadata?.full_name || ''}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-white/80 mb-2 font-medium">Email</label>
                                                <input
                                                    type="email"
                                                    defaultValue={user?.email || ''}
                                                    readOnly
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white/50 cursor-not-allowed focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-white/80 mb-2 font-medium">Phone Number</label>
                                            <input
                                                type="tel"
                                                defaultValue=""
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-white/80 mb-2 font-medium">Default Address</label>
                                            <textarea
                                                defaultValue=""
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                                            />
                                        </div>

                                        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition">
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
