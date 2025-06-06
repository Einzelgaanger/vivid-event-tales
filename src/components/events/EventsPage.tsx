
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Calendar, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { CreateEvent } from './CreateEvent';
import { EventCard } from './EventCard';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'];

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
      event.urgency?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
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
      title: 'Event Created',
      description: 'Your event has been successfully scheduled'
    });
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Event Manager
        </h1>
        <p className="text-gray-600 text-lg">
          Organize and manage your events with precision
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transform transition hover:scale-105"
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
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-800">{events.length}</p>
            <p className="text-blue-600">Total Events</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-orange-800">{stats.pending}</p>
            <p className="text-orange-600">Pending</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
            <p className="text-green-600">Completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
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
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Plan First Event
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
