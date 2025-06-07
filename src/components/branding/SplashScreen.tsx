
import { useState, useEffect } from 'react';
import { Vault } from 'lucide-react';

interface SplashScreenProps {
  loading: boolean;
  message?: string;
}

export function SplashScreen({ loading, message = "Loading your memories..." }: SplashScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        {/* Animated Vault Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-slate-700 p-8 rounded-full shadow-2xl">
            <Vault className="w-16 h-16 text-white animate-pulse" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-wider">
            Mem<span className="text-blue-400">Vault</span>
          </h1>
          <p className="text-blue-200 text-lg">Your Personal Memory Vault</p>
        </div>

        {/* Loading Message */}
        <div className="text-white/80 text-lg min-h-[1.5rem]">
          {message}{dots}
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
