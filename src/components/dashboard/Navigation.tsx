
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, BookOpen, Calendar, User, LogOut, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  onPageChange: (page: 'journal' | 'events' | 'profile') => void;
  currentPage: 'journal' | 'events' | 'profile';
}

export function Navigation({ onPageChange, currentPage }: NavigationProps) {
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { key: 'journal' as const, label: 'Journal', icon: BookOpen, emoji: '📖' },
    { key: 'events' as const, label: 'Events', icon: Calendar, emoji: '📅' },
    { key: 'profile' as const, label: 'Profile', icon: User, emoji: '👤' }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            MemoryVault
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          {navItems.map(({ key, label, icon: Icon, emoji }) => (
            <button
              key={key}
              onClick={() => onPageChange(key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                currentPage === key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.user_metadata?.full_name || user?.email} ✨
          </span>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden">
        <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MemoryVault
            </h1>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-purple-600"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4">
            <div className="space-y-3">
              {navItems.map(({ key, label, icon: Icon, emoji }) => (
                <button
                  key={key}
                  onClick={() => {
                    onPageChange(key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    currentPage === key
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
              
              <hr className="my-3" />
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Tab Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-2">
        <div className="flex justify-around">
          {navItems.map(({ key, label, icon: Icon, emoji }) => (
            <button
              key={key}
              onClick={() => onPageChange(key)}
              className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all ${
                currentPage === key
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-purple-600'
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
