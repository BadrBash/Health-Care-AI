import { Calendar, Clock, TrendingUp, Users, Loader, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type Appointment } from '../lib/supabaseClient';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Appointments', value: '—', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Pending Reviews', value: '—', icon: Clock, color: 'bg-amber-500' },
    { label: 'Active Patients', value: '—', icon: Users, color: 'bg-green-500' },
    { label: 'Recovery Rate', value: '—', icon: TrendingUp, color: 'bg-teal-500' },
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [apptRes, patientRes, pendingRes, resolvedRes] = await Promise.all([
          supabase.from('appointments').select('*').order('appointment_date', { ascending: false }).limit(10),
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'upcoming'),
          supabase.from('diagnoses').select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
        ]);

        if (apptRes.error) throw apptRes.error;

        const totalAppts = (await supabase.from('appointments').select('*', { count: 'exact', head: true })).count ?? 0;
        const totalPatients = patientRes.count ?? 0;
        const pendingCount = pendingRes.count ?? 0;
        const resolvedCount = resolvedRes.count ?? 0;
        const recoveryRate = totalAppts > 0 ? Math.round((resolvedCount / totalAppts) * 100) : 0;

        setStats([
          { label: 'Total Appointments', value: String(totalAppts), icon: Calendar, color: 'bg-blue-500' },
          { label: 'Pending Reviews', value: String(pendingCount), icon: Clock, color: 'bg-amber-500' },
          { label: 'Active Patients', value: String(totalPatients), icon: Users, color: 'bg-green-500' },
          { label: 'Recovery Rate', value: `${recoveryRate}%`, icon: TrendingUp, color: 'bg-teal-500' },
        ]);
        setAppointments(apptRes.data ?? []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center space-x-3 text-red-600 bg-red-50 px-6 py-4 rounded-lg">
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

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
          {appointments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No appointments scheduled</div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.patient_name}</h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{appointment.appointment_time}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                          appointment.status === 'confirmed' || appointment.status === 'upcoming'
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
