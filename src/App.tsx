import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import SignIn from './components/SignIn';

export default function App() {
  const [view, setView] = useState<'landing' | 'driver' | 'admin' | 'login'>('landing');
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  // Automatically redirect authenticated users to the dashboard when they log in 
  // or if they reload the page while signed in.
  useEffect(() => {
    if (isLoaded && isSignedIn && user && (view === 'landing' || view === 'login')) {
      const storedRole = localStorage.getItem('selectedRole');
      
      const applyRole = (role: string) => {
        if (role === 'ADMIN') {
          setView('admin');
        } else {
          setView('driver');
        }
      };

      if (storedRole) {
        user.update({ unsafeMetadata: { role: storedRole } })
          .then(() => {
            localStorage.removeItem('selectedRole');
            applyRole(storedRole);
          })
          .catch((err) => {
            console.error('Error updating Clerk metadata:', err);
            applyRole(storedRole);
          });
      } else {
        const userRole = (user.unsafeMetadata?.role || user.publicMetadata?.role || 'DRIVER') as string;
        applyRole(userRole.toUpperCase());
      }
    }
  }, [view, isSignedIn, isLoaded, user]);

  // Guard routing states: if user is not signed in, 
  // redirect them to the Sign In page whenever they attempt to access secured portals.
  useEffect(() => {
    if (isLoaded && !isSignedIn && (view === 'driver' || view === 'admin')) {
      setView('login');
    }
  }, [view, isSignedIn, isLoaded]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
    setView('landing');
  };

  return (
    <div className="relative min-h-screen bg-brand-navy-dark text-gray-100 flex flex-col justify-between selection:bg-brand-red selection:text-white">
      {/* Hide general navbar in admin, login, and driver views */}
      {view !== 'admin' && view !== 'login' && view !== 'driver' && <Navbar currentView={view} onViewChange={setView} />}

      {/* Main Content Sections */}
      <main className="flex-grow">
        {view === 'landing' ? (
          <>
            <Hero />
            <Stats />
            <Features />
            <FAQ />
          </>
        ) : view === 'driver' ? (
          <DriverDashboard onLogout={handleLogout} />
        ) : view === 'admin' ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <SignIn onViewChange={setView} />
        )}
      </main>

      {/* Footer (Hidden in dashboard and login views) */}
      {view !== 'admin' && view !== 'login' && view !== 'driver' && <Footer />}
    </div>
  );
}
