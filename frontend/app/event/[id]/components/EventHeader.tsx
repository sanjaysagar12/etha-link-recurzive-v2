'use client';

import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark, Share2, MoreHorizontal } from 'lucide-react';

interface EventHeaderProps {
  isBookmarked: boolean;
  setIsBookmarked: (bookmarked: boolean) => void;
}

export default function EventHeader({ isBookmarked, setIsBookmarked }: EventHeaderProps) {
  return (
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
  );
}