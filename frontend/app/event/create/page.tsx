'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadImage from "@/components/UploadImage";

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

      const response = await fetch('http://localhost:3000/api/event', {
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create New Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter event description"
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize">Prize</Label>
                <Input
                  id="prize"
                  name="prize"
                  type="text"
                  value={formData.prize}
                  onChange={handleInputChange}
                  placeholder="Enter prize details"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Event Thumbnail</Label>
                <UploadImage 
                  onImageUploaded={handleImageUploaded}
                  currentImage={formData.thumbnail}
                />
                {formData.thumbnail && (
                  <p className="text-sm text-gray-500">
                    Image uploaded successfully!
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating Event...' : 'Create Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}