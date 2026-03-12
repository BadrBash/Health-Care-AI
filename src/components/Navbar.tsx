import { Activity, Calendar, FileText, Home, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'diagnosis', label: 'Diagnosis', icon: Activity },
    { id: 'records', label: 'Records', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">HealthCare AI</span>
          </div>

          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <User className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
