
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';
import { CreateEvent } from './CreateEvent';
import { EventCard } from './EventCard';
import { format } from 'date-fns';

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

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.urgency.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = () => {
    setShowCreateForm(false);
    fetchEvents();
    toast({
      title: 'Event Created! 🎉',
      description: 'Your event has been successfully scheduled'
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusStats = () => {
    const pending = events.filter(e => e.status === 'pending').length;
    const completed = events.filter(e => e.status === 'completed').length;
    const overdue = events.filter(e => 
      e.status === 'pending' && new Date(e.event_date) < new Date()
    ).length;
    
    return { pending, completed, overdue };
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Your Event Planner 📅
        </h1>
        <p className="text-gray-600 text-lg">
          Never miss an important moment - organize your life with style ✨
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events... 🔍"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg transform transition hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Event
        </Button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateEvent
              onSuccess={handleEventCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-0">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-800">{events.length}</p>
            <p className="text-blue-600">Total Events</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-0">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-orange-800">{stats.pending}</p>
            <p className="text-orange-600">Pending</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-100 to-green-200 border-0">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 mx-auto mb-2 text-green-600 text-2xl">✅</div>
            <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
            <p className="text-green-600">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-100 to-red-200 border-0">
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-800">{stats.overdue}</p>
            <p className="text-red-600">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="p-12 text-center bg-white/50 border-dashed border-2 border-gray-300">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No events found' : 'Start Planning Your Events'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first event to begin organizing your schedule'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Plan First Event 🎯
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={fetchEvents}
              onUpdate={fetchEvents}
            />
          ))}
        </div>
      )}
    </div>
  );
}
