import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-semibold border border-purple-500/30">
                  🚀 Now Live in Iraq
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Premium Mobile Phones & Gadgets
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Delivered Fast</span>
              </h1>

              <p className="text-xl text-white/70 leading-relaxed">
                Shop the latest smartphones, accessories, and gadgets with secure payment options.
                Fast delivery across Iraq. Pay with QI Card, Visa, or Cash on Delivery.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
                >
                  Browse Products
                </Link>
                <Link
                  href="/merchant/register"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition"
                >
                  Become a Merchant
                </Link>
              </div>

              {/* Payment Methods */}
              <div className="pt-8">
                <p className="text-white/50 text-sm mb-4">Accepted Payment Methods</p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white font-semibold">QI Card</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white font-semibold">Visa</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white font-semibold">MasterCard</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-white font-semibold">Cash on Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'iPhone 15 Pro', price: '1,450,000', image: '📱', link: '/products' },
                    { name: 'Samsung S24', price: '1,200,000', image: '📱', link: '/products' },
                    { name: 'AirPods Pro', price: '350,000', image: '🎧', link: '/products' },
                    { name: 'Power Bank', price: '45,000', image: '🔋', link: '/products' },
                  ].map((product, idx) => (
                    <Link
                      key={idx}
                      href={product.link}
                      className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition cursor-pointer group"
                    >
                      <div className="text-4xl mb-2" role="img" aria-label={product.name}>{product.image}</div>
                      <h3 className="text-white font-semibold text-sm mb-1">{product.name}</h3>
                      <p className="text-purple-300 font-bold">{product.price} IQD</p>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs text-white/70">View Details →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose NerojPhone?</h2>
            <p className="text-white/70 text-lg">The most trusted mobile marketplace in Iraq</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Secure Payments',
                description: 'Multiple payment options with manual verification for your safety'
              },
              {
                icon: '🚚',
                title: 'Fast Delivery',
                description: 'Quick delivery across all Iraqi cities with real-time tracking'
              },
              {
                icon: '✅',
                title: 'Verified Products',
                description: 'All products are verified by our team before listing'
              },
              {
                icon: '💬',
                title: '24/7 Support',
                description: 'Our customer support team is always ready to help'
              },
              {
                icon: '⭐',
                title: 'Quality Guaranteed',
                description: 'Only authentic products from trusted merchants'
              },
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'Competitive prices with regular deals and discounts'
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition" role="img" aria-label={feature.title}>{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Shop by Category</h2>
            <p className="text-white/70 text-lg">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Mobile Phones', icon: '📱', count: '250+' },
              { name: 'Chargers & Cables', icon: '🔌', count: '180+' },
              { name: 'Phone Cases', icon: '📦', count: '320+' },
              { name: 'Power Banks', icon: '🔋', count: '95+' },
              { name: 'Headphones', icon: '🎧', count: '140+' },
              { name: 'Screen Protectors', icon: '🛡️', count: '200+' },
              { name: 'Smart Watches', icon: '⌚', count: '75+' },
              { name: 'Accessories', icon: '✨', count: '400+' },
            ].map((category, idx) => (
              <Link
                key={idx}
                href={`/categories/${category.name.toLowerCase().replace(/ /g, '-')}`}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:from-purple-500/20 hover:to-pink-500/20 transition group text-center"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition" role="img" aria-label={category.name}>{category.icon}</div>
                <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                <p className="text-purple-300 text-sm">{category.count} products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Join thousands of happy customers across Iraq
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
              >
                Create Account
              </Link>
              <Link
                href="/products"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
