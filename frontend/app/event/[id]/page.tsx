'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadImage from "@/components/UploadImage";
import { 
  ArrowUp, 
  MessageCircle, 
  Heart, 
  Calendar, 
  Trophy, 
  Users, 
  FileText, 
  Star,
  Reply,
  Plus,
  X,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  Send,
  MoreHorizontal,
  Image as ImageIcon,
  MapPin,
  DollarSign
} from 'lucide-react';

// Simple Badge component
const Badge = ({ className = "", children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => {
  return (
    <span 
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

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
  content: string;
  image?: string;
  upvotes: number;
  createdAt: string;
  author: User;
  comments: Comment[];
  isUpvotedByUser?: boolean;
  _count: {
    comments: number;
    userUpvotes: number;
  };
}

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
  creator: User;
  winner?: User;
  participants: User[];
  posts: Post[];
  isLikedByUser?: boolean;
  _count: {
    participants: number;
    posts: number;
    userLikes: number;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Post creation form state
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);

  // Comment form state
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});
  const [isCreatingComment, setIsCreatingComment] = useState<{ [key: string]: boolean }>({});
  const [showCommentForm, setShowCommentForm] = useState<{ [key: string]: boolean }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});

  // Like and upvote state
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({});
  const [userUpvotes, setUserUpvotes] = useState<{ [key: string]: boolean }>({});
  const [isLiking, setIsLiking] = useState<{ [key: string]: boolean }>({});
  const [isUpvoting, setIsUpvoting] = useState<{ [key: string]: boolean }>({});

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentVotes, setCommentVotes] = useState<{ [key: string]: 'up' | 'down' | null }>({});

  const fetchEventDetail = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
      };

      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3000/api/event/${params.id}`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (response.ok) {
        setEvent(result.data);
        
        // Initialize user interaction state from backend data (only if user is logged in)
        if (token && result.data.isLikedByUser !== undefined) {
          setUserLikes({ [result.data.id]: result.data.isLikedByUser });
        }
        
        // Initialize upvote state for all posts (only if user is logged in)
        if (token) {
          const upvoteState: { [key: string]: boolean } = {};
          result.data.posts.forEach((post: Post) => {
            if (post.isUpvotedByUser !== undefined) {
              upvoteState[post.id] = post.isUpvotedByUser;
            }
          });
          setUserUpvotes(upvoteState);
        }
        
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

  const handleJoinEvent = async () => {
    if (!event) return;
    
    setIsJoining(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/event/${params.id}/join`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert('Successfully joined the event!');
        // Refresh event details to show updated participant count
        fetchEventDetail();
      } else {
        alert(`Error: ${result.message || 'Failed to join event'}`);
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Failed to join event');
    } finally {
      setIsJoining(false);
    }
  };

  const isUserParticipant = (userId: string) => {
    if (!event) return false;
    return event.participants.some(participant => participant.id === userId);
  };

  const isEventHost = (userId: string) => {
    if (!event) return false;
    return event.creator.id === userId;
  };

  // Get current user ID from token (simplified approach)
  const getCurrentUserId = () => {
    // Check if we're in the browser environment
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

  const handleCreatePost = async () => {
    if (!event || !postContent.trim()) {
      alert('Please enter post content');
      return;
    }
    
    setIsCreatingPost(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/event/${params.id}/post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postContent,
          image: postImage || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Post created successfully!');
        // Reset form
        setPostContent('');
        setPostImage('');
        setShowPostForm(false);
        // Refresh event details to show new post
        fetchEventDetail();
      } else {
        alert(`Error: ${result.message || 'Failed to create post'}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setPostImage(imageUrl);
  };

  const handleCancelPost = () => {
    setPostContent('');
    setPostImage('');
    setShowPostForm(false);
  };

  const handleCreateComment = async (postId: string) => {
    const content = commentContent[postId];
    if (!content || !content.trim()) {
      alert('Please enter comment content');
      return;
    }
    
    setIsCreatingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/event/post/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Comment created successfully!');
        // Reset form
        setCommentContent(prev => ({ ...prev, [postId]: '' }));
        setShowCommentForm(prev => ({ ...prev, [postId]: false }));
        // Refresh event details to show new comment
        fetchEventDetail();
      } else {
        alert(`Error: ${result.message || 'Failed to create comment'}`);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment');
    } finally {
      setIsCreatingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreateReply = async (commentId: string) => {
    const content = commentContent[commentId];
    if (!content || !content.trim()) {
      alert('Please enter reply content');
      return;
    }
    
    setIsCreatingComment(prev => ({ ...prev, [commentId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/event/comment/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Reply created successfully!');
        // Reset form
        setCommentContent(prev => ({ ...prev, [commentId]: '' }));
        setShowReplyForm(prev => ({ ...prev, [commentId]: false }));
        // Refresh event details to show new reply
        fetchEventDetail();
      } else {
        alert(`Error: ${result.message || 'Failed to create reply'}`);
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      alert('Failed to create reply');
    } finally {
      setIsCreatingComment(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const handleCancelComment = (id: string, type: 'comment' | 'reply') => {
    setCommentContent(prev => ({ ...prev, [id]: '' }));
    if (type === 'comment') {
      setShowCommentForm(prev => ({ ...prev, [id]: false }));
    } else {
      setShowReplyForm(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleLikeEvent = async () => {
    if (!event || !currentUserId) return;
    
    const eventId = event.id;
    const isCurrentlyLiked = userLikes[eventId];
    
    setIsLiking(prev => ({ ...prev, [eventId]: true }));
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const endpoint = isCurrentlyLiked ? 'unlike' : 'like';
      const response = await fetch(`http://localhost:3000/api/event/${eventId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        // Update local state
        setUserLikes(prev => ({ ...prev, [eventId]: !isCurrentlyLiked }));
        // Refresh event details to show updated like count
        fetchEventDetail();
      } else {
        alert(`Error: ${result.message || 'Failed to update like'}`);
      }
    } catch (error) {
      console.error('Error updating event like:', error);
      alert('Failed to update like');
    } finally {
      setIsLiking(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleUpvotePost = async (postId: string) => {
    if (!currentUserId) return;
    
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
        // Refresh event details to show updated upvote count
        fetchEventDetail();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatShortDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    }
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    setCommentVotes(prev => ({
      ...prev,
      [commentId]: prev[commentId] === voteType ? null : voteType
    }));
  };

  const renderComment = (comment: Comment, level = 0) => {
    const maxLevel = 3;
    const canParticipate = currentUserId && (isUserParticipant(currentUserId) || isEventHost(currentUserId)) && event?.isActive;
    
    return (
      <div key={comment.id} className="mb-4">
        <div className="flex space-x-3">
          <div className="flex flex-col items-center space-y-1">
            <Button
              variant={commentVotes[comment.id] === 'up' ? "default" : "ghost"}
              size="sm"
              onClick={() => handleVote(comment.id, 'up')}
              className={commentVotes[comment.id] === 'up' ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-gray-300 hover:bg-white/10"}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-gray-300">0</span>
            <Button
              variant={commentVotes[comment.id] === 'down' ? "default" : "ghost"}
              size="sm"
              onClick={() => handleVote(comment.id, 'down')}
              className={commentVotes[comment.id] === 'down' ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-gray-300 hover:bg-white/10"}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-white">u/{comment.author.name || comment.author.email}</span>
              <span className="text-xs text-gray-400">{formatShortDate(comment.createdAt)}</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed">{comment.content}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowReplyForm(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                className="text-gray-300 hover:bg-white/10"
              >
                Reply
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-white/10">Share</Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-white/10">Report</Button>
            </div>

            {/* Reply Form */}
            {showReplyForm[comment.id] && canParticipate && level < maxLevel && (
              <div className="mt-4 ml-6 border-l-2 border-gray-600 pl-4">
                <div className="flex space-x-2">
                  <textarea
                    value={commentContent[comment.id] || ''}
                    onChange={(e) => setCommentContent(prev => ({ ...prev, [comment.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    rows={2}
                    className="flex-1 p-2 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-400 rounded-lg resize-none focus:outline-none focus:ring-0 focus:border-gray-600"
                  />
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => handleCreateReply(comment.id)}
                      disabled={!commentContent[comment.id]?.trim() || isCreatingComment[comment.id]}
                      size="sm"
                      className="bg-[#E94042] hover:bg-[#E94042]/90"
                    >
                      {isCreatingComment[comment.id] ? 'Posting...' : 'Reply'}
                    </Button>
                    <Button
                      onClick={() => handleCancelComment(comment.id, 'reply')}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-white/10"
                      disabled={isCreatingComment[comment.id]}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && level < maxLevel && (
              <div className="mt-4 ml-6 border-l-2 border-gray-600 pl-4 space-y-4">
                {comment.replies.map((reply) => renderComment(reply, level + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
        
        <Card className="w-96 text-center bg-white/5 backdrop-blur-md border border-white/20 shadow-xl relative z-10">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E94042] border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-300">Loading event...</p>
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
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/explore'}
              className="inline-flex items-center space-x-2 border-gray-600 text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
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
            <h1 className="text-2xl font-semibold mb-4 text-white">Event not found</h1>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/explore'}
              className="inline-flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Button>
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
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/explore'}
              className="inline-flex items-center space-x-2 text-white hover:bg-white hover:text-black"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Events</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={isBookmarked ? "bg-[#E94042] hover:bg-[#E94042]/90" : "border-gray-600 text-gray-300 hover:bg-white/10"}
              >
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-white/10">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-white/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Card */}
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
                  <Badge className="absolute top-4 right-4 bg-[#E94042] text-white">
                    Event
                  </Badge>
                  {event.verified && (
                    <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Verified
                    </Badge>
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
                        <span>•</span>
                        <span>Posted by u/{event.creator.name || event.creator.email}</span>
                        <span>•</span>
                        <span>{formatShortDate(event.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold leading-tight text-white">{event.title}</h1>
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

            {/* Create Post Form */}
            {showPostForm && (
              <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-[#E94042] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">U</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Share your progress, ideas, or questions..."
                        rows={4}
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-400 rounded-lg resize-none focus:outline-none focus:ring-0 focus:border-gray-600"
                      />
                      
                      <div className="space-y-2">
                        <Label className="text-white">Image (Optional)</Label>
                        <UploadImage 
                          onImageUploaded={handleImageUploaded}
                          currentImage={postImage}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="space-x-2 text-gray-300 hover:text-black hover:bg-white"
                            disabled={isCreatingPost}
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>Add Image</span>
                          </Button>
                          {isCreatingPost && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCreatePost}
                            disabled={isCreatingPost || !postContent.trim()}
                            className="space-x-2 bg-[#E94042] hover:bg-[#E94042]/90 text-white"
                          >
                            <Send className="w-4 h-4" />
                            <span>{isCreatingPost ? 'Posting...' : 'Post'}</span>
                          </Button>
                          <Button
                            onClick={handleCancelPost}
                            variant="outline"
                            disabled={isCreatingPost}
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Posts & Discussions ({event._count.posts})</h3>
                {/* Create Post Button - Only for participants */}
                {currentUserId && isUserParticipant(currentUserId) && event.isActive && (
                  <Button 
                    onClick={() => setShowPostForm(true)}
                    className="bg-[#E94042] hover:bg-[#E94042]/90 text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                )}
              </div>
              
              {event.posts.length === 0 ? (
                <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No posts yet</p>
                  <p className="text-gray-400 text-sm">Be the first to start a discussion!</p>
                </Card>
              ) : (
                event.posts.map((post) => (
                  <Card key={post.id} className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex space-x-3">
                        <div className="flex flex-col items-center space-y-1">
                          <Button
                            variant={userUpvotes[post.id] ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleUpvotePost(post.id)}
                            disabled={!currentUserId || isUpvoting[post.id]}
                            className={userUpvotes[post.id] ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-gray-300 hover:bg-white/10"}
                          >
                            {isUpvoting[post.id] ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <ArrowUp className={`w-4 h-4 ${userUpvotes[post.id] ? 'fill-current' : ''}`} />
                            )}
                          </Button>
                          <span className="text-xs font-medium text-gray-300">{post._count.userUpvotes}</span>
                          <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-white/10">
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-white">u/{post.author.name || post.author.email}</span>
                            <span className="text-xs text-gray-400">{formatShortDate(post.createdAt)}</span>
                          </div>
                          
                          <p className="text-gray-300 leading-relaxed">{post.content}</p>
                          
                          {/* Post Image */}
                          {post.image && (
                            <div className="mt-3">
                              <img 
                                src={post.image} 
                                alt="Post attachment" 
                                className="max-w-md h-auto rounded-lg border border-gray-600"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowCommentForm(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                              className="text-gray-300 hover:bg-white/10"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post._count.comments} Comments
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-white/10">Share</Button>
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-white/10">Save</Button>
                          </div>

                          {/* Comments */}
                          {post.comments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-600 space-y-4">
                              {post.comments.map((comment) => renderComment(comment))}
                            </div>
                          )}

                          {/* Comment Form */}
                          {showCommentForm[post.id] && currentUserId && (
                            <div className="mt-4 ml-6 border-l-2 border-gray-600 pl-4">
                              <div className="flex space-x-2">
                                <textarea
                                  value={commentContent[post.id] || ''}
                                  onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  placeholder="Write a comment..."
                                  rows={2}
                                  className="flex-1 p-2 bg-gray-800/50 border border-gray-600 text-white placeholder:text-gray-400 rounded-lg resize-none focus:outline-none focus:ring-0 focus:border-gray-600"
                                />
                                <div className="flex flex-col space-y-2">
                                  <Button
                                    onClick={() => handleCreateComment(post.id)}
                                    disabled={!commentContent[post.id]?.trim() || isCreatingComment[post.id]}
                                    size="sm"
                                    className="bg-[#E94042] hover:bg-[#E94042]/90"
                                  >
                                    {isCreatingComment[post.id] ? 'Posting...' : 'Comment'}
                                  </Button>
                                  <Button
                                    onClick={() => handleCancelComment(post.id, 'comment')}
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-600 text-gray-300 hover:bg-white/10"
                                    disabled={isCreatingComment[post.id]}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentUserId && (
                  <>
                    {isEventHost(currentUserId) ? (
                      <Button disabled className="w-full bg-gray-500 text-white" size="lg">
                        <User className="w-4 h-4 mr-2" />
                        Event Host
                      </Button>
                    ) : isUserParticipant(currentUserId) ? (
                      <Button disabled className="w-full bg-green-500 text-white" size="lg">
                        <Users className="w-4 h-4 mr-2" />
                        Already Joined
                      </Button>
                    ) : !event.isActive ? (
                      <Button disabled className="w-full bg-gray-500 text-white" size="lg">
                        Event Inactive
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleJoinEvent} 
                        disabled={isJoining}
                        className="w-full bg-[#E94042] hover:bg-[#E94042]/90 text-white"
                        size="lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {isJoining ? 'Joining...' : 'Join Event'}
                      </Button>
                    )}
                  </>
                )}
                
                <div className="text-xs text-gray-400 text-center">
                  Join to participate in discussions and win prizes
                </div>
              </CardContent>
            </Card>

            {/* Event Information */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Created</span>
                  <span className="font-medium text-sm text-white">{formatShortDate(event.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Participants</span>
                  <span className="font-medium text-sm text-white">{event._count.participants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Posts</span>
                  <span className="font-medium text-sm text-white">{event._count.posts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Likes</span>
                  <span className="font-medium text-sm text-white">{event._count.userLikes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Status</span>
                  <Badge className={event.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {event.prize && (
                  <>
                    <div className="border-t border-gray-600 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Prize</span>
                        <span className="font-semibold text-white">{event.prize}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Event Host */}
            <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Event Host</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  {event.creator.avatar ? (
                    <img
                      src={event.creator.avatar}
                      alt={event.creator.name || 'Host'}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#E94042] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {(event.creator.name || event.creator.email)[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="text-sm font-medium text-white">u/{event.creator.name || event.creator.email}</span>
                    <div className="text-xs text-gray-400">
                      Event Creator
                    </div>
                  </div>
                </div>
                {event.verified && (
                  <div className="flex items-center space-x-2 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">Verified Event</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Participants */}
            {event.participants.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/7 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Recent Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.participants.slice(0, 5).map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      {participant.avatar ? (
                        <img
                          src={participant.avatar}
                          alt={participant.name || 'Participant'}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-[#E94042] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {(participant.name || participant.email)[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="text-sm font-medium text-white">u/{participant.name || participant.email}</span>
                      </div>
                    </div>
                  ))}
                  {event.participants.length > 5 && (
                    <div className="text-xs text-gray-400 pt-2 border-t border-gray-600">
                      +{event.participants.length - 5} more participants
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Winner Card */}
            {event.winner && (
              <Card className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-md border border-yellow-500/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Winner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    {event.winner.avatar ? (
                      <img
                        src={event.winner.avatar}
                        alt={event.winner.name || 'Winner'}
                        className="w-12 h-12 rounded-full border-2 border-yellow-500"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(event.winner.name || event.winner.email)[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">u/{event.winner.name || event.winner.email}</div>
                      <div className="text-yellow-400 text-sm">🎉 Event Winner!</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Button
          onClick={() => currentUserId && isUserParticipant(currentUserId) && event.isActive && setShowPostForm(true)}
          className="h-14 w-14 rounded-full bg-[#E94042] hover:bg-[#E94042]/90 shadow-lg"
          size="lg"
          disabled={!currentUserId || !isUserParticipant(currentUserId) || !event.isActive}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}