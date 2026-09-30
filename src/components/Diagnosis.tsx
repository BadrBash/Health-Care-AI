import { Activity, AlertCircle, Brain, CheckCircle, FileText, Loader, Search } from 'lucide-react';
import { useState } from 'react';

export default function Diagnosis() {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  const diagnosisResults = [
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

  const recentDiagnoses = [
    { id: 1, patient: 'John Smith', date: '2024-03-12', condition: 'Hypertension', status: 'Under Treatment' },
    { id: 2, patient: 'Sarah Johnson', date: '2024-03-11', condition: 'Type 2 Diabetes', status: 'Monitoring' },
    { id: 3, patient: 'Michael Brown', date: '2024-03-10', condition: 'Migraine', status: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Information
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patient by name or ID..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Symptoms
                </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Select duration</option>
                    <option>Less than 24 hours</option>
                    <option>1-3 days</option>
                    <option>4-7 days</option>
                    <option>More than a week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Select severity</option>
                    <option>Mild</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                    <option>Critical</option>
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
                {diagnosisResults.map((result, index) => (
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
            <div className="space-y-3">
              {recentDiagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{diagnosis.patient}</h4>
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{diagnosis.condition}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{diagnosis.date}</span>
                    <span className="text-xs font-medium text-blue-600">{diagnosis.status}</span>
                  </div>
                </div>
              ))}
            </div>
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
