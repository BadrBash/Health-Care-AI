import { useState } from 'react';
import BottomNav from './components/BottomNav';
import HealthDashboard from './components/HealthDashboard';
import HeartRateMonitor from './components/HeartRateMonitor';
import StepTracker from './components/StepTracker';
import WaterReminder from './components/WaterReminder';
import Profile from './components/Profile';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './lib/auth';
import { Loader } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HealthDashboard />;
      case 'heart':
        return <HeartRateMonitor />;
      case 'steps':
        return <StepTracker />;
      case 'water':
        return <WaterReminder />;
      case 'profile':
        return <Profile />;
      default:
        return <HealthDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 pt-6 pb-24 min-h-screen">
        {renderContent()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
