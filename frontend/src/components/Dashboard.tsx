import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { SunIcon, MoonIcon, LogoutIcon, ProfileIcon, SearchIcon, AnalysisIcon, UserCircleIcon } from './icons';
import { FaHistory, FaBars, FaTimes, FaCompass } from 'react-icons/fa';
import ProfileForm from './ProfileForm';
import CareerAnalysis from './CareerAnalysis';
import CareerSearch from './CareerSearch';
import PastAnalyses from './PastAnalyses';
import Footer from './Footer';

type View = 'profile' | 'analysis' | 'search' | 'history';

const Dashboard: React.FC = () => {
  const [view, setView] = useState<View>('profile');
  const [searchTarget, setSearchTarget] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const authContext = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);

  const handleNavigateToSearch = (targetRole?: string) => {
    if (targetRole) {
      setSearchTarget(targetRole);
    }
    setView('search');
    setMobileMenuOpen(false);
  };

  const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ icon, label, active, onClick }) => (
    <button
      onClick={() => {
        onClick();
        setMobileMenuOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-102'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:translate-x-1'
      }`}
      data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  const renderView = () => {
    switch (view) {
      case 'profile':
        return <ProfileForm onProfileComplete={() => setView('analysis')} />;
      case 'analysis':
        return <CareerAnalysis onNavigateToSearch={handleNavigateToSearch} />;
      case 'search':
        return <CareerSearch initialQuery={searchTarget} />;
      case 'history':
        return <PastAnalyses onNewAnalysisClick={() => setView('analysis')} />;
      default:
        return <ProfileForm onProfileComplete={() => setView('analysis')} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
            O
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Orbit AI
          </h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-20 w-72 flex-shrink-0 bg-white dark:bg-gray-800 p-5 flex flex-col justify-between shadow-2xl border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div>
            <div className="hidden md:flex items-center gap-3 mb-8 p-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                <FaCompass />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Orbit AI
                </h1>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Career Guidance Engine</p>
              </div>
            </div>

            <nav className="space-y-2">
              <NavItem
                icon={<ProfileIcon className="w-5 h-5" />}
                label="My Profile"
                active={view === 'profile'}
                onClick={() => setView('profile')}
              />
              <NavItem
                icon={<AnalysisIcon className="w-5 h-5" />}
                label="Career Analysis"
                active={view === 'analysis'}
                onClick={() => setView('analysis')}
              />
              <NavItem
                icon={<SearchIcon className="w-5 h-5" />}
                label="Search Careers"
                active={view === 'search'}
                onClick={() => setView('search')}
              />
              <NavItem
                icon={<FaHistory className="w-5 h-5" />}
                label="Saved History"
                active={view === 'history'}
                onClick={() => setView('history')}
              />
            </nav>
          </div>

          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <div className="flex items-center p-3 text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/70 rounded-xl border border-gray-200 dark:border-gray-600">
              <UserCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="ml-2 text-xs font-semibold truncate">{authContext?.user?.name || authContext?.user?.email}</span>
            </div>
            <button
              onClick={themeContext?.toggleTheme}
              className="flex items-center w-full px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              data-testid="toggle-theme-button"
            >
              {themeContext?.theme === 'light' ? (
                <MoonIcon className="w-4 h-4 text-purple-600" />
              ) : (
                <SunIcon className="w-4 h-4 text-yellow-400" />
              )}
              <span className="ml-3">
                {themeContext?.theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              </span>
            </button>
            <button
              onClick={authContext?.logout}
              className="flex items-center w-full px-4 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200 border border-red-200 dark:border-red-900/50"
              data-testid="logout-button"
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Overlay backdrop for mobile menu */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 z-10 md:hidden backdrop-blur-xs"
          />
        )}

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-60px)] md:min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
