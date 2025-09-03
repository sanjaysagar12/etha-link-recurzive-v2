'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  replies?: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: User;
  comments: Comment[];
  _count: {
    comments: number;
  };
}

interface EventDetail {
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
  creator: User;
  winner?: User;
  participants: User[];
  posts: Post[];
  _count: {
    participants: number;
    posts: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventDetail = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Please login first');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/event/${params.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setEvent(result.data);
      } else {
        setError(result.message || 'Failed to fetch event details');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError('Failed to fetch event details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchEventDetail();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: Comment, level = 0) => {
    const maxLevel = 3;
    const indentClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : '';
    
    return (
      <div key={comment.id} className={`${indentClass} mb-4`}>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name || 'User'}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                {(comment.author.name || comment.author.email)[0].toUpperCase()}
              </div>
            )}
            <span className="font-medium text-sm">
              {comment.author.name || comment.author.email}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
        </div>
        
        {comment.replies && comment.replies.length > 0 && level < maxLevel && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && level >= maxLevel && (
          <div className="mt-2 ml-4">
            <Button variant="outline" size="sm" className="text-xs">
              View {comment.replies.length} more replies
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <Button onClick={fetchEventDetail} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Event not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Event Header */}
        <Card className="mb-8">
          {event.thumbnail && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={event.thumbnail}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold mb-2">
                  {event.title}
                  {event.verified && (
                    <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </CardTitle>
                {event.description && (
                  <p className="text-gray-600 mt-2">{event.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                event.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <span className="font-medium text-gray-700">Start Date:</span>
                <p className="text-sm">{formatDate(event.startDate)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">End Date:</span>
                <p className="text-sm">{formatDate(event.endDate)}</p>
              </div>
              {event.prize && (
                <div>
                  <span className="font-medium text-gray-700">Prize:</span>
                  <p className="text-sm">{event.prize}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-sm">{formatDate(event.createdAt)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creator:</span> {event.creator.name || event.creator.email}
              </div>
              {event.winner && (
                <div>
                  <span className="font-medium">Winner:</span> {event.winner.name || event.winner.email}
                </div>
              )}
              <div>
                <span className="font-medium">Participants:</span> {event._count.participants}
              </div>
              <div>
                <span className="font-medium">Posts:</span> {event._count.posts}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts and Comments */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Posts & Discussions</h2>
          
          {event.posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No posts yet. Be the first to start a discussion!</p>
              </CardContent>
            </Card>
          ) : (
            event.posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.name || 'User'}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                            {(post.author.name || post.author.email)[0].toUpperCase()}
                          </div>
                        )}
                        <span>{post.author.name || post.author.email}</span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <span>{post._count.comments} comments</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-6">{post.content}</p>
                  
                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>
                      <div className="space-y-4">
                        {post.comments.map((comment) => renderComment(comment))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}