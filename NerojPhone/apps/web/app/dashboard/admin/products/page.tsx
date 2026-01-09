'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    category: string;
    description?: string;
    rating: number;
    reviews: number;
    stock: number;
    in_stock: boolean;
    merchant_id: string;
    created_at?: string;
}

export default function AdminProductsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        image: '📱',
        brand: '',
        category: 'Smartphones',
        description: '',
        rating: 5,
        reviews: 0,
        stock: 10,
        in_stock: true,
        merchant_id: '',
    });

    const categories = [
        'Smartphones',
        'Accessories',
        'Chargers & Cables',
        'Phone Cases',
        'Power Banks',
        'Headphones',
        'Screen Protectors',
        'Smart Watches',
    ];

    const brands = [
        'Apple',
        'Samsung',
        'Xiaomi',
        'Huawei',
        'OPPO',
        'Realme',
        'Nokia',
        'OnePlus',
        'Other',
    ];

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingProduct) {
                // Update existing product
                const { error } = await supabase
                    .from('products')
                    .update(formData)
                    .eq('id', editingProduct.id);

                if (error) throw error;
                alert('Product updated successfully!');
            } else {
                // Create new product
                const { error } = await supabase
                    .from('products')
                    .insert([formData]);

                if (error) throw error;
                alert('Product added successfully!');
            }

            // Reset form and refresh
            resetForm();
            fetchProducts();
        } catch (error) {
            alert('Error: ' + (error as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            alert('Error: ' + (error as Error).message);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            image: product.image,
            brand: product.brand,
            category: product.category,
            description: product.description || '',
            rating: product.rating,
            reviews: product.reviews,
            stock: product.stock,
            in_stock: product.in_stock,
            merchant_id: product.merchant_id,
        });
        setShowAddForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: 0,
            image: '📱',
            brand: '',
            category: 'Smartphones',
            description: '',
            rating: 5,
            reviews: 0,
            stock: 10,
            in_stock: true,
            merchant_id: user?.id || '',
        });
        setEditingProduct(null);
        setShowAddForm(false);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IQ').format(price);
    };

    if (authLoading || loading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/10 backdrop-blur-lg border-b border-white/10 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/dashboard/admin" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">N</span>
                            </div>
                            <span className="text-white font-bold text-xl">Admin Panel</span>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link href="/products" className="text-white/80 hover:text-white transition">
                                View Store
                            </Link>
                            <Link href="/dashboard/admin" className="text-white/80 hover:text-white transition">
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Product Management</h1>
                            <p className="text-white/70">{products.length} products in inventory</p>
                        </div>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(!showAddForm);
                            }}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                        >
                            {showAddForm ? '✕ Cancel' : '+ Add Product'}
                        </button>
                    </div>

                    {/* Add/Edit Form */}
                    {showAddForm && (
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-white/80 mb-2 font-medium">Product Name *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="iPhone 15 Pro Max"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white/80 mb-2 font-medium">Price (IQD) *</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="1450000"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-white/80 mb-2 font-medium">Brand *</label>
                                        <select
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-[#0D0144]"
                                            required
                                        >
                                            <option value="">Select Brand</option>
                                            {brands.map((brand) => (
                                                <option key={brand} value={brand}>{brand}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-white/80 mb-2 font-medium">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-[#0D0144]"
                                            required
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2 font-medium">Image (Emoji or URL)</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="📱 or https://..."
                                    />
                                    <p className="text-white/50 text-sm mt-1">Use emoji (📱, 🎧, 🔋) or image URL</p>
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2 font-medium">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                                        placeholder="Detailed product description..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-white/80 mb-2 font-medium">Stock Quantity</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white/80 mb-2 font-medium">Rating (0-5)</label>
                                        <input
                                            type="number"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white/80 mb-2 font-medium">In Stock</label>
                                        <select
                                            value={formData.in_stock.toString()}
                                            onChange={(e) => setFormData({ ...formData, in_stock: e.target.value === 'true' })}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [&>option]:bg-[#0D0144]"
                                        >
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition font-semibold"
                                    >
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Products List */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                        <div className="space-y-4">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        <div className="text-6xl flex-shrink-0">{product.image}</div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-white/60">Price:</span>
                                                    <div className="text-purple-300 font-bold">{formatPrice(product.price)} IQD</div>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">Brand:</span>
                                                    <div className="text-white">{product.brand}</div>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">Category:</span>
                                                    <div className="text-white">{product.category}</div>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">Stock:</span>
                                                    <div className={product.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                                                        {product.stock} units
                                                    </div>
                                                </div>
                                            </div>
                                            {product.description && (
                                                <p className="text-white/70 text-sm mt-3">{product.description}</p>
                                            )}
                                        </div>

                                        <div className="flex lg:flex-col gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="flex-1 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition font-semibold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="flex-1 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition font-semibold"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {products.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📦</div>
                                    <p className="text-white/60 text-lg">No products yet. Add your first product!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
