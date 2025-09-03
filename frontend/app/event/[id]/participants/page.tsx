'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Mail, Wallet, Calendar, Crown, Trophy, User } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
  walletAddress?: string;
  createdAt: string;
}

interface EventParticipantsData {
  event: {
    id: string;
    title: string;
    totalParticipants: number;
  };
  participants: User[];
}

export default function EventParticipantsPage() {
  const params = useParams();
  const [data, setData] = useState<EventParticipantsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Get current user ID from token
  const getCurrentUserId = () => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  };

  const currentUserId = isMounted ? getCurrentUserId() : null;

  const fetchEventParticipants = async () => {
    if (!currentUserId) {
      setError('Please login to view event participants');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`http://localhost:3000/api/event/${params.id}/participants`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch event participants');
      }
    } catch (error) {
      console.error('Error fetching event participants:', error);
      setError('Failed to fetch event participants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (params.id && isMounted) {
      fetchEventParticipants();
    }
  }, [params.id, isMounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center relative overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/Avalink.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="fixed inset-0 bg-black/60" />
        
        <Card className="w-96 text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl relative z-10">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E94042] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-300">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatShortAddress = (address?: string) => {
    if (!address) return null;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center relative overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/Avalink.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="fixed inset-0 bg-black/60" />
        
        <Card className="w-96 text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl relative z-10">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold mb-4 text-white">Authentication Required</h1>
            <p className="text-gray-300 mb-4">Please login to view event participants</p>
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              className="bg-[#E94042] hover:bg-[#E94042]/90"
            >
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center relative overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/Avalink.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="fixed inset-0 bg-black/60" />
        
        <Card className="w-96 text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl relative z-10">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E94042] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-300">Loading participants...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center relative overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('/Avalink.webp')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="fixed inset-0 bg-black/60" />
        
        <Card className="w-96 text-center bg-white/5 backdrop-blur-md border border-white shadow-xl relative z-10">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-semibold mb-4 text-red-400">Error</h1>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Link href="/explore">
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Explore
                </Button>
              </Link>
              <Button 
                onClick={fetchEventParticipants}
                className="bg-[#E94042] hover:bg-[#E94042]/90"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#161616] relative overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{
          backgroundImage: `url('/Avalink.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/60" />

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/event/${params.id}`}>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Event
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Participants</h1>
                <p className="text-sm text-gray-300">{data.event.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
              <Users className="w-5 h-5 text-[#E94042]" />
              <span className="text-white font-medium">{data.event.totalParticipants} Participants</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {data.participants.length === 0 ? (
          <Card className="w-full text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <CardContent className="pt-12 pb-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No Participants Yet</h2>
              <p className="text-gray-300 mb-6">This event doesn't have any participants yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.participants.map((participant) => (
              <Card key={participant.id} className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.name || 'Participant'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E94042] to-purple-500 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {participant.name || 'Anonymous User'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Joined {formatDate(participant.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info (only visible to event host) */}
                  {participant.email && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{participant.email}</span>
                    </div>
                  )}

                  {/* Wallet Address (only visible to event host) */}
                  {participant.walletAddress && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/5 rounded-lg">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300 font-mono">
                        {formatShortAddress(participant.walletAddress)}
                      </span>
                    </div>
                  )}

                  {/* Join Date */}
                  <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      Member since {formatDate(participant.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}