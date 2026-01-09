import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NerojPhone - Premium Mobile Phones & Gadgets in Iraq",
  description: "Shop the latest mobile phones, chargers, cases, power banks, and accessories. Fast delivery across Iraq. Secure payment with QI Card, Visa, and more.",
  keywords: "mobile phones Iraq, smartphones Baghdad, phone accessories, QI Card payment, online shopping Iraq, iPhone Iraq, Samsung Iraq",
  authors: [{ name: "NerojPhone" }],
  creator: "NerojPhone",
  publisher: "NerojPhone",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_IQ",
    url: "/",
    title: "NerojPhone - Premium Mobile Phones & Gadgets in Iraq",
    description: "Shop the latest mobile phones and accessories with fast delivery across Iraq",
    siteName: "NerojPhone",
  },
  twitter: {
    card: "summary_large_image",
    title: "NerojPhone - Premium Mobile Phones & Gadgets in Iraq",
    description: "Shop the latest mobile phones and accessories with fast delivery across Iraq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
