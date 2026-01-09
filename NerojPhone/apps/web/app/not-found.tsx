import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
            <div className="text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        404
                    </h1>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Page Not Found
                </h2>

                <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/products"
                        className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition"
                    >
                        Browse Products
                    </Link>
                </div>

                <div className="mt-12 text-white/50 text-sm">
                    <p>Looking for something specific?</p>
                    <div className="flex gap-4 justify-center mt-3">
                        <Link href="/contact" className="hover:text-purple-300 transition">Contact Us</Link>
                        <span>•</span>
                        <Link href="/about" className="hover:text-purple-300 transition">About</Link>
                        <span>•</span>
                        <Link href="/categories" className="hover:text-purple-300 transition">Categories</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
