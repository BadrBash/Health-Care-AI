import { Droplet, Loader, AlertCircle, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type WaterLog, type DailyGoals } from '../lib/supabaseClient';

const GLASS_ML = 250;

export default function WaterReminder() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customMl, setCustomMl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [waterRes, goalsRes] = await Promise.all([
        supabase.from('water_logs').select('*').gte('logged_at', `${today}T00:00:00`).order('logged_at', { ascending: false }),
        supabase.from('daily_goals').select('*').limit(1).maybeSingle(),
      ]);

      if (waterRes.error) throw waterRes.error;
      if (goalsRes.error) throw goalsRes.error;

      setLogs(waterRes.data ?? []);
      setGoals(goalsRes.data as DailyGoals | null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load water data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function addWater(amount: number) {
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('water_logs').insert({ amount_ml: amount });
      if (insertError) throw insertError;
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to log water';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCustom(e: React.FormEvent) {
    e.preventDefault();
    const ml = parseInt(customMl, 10);
    if (isNaN(ml) || ml <= 0) return;
    await addWater(ml);
    setCustomMl('');
    setShowCustom(false);
  }

  async function handleDelete(id: string) {
    try {
      const { error: delError } = await supabase.from('water_logs').delete().eq('id', id);
      if (delError) throw delError;
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(msg);
    }
  }

  const waterGoal = goals?.water_goal_ml ?? 2000;
  const totalMl = logs.reduce((sum, w) => sum + w.amount_ml, 0);
  const glasses = Math.floor(totalMl / GLASS_ML);
  const goalGlasses = Math.ceil(waterGoal / GLASS_ML);
  const progress = Math.min((totalMl / waterGoal) * 100, 100);
  const remaining = Math.max(waterGoal - totalMl, 0);

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
          <h1 className="text-2xl font-bold text-gray-900">Water</h1>
          <p className="text-gray-500 text-sm mt-1">Stay hydrated throughout the day</p>
        </div>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center space-x-1.5 bg-cyan-500 text-white px-4 py-2.5 rounded-xl hover:bg-cyan-600 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">Custom</span>
        </button>
      </div>

      {/* Progress card */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Droplet className="w-5 h-5 text-white" fill="white" />
              <span className="text-white font-semibold text-sm">Today's Intake</span>
            </div>
            {progress >= 100 && (
              <span className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white">
                <CheckCircle className="w-3 h-3" />
                Goal reached!
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-white">
              {totalMl >= 1000 ? `${(totalMl / 1000).toFixed(1)}L` : `${totalMl}ml`}
            </span>
            <span className="text-white/70 text-sm">/ {waterGoal >= 1000 ? `${(waterGoal / 1000).toFixed(1)}L` : `${waterGoal}ml`}</span>
          </div>
          <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          {remaining > 0 ? (
            <p className="text-white/80 text-xs mt-2">
              {remaining >= 1000 ? `${(remaining / 1000).toFixed(1)}L` : `${remaining}ml`} to go — keep drinking!
            </p>
          ) : (
            <p className="text-white/80 text-xs mt-2">You've hit your daily goal. Great job!</p>
          )}
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="grid grid-cols-4 gap-3">
        {[250, 500, 750, 1000].map((amt) => (
          <button
            key={amt}
            onClick={() => addWater(amt)}
            disabled={submitting}
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center mb-1.5">
              <Droplet className="w-5 h-5 text-cyan-600" fill="currentColor" />
            </div>
            <span className="text-xs font-semibold text-gray-700">{amt >= 1000 ? `${amt / 1000}L` : `${amt}ml`}</span>
          </button>
        ))}
      </div>

      {/* Custom amount form */}
      {showCustom && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <form onSubmit={handleCustom} className="flex space-x-3">
            <input
              type="number"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Amount in ml"
              required
              min={1}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 disabled:bg-gray-300 transition-colors text-sm font-medium"
            >
              Add
            </button>
          </form>
        </div>
      )}

      {/* Glass tracker */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Glass Tracker ({glasses}/{goalGlasses})</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: goalGlasses }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-10 rounded-lg rounded-b-xl border-2 transition-all ${
                i < glasses
                  ? 'bg-gradient-to-b from-cyan-400 to-blue-500 border-cyan-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
              style={{ clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)' }}
            />
          ))}
        </div>
      </div>

      {/* Today's log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Today's Log</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No water logged yet. Tap a quick-add button above.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <Droplet className="w-4 h-4 text-cyan-600" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {log.amount_ml >= 1000 ? `${(log.amount_ml / 1000).toFixed(1)}L` : `${log.amount_ml}ml`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(log.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
