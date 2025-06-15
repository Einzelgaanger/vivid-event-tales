import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Calendar, Heart, Star, Smile, Frown, Meh } from 'lucide-react';
import { CreateJournalEntry } from './CreateJournalEntry';
import { JournalCard } from './JournalCard';
import { format, parseISO } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  useEffect(() => {
    const filtered = entries.filter(entry => 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.mood?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEntries(filtered);
  }, [entries, searchTerm]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user?.id! as any)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries((data as unknown as JournalEntry[]) || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load journal entries',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEntryCreated = () => {
    setShowCreateForm(false);
    fetchEntries();
    toast({
      title: 'Memory Saved!',
      description: 'Your journal entry has been created successfully'
    });
  };

  const getMoodEmoji = (mood: string | null) => {
    switch (mood?.toLowerCase()) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'excited': return '🤩';
      case 'peaceful': return '😌';
      case 'anxious': return '😰';
      case 'grateful': return '🙏';
      case 'tired': return '😴';
      case 'angry': return '😠';
      default: return '😐';
    }
  };

  const getRatingStars = (rating: number | null) => {
    if (!rating) return '';
    return '⭐'.repeat(rating);
  };

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
          Your Memory Journal
        </h1>
        <p className="text-gray-600 text-lg">
          Capture life's beautiful moments, one memory at a time
        </p>
      </div>

      {/* Search and Create */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search your memories..."
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
          New Memory
        </Button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateJournalEntry
              onSuccess={handleEntryCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-0">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-800">{entries.length}</p>
            <p className="text-purple-600">Total Memories</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-100 to-pink-200 border-0">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-pink-600" />
            <p className="text-2xl font-bold text-pink-800">
              {entries.length > 0 ? Math.ceil((Date.now() - new Date(entries[entries.length - 1]?.entry_date).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </p>
            <p className="text-pink-600">Days Journaling</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-100 to-indigo-200 border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
            <p className="text-2xl font-bold text-indigo-800">
              {entries.length > 0 ? (entries.reduce((sum, entry) => sum + (entry.rating || 0), 0) / entries.filter(e => e.rating).length).toFixed(1) : '0'}
            </p>
            <p className="text-indigo-600">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <Card className="p-12 text-center bg-white/50 border-dashed border-2 border-gray-300">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No memories found' : 'Start Your Memory Journey'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first journal entry to begin capturing precious moments'
            }
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Create First Memory
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onDelete={fetchEntries}
              onUpdate={fetchEntries}
            />
          ))}
        </div>
      )}
    </div>
  );
}
