import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, BarChart2, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-teal-600 font-bold text-xl">FitTrack</span>
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Calendar className="mr-1 h-5 w-5" />
                  <span>Calendrier</span>
                </div>
              </Link>
              
              <Link
                to="/stats"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/stats') 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <BarChart2 className="mr-1 h-5 w-5" />
                  <span>Statistiques</span>
                </div>
              </Link>
              
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/profile') 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <User className="mr-1 h-5 w-5" />
                  <span>Profil</span>
                </div>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <LogOut className="mr-1 h-5 w-5" />
                  <span>Déconnexion</span>
                </div>
              </button>
            </div>
            
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span>Calendrier</span>
                </div>
              </Link>
              
              <Link
                to="/stats"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/stats') 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" />
                  <span>Statistiques</span>
                </div>
              </Link>
              
              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/profile') 
                    ? 'bg-teal-100 text-teal-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  <span>Profil</span>
                </div>
              </Link>
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Déconnexion</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FitTrack. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;