'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus } from 'lucide-react';

// Import components
import EventHeader from './components/EventHeader';
import EventCard from './components/EventCard';
import PostForm from './components/PostForm';
import PostsList from './components/PostsList';
import EventSidebar from './components/EventSidebar';

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

  const canParticipate = currentUserId && (isUserParticipant(currentUserId) || isEventHost(currentUserId)) && event?.isActive;

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
      <EventHeader 
        isBookmarked={isBookmarked}
        setIsBookmarked={setIsBookmarked}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Card */}
            <EventCard
              event={event}
              userLikes={userLikes}
              isLiking={isLiking}
              currentUserId={currentUserId}
              isUserParticipant={isUserParticipant}
              isEventHost={isEventHost}
              handleLikeEvent={handleLikeEvent}
              handleJoinEvent={handleJoinEvent}
              isJoining={isJoining}
              formatDate={formatDate}
              formatShortDate={formatShortDate}
            />

            {/* Create Post Form */}
            {showPostForm && (
              <PostForm
                postContent={postContent}
                setPostContent={setPostContent}
                postImage={postImage}
                handleImageUploaded={handleImageUploaded}
                handleCreatePost={handleCreatePost}
                handleCancelPost={handleCancelPost}
                isCreatingPost={isCreatingPost}
              />
            )}

            {/* Posts List */}
            <PostsList
              posts={event.posts}
              currentUserId={currentUserId}
              isUserParticipant={isUserParticipant}
              isActive={event.isActive}
              setShowPostForm={setShowPostForm}
              userUpvotes={userUpvotes}
              isUpvoting={isUpvoting}
              handleUpvotePost={handleUpvotePost}
              formatShortDate={formatShortDate}
              showCommentForm={showCommentForm}
              setShowCommentForm={setShowCommentForm}
              commentContent={commentContent}
              setCommentContent={setCommentContent}
              handleCreateComment={handleCreateComment}
              handleCancelComment={handleCancelComment}
              isCreatingComment={isCreatingComment}
              commentVotes={commentVotes}
              handleVote={handleVote}
              showReplyForm={showReplyForm}
              setShowReplyForm={setShowReplyForm}
              handleCreateReply={handleCreateReply}
              canParticipate={canParticipate}
            />
          </div>

          {/* Sidebar */}
          <EventSidebar
            event={event}
            currentUserId={currentUserId}
            isEventHost={isEventHost}
            isUserParticipant={isUserParticipant}
            handleJoinEvent={handleJoinEvent}
            isJoining={isJoining}
            formatShortDate={formatShortDate}
          />
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