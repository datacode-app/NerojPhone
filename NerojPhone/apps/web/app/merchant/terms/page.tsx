import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function MerchantTermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0D0144] via-[#0E0144] to-[#0A013D]">
            <Navbar />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-white/10">
                        <h1 className="text-4xl font-bold text-white mb-4">Merchant Terms & Conditions</h1>
                        <p className="text-white/70 mb-8">Last Updated: January 7, 2026</p>

                        <div className="space-y-8 text-white/80">
                            {/* Introduction */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                                <p className="mb-4">
                                    Welcome to NerojPhone's Merchant Program. By applying to become a merchant on our platform,
                                    you agree to comply with these Merchant Terms and Conditions ("Terms"). Please read them
                                    carefully before submitting your application.
                                </p>
                                <p>
                                    These Terms constitute a legally binding agreement between you (the "Merchant") and NerojPhone
                                    ("Platform", "we", "us", or "our").
                                </p>
                            </section>

                            {/* Eligibility */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">2. Merchant Eligibility</h2>
                                <p className="mb-3">To become a merchant on NerojPhone, you must:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Be at least 18 years of age or the age of legal majority in your jurisdiction</li>
                                    <li>Have a valid business license or registration in Iraq</li>
                                    <li>Provide accurate and complete information during registration</li>
                                    <li>Have a valid Iraqi phone number and email address</li>
                                    <li>Agree to sell only authentic, legal products</li>
                                    <li>Comply with all applicable laws and regulations in Iraq</li>
                                </ul>
                            </section>

                            {/* Application Process */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">3. Application & Approval Process</h2>
                                <p className="mb-3">3.1 <strong className="text-white">Application Review:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                    <li>All merchant applications are subject to review and approval by NerojPhone</li>
                                    <li>Review typically takes 2-5 business days</li>
                                    <li>We reserve the right to reject any application without providing a reason</li>
                                    <li>Approval does not guarantee continued access to the platform</li>
                                </ul>

                                <p className="mb-3">3.2 <strong className="text-white">Verification:</strong></p>
                                <p>We may request additional documentation to verify your identity and business, including but not limited to:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Government-issued ID</li>
                                    <li>Business registration documents</li>
                                    <li>Tax identification number</li>
                                    <li>Proof of business address</li>
                                </ul>
                            </section>

                            {/* Product Listings */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">4. Product Listings & Standards</h2>
                                <p className="mb-3">4.1 <strong className="text-white">Product Requirements:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                    <li>All products must be authentic and legally sourced</li>
                                    <li>Product descriptions must be accurate and not misleading</li>
                                    <li>Images must be clear and represent the actual product</li>
                                    <li>Pricing must be fair and competitive</li>
                                    <li>Stock quantities must be accurate and updated regularly</li>
                                </ul>

                                <p className="mb-3">4.2 <strong className="text-white">Prohibited Items:</strong></p>
                                <p className="mb-2">You may NOT list the following:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Counterfeit or replica products</li>
                                    <li>Stolen goods</li>
                                    <li>Illegal or restricted items under Iraqi law</li>
                                    <li>Products that infringe on intellectual property rights</li>
                                    <li>Dangerous or hazardous materials without proper authorization</li>
                                    <li>Products that violate our community standards</li>
                                </ul>
                            </section>

                            {/* Pricing & Fees */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">5. Pricing & Commission</h2>
                                <p className="mb-3">5.1 <strong className="text-white">Platform Commission:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                    <li>NerojPhone charges a commission on each completed sale</li>
                                    <li>Commission rates will be communicated during onboarding</li>
                                    <li>Commission is calculated on the total sale price (including taxes)</li>
                                    <li>We reserve the right to adjust commission rates with 30 days notice</li>
                                </ul>

                                <p className="mb-3">5.2 <strong className="text-white">Payment Processing:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Payments are processed through our secure payment gateway</li>
                                    <li>Merchant payouts are made on a weekly or monthly basis (as agreed)</li>
                                    <li>Minimum payout threshold applies</li>
                                    <li>Payment processing fees may apply</li>
                                </ul>
                            </section>

                            {/* Order Fulfillment */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">6. Order Fulfillment & Shipping</h2>
                                <p className="mb-3">6.1 <strong className="text-white">Merchant Responsibilities:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                    <li>Process orders within 24 hours of confirmation</li>
                                    <li>Ship products within the timeframe displayed on product listings</li>
                                    <li>Package products securely to prevent damage</li>
                                    <li>Provide tracking information when available</li>
                                    <li>Update order status promptly</li>
                                    <li>Respond to customer inquiries within 24 hours</li>
                                </ul>

                                <p className="mb-3">6.2 <strong className="text-white">Shipping Standards:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Use reliable shipping carriers</li>
                                    <li>Ensure proper packaging to prevent damage</li>
                                    <li>Include return address on all packages</li>
                                    <li>Ship to the address provided by the customer</li>
                                </ul>
                            </section>

                            {/* Returns & Refunds */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">7. Returns, Refunds & Customer Service</h2>
                                <p className="mb-3">7.1 <strong className="text-white">Return Policy:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                    <li>You must accept returns within 7 days of delivery for defective products</li>
                                    <li>Return shipping costs may be borne by the merchant or customer depending on the reason</li>
                                    <li>Refunds must be processed within 5 business days of receiving returned items</li>
                                    <li>You must clearly state your return policy on product listings</li>
                                </ul>

                                <p className="mb-3">7.2 <strong className="text-white">Customer Service:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Respond professionally to all customer inquiries</li>
                                    <li>Resolve disputes in good faith</li>
                                    <li>Maintain a minimum customer satisfaction rating</li>
                                    <li>Cooperate with NerojPhone's customer service team when needed</li>
                                </ul>
                            </section>

                            {/* Intellectual Property */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
                                <p className="mb-4">
                                    8.1 You represent and warrant that you own or have the necessary rights to all content you
                                    upload to the platform, including product images, descriptions, and brand names.
                                </p>
                                <p className="mb-4">
                                    8.2 You may not use NerojPhone's trademarks, logos, or branding without prior written consent.
                                </p>
                                <p>
                                    8.3 Any infringement of intellectual property rights may result in immediate termination of
                                    your merchant account and potential legal action.
                                </p>
                            </section>

                            {/* Data & Privacy */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">9. Data Protection & Privacy</h2>
                                <p className="mb-3">9.1 <strong className="text-white">Customer Data:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                    <li>You may only use customer data for order fulfillment purposes</li>
                                    <li>You must not share, sell, or misuse customer information</li>
                                    <li>You must comply with applicable data protection laws</li>
                                    <li>Customer data remains the property of NerojPhone</li>
                                </ul>

                                <p className="mb-3">9.2 <strong className="text-white">Your Data:</strong></p>
                                <p>
                                    We collect and process your merchant data in accordance with our Privacy Policy.
                                    This includes business information, sales data, and communication records.
                                </p>
                            </section>

                            {/* Account Suspension */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">10. Account Suspension & Termination</h2>
                                <p className="mb-3">10.1 <strong className="text-white">We may suspend or terminate your account if:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                                    <li>You violate these Terms or our policies</li>
                                    <li>You receive excessive customer complaints</li>
                                    <li>You engage in fraudulent activity</li>
                                    <li>You list prohibited items</li>
                                    <li>Your account remains inactive for an extended period</li>
                                    <li>You fail to fulfill orders or provide adequate customer service</li>
                                </ul>

                                <p className="mb-3">10.2 <strong className="text-white">Upon termination:</strong></p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Your access to the merchant dashboard will be revoked</li>
                                    <li>All active listings will be removed</li>
                                    <li>Pending payouts may be withheld pending investigation of disputes</li>
                                    <li>You must fulfill all pending orders</li>
                                </ul>
                            </section>

                            {/* Liability */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">11. Liability & Indemnification</h2>
                                <p className="mb-4">
                                    11.1 <strong className="text-white">Merchant Liability:</strong> You are solely responsible
                                    for the products you sell, including their quality, safety, and legality. You agree to
                                    indemnify and hold harmless NerojPhone from any claims, damages, or losses arising from
                                    your products or actions.
                                </p>
                                <p className="mb-4">
                                    11.2 <strong className="text-white">Platform Liability:</strong> NerojPhone provides a
                                    marketplace platform and is not responsible for disputes between merchants and customers,
                                    product quality issues, or delivery problems.
                                </p>
                                <p>
                                    11.3 <strong className="text-white">Limitation of Liability:</strong> To the maximum extent
                                    permitted by law, our liability to you is limited to the fees you paid to us in the 12
                                    months preceding any claim.
                                </p>
                            </section>

                            {/* Dispute Resolution */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">12. Dispute Resolution</h2>
                                <p className="mb-4">
                                    12.1 Any disputes arising from these Terms will first be attempted to be resolved through
                                    good faith negotiations between you and NerojPhone.
                                </p>
                                <p>
                                    12.2 If a resolution cannot be reached, disputes will be resolved through arbitration or
                                    the courts of Iraq, in accordance with Iraqi law.
                                </p>
                            </section>

                            {/* Changes to Terms */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">13. Changes to Terms</h2>
                                <p className="mb-4">
                                    We reserve the right to modify these Terms at any time. We will notify you of significant
                                    changes via email or through your merchant dashboard. Continued use of the platform after
                                    changes constitute acceptance of the new Terms.
                                </p>
                            </section>

                            {/* Contact */}
                            <section>
                                <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
                                <p className="mb-2">For questions about these Merchant Terms, please contact us:</p>
                                <ul className="list-none space-y-2 ml-4">
                                    <li>📧 Email: merchants@nerojphone.com</li>
                                    <li>📱 Phone: +964 XXX XXX XXXX</li>
                                    <li>🏢 Address: Baghdad, Iraq</li>
                                </ul>
                            </section>

                            {/* Agreement */}
                            <section className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-6 mt-8">
                                <h2 className="text-2xl font-bold text-white mb-4">Merchant Agreement</h2>
                                <p className="mb-4">
                                    By clicking "Submit Application" on the merchant registration form, you acknowledge that
                                    you have read, understood, and agree to be bound by these Merchant Terms and Conditions,
                                    as well as our Privacy Policy and Community Guidelines.
                                </p>
                                <p className="text-white font-semibold">
                                    ✓ I understand that violation of these terms may result in account suspension or termination
                                </p>
                                <p className="text-white font-semibold">
                                    ✓ I agree to sell only authentic, legal products on the NerojPhone platform
                                </p>
                                <p className="text-white font-semibold">
                                    ✓ I will provide excellent customer service and fulfill orders promptly
                                </p>
                            </section>
                        </div>

                        {/* Back Button */}
                        <div className="mt-12 text-center">
                            <Link
                                href="/merchant/register"
                                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                            >
                                ← Back to Merchant Registration
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
