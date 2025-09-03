'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
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
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Authenticating...</p>
            </div>
        </div>
    );
}