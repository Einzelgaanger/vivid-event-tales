
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { JournalPage } from '@/components/journal/JournalPage';
import { EventsPage } from '@/components/events/EventsPage';
import { NotesPage } from '@/components/notes/NotesPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { PinVerification } from '@/components/auth/PinVerification';
import { Navigation } from '@/components/dashboard/Navigation';
import { BookOpen, Calendar, FileText, Settings, User, Vault } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [pinVerified, setPinVerified] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    // Check if PIN verification is needed
    const lastActivity = localStorage.getItem('lastActivity');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (!lastActivity || now - parseInt(lastActivity) > fiveMinutes) {
      setPinVerified(false);
    } else {
      setPinVerified(true);
    }

    // Update last activity timestamp
    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    window.addEventListener('focus', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);

    return () => {
      window.removeEventListener('focus', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Vault className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MemVault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!pinVerified) {
    return <PinVerification onVerified={() => setPinVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <Navigation />
      
      <main className="pt-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4">
              <TabsList className="grid w-full grid-cols-5 bg-transparent h-16">
                <TabsTrigger 
                  value="journal" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                >
                  <BookOpen className="w-4 h-4" />
                  Journal
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                >
                  <Calendar className="w-4 h-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  Notes
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                >
                  <User className="w-4 h-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="journal" className="mt-0">
            <JournalPage />
          </TabsContent>
          
          <TabsContent value="events" className="mt-0">
            <EventsPage />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-0">
            <NotesPage />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0">
            <ProfilePage />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
