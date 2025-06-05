
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/dashboard/Navigation';
import { JournalPage } from '@/components/journal/JournalPage';
import { EventsPage } from '@/components/events/EventsPage';
import { ProfilePage } from '@/components/profile/ProfilePage';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<'journal' | 'events' | 'profile'>('journal');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'journal':
        return <JournalPage />;
      case 'events':
        return <EventsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <JournalPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-25 to-indigo-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="pb-20 md:pb-4">
        {renderCurrentPage()}
      </main>
    </div>
  );
}
