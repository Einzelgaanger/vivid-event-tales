import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Calendar, MapPin } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

interface EditEventProps {
  event: Event;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditEvent({ event, onSuccess, onCancel }: EditEventProps) {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [venue, setVenue] = useState(event.venue || '');
  const [eventDate, setEventDate] = useState(event.event_date);
  const [eventTime, setEventTime] = useState(event.event_time || '');
  const [urgency, setUrgency] = useState(event.urgency || 'medium');
  const [additionalNotes, setAdditionalNotes] = useState(event.additional_notes || '');
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>(event.media_urls || []);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index: number) => {
    setExistingMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${event.user_id}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your event',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      let newMediaUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        setUploading(true);
        newMediaUrls = await uploadFiles(mediaFiles);
        setUploading(false);
      }

      const allMediaUrls = [...existingMediaUrls, ...newMediaUrls];

      const { error } = await supabase
        .from('events')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          venue: venue.trim() || null,
          event_date: eventDate,
          event_time: eventTime || null,
          urgency: urgency || null,
          additional_notes: additionalNotes.trim() || null,
          media_urls: allMediaUrls.length > 0 ? allMediaUrls : null
        })
        .eq('id', event.id);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div></div>
          <CardTitle className="text-2xl">Edit Event</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the event?"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="urgency">Priority Level</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Event Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us more about this event..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Event Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Event Time</Label>
              <Input
                id="time"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue/Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Where is it happening?"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any special requirements, reminders, or details..."
              rows={3}
            />
          </div>

          {/* Existing media display and new file upload similar to journal edit */}
          {existingMediaUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Current Files</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {existingMediaUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-100 rounded-lg p-2 text-center">
                      <p className="text-xs truncate">File {index + 1}</p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExistingMedia(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Add New Files</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Click to upload files</p>
                <p className="text-sm text-gray-400">Images, videos, documents</p>
              </label>
            </div>
            
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-100 rounded-lg p-2 text-center">
                      <p className="text-xs truncate">{file.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              {uploading ? 'Uploading...' : loading ? 'Updating...' : 'Update Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
