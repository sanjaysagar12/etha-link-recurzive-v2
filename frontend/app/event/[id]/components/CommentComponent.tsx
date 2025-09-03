'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUp, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle 
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  replies?: Comment[];
}

interface CommentProps {
  comment: Comment;
  level?: number;
  commentVotes: { [key: string]: 'up' | 'down' | null };
  handleVote: (commentId: string, voteType: 'up' | 'down') => void;
  formatShortDate: (dateString: string) => string;
  showReplyForm: { [key: string]: boolean };
  setShowReplyForm: (value: React.SetStateAction<{ [key: string]: boolean }>) => void;
  commentContent: { [key: string]: string };
  setCommentContent: (value: React.SetStateAction<{ [key: string]: string }>) => void;
  handleCreateReply: (commentId: string) => void;
  handleCancelComment: (id: string, type: 'comment' | 'reply') => void;
  isCreatingComment: { [key: string]: boolean };
  canParticipate: boolean;
}

export default function CommentComponent({ 
  comment, 
  level = 0, 
  commentVotes, 
  handleVote, 
  formatShortDate, 
  showReplyForm, 
  setShowReplyForm,
  commentContent,
  setCommentContent,
  handleCreateReply,
  handleCancelComment,
  isCreatingComment,
  canParticipate
}: CommentProps) {
  const maxLevel = 3;

  return (
    <div className="mb-4">
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
              {comment.replies.map((reply) => (
                <CommentComponent
                  key={reply.id}
                  comment={reply}
                  level={level + 1}
                  commentVotes={commentVotes}
                  handleVote={handleVote}
                  formatShortDate={formatShortDate}
                  showReplyForm={showReplyForm}
                  setShowReplyForm={setShowReplyForm}
                  commentContent={commentContent}
                  setCommentContent={setCommentContent}
                  handleCreateReply={handleCreateReply}
                  handleCancelComment={handleCancelComment}
                  isCreatingComment={isCreatingComment}
                  canParticipate={canParticipate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}