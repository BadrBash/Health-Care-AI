import { Activity, Download, Eye, FileText, Pill, Search, TestTube } from 'lucide-react';
import { useState } from 'react';

export default function Records() {
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);

  const medicalRecords = [
    {
      id: 1,
      patient: 'John Smith',
      date: '2024-03-12',
      type: 'Consultation',
      doctor: 'Dr. Sarah Wilson',
      diagnosis: 'Hypertension',
      prescription: 'Lisinopril 10mg daily',
      notes: 'Patient showing good response to treatment. Blood pressure within normal range.',
    },
    {
      id: 2,
      patient: 'Sarah Johnson',
      date: '2024-03-11',
      type: 'Lab Results',
      doctor: 'Dr. Michael Chen',
      diagnosis: 'Type 2 Diabetes',
      prescription: 'Metformin 500mg twice daily',
      notes: 'HbA1c levels improved. Continue current medication and dietary restrictions.',
    },
    {
      id: 3,
      patient: 'Michael Brown',
      date: '2024-03-10',
      type: 'Follow-up',
      doctor: 'Dr. Emily Davis',
      diagnosis: 'Migraine',
      prescription: 'Sumatriptan as needed',
      notes: 'Frequency of episodes reduced. Patient reports satisfaction with current treatment.',
    },
  ];

  const vitalSigns = [
    { label: 'Blood Pressure', value: '120/80 mmHg', status: 'normal' },
    { label: 'Heart Rate', value: '72 bpm', status: 'normal' },
    { label: 'Temperature', value: '98.6°F', status: 'normal' },
    { label: 'Oxygen Saturation', value: '98%', status: 'normal' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
        <p className="text-gray-600 mt-1">Access and manage patient medical history</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Patient Search</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name, ID, or condition..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Vital Signs</h3>
            <div className="space-y-4">
              {vitalSigns.map((vital, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{vital.label}</span>
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{vital.value}</div>
                  <span className="text-xs text-green-600 font-medium">{vital.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {medicalRecords.map((record) => (
                <div key={record.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-lg ${
                          record.type === 'Consultation'
                            ? 'bg-blue-100'
                            : record.type === 'Lab Results'
                            ? 'bg-teal-100'
                            : 'bg-amber-100'
                        }`}
                      >
                        {record.type === 'Consultation' ? (
                          <FileText
                            className={`w-6 h-6 ${
                              record.type === 'Consultation'
                                ? 'text-blue-600'
                                : record.type === 'Lab Results'
                                ? 'text-teal-600'
                                : 'text-amber-600'
                            }`}
                          />
                        ) : record.type === 'Lab Results' ? (
                          <TestTube
                            className={`w-6 h-6 ${
                              record.type === 'Consultation'
                                ? 'text-blue-600'
                                : record.type === 'Lab Results'
                                ? 'text-teal-600'
                                : 'text-amber-600'
                            }`}
                          />
                        ) : (
                          <Activity
                            className={`w-6 h-6 ${
                              record.type === 'Consultation'
                                ? 'text-blue-600'
                                : record.type === 'Lab Results'
                                ? 'text-teal-600'
                                : 'text-amber-600'
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{record.patient}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{record.type}</span>
                          <span>•</span>
                          <span>{record.date}</span>
                          <span>•</span>
                          <span>{record.doctor}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRecord(selectedRecord === record.id ? null : record.id)}
                      className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {selectedRecord === record.id ? 'Hide' : 'View'}
                      </span>
                    </button>
                  </div>

                  {selectedRecord === record.id && (
                    <div className="mt-4 p-5 bg-gray-50 rounded-lg space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Diagnosis</h4>
                        <p className="text-sm text-gray-700">{record.diagnosis}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <Pill className="w-4 h-4" />
                          <span>Prescription</span>
                        </h4>
                        <p className="text-sm text-gray-700">{record.prescription}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Clinical Notes</h4>
                        <p className="text-sm text-gray-700">{record.notes}</p>
                      </div>
                      <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Download Report
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          Share with Patient
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
