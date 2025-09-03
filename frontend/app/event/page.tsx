'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Trophy, 
  Star, 
  Clock, 
  User,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  prize?: string;
  thumbnail?: string;
  verified: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  creator: {
    id: string;
    name?: string;
    email: string;
  };
  _count: {
    participants: number;
    posts: number;
  };
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login first');
        return;
      }

      const response = await fetch('http://localhost:3000/api/event', {
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
        setError(result.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        
        <div className="text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8 relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#E94042] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Loading events...</p>
        </div>
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
        
        <div className="text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8 relative z-10 max-w-md">
          <Calendar className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg font-semibold mb-2">Error</p>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button 
            onClick={fetchEvents}
            className="w-full bg-[#E94042] hover:bg-[#E94042]/90 text-white"
          >
            Try Again
          </Button>
        </div>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#E94042] rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">All Events</h1>
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover and participate in exciting events from the community
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E94042]/50 focus:border-[#E94042]/50"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-300 hover:bg-white/10 border border-white/20"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 bg-white/10 px-3 py-2 rounded-lg border border-white/20">
                <span className="font-medium">{events.length}</span> events found
              </div>
              <Button
                onClick={() => window.location.href = '/event/create'}
                className="flex items-center gap-2 bg-[#E94042] hover:bg-[#E94042]/90 text-white px-4 py-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-12 max-w-md mx-auto">
              <Calendar className="w-20 h-20 text-gray-500 mx-auto mb-6" />
              <p className="text-gray-300 text-xl font-semibold mb-2">No events found</p>
              <p className="text-gray-400 mb-6">Be the first to create an exciting event!</p>
              <Button 
                onClick={() => window.location.href = '/event/create'}
                className="bg-[#E94042] hover:bg-[#E94042]/90 text-white px-6 py-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Event
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
                onClick={() => handleEventClick(event.id)}
              >
                {/* Event Image */}
                {event.thumbnail ? (
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {event.verified && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          Verified
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        event.isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-gradient-to-br from-[#E94042]/20 to-purple-500/20 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-white/40" />
                    {event.verified && (
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          Verified
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        event.isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white line-clamp-2 group-hover:text-[#E94042] transition-colors">
                    {event.title}
                  </CardTitle>
                  {event.description && (
                    <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4 text-[#E94042]" />
                      <span className="font-medium text-gray-300">Start:</span>
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4 text-[#E94042]" />
                      <span className="font-medium text-gray-300">End:</span>
                      <span>{formatDate(event.endDate)}</span>
                    </div>
                    {event.prize && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-gray-300">Prize:</span>
                        <span className="text-yellow-400 font-semibold">{event.prize}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="w-4 h-4 text-[#E94042]" />
                      <span className="font-medium text-gray-300">Creator:</span>
                      <span>{event.creator.name || event.creator.email}</span>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/20">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{event._count.participants}</div>
                          <div className="text-xs text-gray-400">Participants</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{event._count.posts}</div>
                          <div className="text-xs text-gray-400">Posts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}