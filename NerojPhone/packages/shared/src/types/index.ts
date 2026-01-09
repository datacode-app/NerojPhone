export interface Product {
    id: string;
    name: string;
    price: number;
    image: string; // URL or emoji
    brand: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    merchant_id: string;
    description?: string;
    created_at?: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    brand: string;
    quantity: number;
    category: string;
    merchant_id?: string;
}

export interface Order {
    id: string;
    order_number: string;
    customer_id: string;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    items: any[]; // JSONB snapshot
    created_at: string;
    shipping_address: any;
    payment_method: string;
}

export interface UserProfile {
    id: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    role: 'customer' | 'merchant' | 'admin';
    created_at: string;
    business_name?: string; // For merchants
}
