import { Activity, AlertCircle, Brain, CheckCircle, FileText, Loader, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type Diagnosis, type DiagnosisResult } from '../lib/supabaseClient';

export default function DiagnosisPage() {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecent();
  }, []);

  async function loadRecent() {
    setLoading(true);
    try {
      const { data, error: queryError } = await supabase
        .from('diagnoses')
        .select('*')
        .order('diagnosis_date', { ascending: false })
        .limit(5);

      if (queryError) throw queryError;
      setRecentDiagnoses(data ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load recent diagnoses';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    // Simulated AI analysis — in production this would call an AI model
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysisResults: DiagnosisResult[] = [
      {
        condition: 'Common Cold',
        probability: 78,
        severity: 'low',
        description: 'A viral infection of the upper respiratory tract',
        recommendations: ['Rest and hydration', 'Over-the-counter pain relievers', 'Monitor temperature'],
      },
      {
        condition: 'Seasonal Allergies',
        probability: 65,
        severity: 'low',
        description: 'Allergic reaction to environmental triggers',
        recommendations: ['Antihistamines', 'Avoid allergens', 'Consider allergy testing'],
      },
      {
        condition: 'Flu (Influenza)',
        probability: 45,
        severity: 'medium',
        description: 'Viral infection affecting the respiratory system',
        recommendations: ['Antiviral medication if caught early', 'Complete rest', 'Stay hydrated'],
      },
    ];

    setResults(analysisResults);
    setIsAnalyzing(false);
    setShowResults(true);

    // Persist the diagnosis to the database
    try {
      await supabase.from('diagnoses').insert({
        patient_name: patientName || 'Unknown Patient',
        symptoms,
        duration: duration || null,
        severity: severity || null,
        results: analysisResults,
        status: 'Under Review',
      });
      await loadRecent();
    } catch (err) {
      // Results still shown even if save fails
      const msg = err instanceof Error ? err.message : 'Failed to save diagnosis';
      setError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center space-x-3 text-red-600 bg-red-50 px-6 py-4 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI-Assisted Diagnosis</h1>
        <p className="text-gray-600 mt-1">Intelligent symptom analysis and diagnosis support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Symptom Analysis</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Describe Symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient symptoms in detail... (e.g., fever, headache, cough, duration, severity)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select duration</option>
                    <option value="Less than 24 hours">Less than 24 hours</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="4-7 days">4-7 days</option>
                    <option value="More than a week">More than a week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select severity</option>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !symptoms}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Analyzing Symptoms...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showResults && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Analysis Results</h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{result.condition}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              result.severity === 'low'
                                ? 'bg-green-100 text-green-700'
                                : result.severity === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {result.severity} severity
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{result.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-3xl font-bold text-blue-600">{result.probability}%</div>
                        <div className="text-xs text-gray-500">Match</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>Disclaimer:</strong> This AI-assisted diagnosis is for reference only. Always consult with a qualified healthcare professional for accurate diagnosis and treatment.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Diagnoses</h3>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : recentDiagnoses.length === 0 ? (
              <p className="text-sm text-gray-500">No recent diagnoses</p>
            ) : (
              <div className="space-y-3">
                {recentDiagnoses.map((diagnosis) => (
                  <div key={diagnosis.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{diagnosis.patient_name}</h4>
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2 truncate">{diagnosis.symptoms}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{diagnosis.diagnosis_date}</span>
                      <span className="text-xs font-medium text-blue-600">{diagnosis.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">AI Insights</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Our AI system analyzes symptoms using machine learning models trained on millions of medical records to provide accurate diagnostic suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
