'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import UploadImage from "@/components/UploadImage";

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
              <div>
                <span className="font-medium">Likes:</span> {event._count.userLikes}
              </div>
            </div>

            {/* Join Event Button */}
            {currentUserId && (
              <div className="mt-6 pt-4 border-t">
                {isEventHost(currentUserId) ? (
                  <Button disabled className="bg-gray-100 text-gray-500">
                    You are the host
                  </Button>
                ) : isUserParticipant(currentUserId) ? (
                  <Button disabled className="bg-green-100 text-green-700">
                    Already Joined
                  </Button>
                ) : !event.isActive ? (
                  <Button disabled className="bg-gray-100 text-gray-500">
                    Event Inactive
                  </Button>
                ) : new Date() > new Date(event.endDate) ? (
                  <Button disabled className="bg-gray-100 text-gray-500">
                    Event Ended
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoinEvent}
                    disabled={isJoining}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isJoining ? 'Joining...' : 'Join Event'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts and Comments */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Posts & Discussions</h2>
            {/* Create Post Button - Only for participants */}
            {currentUserId && isUserParticipant(currentUserId) && event.isActive && (
              <Button 
                onClick={() => setShowPostForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Post
              </Button>
            )}
          </div>

          {/* Create Post Form */}
          {showPostForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="postContent">Content *</Label>
                    <Textarea
                      id="postContent"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your progress, ideas, or questions..."
                      rows={4}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image (Optional)</Label>
                    <UploadImage 
                      onImageUploaded={handleImageUploaded}
                      currentImage={postImage}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreatePost}
                      disabled={isCreatingPost || !postContent.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isCreatingPost ? 'Creating Post...' : 'Create Post'}
                    </Button>
                    <Button
                      onClick={handleCancelPost}
                      variant="outline"
                      disabled={isCreatingPost}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
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
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {post.author.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name || 'User'}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                          {(post.author.name || post.author.email)[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">{post.author.name || post.author.email}</span>
                        <div className="text-xs text-gray-400">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👍 {post._count.userUpvotes}</span>
                      <span>💬 {post._count.comments}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  
                  {post.image && (
                    <div className="mb-4">
                      <img
                        src={post.image}
                        alt="Post image"
                        className="max-w-full h-auto rounded-lg shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
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