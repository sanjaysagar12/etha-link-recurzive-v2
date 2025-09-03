'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User,
  Calendar,
  Trophy,
  Users,
  FileText,
  MessageCircle,
  ArrowUp,
  Heart,
  Star,
  ExternalLink,
  Settings,
  LogOut,
  Home
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface EventSummary {
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
  creator?: UserProfile;
  _count: {
    participants: number;
    posts: number;
    userLikes: number;
  };
}

interface PostSummary {
  id: string;
  content: string;
  image?: string;
  upvotes: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    thumbnail?: string;
    verified: boolean;
    isActive: boolean;
  };
  _count: {
    comments: number;
    userUpvotes: number;
  };
}

interface CommentSummary {
  id: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    content: string;
    event: {
      id: string;
      title: string;
      isActive: boolean;
    };
    author: {
      id: string;
      name: string;
      email: string;
    };
  };
  parent?: {
    id: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface UpvoteSummary {
  id: string;
  createdAt: string;
  post: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
    event: {
      id: string;
      title: string;
      isActive: boolean;
    };
  };
}

interface EventLikeSummary {
  id: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    thumbnail?: string;
    verified: boolean;
    isActive: boolean;
    creator: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface UserStats {
  totalEventsHosted: number;
  totalEventsJoined: number;
  totalEventsWon: number;
  totalPosts: number;
  totalComments: number;
  totalUpvotesGiven: number;
  totalEventLikes: number;
  totalUpvotesReceived: number;
}

interface FullUserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  createdEvents: EventSummary[];
  joinedEvents: EventSummary[];
  wonEvents: EventSummary[];
  posts: PostSummary[];
  comments: CommentSummary[];
  upvotes: UpvoteSummary[];
  eventLikes: EventLikeSummary[];
  stats: UserStats;
}

