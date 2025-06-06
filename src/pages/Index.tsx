
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Calendar, Star, Camera, Users, Clock, Shield, ChevronRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-green-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-full shadow-xl">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-slate-700 bg-clip-text text-transparent">
            MemoryVault
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            Your Digital Memory Keeper & Event Planner
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Store your precious moments, plan your future adventures, and create a digital diary that grows with you. 
            Come back after 10 years and relive not just photos, but emotions, thoughts, and dreams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold px-8 py-4 rounded-full shadow-xl transform transition hover:scale-105 text-lg"
            >
              Start Your Journey <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
              className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-full text-lg"
            >
              Sign In <BookOpen className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Why Choose MemoryVault?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-6 text-blue-600" />
                <h3 className="text-2xl font-bold mb-4 text-blue-800">Smart Journaling</h3>
                <p className="text-gray-600">
                  Write about your day, rate your mood, add photos and videos. Every memory becomes a beautiful story that you can revisit anytime.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-6 text-green-600" />
                <h3 className="text-2xl font-bold mb-4 text-green-800">Event Planning</h3>
                <p className="text-gray-600">
                  Never miss important moments! Plan events, set reminders, track urgency levels, and organize your life like a pro.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Camera className="w-16 h-16 mx-auto mb-6 text-slate-600" />
                <h3 className="text-2xl font-bold mb-4 text-slate-800">Rich Media</h3>
                <p className="text-gray-600">
                  Upload photos and videos that automatically slideshow when viewing memories. Experience your past like never before.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 mx-auto mb-6 text-emerald-600" />
                <h3 className="text-2xl font-bold mb-4 text-emerald-800">Private & Secure</h3>
                <p className="text-gray-600">
                  Your memories are yours alone. Bank-level security ensures your personal moments stay private and protected.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Star className="w-16 h-16 mx-auto mb-6 text-amber-600" />
                <h3 className="text-2xl font-bold mb-4 text-amber-800">Mood Tracking</h3>
                <p className="text-gray-600">
                  Rate your days, track your emotions, and discover patterns in your happiness. Watch your journey unfold over time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <Clock className="w-16 h-16 mx-auto mb-6 text-teal-600" />
                <h3 className="text-2xl font-bold mb-4 text-teal-800">Time Travel</h3>
                <p className="text-gray-600">
                  Search through years of memories instantly. Find that special moment from 5 years ago in seconds, not hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-0 text-white">
              <CardContent className="p-8">
                <p className="text-lg mb-4 italic">
                  "I've been using MemoryVault for 2 years now. Reading my old entries brings back emotions I thought I'd forgotten. It's like having a conversation with my past self!"
                </p>
                <p className="font-semibold">- Sarah M.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-0 text-white">
              <CardContent className="p-8">
                <p className="text-lg mb-4 italic">
                  "The event planning feature is a game-changer! I never miss important dates anymore, and the urgency levels help me prioritize perfectly."
                </p>
                <p className="font-semibold">- Marcus T.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Ready to Start Your Memory Journey?
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of people who are already preserving their precious moments and planning their future adventures.
          </p>
          
          <div className="space-y-4 mb-8">
            <p className="flex items-center justify-center text-gray-600">
              <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
              Free to start, premium features available
            </p>
            <p className="flex items-center justify-center text-gray-600">
              <Shield className="w-5 h-5 mr-2 text-green-500" />
              Your data is always secure and private
            </p>
            <p className="flex items-center justify-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-slate-500" />
              Join our growing community of memory keepers
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold px-12 py-6 rounded-full shadow-xl transform transition hover:scale-105 text-xl"
          >
            Create Your MemoryVault
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-full">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            MemoryVault
          </h3>
          
          <p className="text-gray-400 mb-6">
            Making memories count, one moment at a time.
          </p>
          
          <p className="text-gray-500 text-sm">
            © 2024 MemoryVault. Made with care for memory keepers everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
