
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
import { StreakCounter } from '@/components/gamification/StreakCounter';
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
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-black rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
            <Vault className="w-12 h-12 text-white" />
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading MemVault...</p>
          <p className="text-gray-500">🔐 Securing your memories...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-black/5">
      <Navigation />
      
      <main className="pt-20 pb-8">
        {/* Streak Counter */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <StreakCounter />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white/80 backdrop-blur shadow-lg border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4">
              <TabsList className="grid w-full grid-cols-5 bg-transparent h-20 gap-2">
                <TabsTrigger 
                  value="journal" 
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                >
                  <BookOpen className="w-6 h-6" />
                  <span className="text-sm font-medium">📖 Journal</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="events" 
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 hover:bg-purple-50 transition-all duration-200"
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm font-medium">📅 Events</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 hover:bg-green-50 transition-all duration-200"
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-sm font-medium">📝 Notes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700 hover:bg-orange-50 transition-all duration-200"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">👤 Profile</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-sm font-medium">⚙️ Settings</span>
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
