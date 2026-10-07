import { Heart, Loader, AlertCircle, Plus, Trash2, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type HeartRateLog, type DailyGoals } from '../lib/supabaseClient';

export default function HeartRateMonitor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<HeartRateLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bpmInput, setBpmInput] = useState('');
  const [contextInput, setContextInput] = useState('resting');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [logRes, goalsRes] = await Promise.all([
        supabase.from('heart_rate_logs').select('*').order('logged_at', { ascending: false }).limit(20),
        supabase.from('daily_goals').select('*').limit(1).maybeSingle(),
      ]);

      if (logRes.error) throw logRes.error;
      if (goalsRes.error) throw goalsRes.error;

      setLogs(logRes.data ?? []);
      setGoals(goalsRes.data as DailyGoals | null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load heart rate data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const bpm = parseInt(bpmInput, 10);
    if (isNaN(bpm) || bpm < 30 || bpm > 220) return;

    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('heart_rate_logs').insert({
        bpm,
        context: contextInput,
      });
      if (insertError) throw insertError;
      setBpmInput('');
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save reading';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error: delError } = await supabase.from('heart_rate_logs').delete().eq('id', id);
      if (delError) throw delError;
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete reading';
      setError(msg);
    }
  }

  const minHr = goals?.min_heart_rate ?? 60;
  const maxHr = goals?.max_heart_rate ?? 100;
  const latest = logs[0];

  function zoneFor(bpm: number): { label: string; color: string } {
    if (bpm < minHr) return { label: 'Below target', color: 'text-amber-600 bg-amber-50' };
    if (bpm > maxHr + 40) return { label: 'Peak', color: 'text-red-600 bg-red-50' };
    if (bpm > maxHr) return { label: 'Elevated', color: 'text-orange-600 bg-orange-50' };
    return { label: 'Normal', color: 'text-green-600 bg-green-50' };
  }

  const chartData = logs.slice(0, 10).reverse();
  const maxBpm = Math.max(...chartData.map((l) => l.bpm), 120);
  const minBpm = Math.min(...chartData.map((l) => l.bpm), 50);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Heart Rate</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor your heartbeat</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">Log</span>
        </button>
      </div>

      {/* Current BPM large card */}
      <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12" />
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-white" fill="white" />
            <span className="text-white font-semibold text-sm">Current BPM</span>
          </div>
          {latest && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white">
              {zoneFor(latest.bpm).label}
            </span>
          )}
        </div>
        <div className="flex items-baseline space-x-2 relative">
          <span className="text-5xl font-bold text-white">{latest?.bpm ?? '—'}</span>
          <span className="text-white/80 text-sm">beats/min</span>
        </div>
        {latest && (
          <p className="text-white/70 text-xs mt-2 relative capitalize">
            {latest.context} · {new Date(latest.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Log New Reading</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Heart Rate (BPM)</label>
              <input
                type="number"
                value={bpmInput}
                onChange={(e) => setBpmInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g. 72"
                required
                min={30}
                max={220}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Context</label>
              <select
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="resting">Resting</option>
                <option value="walking">Walking</option>
                <option value="exercise">Exercise</option>
                <option value="post-workout">Post-Workout</option>
                <option value="sleeping">Sleeping</option>
                <option value="stressful">Stressful</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-300 transition-colors text-sm font-medium"
              >
                {submitting ? 'Saving...' : 'Save Reading'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <span>Recent Trend</span>
          </h3>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {chartData.map((log, i) => {
              const heightPct = ((log.bpm - minBpm + 10) / (maxBpm - minBpm + 10)) * 100;
              const zone = zoneFor(log.bpm);
              return (
                <div key={log.id} className="flex-1 flex flex-col items-center justify-end h-full" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="text-[10px] text-gray-400 mb-1">{log.bpm}</span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      zone.label === 'Normal' ? 'bg-green-400' : zone.label === 'Elevated' || zone.label === 'Peak' ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                    style={{ height: `${Math.max(heightPct, 10)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>Oldest</span>
            <span>Latest</span>
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">History</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No readings yet. Tap "Log" to add one.</div>
          ) : (
            logs.map((log) => {
              const zone = zoneFor(log.bpm);
              return (
                <div key={log.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${zone.color}`}>
                      <Heart className="w-4 h-4" fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{log.bpm} BPM</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {log.context} · {new Date(log.logged_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(log.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
