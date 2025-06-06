
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { EditEvent } from './EditEvent';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

interface EventCardProps {
  event: Event;
  onDelete: () => void;
  onUpdate: () => void;
}

export function EventCard({ event, onDelete, onUpdate }: EventCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id as any);

      if (error) throw error;

      toast({
        title: 'Event Deleted',
        description: 'The event has been successfully deleted'
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
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = event.status === 'completed' ? 'pending' : 'completed';
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus } as any)
        .eq('id', event.id as any);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Event marked as ${newStatus}`
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleEditSuccess = () => {
    setShowEdit(false);
    onUpdate();
    toast({
      title: 'Event Updated',
      description: 'Your event has been successfully updated'
    });
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: 'Download Failed',
        description: 'Could not download the file',
        variant: 'destructive'
      });
    }
  };

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = event.status === 'pending' && new Date(event.event_date) < new Date();

  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 ${
        isOverdue ? 'border-l-red-500' : 
        event.status === 'completed' ? 'border-l-green-500' : 'border-l-blue-500'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-2">
              {event.title}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={getUrgencyColor(event.urgency)}>
                {event.urgency || 'medium'}
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {isOverdue ? 'overdue' : event.status || 'pending'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {event.description && (
            <p className="text-gray-600 text-sm line-clamp-3">{event.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
              {event.event_time && (
                <>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{event.event_time}</span>
                </>
              )}
            </div>

            {event.venue && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            )}

            {isOverdue && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>This event is overdue</span>
              </div>
            )}
          </div>

          {event.additional_notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 line-clamp-2">{event.additional_notes}</p>
            </div>
          )}

          {event.media_urls && event.media_urls.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
              <div className="flex flex-wrap gap-2">
                {event.media_urls.map((url, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(url, `attachment-${index + 1}`)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    <FileText className="w-3 h-3 mr-1" />
                    File {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStatusToggle}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {event.status === 'completed' ? 'Mark Pending' : 'Mark Complete'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <EditEvent
              event={event}
              onSuccess={handleEditSuccess}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
