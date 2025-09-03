'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import UploadImage from "@/components/UploadImage";
import { Send, X, ImageIcon } from 'lucide-react';

interface PostFormProps {
  postContent: string;
  setPostContent: (content: string) => void;
  postImage: string;
  handleImageUploaded: (imageUrl: string) => void;
  handleCreatePost: () => void;
  handleCancelPost: () => void;
  isCreatingPost: boolean;
}

export default function PostForm({ 
  postContent, 
  setPostContent, 
  postImage, 
  handleImageUploaded, 
  handleCreatePost, 
  handleCancelPost, 
  isCreatingPost 
}: PostFormProps) {
  return (
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
  );
}