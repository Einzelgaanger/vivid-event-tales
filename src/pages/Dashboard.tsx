
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { PinVerification } from '@/components/auth/PinVerification';
import { Navigation } from '@/components/dashboard/Navigation';
import { JournalPage } from '@/components/journal/JournalPage';
import { EventsPage } from '@/components/events/EventsPage';
import { NotesPage } from '@/components/notes/NotesPage';
import { ProfileSettingsPage } from '@/components/settings/ProfileSettingsPage';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('journal');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    const fiveMinutes = 5 * 60 * 1000;
    
    if (lastActivity && Date.now() - parseInt(lastActivity) < fiveMinutes) {
      setIsVerified(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isVerified) {
    return <PinVerification onVerified={() => setIsVerified(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'journal':
        return <JournalPage />;
      case 'events':
        return <EventsPage />;
      case 'notes':
        return <NotesPage />;
      case 'profile':
        return <ProfileSettingsPage />;
      default:
        return <JournalPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className={`${activeTab !== 'profile' ? 'pb-20 md:pb-0' : 'pb-20 md:pb-4'}`}>
        {renderContent()}
      </main>
    </div>
  );
}
