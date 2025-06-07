
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Check, X, Calendar, BookOpen, StickyNote } from 'lucide-react';

interface Invitation {
  id: string;
  sender_id: string;
  item_id: string;
  item_type: 'journal' | 'event' | 'note';
  item_title: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender_profile: {
    full_name: string;
    email: string;
  };
}

export function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchInvitations();
  }, [user]);

  const fetchInvitations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shared_invites')
        .select(`
          *,
          sender_profile:profiles!sender_id(full_name, email)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      const { error } = await supabase
        .from('shared_invites')
        .update({ status: action === 'accept' ? 'accepted' : 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: action === 'accept' ? '✅ Invitation Accepted' : '❌ Invitation Declined',
        description: `You have ${action}ed the invitation`,
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error updating invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update invitation',
        variant: 'destructive'
      });
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'journal':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'note':
        return <StickyNote className="w-5 h-5 text-green-600" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mail className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Memory Invitations</h1>
      </div>

      {invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations</h3>
            <p className="text-gray-600">You don't have any memory sharing invitations yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getItemIcon(invitation.item_type)}
                    <span className="capitalize">{invitation.item_type} Invitation</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invitation.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 mb-2">
                      <strong>{invitation.sender_profile.full_name}</strong> wants to share:
                    </p>
                    <p className="text-lg font-medium text-gray-900">"{invitation.item_title}"</p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Received on {new Date(invitation.created_at).toLocaleDateString()}
                  </div>

                  {invitation.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleInvitation(invitation.id, 'accept')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleInvitation(invitation.id, 'decline')}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
