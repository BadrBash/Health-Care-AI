import { Activity, Download, Eye, FileText, Pill, Search, TestTube, Loader, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type MedicalRecord, type VitalSign } from '../lib/supabaseClient';

export default function Records() {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [recRes, vitRes] = await Promise.all([
        supabase.from('medical_records').select('*').order('record_date', { ascending: false }),
        supabase.from('vital_signs').select('*').order('recorded_at', { ascending: false }),
      ]);

      if (recRes.error) throw recRes.error;
      if (vitRes.error) throw vitRes.error;

      setRecords(recRes.data ?? []);
      setVitals(vitRes.data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load medical records';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.patient_name.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q) ||
      r.doctor_name.toLowerCase().includes(q)
    );
  });

  const latestVitals = vitals[0];

  const vitalDisplay = latestVitals
    ? [
        { label: 'Blood Pressure', value: latestVitals.blood_pressure ?? '—', status: latestVitals.status },
        { label: 'Heart Rate', value: latestVitals.heart_rate ?? '—', status: latestVitals.status },
        { label: 'Temperature', value: latestVitals.temperature ?? '—', status: latestVitals.status },
        { label: 'Oxygen Saturation', value: latestVitals.oxygen_saturation ?? '—', status: latestVitals.status },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center space-x-3 text-red-600 bg-red-50 px-6 py-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

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
            placeholder="Search by patient name, condition, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Vital Signs{latestVitals ? ` — ${latestVitals.patient_name}` : ''}
            </h3>
            {vitalDisplay.length === 0 ? (
              <p className="text-sm text-gray-500">No vital signs recorded yet</p>
            ) : (
              <div className="space-y-4">
                {vitalDisplay.map((vital, index) => (
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
            )}
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
              {filteredRecords.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No medical records found</div>
              ) : (
                filteredRecords.map((record) => (
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
                            <FileText className="w-6 h-6 text-blue-600" />
                          ) : record.type === 'Lab Results' ? (
                            <TestTube className="w-6 h-6 text-teal-600" />
                          ) : (
                            <Activity className="w-6 h-6 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{record.patient_name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{record.type}</span>
                            <span>•</span>
                            <span>{record.record_date}</span>
                            <span>•</span>
                            <span>{record.doctor_name}</span>
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
                          <p className="text-sm text-gray-700">{record.diagnosis ?? 'No diagnosis recorded'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                            <Pill className="w-4 h-4" />
                            <span>Prescription</span>
                          </h4>
                          <p className="text-sm text-gray-700">{record.prescription ?? 'No prescription recorded'}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Clinical Notes</h4>
                          <p className="text-sm text-gray-700">{record.notes ?? 'No notes recorded'}</p>
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