interface ProfileResponse {
  status: string;
  data: FullUserData;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<FullUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No token found. Please login.');
        return;
      }

      const response = await fetch('http://localhost:3000/api/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setError(`Failed to fetch profile. Status: ${response.status}`);
        return;
      }

      const data: ProfileResponse = await response.json();
      setUserData(data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={fetchProfile} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                    {userData.name?.[0]?.toUpperCase() || userData.email[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{userData.name || userData.email}</h1>
                  <p className="text-gray-600">{userData.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      userData.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {userData.role}
                    </span>
                    <span className="text-sm text-gray-500">
                      Joined {formatDate(userData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{userData.stats.totalEventsHosted}</p>
                  <p className="text-sm text-gray-600">Events Hosted</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{userData.stats.totalEventsJoined}</p>
                  <p className="text-sm text-gray-600">Events Joined</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{userData.stats.totalPosts}</p>
                  <p className="text-sm text-gray-600">Posts Created</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ArrowUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{userData.stats.totalUpvotesReceived}</p>
                  <p className="text-sm text-gray-600">Upvotes Received</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'hosted', label: 'Hosted Events', icon: Trophy },
                  { id: 'joined', label: 'Joined Events', icon: Users },
                  { id: 'posts', label: 'Posts', icon: FileText },
                  { id: 'activity', label: 'Activity', icon: MessageCircle },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="text-gray-600">{userData.name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Email:</span>
                          <span className="text-gray-600">{userData.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Role:</span>
                          <span className="text-gray-600 capitalize">{userData.role.toLowerCase()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Status:</span>
                          <span className={`font-medium ${userData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {userData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Activity Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Comments Made:</span>
                          <span className="text-gray-600">{userData.stats.totalComments}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Upvotes Given:</span>
                          <span className="text-gray-600">{userData.stats.totalUpvotesGiven}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Events Liked:</span>
                          <span className="text-gray-600">{userData.stats.totalEventLikes}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Events Won:</span>
                          <span className="text-gray-600">{userData.stats.totalEventsWon}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hosted Events Tab */}
              {activeTab === 'hosted' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Events You've Created</h3>
                  {userData.createdEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't hosted any events yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {userData.createdEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                          onClick={() => handleEventClick(event.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                {event.verified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  event.isActive 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {event.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{event._count.participants} participants</span>
                                <span>{event._count.posts} posts</span>
                                <span>{event._count.userLikes} likes</span>
                                <span>{formatDate(event.createdAt)}</span>
                              </div>
                            </div>
                            {event.thumbnail && (
                              <img 
                                src={event.thumbnail} 
                                alt={event.title}
                                className="w-16 h-16 rounded-lg object-cover ml-4"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Joined Events Tab */}
              {activeTab === 'joined' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Events You've Joined</h3>
                  {userData.joinedEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't joined any events yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {userData.joinedEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                          onClick={() => handleEventClick(event.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                {event.verified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  event.isActive 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {event.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>By {event.creator?.name || event.creator?.email}</span>
                                <span>{event._count.participants} participants</span>
                                <span>{event._count.posts} posts</span>
                                <span>{formatDate(event.createdAt)}</span>
                              </div>
                            </div>
                            {event.thumbnail && (
                              <img 
                                src={event.thumbnail} 
                                alt={event.title}
                                className="w-16 h-16 rounded-lg object-cover ml-4"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Your Posts</h3>
                  {userData.posts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">You haven't created any posts yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userData.posts.map((post) => (
                        <div 
                          key={post.id} 
                          className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                          onClick={() => handleEventClick(post.event.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 text-sm text-gray-500">
                              <ArrowUp className="w-4 h-4 text-orange-500" />
                              <span>{post._count.userUpvotes}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-blue-600 font-medium">r/{post.event.title}</span>
                                {post.event.verified && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                <span className="text-sm text-gray-500">• {formatTimeAgo(post.createdAt)}</span>
                              </div>
                              <p className="text-gray-800 mb-2 line-clamp-3">{post.content}</p>
                              {post.image && (
                                <img 
                                  src={post.image} 
                                  alt="Post image"
                                  className="w-32 h-20 rounded object-cover mb-2"
                                />
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {post._count.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ExternalLink className="w-4 h-4" />
                                  View in Event
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {/* Recent Comments */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Comments</h3>
                    {userData.comments.length === 0 ? (
                      <div className="text-center py-4">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No recent comments</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userData.comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className="border rounded-lg p-3 hover:shadow-sm cursor-pointer transition-shadow"
                            onClick={() => handleEventClick(comment.post.event.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-blue-600 font-medium">r/{comment.post.event.title}</span>
                                {comment.parent ? (
                                  <span className="text-gray-500">• replied to {comment.parent.author.name || comment.parent.author.email}</span>
                                ) : (
                                  <span className="text-gray-500">• commented on post</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 text-sm mb-2 line-clamp-2">{comment.content}</p>
                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded line-clamp-1">
                              Original post: {comment.post.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Upvotes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Upvotes</h3>
                    {userData.upvotes.length === 0 ? (
                      <div className="text-center py-4">
                        <ArrowUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No recent upvotes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userData.upvotes.map((upvote) => (
                          <div 
                            key={upvote.id} 
                            className="border rounded-lg p-3 hover:shadow-sm cursor-pointer transition-shadow"
                            onClick={() => handleEventClick(upvote.post.event.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm">
                                <ArrowUp className="w-4 h-4 text-orange-500" />
                                <span className="text-blue-600 font-medium">r/{upvote.post.event.title}</span>
                                <span className="text-gray-500">• upvoted post by {upvote.post.author.name || upvote.post.author.email}</span>
                              </div>
                              <span className="text-xs text-gray-500">{formatTimeAgo(upvote.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 text-sm line-clamp-2">{upvote.post.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Event Likes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Event Likes</h3>
                    {userData.eventLikes.length === 0 ? (
                      <div className="text-center py-4">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No recent event likes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userData.eventLikes.map((like) => (
                          <div 
                            key={like.id} 
                            className="border rounded-lg p-3 hover:shadow-sm cursor-pointer transition-shadow"
                            onClick={() => handleEventClick(like.event.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Heart className="w-4 h-4 text-red-500 fill-current" />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-800">{like.event.title}</span>
                                    {like.event.verified && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    Created by {like.event.creator.name || like.event.creator.email}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500">{formatTimeAgo(like.createdAt)}</span>
                                {like.event.thumbnail && (
                                  <img 
                                    src={like.event.thumbnail} 
                                    alt={like.event.title}
                                    className="w-12 h-8 rounded object-cover mt-1"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Won Events */}
                  {userData.wonEvents.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">🏆 Events Won</h3>
                      <div className="space-y-3">
                        {userData.wonEvents.map((event) => (
                          <div 
                            key={event.id} 
                            className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                            onClick={() => handleEventClick(event.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Trophy className="w-5 h-5 text-yellow-600" />
                                  <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                  {event.verified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                </div>
                                {event.prize && (
                                  <p className="text-sm text-yellow-700 font-medium mb-1">Prize: {event.prize}</p>
                                )}
                                <p className="text-sm text-gray-600">
                                  Created by {event.creator?.name || event.creator?.email} • Won on {formatDate(event.createdAt)}
                                </p>
                              </div>
                              {event.thumbnail && (
                                <img 
                                  src={event.thumbnail} 
                                  alt={event.title}
                                  className="w-16 h-16 rounded-lg object-cover ml-4"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
