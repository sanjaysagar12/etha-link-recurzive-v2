'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  ArrowUp, 
  MessageCircle, 
  Calendar, 
  User,
  Star,
  ExternalLink,
  Clock
} from 'lucide-react';

interface User {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

interface Event {
  id: string;
  title: string;
  thumbnail?: string;
  verified: boolean;
  isActive: boolean;
  creator: User;
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
  content: string;
  image?: string;
  upvotes: number;
  createdAt: string;
  author: User;
  event: Event;
  comments: Comment[];
  isUpvotedByUser?: boolean;
  _count: {
    comments: number;
    userUpvotes: number;
  };
}

export default function ExplorePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User interaction state
  const [userUpvotes, setUserUpvotes] = useState<{ [key: string]: boolean }>({});
  const [isUpvoting, setIsUpvoting] = useState<{ [key: string]: boolean }>({});

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

  const currentUserId = getCurrentUserId();

  const fetchExplorePosts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:3000/api/event/explore', {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (response.ok) {
        setPosts(result.data);
        
        // Initialize upvote state for all posts (only if user is logged in)
        if (token && result.data) {
          const upvoteState: { [key: string]: boolean } = {};
          result.data.forEach((post: Post) => {
            if (post.isUpvotedByUser !== undefined) {
              upvoteState[post.id] = post.isUpvotedByUser;
            }
          });
          setUserUpvotes(upvoteState);
        }
      } else {
        setError(result.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching explore posts:', error);
      setError('Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplorePosts();
  }, []);

  const handleUpvotePost = async (postId: string) => {
    if (!currentUserId) {
      alert('Please login to upvote posts');
      return;
    }
    
    const isCurrentlyUpvoted = userUpvotes[postId];
    
    setIsUpvoting(prev => ({ ...prev, [postId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const endpoint = isCurrentlyUpvoted ? 'remove-upvote' : 'upvote';
      const response = await fetch(`http://localhost:3000/api/event/post/${postId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Update local state
        setUserUpvotes(prev => ({ ...prev, [postId]: !isCurrentlyUpvoted }));
        // Update post count in the posts array
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                _count: { 
                  ...post._count, 
                  userUpvotes: isCurrentlyUpvoted 
                    ? post._count.userUpvotes - 1 
                    : post._count.userUpvotes + 1 
                }
              }
            : post
        ));
      } else {
        alert(`Error: ${result.message || 'Failed to update upvote'}`);
      }
    } catch (error) {
      console.error('Error updating post upvote:', error);
      alert('Failed to update upvote');
    } finally {
      setIsUpvoting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handlePostClick = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <Button onClick={fetchExplorePosts} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Explore Posts</h1>
              <div className="text-sm text-gray-500">
                {posts.length} posts found
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="p-4 space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No posts found</p>
              <p className="text-gray-400 text-sm">Check back later for new content!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                {/* Post Header */}
                <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Event Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          E
                        </div>
                        <span className="font-medium text-blue-600">r/{post.event.title}</span>
                        {post.event.verified && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      
                      <span className="text-gray-400">•</span>
                      
                      {/* Author Info */}
                      <div className="flex items-center gap-2">
                        {post.author.avatar ? (
                          <img
                            src={post.author.avatar}
                            alt={post.author.name || 'User'}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                            {(post.author.name || post.author.email)[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-gray-600">
                          u/{post.author.name || post.author.email}
                        </span>
                      </div>
                      
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    
                    {/* Event Status */}
                    <div className="flex items-center gap-2">
                      {post.event.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => handlePostClick(post.event.id)}
                >
                  <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>
                  
                  {post.image && (
                    <div className="mb-4">
                      <img
                        src={post.image}
                        alt="Post image"
                        className="max-w-full h-auto rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex items-center gap-4">
                    {/* Upvote Button */}
                    {currentUserId ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvotePost(post.id);
                        }}
                        disabled={isUpvoting[post.id]}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
                          userUpvotes[post.id] 
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {isUpvoting[post.id] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            <span className="text-sm font-medium">{post._count.userUpvotes}</span>
                          </>
                        ) : (
                          <>
                            <ArrowUp className={`w-4 h-4 ${userUpvotes[post.id] ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{post._count.userUpvotes}</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 text-gray-500">
                        <ArrowUp className="w-4 h-4" />
                        <span className="text-sm">{post._count.userUpvotes}</span>
                      </div>
                    )}
                    
                    {/* Comments */}
                    <Button
                      onClick={() => handlePostClick(post.event.id)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post._count.comments}</span>
                    </Button>
                    
                    {/* View Event */}
                    <Button
                      onClick={() => handlePostClick(post.event.id)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100 ml-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">View Event</span>
                    </Button>
                  </div>
                </div>

                {/* Comments Preview */}
                {post.comments.length > 0 && (
                  <div className="px-4 py-3 border-t">
                    <div className="space-y-3">
                      {post.comments.slice(0, 2).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          {comment.author.avatar ? (
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.name || 'User'}
                              className="w-6 h-6 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {(comment.author.name || comment.author.email)[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.author.name || comment.author.email}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <Button
                          onClick={() => handlePostClick(post.event.id)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 text-sm p-0 h-auto"
                        >
                          View all {post._count.comments} comments
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}