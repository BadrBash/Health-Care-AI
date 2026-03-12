import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Appointments from './components/Appointments';
import Diagnosis from './components/Diagnosis';
import Records from './components/Records';
import Profile from './components/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'appointments':
        return <Appointments />;
      case 'diagnosis':
        return <Diagnosis />;
        case 'records':
        return <Records />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
