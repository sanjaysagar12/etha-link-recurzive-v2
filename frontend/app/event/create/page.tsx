'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadImage from "@/components/UploadImage";
import { 
  Calendar, 
  Trophy, 
  FileText, 
  ImageIcon, 
  Clock, 
  Plus,
  ArrowLeft,
  Sparkles,
  Users,
  Target
} from 'lucide-react';

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    thumbnail: '',
    startDate: '',
    endDate: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      thumbnail: imageUrl
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch('https://api-etherlink.portos.cloud/api/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Event created successfully!');
        setFormData({
          title: '',
          description: '',
          prize: '',
          thumbnail: '',
          startDate: '',
          endDate: ''
        });
      } else {
        alert(`Error: ${result.message || 'Failed to create event'}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="absolute left-4 top-8 flex items-center gap-2 text-gray-300 hover:bg-white/10 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#E94042] rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Create New Event</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Bring your community together with an amazing event
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Event Title */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#E94042]" />
                      <Label htmlFor="title" className="text-white font-semibold">Event Title *</Label>
                    </div>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter an exciting event title..."
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E94042]/50 focus:ring-[#E94042]/50"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#E94042]" />
                      <Label htmlFor="description" className="text-white font-semibold">Description</Label>
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your event in detail. What makes it special?"
                      rows={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E94042]/50 focus:ring-[#E94042]/50 resize-none"
                    />
                  </div>

                  {/* Prize */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <Label htmlFor="prize" className="text-white font-semibold">Prize (Optional)</Label>
                    </div>
                    <Input
                      id="prize"
                      name="prize"
                      type="text"
                      value={formData.prize}
                      onChange={handleInputChange}
                      placeholder="What will the winner receive?"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#E94042]/50 focus:ring-[#E94042]/50"
                    />
                  </div>

                  {/* Event Thumbnail */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-[#E94042]" />
                      <Label className="text-white font-semibold">Event Thumbnail</Label>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                      <UploadImage 
                        onImageUploaded={handleImageUploaded}
                        currentImage={formData.thumbnail}
                      />
                      {formData.thumbnail && (
                        <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                          <Sparkles className="w-4 h-4" />
                          Image uploaded successfully!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#E94042]" />
                      <Label className="text-white font-semibold">Event Schedule *</Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-gray-300 text-sm">Start Date & Time</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          required
                          className="bg-white/10 border-white/20 text-white focus:border-[#E94042]/50 focus:ring-[#E94042]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-gray-300 text-sm">End Date & Time</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          required
                          className="bg-white/10 border-white/20 text-white focus:border-[#E94042]/50 focus:ring-[#E94042]/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !formData.title || !formData.startDate || !formData.endDate}
                      className="w-full bg-[#E94042] hover:bg-[#E94042]/90 text-white py-4 text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Event...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="w-5 h-5" />
                          Create Event
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            {formData.title && (
              <Card className="bg-white/5 backdrop-blur-md border border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#E94042]" />
                    <CardTitle className="text-white">Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">{formData.title}</h3>
                    {formData.description && (
                      <p className="text-gray-300 text-sm line-clamp-3">{formData.description}</p>
                    )}
                    {formData.prize && (
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <Trophy className="w-4 h-4" />
                        <span>{formData.prize}</span>
                      </div>
                    )}
                    {formData.startDate && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(formData.startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}