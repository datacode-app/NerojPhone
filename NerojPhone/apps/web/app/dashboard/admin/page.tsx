'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Payment {
    id: string;
    orderNumber: string;
    customer: string;
    amount: number;
    method: string;
    status: 'uploaded' | 'verified' | 'failed';
    uploadedAt: string;
    receiptUrl?: string;
    transactionId?: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'products' | 'users'>('overview');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const pendingPayments: Payment[] = [
        {
            id: '1',
            orderNumber: 'NRJ-20260106-000125',
            customer: 'Ahmed Ali',
            amount: 1450000,
            method: 'QI Card',
            status: 'uploaded',
            uploadedAt: '2026-01-06 10:30',
            transactionId: 'QI-2026-123456',
        },
        {
            id: '2',
            orderNumber: 'NRJ-20260106-000126',
            customer: 'Sara Mohammed',
            amount: 850000,
            method: 'Visa',
            status: 'uploaded',
            uploadedAt: '2026-01-06 11:15',
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IQ').format(price);
    };

    const handlePaymentApproval = (paymentId: string, approved: boolean) => {
        // In production, this would call an API to update payment status
        // Payment status update logic would go here
        setSelectedPayment(null);
    };

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
                            <span className="text-white font-bold text-xl hidden sm:block">NerojPhone Admin</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {pendingPayments.length} Pending
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">A</span>
                                </div>
                                <span className="text-white text-sm hidden md:block">Admin</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                        <p className="text-white/70">Manage your e-commerce platform</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-24">
                                <nav className="space-y-2">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: '📊' },
                                        { id: 'payments', label: 'Payments', icon: '💳', badge: pendingPayments.length },
                                        { id: 'products', label: 'Products', icon: '📦' },
                                        { id: 'users', label: 'Users', icon: '👥' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'text-white/70 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{tab.icon}</span>
                                                <span className="font-medium">{tab.label}</span>
                                            </div>
                                            {tab.badge && tab.badge > 0 && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Overview */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Stats */}
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                            <div className="text-3xl mb-3">💰</div>
                                            <div className="text-white/60 text-sm mb-1">Total Revenue</div>
                                            <div className="text-white text-2xl font-bold">45.2M IQD</div>
                                            <div className="text-green-400 text-sm mt-2">+12.5% this month</div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                            <div className="text-3xl mb-3">📦</div>
                                            <div className="text-white/60 text-sm mb-1">Total Orders</div>
                                            <div className="text-white text-2xl font-bold">1,234</div>
                                            <div className="text-green-400 text-sm mt-2">+8.3% this month</div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                            <div className="text-3xl mb-3">👥</div>
                                            <div className="text-white/60 text-sm mb-1">Total Users</div>
                                            <div className="text-white text-2xl font-bold">5,678</div>
                                            <div className="text-green-400 text-sm mt-2">+15.2% this month</div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                            <div className="text-3xl mb-3">🏪</div>
                                            <div className="text-white/60 text-sm mb-1">Active Merchants</div>
                                            <div className="text-white text-2xl font-bold">89</div>
                                            <div className="text-green-400 text-sm mt-2">+5 this month</div>
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                                        <div className="space-y-4">
                                            {[
                                                { icon: '💳', text: 'New payment verification needed', time: '5 min ago', type: 'warning' },
                                                { icon: '📦', text: 'New product submitted for approval', time: '15 min ago', type: 'info' },
                                                { icon: '👤', text: 'New merchant registration', time: '1 hour ago', type: 'success' },
                                                { icon: '⭐', text: 'New product review posted', time: '2 hours ago', type: 'info' },
                                            ].map((activity, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-white/5 rounded-lg p-4">
                                                    <div className="text-2xl">{activity.icon}</div>
                                                    <div className="flex-1">
                                                        <div className="text-white">{activity.text}</div>
                                                        <div className="text-white/60 text-sm">{activity.time}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Verification */}
                            {activeTab === 'payments' && (
                                <div className="space-y-6">
                                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-xl font-bold text-white mb-6">
                                            Pending Payment Verifications ({pendingPayments.length})
                                        </h3>

                                        <div className="space-y-4">
                                            {pendingPayments.map((payment) => (
                                                <div key={payment.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                                                        <div>
                                                            <div className="text-white font-bold text-lg mb-1">{payment.orderNumber}</div>
                                                            <div className="text-white/60 text-sm">Customer: {payment.customer}</div>
                                                            <div className="text-white/60 text-sm">Uploaded: {payment.uploadedAt}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-purple-300 font-bold text-2xl mb-1">
                                                                {formatPrice(payment.amount)} IQD
                                                            </div>
                                                            <div className="text-white/60 text-sm">{payment.method}</div>
                                                        </div>
                                                    </div>

                                                    {payment.transactionId && (
                                                        <div className="bg-white/5 rounded-lg p-3 mb-4">
                                                            <div className="text-white/60 text-sm mb-1">Transaction ID</div>
                                                            <div className="text-white font-mono">{payment.transactionId}</div>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => setSelectedPayment(payment)}
                                                            className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
                                                        >
                                                            View Receipt
                                                        </button>
                                                        <button
                                                            onClick={() => handlePaymentApproval(payment.id, true)}
                                                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition"
                                                        >
                                                            ✓ Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handlePaymentApproval(payment.id, false)}
                                                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/50 transition"
                                                        >
                                                            ✗ Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Products */}
                            {activeTab === 'products' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white">Products</h3>
                                        <Link
                                            href="/dashboard/admin/products"
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                                        >
                                            Manage Products →
                                        </Link>
                                    </div>
                                    <div className="text-white/70 text-center py-8">
                                        <div className="text-5xl mb-4">📦</div>
                                        <p className="mb-4">Click "Manage Products" to add, edit, or remove products</p>
                                        <p className="text-sm text-white/50">Full product management interface with CRUD operations</p>
                                    </div>
                                </div>
                            )}

                            {/* Users */}
                            {activeTab === 'users' && (
                                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                                    <h3 className="text-xl font-bold text-white mb-6">User Management</h3>
                                    <div className="text-white/60 text-center py-12">
                                        User management interface coming soon...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Receipt Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-2xl w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">Payment Receipt</h3>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="text-white/60 hover:text-white transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <div className="text-white/60 text-sm mb-1">Order Number</div>
                                <div className="text-white font-semibold">{selectedPayment.orderNumber}</div>
                            </div>
                            <div>
                                <div className="text-white/60 text-sm mb-1">Customer</div>
                                <div className="text-white font-semibold">{selectedPayment.customer}</div>
                            </div>
                            <div>
                                <div className="text-white/60 text-sm mb-1">Amount</div>
                                <div className="text-purple-300 font-bold text-2xl">
                                    {formatPrice(selectedPayment.amount)} IQD
                                </div>
                            </div>
                            {selectedPayment.transactionId && (
                                <div>
                                    <div className="text-white/60 text-sm mb-1">Transaction ID</div>
                                    <div className="text-white font-mono bg-white/5 px-4 py-2 rounded-lg">
                                        {selectedPayment.transactionId}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 mb-6 text-center">
                            <div className="text-6xl mb-4">🧾</div>
                            <div className="text-white/60">Receipt image would appear here</div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handlePaymentApproval(selectedPayment.id, false)}
                                className="flex-1 bg-red-500/20 text-red-300 px-6 py-3 rounded-lg font-semibold hover:bg-red-500/30 transition"
                            >
                                Reject Payment
                            </button>
                            <button
                                onClick={() => handlePaymentApproval(selectedPayment.id, true)}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition"
                            >
                                Approve Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
