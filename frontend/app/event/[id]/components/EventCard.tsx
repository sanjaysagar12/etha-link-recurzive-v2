'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  MessageCircle, 
  Trophy, 
  Heart, 
  Star,
  User,
  Plus,
  Clock
} from 'lucide-react';

interface EventDetail {
  id: string;
  title: string;
  description?: string;
  prize?: string;
  thumbnail?: string;
  verified: boolean;
  likes: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  creator: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  _count: {
    participants: number;
    posts: number;
    userLikes: number;
  };
}

interface EventCardProps {
  event: EventDetail;
  userLikes: { [key: string]: boolean };
  isLiking: { [key: string]: boolean };
  currentUserId: string | null;
  isUserParticipant: (userId: string) => boolean;
  isEventHost: (userId: string) => boolean;
  handleLikeEvent: () => void;
  handleJoinEvent: () => void;
  isJoining: boolean;
  formatDate: (dateString: string) => string;
  formatShortDate: (dateString: string) => string;
}

// Simple Badge component
const SimpleBadge = ({ className = "", children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => {
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

export default function EventCard({ 
  event, 
  userLikes, 
  isLiking, 
  currentUserId, 
  isUserParticipant, 
  isEventHost, 
  handleLikeEvent, 
  handleJoinEvent, 
  isJoining, 
  formatDate, 
  formatShortDate 
}: EventCardProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300 overflow-hidden p-0">
      {/* Event Image */}
      {event.thumbnail && (
        <div className="relative h-64 sm:h-80">
          <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/400/250';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <SimpleBadge className="absolute top-4 right-4 bg-[#E94042] text-white">
            Event
          </SimpleBadge>
          {event.verified && (
            <SimpleBadge className="absolute top-4 left-4 bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Verified
            </SimpleBadge>
          )}
        </div>
      )}

      <CardContent className="p-6 space-y-6">
        {/* Event Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {event.creator.avatar ? (
              <img
                src={event.creator.avatar}
                alt={event.creator.name || 'Host'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-[#E94042] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {(event.creator.name || event.creator.email)[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span className="font-medium text-white">r/Events</span>
                {event.verified && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">Verified</span>
                    </div>
                  </>
                )}
                <span>•</span>
                <span>Posted by u/{event.creator.name || event.creator.email}</span>
                <span>•</span>
                <span>{formatShortDate(event.createdAt)}</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white flex items-center gap-3">
            {event.title}
            {event.verified && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-medium rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-current" />
                <span>Verified Event</span>
              </div>
            )}
          </h1>
          {event.description && (
            <p className="text-gray-300 leading-relaxed text-lg">{event.description}</p>
          )}
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Date</span>
            </div>
            <div className="text-sm font-semibold text-white">{formatDate(event.createdAt)}</div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Attendees</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {event._count.participants}
            </div>
          </Card>

          <Card className="p-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2 text-gray-400 mb-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Posts</span>
            </div>
            <div className="text-sm font-semibold text-white">{event._count.posts}</div>
          </Card>

          {event.prize && (
            <Card className="p-4 bg-[#E94042] text-white">
              <div className="flex items-center space-x-2 text-gray-200 mb-2">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Prize</span>
              </div>
              <div className="text-sm font-semibold">{event.prize}</div>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-600">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="space-x-2 text-gray-300 hover:bg-white/10">
              <MessageCircle className="w-4 h-4" />
              <span>{event._count.posts}</span>
            </Button>

            <Button 
              variant="ghost"
              size="sm"
              onClick={handleLikeEvent}
              disabled={isLiking[event.id]}
              className={`space-x-2 ${
                userLikes[event.id] 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${userLikes[event.id] ? 'fill-current' : ''}`} />
              <span>{event._count.userLikes}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            {currentUserId && (
              <>
                {isEventHost(currentUserId) ? (
                  <Button disabled className="bg-gray-500 text-white" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Event Host
                  </Button>
                ) : isUserParticipant(currentUserId) ? (
                  <Button disabled className="bg-green-500 text-white" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Joined
                  </Button>
                ) : !event.isActive ? (
                  <Button disabled className="bg-gray-500 text-white" size="sm">
                    Event Inactive
                  </Button>
                ) : new Date() > new Date(event.endDate) ? (
                  <Button disabled className="bg-gray-500 text-white" size="sm">
                    <Clock className="w-4 h-4 mr-2" />
                    Event Ended
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoinEvent}
                    disabled={isJoining}
                    className="bg-[#E94042] hover:bg-[#E94042]/90 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isJoining ? 'Joining...' : 'Join Event'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}