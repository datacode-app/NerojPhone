import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-[#0A013D] backdrop-blur-xl border-t border-white/10 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <Logo size="md" showText={true} variant="footer" />
                        <p className="text-white/60 text-sm mt-4">
                            Iraq's premier marketplace for mobile phones and gadgets.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Shop</h4>
                        <ul className="space-y-2">
                            <li><Link href="/products" className="text-white/60 hover:text-white transition text-sm">All Products</Link></li>
                            <li><Link href="/categories" className="text-white/60 hover:text-white transition text-sm">Categories</Link></li>
                            <li><Link href="/deals" className="text-white/60 hover:text-white transition text-sm">Deals</Link></li>
                            <li><Link href="/new-arrivals" className="text-white/60 hover:text-white transition text-sm">New Arrivals</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="text-white/60 hover:text-white transition text-sm">Help Center</Link></li>
                            <li><Link href="/shipping" className="text-white/60 hover:text-white transition text-sm">Shipping Info</Link></li>
                            <li><Link href="/returns" className="text-white/60 hover:text-white transition text-sm">Returns</Link></li>
                            <li><Link href="/contact" className="text-white/60 hover:text-white transition text-sm">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-white/60 hover:text-white transition text-sm">About Us</Link></li>
                            <li><Link href="/merchant" className="text-white/60 hover:text-white transition text-sm">Become a Merchant</Link></li>
                            <li><Link href="/privacy" className="text-white/60 hover:text-white transition text-sm">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-white/60 hover:text-white transition text-sm">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center">
                    <p className="text-white/60 text-sm">
                        © 2026 NerojPhone. All rights reserved. Built with ❤️ for Iraq.
                    </p>
                </div>
            </div>
        </footer>
    );
}
