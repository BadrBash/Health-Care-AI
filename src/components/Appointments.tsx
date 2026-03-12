import { Calendar, Clock, MapPin, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function Appointments() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    date: '',
    time: '',
    type: '',
    doctor: '',
    notes: '',
  });

  const appointments = [
    { id: 1, patient: 'John Smith', date: '2024-03-15', time: '10:00 AM', doctor: 'Dr. Sarah Wilson', type: 'Check-up', status: 'upcoming' },
    { id: 2, patient: 'Sarah Johnson', date: '2024-03-15', time: '11:30 AM', doctor: 'Dr. Michael Chen', type: 'Consultation', status: 'upcoming' },
    { id: 3, patient: 'Michael Brown', date: '2024-03-14', time: '2:00 PM', doctor: 'Dr. Emily Davis', type: 'Follow-up', status: 'completed' },
    { id: 4, patient: 'Emily Davis', date: '2024-03-16', time: '3:30 PM', doctor: 'Dr. Sarah Wilson', type: 'Diagnosis', status: 'upcoming' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking appointment:', formData);
    setShowBookingForm(false);
    setFormData({ patientName: '', date: '', time: '', type: '', doctor: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage and schedule patient appointments</p>
        </div>
        <button
          onClick={() => setShowBookingForm(!showBookingForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">New Appointment</span>
        </button>
      </div>

      {showBookingForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Book New Appointment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select type</option>
                  <option value="checkup">Regular Check-up</option>
                  <option value="consultation">Consultation</option>
                  <option value="followup">Follow-up</option>
                  <option value="diagnosis">Diagnosis</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select doctor</option>
                  <option value="dr-wilson">Dr. Sarah Wilson</option>
                  <option value="dr-chen">Dr. Michael Chen</option>
                  <option value="dr-davis">Dr. Emily Davis</option>
                  <option value="dr-johnson">Dr. Robert Johnson</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requirements or notes..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">All Appointments</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">{appointment.patient}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{appointment.doctor}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    View
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
