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
    Clock,
    Home,
    Search,
    Filter,
    Compass
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
                    <p className="text-gray-300">Loading posts...</p>
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
                    <MessageCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400 text-lg font-semibold mb-2">Error</p>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <Button
                        onClick={fetchExplorePosts}
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
            {/* Header */}
            <div className="bg-white/5 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 shadow-xl">
                <div className="px-6 py-4">
                    {/* Top Row - Navigation & Actions */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => router.push('/')}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-gray-300 hover:bg-white/10 hover:text-white border border-white/20 hover:border-white/30 transition-all duration-300 px-3 py-2"
                            >
                                <Home className="w-4 h-4" />
                                <span className="font-medium">Home</span>
                            </Button>
                            
                            <div className="h-6 w-px bg-white/20"></div>
                            
                            <Button
                                onClick={() => router.push('/event')}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-gray-300 hover:bg-white/10 hover:text-white border border-white/20 hover:border-white/30 transition-all duration-300 px-3 py-2"
                            >
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">Events</span>
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 rounded-lg">
                                <Compass className="w-4 h-4 text-[#E94042]" />
                                <span className="font-medium">{posts.length}</span>
                                <span>posts found</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Title Section */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-[#E94042] to-red-600 rounded-full flex items-center justify-center shadow-lg">
                                <Compass className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                                    Explore Posts
                                </h1>
                            </div>
                        </div>
                        <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                            Discover amazing content and connect with the community
                        </p>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search posts, events, or users..."
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E94042]/50 focus:border-[#E94042]/50 transition-all duration-300"
                                />
                            </div>
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-gray-300 hover:bg-white/10 hover:text-white border border-white/20 hover:border-white/30 transition-all duration-300 px-4 py-3"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="font-medium hidden sm:block">Filter</span>
                            </Button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Live feed</span>
                            </div>
                            
                            <Button
                                onClick={() => fetchExplorePosts()}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-gray-300 hover:bg-[#E94042]/20 hover:text-[#E94042] border border-white/20 hover:border-[#E94042]/30 transition-all duration-300 px-3 py-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-medium">Refresh</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">


                {/* Posts Feed */}
                <div className="p-6 space-y-6">
                    {posts.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-12 text-center">
                            <MessageCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-300 text-lg font-semibold mb-2">No posts found</p>
                            <p className="text-gray-400 text-sm">Check back later for new content from the community!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-lg hover:bg-white/7 transition-all duration-300 overflow-hidden">
                                {/* Post Header */}
                                <div className="p-4 border-b border-white/20 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Event Info */}
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-8 h-8 rounded-full bg-[#E94042] flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                                    E
                                                </div>
                                                <span className="font-semibold text-white">r/{post.event.title}</span>
                                                {post.event.verified && (
                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                )}
                                            </div>

                                            <span className="text-gray-500">•</span>

                                            {/* Author Info */}
                                            <div className="flex items-center gap-2">
                                                {post.author.avatar ? (
                                                    <img
                                                        src={post.author.avatar}
                                                        alt={post.author.name || 'User'}
                                                        className="w-7 h-7 rounded-full border-2 border-white/20"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white/20">
                                                        {(post.author.name || post.author.email)[0].toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-sm text-gray-300 font-medium">
                                                    u/{post.author.name || post.author.email}
                                                </span>
                                            </div>

                                            <span className="text-gray-500">•</span>
                                            <span className="text-sm text-gray-400">{formatTimeAgo(post.createdAt)}</span>
                                        </div>

                                        {/* Event Status */}
                                        <div className="flex items-center gap-2">
                                            {post.event.isActive ? (
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium border border-green-500/30">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full font-medium border border-gray-500/30">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => handlePostClick(post.event.id)}
                                >
                                    <p className="text-gray-200 mb-4 leading-relaxed text-lg">{post.content}</p>

                                    {post.image && (
                                        <div className="mb-4">
                                            <img
                                                src={post.image}
                                                alt="Post image"
                                                className="max-w-full h-auto rounded-lg border border-white/20 shadow-lg"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Post Actions */}
                                <div className="px-6 py-4 border-t border-white/20 bg-white/5">
                                    <div className="flex items-center gap-6">
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
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${userUpvotes[post.id]
                                                        ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30'
                                                        : 'text-gray-300 hover:bg-white/10 border border-white/20'
                                                    }`}
                                            >
                                                {isUpvoting[post.id] ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-sm font-medium">{post._count.userUpvotes}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ArrowUp className={`w-5 h-5 ${userUpvotes[post.id] ? 'fill-current' : ''}`} />
                                                        <span className="text-sm font-semibold">{post._count.userUpvotes}</span>
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-white/5 rounded-full border border-white/20">
                                                <ArrowUp className="w-5 h-5" />
                                                <span className="text-sm font-semibold">{post._count.userUpvotes}</span>
                                            </div>
                                        )}

                                        {/* Comments */}
                                        <Button
                                            onClick={() => handlePostClick(post.event.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-300 hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-300"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="text-sm font-semibold">{post._count.comments}</span>
                                        </Button>

                                        {/* View Event */}
                                        <Button
                                            onClick={() => handlePostClick(post.event.id)}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-300 hover:bg-[#E94042]/20 hover:text-[#E94042] border border-white/20 hover:border-[#E94042]/30 transition-all duration-300 ml-auto"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span className="text-sm font-medium">View Event</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Comments Preview */}
                                {post.comments.length > 0 && (
                                    <div className="px-6 py-4 border-t border-white/20 bg-black/20">
                                        <div className="space-y-4">
                                            {post.comments.slice(0, 2).map((comment) => (
                                                <div key={comment.id} className="flex items-start gap-3">
                                                    {comment.author.avatar ? (
                                                        <img
                                                            src={comment.author.avatar}
                                                            alt={comment.author.name || 'User'}
                                                            className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white/20"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 border-2 border-white/20">
                                                            {(comment.author.name || comment.author.email)[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-sm font-semibold text-white">
                                                                u/{comment.author.name || comment.author.email}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {formatTimeAgo(comment.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {post.comments.length > 2 && (
                                                <Button
                                                    onClick={() => handlePostClick(post.event.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-[#E94042] hover:text-[#E94042]/80 text-sm p-0 h-auto font-medium"
                                                >
                                                    View all {post._count.comments} comments →
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