'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PostItem from './PostItem';
import { Plus, MessageCircle } from 'lucide-react';

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

interface PostsListProps {
  posts: Post[];
  currentUserId: string | null;
  isUserParticipant: (userId: string) => boolean;
  isActive: boolean;
  setShowPostForm: (show: boolean) => void;
  userUpvotes: { [key: string]: boolean };
  isUpvoting: { [key: string]: boolean };
  handleUpvotePost: (postId: string) => void;
  formatShortDate: (dateString: string) => string;
  showCommentForm: { [key: string]: boolean };
  setShowCommentForm: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
  commentContent: { [key: string]: string };
  setCommentContent: (value: React.SetStateAction<{ [key: string]: string }>) => void;
  handleCreateComment: (postId: string) => void;
  handleCancelComment: (id: string, type: 'comment' | 'reply') => void;
  isCreatingComment: { [key: string]: boolean };
  commentVotes: { [key: string]: 'up' | 'down' | null };
  handleVote: (commentId: string, voteType: 'up' | 'down') => void;
  showReplyForm: { [key: string]: boolean };
  setShowReplyForm: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
  handleCreateReply: (commentId: string) => void;
  canParticipate: boolean;
}

export default function PostsList({ 
  posts,
  currentUserId,
  isUserParticipant,
  isActive,
  setShowPostForm,
  userUpvotes,
  isUpvoting,
  handleUpvotePost,
  formatShortDate,
  showCommentForm,
  setShowCommentForm,
  commentContent,
  setCommentContent,
  handleCreateComment,
  handleCancelComment,
  isCreatingComment,
  commentVotes,
  handleVote,
  showReplyForm,
  setShowReplyForm,
  handleCreateReply,
  canParticipate
}: PostsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Posts & Discussions ({posts.length})</h3>
        {/* Create Post Button - Only for participants */}
        {currentUserId && isUserParticipant(currentUserId) && isActive && (
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
      
      {posts.length === 0 ? (
        <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-300 text-lg">No posts yet</p>
          <p className="text-gray-400 text-sm">Be the first to start a discussion!</p>
        </Card>
      ) : (
        posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            userUpvotes={userUpvotes}
            isUpvoting={isUpvoting}
            handleUpvotePost={handleUpvotePost}
            currentUserId={currentUserId}
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
        ))
      )}
    </div>
  );
}