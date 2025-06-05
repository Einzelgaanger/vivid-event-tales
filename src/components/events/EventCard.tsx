
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Trash2, Edit, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { EditEvent } from './EditEvent';

interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  event_date: string;
  event_time: string | null;
  urgency: string;
  status: string;
  additional_notes: string | null;
  media_urls: string[] | null;
  created_at: string;
}

interface EventCardProps {
  event: Event;
  onDelete: () => void;
  onUpdate: () => void;
}

export function EventCard({ event, onDelete, onUpdate }: EventCardProps) {
  const [showFullView, setShowFullView] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: 'Event Deleted',
        description: 'Your event has been permanently deleted.',
      });
      onDelete();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
    setShowFullView(false);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    onUpdate();
    toast({
      title: 'Event Updated',
      description: 'Your event has been successfully updated.',
    });
  };

  const handleStatusToggle = async () => {
    setUpdating(true);
    try {
      const newStatus = event.status === 'pending' ? 'completed' : 'pending';
      
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', event.id);

      if (error) throw error;

      toast({
        title: newStatus === 'completed' ? 'Event Completed' : 'Event Reopened',
        description: newStatus === 'completed' 
          ? 'Great job finishing this event!' 
          : 'Event has been marked as pending again.'
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating event status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const isOverdue = event.status === 'pending' && isPast(parseISO(event.event_date));
  const isCompleted = event.status === 'completed';

  if (showEditForm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <EditEvent
            event={event}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditForm(false)}
          />
        </div>
      </div>
    );
  }

  if (showFullView) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <Card className="border-0 shadow-2xl">
            <CardHeader className={`text-white ${isCompleted ? 'bg-gradient-to-r from-green-600 to-emerald-600' : isOverdue ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2 flex items-center gap-2">
                    {event.title}
                    {isCompleted && <CheckCircle className="w-6 h-6" />}
                    {isOverdue && <AlertCircle className="w-6 h-6" />}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-white/90 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.event_date)}
                    </div>
                    {event.event_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.event_time}
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.venue}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span>{getUrgencyIcon(event.urgency)}</span>
                      <span className="capitalize">{event.urgency} Priority</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullView(false)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Status Badge */}
              <div className="mb-4">
                <Badge className={`${isCompleted ? 'bg-green-100 text-green-800' : isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                </Badge>
              </div>

              {/* Description */}
              {event.description && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Additional Notes */}
              {event.additional_notes && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Additional Notes
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {event.additional_notes}
                  </p>
                </div>
              )}

              {/* Media Files with Download */}
              {event.media_urls && event.media_urls.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Attached Files</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {event.media_urls.map((url, index) => (
                      <div key={index} className="bg-gray-100 rounded-lg overflow-hidden relative group">
                        {url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') ? (
                          <video src={url} controls className="w-full h-32 object-cover" />
                        ) : url.includes('.pdf') || url.includes('.doc') ? (
                          <div className="p-4 text-center h-32 flex flex-col justify-center">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                            <p className="text-xs">Document {index + 1}</p>
                          </div>
                        ) : (
                          <img src={url} alt={`Attachment ${index + 1}`} className="w-full h-32 object-cover" />
                        )}
                        <Button
                          size="sm"
                          onClick={() => downloadFile(url, `event-file-${index + 1}`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white hover:bg-black/70"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Download All Files */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.media_urls.map((url, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(url, `event-file-${index + 1}`)}
                        className="flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        File {index + 1}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <Badge variant="outline" className="text-gray-500">
                  Created {format(parseISO(event.created_at), 'MMM dd, yyyy')}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant={isCompleted ? "outline" : "default"}
                    size="sm"
                    onClick={handleStatusToggle}
                    disabled={updating}
                    className={isCompleted ? "" : "bg-green-600 hover:bg-green-700"}
                  >
                    {updating ? 'Updating...' : isCompleted ? 'Mark Pending' : 'Mark Complete'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Card className={`cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border-l-4 ${isCompleted ? 'border-l-green-500 bg-green-50/50' : isOverdue ? 'border-l-red-500 bg-red-50/50' : 'border-l-blue-500 bg-white/80'} backdrop-blur-sm shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1" onClick={() => setShowFullView(true)}>
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg text-gray-800 line-clamp-2 flex-1">
                {event.title}
              </CardTitle>
              {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
              {isOverdue && <AlertCircle className="w-5 h-5 text-red-600" />}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(event.event_date)}
              </div>
              {event.event_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.event_time}
                </div>
              )}
              <Badge className={`text-xs ${getUrgencyColor(event.urgency)}`}>
                {getUrgencyIcon(event.urgency)} {event.urgency}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStatusToggle}
              disabled={updating}
              className={isCompleted ? "text-gray-400 hover:text-gray-600" : "text-green-400 hover:text-green-600"}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-gray-400 hover:text-blue-500"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={() => setShowFullView(true)}>
        {/* Venue */}
        {event.venue && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <MapPin className="w-3 h-3" />
            {event.venue}
          </div>
        )}

        {/* Description Preview */}
        {event.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {event.description}
          </p>
        )}

        {/* Media Preview */}
        {event.media_urls && event.media_urls.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <FileText className="w-3 h-3" />
            {event.media_urls.length} attachment(s)
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500">
          <Badge className={`text-xs ${isCompleted ? 'bg-green-100 text-green-800' : isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
          </Badge>
          {event.additional_notes && (
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Notes
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
