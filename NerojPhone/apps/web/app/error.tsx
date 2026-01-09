'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500/20 rounded-full mb-6">
                        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Something Went Wrong
                    </h1>
                </div>

                <p className="text-white/70 text-lg mb-2">
                    We're sorry, but something unexpected happened.
                </p>

                {error.message && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-8 max-w-lg mx-auto">
                        <p className="text-red-300 text-sm font-mono">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                        onClick={reset}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/50 transition"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition inline-block"
                    >
                        Go Home
                    </Link>
                </div>

                <div className="text-white/50 text-sm">
                    <p>If this problem persists, please <Link href="/contact" className="text-purple-300 hover:underline">contact support</Link></p>
                </div>
            </div>
        </div>
    );
}
