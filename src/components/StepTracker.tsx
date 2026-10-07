import { Footprints, Loader, AlertCircle, Plus, Trash2, Flame, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type StepLog, type DailyGoals } from '../lib/supabaseClient';

export default function StepTracker() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayLog, setTodayLog] = useState<StepLog | null>(null);
  const [history, setHistory] = useState<StepLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stepInput, setStepInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [todayRes, histRes, goalsRes] = await Promise.all([
        supabase.from('step_logs').select('*').eq('log_date', today).maybeSingle(),
        supabase.from('step_logs').select('*').order('log_date', { ascending: false }).limit(7),
        supabase.from('daily_goals').select('*').limit(1).maybeSingle(),
      ]);

      if (todayRes.error) throw todayRes.error;
      if (histRes.error) throw histRes.error;
      if (goalsRes.error) throw goalsRes.error;

      setTodayLog(todayRes.data as StepLog | null);
      setHistory(histRes.data ?? []);
      setGoals(goalsRes.data as DailyGoals | null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load step data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const steps = parseInt(stepInput, 10);
    if (isNaN(steps) || steps < 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const distanceMeters = Math.round(steps * 0.762);
      const calories = Math.round(steps * 0.04);

      if (todayLog) {
        const { error: updateError } = await supabase
          .from('step_logs')
          .update({ steps: todayLog.steps + steps, distance_meters: todayLog.distance_meters + distanceMeters, calories: todayLog.calories + calories })
          .eq('id', todayLog.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('step_logs').insert({
          steps,
          distance_meters: distanceMeters,
          calories,
          log_date: new Date().toISOString().split('T')[0],
        });
        if (insertError) throw insertError;
      }

      setStepInput('');
      setShowAddForm(false);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save steps';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error: delError } = await supabase.from('step_logs').delete().eq('id', id);
      if (delError) throw delError;
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete log';
      setError(msg);
    }
  }

  const stepGoal = goals?.step_goal ?? 10000;
  const currentSteps = todayLog?.steps ?? 0;
  const progress = Math.min((currentSteps / stepGoal) * 100, 100);
  const circumference = 2 * Math.PI * 70;
  const strokeDash = (progress / 100) * circumference;

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
          <h1 className="text-2xl font-bold text-gray-900">Steps</h1>
          <p className="text-gray-500 text-sm mt-1">Track your daily movement</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">Log</span>
        </button>
      </div>

      {/* Circular progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="12" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#stepGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="stepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Footprints className="w-7 h-7 text-blue-500 mb-1" />
            <span className="text-3xl font-bold text-gray-900">{currentSteps.toLocaleString()}</span>
            <span className="text-xs text-gray-400">of {stepGoal.toLocaleString()}</span>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-500">
          {progress >= 100 ? 'Goal reached! ' : `${Math.round(progress)}% of goal`}
        </p>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Add Steps</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of Steps</label>
              <input
                type="number"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 5000"
                required
                min={0}
              />
            </div>
            <p className="text-xs text-gray-400">Distance and calories are calculated automatically.</p>
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
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors text-sm font-medium"
              >
                {submitting ? 'Saving...' : 'Add Steps'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-2.5 bg-orange-100 rounded-xl">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Calories</p>
            <p className="text-lg font-bold text-gray-900">{todayLog?.calories ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-2.5 bg-green-100 rounded-xl">
            <MapPin className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Distance</p>
            <p className="text-lg font-bold text-gray-900">
              {todayLog ? `${(todayLog.distance_meters / 1000).toFixed(2)}km` : '0km'}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly history */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Last 7 Days</h3>
        </div>
        <div className="p-4 space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">No step data yet</p>
          ) : (
            history.map((log) => {
              const logProgress = Math.min((log.steps / stepGoal) * 100, 100);
              const isToday = log.log_date === new Date().toISOString().split('T')[0];
              return (
                <div key={log.id} className="flex items-center space-x-3 group">
                  <div className="w-12 text-center flex-shrink-0">
                    <p className="text-xs font-medium text-gray-500">
                      {new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {new Date(log.log_date + 'T00:00:00').getDate()}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">{log.steps.toLocaleString()}</span>
                      <span className="text-xs text-gray-400">{Math.round(logProgress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isToday ? 'bg-blue-500' : 'bg-blue-300'}`}
                        style={{ width: `${logProgress}%` }}
                      />
                    </div>
                  </div>
                  {!isToday && (
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
