'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Home,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Copy
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

interface WalletInfo {
  id: string;
  balance: string;
  lockedBalance: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionInfo {
  id: string;
  amount: string;
  type: string;
  status: string;
  description?: string;
  txHash?: string;
  createdAt: string;
  confirmedAt?: string;
  senderWallet?: {
    id: string;
    user: {
      id: string;
      name?: string;
      email: string;
    };
  };
  receiverWallet?: {
    id: string;
    user: {
      id: string;
      name?: string;
      email: string;
    };
  };
  event?: {
    id: string;
    title: string;
    verified: boolean;
  };
}

interface FullUserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  walletAddress?: string;
  createdEvents: EventSummary[];
  joinedEvents: EventSummary[];
  wonEvents: EventSummary[];
  posts: PostSummary[];
  comments: CommentSummary[];
  upvotes: UpvoteSummary[];
  eventLikes: EventLikeSummary[];
  stats: UserStats;
  wallet?: WalletInfo;
  transactions: TransactionInfo[];
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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    recipientAddress: '',
    amount: '',
  });
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No token found. Please login.');
        setIsTokenInvalid(true);
        return;
      }

      const response = await fetch('https://api-etherlink.portos.cloud/api/user/me', {
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
    router.push('/auth/login');
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

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'FAILED' || status === 'CANCELLED') return <XCircle className="w-4 h-4 text-red-400" />;
    if (status === 'PENDING') return <Clock className="w-4 h-4 text-yellow-400" />;
    
    switch (type) {
      case 'DEPOSIT': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'WITHDRAWAL': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'PRIZE_DISTRIBUTION': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'PRIZE_LOCK': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'EVENT_PARTICIPATION': return <Users className="w-4 h-4 text-blue-400" />;
      case 'REFUND': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string, status: string) => {
    if (status === 'FAILED' || status === 'CANCELLED') return 'text-red-400';
    if (status === 'PENDING') return 'text-yellow-400';
    
    switch (type) {
      case 'DEPOSIT': return 'text-green-400';
      case 'WITHDRAWAL': return 'text-red-400';
      case 'PRIZE_DISTRIBUTION': return 'text-yellow-400';
      case 'PRIZE_LOCK': return 'text-orange-400';
      case 'EVENT_PARTICIPATION': return 'text-blue-400';
      case 'REFUND': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/auth/login');
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const handleWithdraw = async () => {
    if (!userData?.wallet) {
      alert('No wallet found. Please contact support.');
      return;
    }

    if (parseFloat(userData.wallet.balance) <= 0) {
      alert('Insufficient balance to withdraw.');
      return;
    }

    setIsWithdrawing(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('https://api-etherlink.portos.cloud/etherlink/distribute-funds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderAddress: userData.id, // Use user ID instead of wallet address
          recipientAddress: withdrawData.recipientAddress,
          amountInEther: withdrawData.amount,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.data?.status === 'confirmed') {
          alert(`✅ Successfully sent ${withdrawData.amount} ETH to ${withdrawData.recipientAddress}\nTransaction Hash: ${result.data.transactionHash}`);
        } else {
          alert(`🕐 Transaction sent! ${withdrawData.amount} ETH to ${withdrawData.recipientAddress}\nTransaction Hash: ${result.data?.transactionHash}\n\nNote: Transaction is pending confirmation. It may take a few minutes to appear on the blockchain.`);
        }
        setShowWithdrawModal(false);
        setWithdrawData({ recipientAddress: '', amount: '' });
        // Refresh profile data to show updated balance
        fetchProfile();
      } else {
        alert(`❌ Error: ${result.message || 'Failed to send funds'}`);
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert('Failed to withdraw funds');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
      <div className="min-h-screen bg-[#161616] flex items-center justify-center">
        <p className="text-gray-300">No user data found.</p>
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
                  onClick={() => router.push('/event/my')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  My Events
                </button>
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

        {/* Content */}
        <div className="p-6">
          {/* Wallet Card */}
          {userData.wallet && (
            <div className="mb-6 bg-gradient-to-r from-[#E94042]/10 to-purple-500/10 backdrop-blur-md border border-white/20 rounded-lg p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E94042]/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-[#E94042]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">In-App Wallet</h3>
                    <p className="text-sm text-gray-300">Manage your ETH balance</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={parseFloat(userData.wallet.balance) <= 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E94042] text-white rounded-lg hover:bg-[#E94042]/90 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send Funds
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-gray-300">Available Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {parseFloat(userData.wallet.balance).toFixed(4)} ETH
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-sm text-gray-300">Locked Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">
                    {parseFloat(userData.wallet.lockedBalance).toFixed(4)} ETH
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm text-gray-300">Total Balance:</span>
                    <span className="text-lg font-bold text-white ml-2">
                      {(parseFloat(userData.wallet.balance) + parseFloat(userData.wallet.lockedBalance)).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Wallet created</p>
                    <p className="text-xs text-gray-300">{formatDate(userData.wallet.createdAt)}</p>
                  </div>
                </div>
                
                {/* Wallet Address Display */}
                {userData.walletAddress && (
                  <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">Wallet Address:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-mono">
                        {`${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}`}
                      </span>
                      <button
                        onClick={() => copyToClipboard(userData.walletAddress!)}
                        className="text-gray-400 hover:text-white"
                        title="Copy address"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction History */}
          {userData.transactions && userData.transactions.length > 0 && (
            <div className="mb-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {userData.transactions.slice(0, 10).map((tx) => (
                  <div 
                    key={tx.id} 
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(tx.type, tx.status)}
                        <span className={`text-sm font-medium ${getTransactionColor(tx.type, tx.status)}`}>
                          {tx.type.replace('_', ' ')} {tx.status === 'PENDING' ? '(Pending)' : ''}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(tx.createdAt)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm mb-1">{tx.description || 'No description'}</p>
                        <p className="text-xs text-gray-400">
                          {tx.senderWallet ? `From: ${tx.senderWallet.user.name || tx.senderWallet.user.email}` : ''}
                          {tx.receiverWallet ? `To: ${tx.receiverWallet.user.name || tx.receiverWallet.user.email}` : ''}
                        </p>
                      </div>
                      <div className="whitespace-nowrap">
                        <span className={`text-lg font-bold ${
                          tx.status === 'FAILED' || tx.status === 'CANCELLED' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {tx.amount} ETH
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && userData?.wallet && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-96 max-w-[90vw] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E94042]/20 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-[#E94042]" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Send Funds</h2>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Available Balance Display */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Available Balance</span>
                    <span className="text-lg font-bold text-green-400">
                      {parseFloat(userData.wallet.balance).toFixed(4)} ETH
                    </span>
                  </div>
                </div>

                {/* Recipient Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={withdrawData.recipientAddress}
                    onChange={(e) => setWithdrawData({ ...withdrawData, recipientAddress: e.target.value })}
                    placeholder="0x..."
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E94042]"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      max={parseFloat(userData.wallet.balance)}
                      value={withdrawData.amount}
                      onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                      placeholder="0.0000"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E94042]"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawData({ ...withdrawData, amount: userData.wallet?.balance || '0' })}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-[#E94042] hover:text-[#E94042]/80"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ This action cannot be undone. Please double-check the recipient address before proceeding.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawData({ recipientAddress: '', amount: '' });
                    }}
                    disabled={isWithdrawing}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={
                      isWithdrawing || 
                      !withdrawData.recipientAddress || 
                      !withdrawData.amount ||
                      parseFloat(withdrawData.amount) <= 0 ||
                      parseFloat(withdrawData.amount) > parseFloat(userData.wallet.balance)
                    }
                    className="flex-1 px-4 py-2 bg-[#E94042] text-white rounded-lg hover:bg-[#E94042]/90 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {isWithdrawing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Send {withdrawData.amount || '0'} ETH
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
