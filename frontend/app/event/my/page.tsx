'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Users, MessageSquare, Heart, Star, Calendar, Trophy, Eye, Settings } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

interface HostedEvent {
  id: string;
  title: string;
  description?: string;
  prize?: string;
  thumbnail?: string;
  verified: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  likes: number;
  createdAt: string;
  updatedAt: string;
  creator: User;
  winner?: User;
  _count: {
    participants: number;
    posts: number;
    userLikes: number;
  };
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<HostedEvent[]>([]);
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

  const fetchHostedEvents = async () => {
    if (!currentUserId) {
      setError('Please login to view your events');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('https://api-etherlink.portos.cloud/api/event/my', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setEvents(result.data);
      } else {
        setError(result.message || 'Failed to fetch hosted events');
      }
    } catch (error) {
      console.error('Error fetching hosted events:', error);
      setError('Failed to fetch hosted events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchHostedEvents();
    }
  }, [isMounted]);

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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventStatus = (event: HostedEvent) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return { status: 'upcoming', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (now >= start && now <= end) return { status: 'active', color: 'text-green-400', bg: 'bg-green-500/10' };
    return { status: 'ended', color: 'text-gray-400', bg: 'bg-gray-500/10' };
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
            <p className="text-gray-300 mb-4">Please login to view your hosted events</p>
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
            <p className="text-gray-300">Loading your events...</p>
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
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/explore'}
                className="border-gray-600 text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Button>
              <Button 
                onClick={fetchHostedEvents}
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
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Explore
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white">My Events</h1>
            </div>
            
            <Link href="/event/create">
              <Button className="bg-[#E94042] hover:bg-[#E94042]/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {events.length === 0 ? (
          <Card className="w-full text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl">
            <CardContent className="pt-12 pb-12">
              <div className="mb-6">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">No Events Yet</h2>
                <p className="text-gray-300 mb-6">You haven't created any events yet. Start by creating your first event!</p>
                
                <Link href="/event/create">
                  <Button className="bg-[#E94042] hover:bg-[#E94042]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventStatus = getEventStatus(event);
              
              return (
                <Card key={event.id} className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300 group">
                  <div className="relative">
                    {event.thumbnail ? (
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-[#E94042]/20 to-purple-500/20 rounded-t-lg flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/60" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${eventStatus.bg} ${eventStatus.color} backdrop-blur-sm`}>
                      {eventStatus.status.charAt(0).toUpperCase() + eventStatus.status.slice(1)}
                    </div>
                    
                    {/* Verified Badge */}
                    {event.verified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-yellow-500/20 backdrop-blur-sm rounded-full">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-yellow-400">Verified</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#E94042] transition-colors">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Prize */}
                    {event.prize && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-medium text-sm">
                          {event.prize} ETH Prize
                        </span>
                      </div>
                    )}

                    {/* Winner */}
                    {event.winner && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <Trophy className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium text-sm">
                          Winner: {event.winner.name || event.winner.email}
                        </span>
                      </div>
                    )}

                    {/* Event Dates */}
                    <div className="text-xs text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>Start: {formatDate(event.startDate)}</span>
                        <span>End: {formatDate(event.endDate)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-300 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event._count.participants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{event._count.posts}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{event._count.userLikes}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/event/${event.id}`} className="flex-1">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-white/10">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/event/${event.id}/participants`} className="flex-1">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-white/10">
                          <Users className="w-4 h-4 mr-2" />
                          Participants
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}