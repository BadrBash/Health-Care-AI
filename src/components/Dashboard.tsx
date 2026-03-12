import { Calendar, Clock, TrendingUp, Users } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Appointments', value: '24', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Pending Reviews', value: '8', icon: Clock, color: 'bg-amber-500' },
    { label: 'Active Patients', value: '156', icon: Users, color: 'bg-green-500' },
    { label: 'Recovery Rate', value: '94%', icon: TrendingUp, color: 'bg-teal-500' },
  ];

  const upcomingAppointments = [
    { id: 1, patient: 'John Smith', time: '10:00 AM', type: 'Check-up', status: 'confirmed' },
    { id: 2, patient: 'Sarah Johnson', time: '11:30 AM', type: 'Consultation', status: 'pending' },
    { id: 3, patient: 'Michael Brown', time: '2:00 PM', type: 'Follow-up', status: 'confirmed' },
    { id: 4, patient: 'Emily Davis', time: '3:30 PM', type: 'Diagnosis', status: 'confirmed' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{appointment.patient}</h3>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
