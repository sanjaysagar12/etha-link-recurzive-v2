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
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No token found. Please login.');
        setIsTokenInvalid(true);
        return;
      }

      const response = await fetch('http://localhost:3000/api/user/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError('Your session has expired. Please login again.');
        setIsTokenInvalid(true);
        return;
      }

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

  const handleLogin = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
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
          <p className="text-gray-300">Loading profile...</p>
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
          <div className="mb-6">
            <User className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold mb-2">Authentication Error</p>
            <p className="text-gray-300">{error}</p>
          </div>
          {isTokenInvalid ? (
            <button 
              onClick={handleLogin} 
              className="w-full px-6 py-3 bg-[#E94042] text-white rounded-lg hover:bg-[#E94042]/90 font-medium transition-colors"
            >
              Go to Login
            </button>
          ) : (
            <button 
              onClick={fetchProfile} 
              className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 font-medium transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!userData) {
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
          <p className="text-gray-300">No user data found.</p>
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-md border-b border-white/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#E94042]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#E94042] flex items-center justify-center text-white text-xl font-bold">
                    {userData.name?.[0]?.toUpperCase() || userData.email[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">{userData.name || userData.email}</h1>
                  <p className="text-gray-300">{userData.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      userData.role === 'ADMIN' 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {userData.role}
                    </span>
                    <span className="text-sm text-gray-400">
                      Joined {formatDate(userData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E94042] text-white rounded-lg hover:bg-[#E94042]/90 transition-colors"
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
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/7 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userData.stats.totalEventsHosted}</p>
                  <p className="text-sm text-gray-300">Events Hosted</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/7 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userData.stats.totalEventsJoined}</p>
                  <p className="text-sm text-gray-300">Events Joined</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/7 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userData.stats.totalPosts}</p>
                  <p className="text-sm text-gray-300">Posts Created</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/7 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <ArrowUp className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{userData.stats.totalUpvotesReceived}</p>
                  <p className="text-sm text-gray-300">Upvotes Received</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg shadow-xl">
            <div className="border-b border-white/20">
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
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-[#E94042] text-[#E94042]'
                          : 'border-transparent text-gray-400 hover:text-gray-300'
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
                      <h3 className="text-lg font-semibold text-white">Account Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Name:</span>
                          <span className="text-gray-400">{userData.name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Email:</span>
                          <span className="text-gray-400">{userData.email}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Role:</span>
                          <span className="text-gray-400 capitalize">{userData.role.toLowerCase()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Status:</span>
                          <span className={`font-medium ${userData.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {userData.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Activity Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Comments Made:</span>
                          <span className="text-gray-400">{userData.stats.totalComments}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Upvotes Given:</span>
                          <span className="text-gray-400">{userData.stats.totalUpvotesGiven}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Events Liked:</span>
                          <span className="text-gray-400">{userData.stats.totalEventLikes}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-600">
                          <span className="font-medium text-gray-300">Events Won:</span>
                          <span className="text-gray-400">{userData.stats.totalEventsWon}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hosted Events Tab */}
              {activeTab === 'hosted' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Events You've Created</h3>
                  {userData.createdEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">You haven't hosted any events yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {userData.createdEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all duration-300"
                          onClick={() => handleEventClick(event.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white">{event.title}</h4>
                                {event.verified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  event.isActive 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}>
                                  {event.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-400">
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
                  <h3 className="text-lg font-semibold text-white">Events You've Joined</h3>
                  {userData.joinedEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">You haven't joined any events yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {userData.joinedEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all duration-300"
                          onClick={() => handleEventClick(event.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white">{event.title}</h4>
                                {event.verified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  event.isActive 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}>
                                  {event.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-400">
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
                  <h3 className="text-lg font-semibold text-white">Your Posts</h3>
                  {userData.posts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">You haven't created any posts yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userData.posts.map((post) => (
                        <div 
                          key={post.id} 
                          className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-all duration-300"
                          onClick={() => handleEventClick(post.event.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center gap-1 text-sm text-gray-400">
                              <ArrowUp className="w-4 h-4 text-orange-400" />
                              <span>{post._count.userUpvotes}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-[#E94042] font-medium">r/{post.event.title}</span>
                                {post.event.verified && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                <span className="text-sm text-gray-400">• {formatTimeAgo(post.createdAt)}</span>
                              </div>
                              <p className="text-gray-300 mb-2 line-clamp-3">{post.content}</p>
                              {post.image && (
                                <img 
                                  src={post.image} 
                                  alt="Post image"
                                  className="w-32 h-20 rounded object-cover mb-2 border border-white/20"
                                />
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-400">
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
                    <h3 className="text-lg font-semibold text-white">Recent Comments</h3>
                    {userData.comments.length === 0 ? (
                      <div className="text-center py-4">
                        <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No recent comments</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userData.comments.map((comment) => (
                          <div 
                            key={comment.id} 
                            className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-all duration-300"
                            onClick={() => handleEventClick(comment.post.event.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-[#E94042] font-medium">r/{comment.post.event.title}</span>
                                {comment.parent ? (
                                  <span className="text-gray-400">• replied to {comment.parent.author.name || comment.parent.author.email}</span>
                                ) : (
                                  <span className="text-gray-400">• commented on post</span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2 line-clamp-2">{comment.content}</p>
                            <p className="text-xs text-gray-400 bg-gray-800/30 p-2 rounded line-clamp-1">
                              Original post: {comment.post.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Upvotes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Recent Upvotes</h3>
                    {userData.upvotes.length === 0 ? (
                      <div className="text-center py-4">
                        <ArrowUp className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No recent upvotes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userData.upvotes.map((upvote) => (
                          <div 
                            key={upvote.id} 
                            className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-all duration-300"
                            onClick={() => handleEventClick(upvote.post.event.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm">
                                <ArrowUp className="w-4 h-4 text-orange-400" />
                                <span className="text-[#E94042] font-medium">r/{upvote.post.event.title}</span>
                                <span className="text-gray-400">• upvoted post by {upvote.post.author.name || upvote.post.author.email}</span>
                              </div>
                              <span className="text-xs text-gray-500">{formatTimeAgo(upvote.createdAt)}</span>
                            </div>
                            <p className="text-gray-300 text-sm line-clamp-2">{upvote.post.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Event Likes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Recent Event Likes</h3>
                    {userData.eventLikes.length === 0 ? (
                      <div className="text-center py-4">
                        <Heart className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No recent event likes</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userData.eventLikes.map((like) => (
                          <div 
                            key={like.id} 
                            className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition-all duration-300"
                            onClick={() => handleEventClick(like.event.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Heart className="w-4 h-4 text-red-400 fill-current" />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white">{like.event.title}</span>
                                    {like.event.verified && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                                  </div>
                                  <p className="text-sm text-gray-400">
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
                                    className="w-12 h-8 rounded object-cover mt-1 border border-white/20"
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
                      <h3 className="text-lg font-semibold text-white">🏆 Events Won</h3>
                      <div className="space-y-3">
                        {userData.wonEvents.map((event) => (
                          <div 
                            key={event.id} 
                            className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-lg p-4 hover:from-yellow-500/30 hover:to-yellow-600/30 cursor-pointer transition-all duration-300"
                            onClick={() => handleEventClick(event.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Trophy className="w-5 h-5 text-yellow-400" />
                                  <h4 className="font-semibold text-white">{event.title}</h4>
                                  {event.verified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                </div>
                                {event.prize && (
                                  <p className="text-sm text-yellow-300 font-medium mb-1">Prize: {event.prize}</p>
                                )}
                                <p className="text-sm text-gray-300">
                                  Created by {event.creator?.name || event.creator?.email} • Won on {formatDate(event.createdAt)}
                                </p>
                              </div>
                              {event.thumbnail && (
                                <img 
                                  src={event.thumbnail} 
                                  alt={event.title}
                                  className="w-16 h-16 rounded-lg object-cover ml-4 border border-yellow-500/30"
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
