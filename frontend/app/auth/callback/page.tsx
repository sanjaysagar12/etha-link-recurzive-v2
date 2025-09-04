'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (token) {
            // Store token in localStorage
            localStorage.setItem('access_token', token);
            
            // Redirect to dashboard or home page
            router.push('/');
        } else {
            // If no token, redirect to login page
            router.push('/auth/login');
        }
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#161616]">
            <div className="text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-2 border-[#E94042] border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-lg">Authenticating...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait while we sign you in</p>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#161616]">
            <div className="text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8">
                <div className="animate-spin rounded-full h-16 w-16 border-2 border-[#E94042] border-t-transparent mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading...</p>
            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <AuthCallbackContent />
        </Suspense>
    );
}