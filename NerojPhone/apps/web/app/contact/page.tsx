'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block mb-6">
                        <span className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold border border-amber-500/30">
                            💬 We're Here to Help
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Get in <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">Touch</span>
                    </h1>

                    <p className="text-xl text-white/70 leading-relaxed">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                icon: '📧',
                                title: 'Email Us',
                                info: 'support@nerojphone.iq',
                                description: 'Send us an email anytime'
                            },
                            {
                                icon: '📱',
                                title: 'Call Us',
                                info: '+964 XXX XXX XXXX',
                                description: 'Mon-Sat from 9am to 6pm'
                            },
                            {
                                icon: '📍',
                                title: 'Visit Us',
                                info: 'Baghdad, Iraq',
                                description: 'Come say hello at our office'
                            },
                        ].map((method, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center hover:bg-white/10 transition"
                            >
                                <div className="text-5xl mb-4">{method.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                                <p className="text-amber-400 font-semibold mb-2">{method.info}</p>
                                <p className="text-white/60 text-sm">{method.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
                            <h2 className="text-3xl font-bold text-white mb-8 text-center">Send us a Message</h2>

                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-white/80 mb-2 text-sm font-semibold">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/80 mb-2 text-sm font-semibold">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2 text-sm font-semibold">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2 text-sm font-semibold">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition"
                                        placeholder="+964 XXX XXX XXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2 text-sm font-semibold">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/80 mb-2 text-sm font-semibold">
                                        Message
                                    </label>
                                    <textarea
                                        rows={6}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition transform hover:scale-105"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 bg-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-white/70">Quick answers to common questions</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                question: 'What payment methods do you accept?',
                                answer: 'We accept QI Card, Visa, MasterCard, and Cash on Delivery for your convenience.'
                            },
                            {
                                question: 'How long does delivery take?',
                                answer: 'Delivery typically takes 2-5 business days depending on your location in Iraq.'
                            },
                            {
                                question: 'Do you offer warranty on products?',
                                answer: 'Yes, all products come with manufacturer warranty. Details vary by product.'
                            },
                            {
                                question: 'Can I return a product?',
                                answer: 'Yes, we have a 7-day return policy for unopened products in original condition.'
                            },
                        ].map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10"
                            >
                                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                                <p className="text-white/60">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
