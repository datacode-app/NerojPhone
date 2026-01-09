'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    stock_quantity: number;
    image_url: string;
    created_at: string;
}

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    customer_email: string;
    items: OrderItem[];
}

type TabType = 'products' | 'orders' | 'analytics' | 'add-product';

export default function MerchantDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
    const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
    const [merchantId, setMerchantId] = useState<string | null>(null);

    // Form state for adding/editing products
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        stock_quantity: '',
        image_url: '',
        specifications: {
            screen: '',
            processor: '',
            ram: '',
            storage: '',
            camera: '',
            battery: '',
            os: ''
        }
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchMerchantId();
        fetchCategories();
        fetchBrands();
    }, [user]);

    useEffect(() => {
        if (merchantId) {
            fetchProducts();
            fetchOrders();
        }
    }, [merchantId]);

    const fetchMerchantId = async () => {
        try {
            const { data, error } = await supabase
                .from('merchants')
                .select('id')
                .eq('user_id', user?.id)
                .maybeSingle(); // Use maybeSingle instead of single

            if (error) throw error;
            setMerchantId(data?.id || null);
        } catch (error) {
            console.error('Error fetching merchant ID:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setBrands(data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchProducts = async () => {
        if (!merchantId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('merchant_id', merchantId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map database columns to UI model
            const mappedProducts = (data || []).map((item: any) => {
                let imageUrl = '';
                // Handle various formats of images column
                if (Array.isArray(item.images) && item.images.length > 0) {
                    imageUrl = item.images[0];
                } else if (typeof item.images === 'string') {
                    try {
                        const parsed = JSON.parse(item.images);
                        if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
                    } catch {
                        // If not JSON, treat as direct string
                        if (item.images.startsWith('http')) imageUrl = item.images;
                    }
                }

                // Fallback to legacy image_url if images is empty
                if (!imageUrl && item.image_url) imageUrl = item.image_url;

                return {
                    ...item,
                    image_url: imageUrl
                };
            });

            setProducts(mappedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!merchantId) return;
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('merchant_id', merchantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploadingImage(true);

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            // Update form with image URL
            setProductForm({ ...productForm, image_url: publicUrl });
            setImagePreview(publicUrl);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image: ' + (error as Error).message);
        } finally {
            setUploadingImage(false);
        }
    };


    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Check if merchant ID is available
            if (!merchantId) {
                alert('Merchant profile not found. Please contact support.');
                return;
            }

            // Generate slug from product name
            const slug = productForm.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '') + '-' + Date.now();

            // Prepare product data matching the actual schema
            const productData = {
                merchant_id: merchantId,
                category_id: productForm.category || null, // UUID from dropdown
                brand_id: productForm.brand || null, // UUID from dropdown (optional)
                name: productForm.name,
                name_ar: productForm.name, // Using same name for now
                slug: slug,
                description: productForm.description,
                description_ar: productForm.description, // Using same description
                price: parseFloat(productForm.price),
                stock_quantity: parseInt(productForm.stock_quantity),
                images: productForm.image_url ? [productForm.image_url] : [],
                specifications: productForm.specifications,
                is_featured: false,
                status: 'active',
                sku: `SKU-${Date.now()}`
            };

            const { error } = await supabase
                .from('products')
                .insert([productData]);

            if (error) throw error;

            alert('Product added successfully!');
            resetForm();
            setActiveTab('products');
            fetchProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product: ' + (error as Error).message);
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const productData = {
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                category: productForm.category,
                brand: productForm.brand,
                stock_quantity: parseInt(productForm.stock_quantity),
                images: [productForm.image_url], // Map to images array
                specifications: productForm.specifications
            };

            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingProduct.id)
                .eq('merchant_id', merchantId); // Ensure ownership

            if (error) throw error;

            alert('Product updated successfully!');
            setEditingProduct(null);
            resetForm();
            setActiveTab('products');
            fetchProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product: ' + (error as Error).message);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id)
                .eq('merchant_id', merchantId); // Ensure ownership

            if (error) throw error;

            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product: ' + (error as Error).message);
        }
    };

    const startEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            brand: product.brand,
            stock_quantity: product.stock_quantity.toString(),
            image_url: product.image_url,
            specifications: (product as Product & { specifications?: typeof productForm.specifications }).specifications || {
                screen: '',
                processor: '',
                ram: '',
                storage: '',
                camera: '',
                battery: '',
                os: ''
            }
        });
        setImagePreview(product.image_url);
        setActiveTab('add-product');
    };

    const resetForm = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            category: '',
            brand: '',
            stock_quantity: '',
            image_url: '',
            specifications: {
                screen: '',
                processor: '',
                ram: '',
                storage: '',
                camera: '',
                battery: '',
                os: ''
            }
        });
        setEditingProduct(null);
        setImagePreview('');
    };

    const calculateAnalytics = () => {
        const totalProducts = products.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const lowStockProducts = products.filter(p => p.stock_quantity < 10).length;

        return { totalProducts, totalOrders, totalRevenue, lowStockProducts };
    };

    const analytics = calculateAnalytics();

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Merchant Dashboard</h1>
                        <p className="text-white/70">Welcome back, {user.email}</p>
                    </div>
                    <Link
                        href="/"
                        className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-600/20 transition flex items-center gap-2"
                    >
                        <span>🏠</span> View Main Site
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 overflow-x-auto">
                    {[
                        { id: 'products', label: '📦 Products', icon: '📦' },
                        { id: 'add-product', label: '➕ Add Product', icon: '➕' },
                        { id: 'orders', label: '🛍️ Orders', icon: '🛍️' },
                        { id: 'analytics', label: '📊 Analytics', icon: '📊' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as TabType);
                                if (tab.id === 'add-product') resetForm();
                            }}
                            className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6">Your Products</h2>
                        {loading ? (
                            <div className="text-white text-center py-12">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/70 mb-4">No products yet</p>
                                <button
                                    onClick={() => setActiveTab('add-product')}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                                >
                                    Add Your First Product
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition"
                                    >
                                        <div className="relative w-full h-48 mb-4">
                                            <img
                                                src={product.image_url || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">{product.name}</h3>
                                        <p className="text-white/60 text-sm mb-4 line-clamp-2">{product.description}</p>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-purple-400 font-bold text-xl">
                                                {product.price.toLocaleString()} IQD
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock_quantity > 10
                                                ? 'bg-green-500/20 text-green-300'
                                                : product.stock_quantity > 0
                                                    ? 'bg-yellow-500/20 text-yellow-300'
                                                    : 'bg-red-500/20 text-red-300'
                                                }`}>
                                                Stock: {product.stock_quantity}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEditProduct(product)}
                                                className="flex-1 bg-blue-500/20 text-blue-300 py-2 rounded-lg hover:bg-blue-500/30 transition font-semibold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="flex-1 bg-red-500/20 text-red-300 py-2 rounded-lg hover:bg-red-500/30 transition font-semibold"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Add/Edit Product Tab */}
                {activeTab === 'add-product' && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white mb-2 font-semibold">Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                                        placeholder="iPhone 15 Pro Max"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2 font-semibold">Price (IQD) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                                        placeholder="1500000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2 font-semibold">Category *</label>
                                    <select
                                        required
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                                        style={{
                                            colorScheme: 'dark'
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2 font-semibold">Brand</label>
                                    <select
                                        value={productForm.brand}
                                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 [&>option]:bg-slate-800 [&>option]:text-white"
                                        style={{
                                            colorScheme: 'dark'
                                        }}
                                    >
                                        <option value="">Select Brand (Optional)</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white mb-2 font-semibold">Stock Quantity *</label>
                                    <input
                                        type="number"
                                        required
                                        value={productForm.stock_quantity}
                                        onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                                        placeholder="50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white mb-2 font-semibold">Image URL *</label>
                                    <input
                                        type="url"
                                        value={productForm.image_url}
                                        onChange={(e) => {
                                            setProductForm({ ...productForm, image_url: e.target.value });
                                            setImagePreview(e.target.value);
                                        }}
                                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            {/* Product Image Section - Clean Design */}
                            <div>
                                <label className="block text-white mb-3 font-semibold">Product Image *</label>

                                <div className="text-white/70 text-sm mb-3">Option 1: Upload Image from Computer</div>
                                <div className="flex items-center gap-4 mb-4">
                                    <label className="cursor-pointer">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition inline-flex items-center gap-2">
                                            {uploadingImage ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    📁 Choose Image File
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                    <span className="text-white/60 text-sm">Max 5MB • JPG, PNG, WebP</span>
                                </div>

                                {/* Simple OR */}
                                <div className="text-center my-3">
                                    <span className="bg-slate-800 px-3 py-1 rounded text-white/60 text-sm">OR</span>
                                </div>

                                <div className="text-white/70 text-sm mb-3">Option 2: Paste Image URL</div>
                                <p className="text-white/50 text-xs mb-4">
                                    💡 You can upload from your computer OR paste an image URL from sites like ImgBB, Imgur, etc.
                                </p>

                                {/* Image Preview */}
                                {(imagePreview || productForm.image_url) && (
                                    <div className="mt-4">
                                        <div className="text-white/70 text-sm mb-2">Preview:</div>
                                        <div className="relative w-full max-w-sm h-48 rounded-lg border border-white/20 overflow-hidden">
                                            <img
                                                src={imagePreview || productForm.image_url}
                                                alt="Product preview"
                                                className="w-full h-full object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-white mb-2 font-semibold">Description *</label>
                                <textarea
                                    required
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                                    rows={4}
                                    placeholder="Detailed product description..."
                                />
                            </div>

                            <div className="border-t border-white/20 pt-6">
                                <h3 className="text-white font-bold mb-4">Product Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(productForm.specifications).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-white/70 mb-2 capitalize">{key}</label>
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => setProductForm({
                                                    ...productForm,
                                                    specifications: { ...productForm.specifications, [key]: e.target.value }
                                                })}
                                                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                                                placeholder={`Enter ${key}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition"
                                >
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                                {editingProduct && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            resetForm();
                                            setActiveTab('products');
                                        }}
                                        className="px-6 bg-white/10 text-white font-bold py-4 rounded-xl hover:bg-white/20 transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6">Orders</h2>
                        {orders.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/70">No orders yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-white font-bold text-lg">#{order.order_number}</h3>
                                                <p className="text-white/60 text-sm">{order.customer_email}</p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${order.status === 'delivered'
                                                ? 'bg-green-500/20 text-green-300'
                                                : order.status === 'shipped'
                                                    ? 'bg-blue-500/20 text-blue-300'
                                                    : 'bg-yellow-500/20 text-yellow-300'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/70">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="text-purple-400 font-bold text-xl">
                                                {order.total_amount.toLocaleString()} IQD
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
                                <div className="text-4xl mb-2" role="img" aria-label="products">📦</div>
                                <div className="text-white/70 text-sm mb-1">Total Products</div>
                                <div className="text-white text-3xl font-bold">{analytics.totalProducts}</div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
                                <div className="text-4xl mb-2" role="img" aria-label="orders">🛍️</div>
                                <div className="text-white/70 text-sm mb-1">Total Orders</div>
                                <div className="text-white text-3xl font-bold">{analytics.totalOrders}</div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                                <div className="text-4xl mb-2" role="img" aria-label="revenue">💰</div>
                                <div className="text-white/70 text-sm mb-1">Total Revenue</div>
                                <div className="text-white text-3xl font-bold">{analytics.totalRevenue.toLocaleString()}</div>
                                <div className="text-white/60 text-xs mt-1">IQD</div>
                            </div>

                            <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
                                <div className="text-4xl mb-2" role="img" aria-label="alert">⚠️</div>
                                <div className="text-white/70 text-sm mb-1">Low Stock Items</div>
                                <div className="text-white text-3xl font-bold">{analytics.lowStockProducts}</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                            <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70">Average Product Price</span>
                                    <span className="text-white font-bold">
                                        {products.length > 0
                                            ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toLocaleString()
                                            : 0} IQD
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70">Average Order Value</span>
                                    <span className="text-white font-bold">
                                        {orders.length > 0
                                            ? (analytics.totalRevenue / orders.length).toLocaleString()
                                            : 0} IQD
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white/70">Total Inventory Value</span>
                                    <span className="text-white font-bold">
                                        {products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0).toLocaleString()} IQD
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
