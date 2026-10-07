import { Droplet, Footprints, Heart, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type HeartRateLog, type StepLog, type WaterLog, type DailyGoals } from '../lib/supabaseClient';

export default function HealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestHeart, setLatestHeart] = useState<HeartRateLog | null>(null);
  const [todaySteps, setTodaySteps] = useState<StepLog | null>(null);
  const [todayWater, setTodayWater] = useState<WaterLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];

      const [heartRes, stepsRes, waterRes, goalsRes] = await Promise.all([
        supabase.from('heart_rate_logs').select('*').order('logged_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('step_logs').select('*').eq('log_date', today).maybeSingle(),
        supabase.from('water_logs').select('*').gte('logged_at', `${today}T00:00:00`),
        supabase.from('daily_goals').select('*').limit(1).maybeSingle(),
      ]);

      if (heartRes.error) throw heartRes.error;
      if (stepsRes.error) throw stepsRes.error;
      if (waterRes.error) throw waterRes.error;
      if (goalsRes.error) throw goalsRes.error;

      setLatestHeart(heartRes.data as HeartRateLog | null);
      setTodaySteps(stepsRes.data as StepLog | null);
      setTodayWater((waterRes.data as WaterLog[]) ?? []);
      setGoals(goalsRes.data as DailyGoals | null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load health data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const totalWaterMl = todayWater.reduce((sum, w) => sum + w.amount_ml, 0);
  const stepGoal = goals?.step_goal ?? 10000;
  const waterGoal = goals?.water_goal_ml ?? 2000;
  const minHr = goals?.min_heart_rate ?? 60;
  const maxHr = goals?.max_heart_rate ?? 100;

  const stepProgress = todaySteps ? Math.min((todaySteps.steps / stepGoal) * 100, 100) : 0;
  const waterProgress = Math.min((totalWaterMl / waterGoal) * 100, 100);

  const heartStatus =
    latestHeart == null
      ? 'No data'
      : latestHeart.bpm < minHr
      ? 'Low'
      : latestHeart.bpm > maxHr
      ? 'High'
      : 'Normal';

  const heartColor =
    heartStatus === 'Normal' ? 'text-green-600' : heartStatus === 'High' ? 'text-red-600' : heartStatus === 'Low' ? 'text-amber-600' : 'text-gray-500';

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

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today's Health</h1>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Heart Rate Card */}
      <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-white" fill="white" />
            <span className="text-white font-semibold text-sm">Heart Rate</span>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white`}>
            {heartStatus}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-white">{latestHeart?.bpm ?? '—'}</span>
          <span className="text-white/80 text-sm">BPM</span>
        </div>
        {latestHeart && (
          <p className="text-white/70 text-xs mt-2 capitalize">{latestHeart.context} · {new Date(latestHeart.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        )}
      </div>

      {/* Steps + Water side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Steps */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Footprints className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm">Steps</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{todaySteps?.steps.toLocaleString() ?? '0'}</div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${stepProgress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Goal: {stepGoal.toLocaleString()}</p>
        </div>

        {/* Water */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 bg-cyan-100 rounded-lg">
              <Droplet className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm">Water</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalWaterMl >= 1000 ? `${(totalWaterMl / 1000).toFixed(1)}L` : `${totalWaterMl}ml`}
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${waterProgress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Goal: {waterGoal >= 1000 ? `${(waterGoal / 1000).toFixed(1)}L` : `${waterGoal}ml`}</p>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span>Today's Summary</span>
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Distance</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {todaySteps ? `${(todaySteps.distance_meters / 1000).toFixed(2)}km` : '0km'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Calories</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{todaySteps?.calories ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Glasses</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{Math.round(totalWaterMl / 250)}</p>
          </div>
        </div>
      </div>

      {/* Heart rate zone indicator */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Heart Rate Zone</h3>
        <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-cyan-400 via-green-400 via-amber-400 to-red-400">
          {latestHeart && (
            <div
              className="absolute top-0 w-1 h-full bg-gray-800 rounded-full"
              style={{ left: `${Math.min(Math.max((latestHeart.bpm / 180) * 100, 0), 100)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{minHr} BPM</span>
          <span className={heartColor}>Current: {latestHeart?.bpm ?? '—'}</span>
          <span>180 BPM</span>
        </div>
      </div>
    </div>
  );
}
