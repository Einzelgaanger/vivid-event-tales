
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { X, Upload, Calendar, MapPin, Clock } from 'lucide-react';
import { EventReminders } from './EventReminders';

interface CreateEventProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Reminder {
  id: string;
  datetime: string;
}

export function CreateEvent({ onSuccess, onCancel }: CreateEventProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState(new Date().toTimeString().slice(0, 5));
  const [urgency, setUrgency] = useState('medium');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const urgencyOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
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
      let mediaUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        setUploading(true);
        mediaUrls = await uploadFiles(mediaFiles);
        setUploading(false);
      }

      const eventData = {
        user_id: user?.id!,
        title: title.trim(),
        description: description.trim() || null,
        venue: venue.trim() || null,
        event_date: eventDate,
        event_time: eventTime || null,
        urgency: urgency,
        additional_notes: additionalNotes.trim() || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        reminder_enabled: reminders.length > 0
      };

      const { data: eventResult, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (eventError) throw eventError;

      if (reminders.length > 0 && eventResult) {
        const reminderInserts = reminders.map(reminder => ({
          event_id: eventResult.id,
          reminder_datetime: reminder.datetime
        }));
        
        const { error: reminderError } = await supabase
          .from('event_reminders')
          .insert(reminderInserts);
        
        if (reminderError) throw reminderError;
      }

      toast({
        title: 'Event Created',
        description: 'Your event has been successfully scheduled',
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-center">
            <div></div>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Calendar className="w-8 h-8" />
              Create New Event
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-lg font-medium">Event Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's happening?"
                  className="border-purple-200 focus:border-purple-500"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="urgency" className="text-lg font-medium">Priority Level</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={option.color}>{option.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg font-medium">Event Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about this event..."
                rows={4}
                className="border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="date" className="text-lg font-medium">Event Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="pl-10 border-purple-200 focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="time" className="text-lg font-medium">Event Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                  <Input
                    id="time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="venue" className="text-lg font-medium">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Where is it happening?"
                    className="pl-10 border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-lg font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special requirements, reminders, or details..."
                rows={3}
                className="border-gray-200 focus:border-gray-500"
              />
            </div>

            <EventReminders
              reminders={reminders}
              onRemindersChange={setReminders}
            />

            <div className="space-y-3">
              <Label className="text-lg font-medium">Attach Files</Label>
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center bg-purple-50/50 hover:bg-purple-100/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                  <p className="text-purple-700 font-medium">Click to upload files</p>
                  <p className="text-sm text-purple-500">Images, videos, documents</p>
                </label>
              </div>
              
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-3 text-center">
                        <p className="text-xs truncate font-medium">{file.name}</p>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
