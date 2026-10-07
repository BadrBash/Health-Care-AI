import { Bell, Loader, AlertCircle, CheckCircle, Save, Target, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, type DailyGoals } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [goalsId, setGoalsId] = useState<string | null>(null);
  const [goals, setGoals] = useState({
    step_goal: 10000,
    water_goal_ml: 2000,
    min_heart_rate: 60,
    max_heart_rate: 100,
  });

  const [notifications, setNotifications] = useState({
    waterReminders: true,
    stepGoals: true,
    heartAlerts: true,
    weeklyReport: false,
  });

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase.from('daily_goals').select('*').limit(1).maybeSingle();
      if (queryError) throw queryError;

      if (data) {
        const g = data as DailyGoals;
        setGoalsId(g.id);
        setGoals({
          step_goal: g.step_goal,
          water_goal_ml: g.water_goal_ml,
          min_heart_rate: g.min_heart_rate,
          max_heart_rate: g.max_heart_rate,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load settings';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoals({ ...goals, [e.target.name]: parseInt(e.target.value, 10) || 0 });
  };

  const handleNotificationChange = (key: string) => {
    setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      if (goalsId) {
        const { error: updateError } = await supabase
          .from('daily_goals')
          .update({ ...goals, updated_at: new Date().toISOString() })
          .eq('id', goalsId);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('daily_goals')
          .insert(goals)
          .select()
          .single();
        if (insertError) throw insertError;
        if (data) setGoalsId(data.id);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

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

      {saved && (
        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Settings saved</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your goals and preferences</p>
      </div>

      {/* User card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{user?.email}</p>
            <p className="text-sm text-gray-400">Member since {new Date(user?.created_at ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Daily Goals</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Daily Step Goal</label>
            <input
              type="number"
              name="step_goal"
              value={goals.step_goal}
              onChange={handleGoalChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Daily Water Goal (ml)</label>
            <input
              type="number"
              name="water_goal_ml"
              value={goals.water_goal_ml}
              onChange={handleGoalChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={0}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Heart Rate</label>
              <input
                type="number"
                name="min_heart_rate"
                value={goals.min_heart_rate}
                onChange={handleGoalChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Heart Rate</label>
              <input
                type="number"
                name="max_heart_rate"
                value={goals.max_heart_rate}
                onChange={handleGoalChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={60}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Notifications</h2>
        </div>

        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-medium text-gray-900 text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-xs text-gray-400">
                  {key === 'waterReminders' && 'Remind me to drink water'}
                  {key === 'stepGoals' && 'Alert me about step progress'}
                  {key === 'heartAlerts' && 'Warn about unusual heart rate'}
                  {key === 'weeklyReport' && 'Weekly health summary'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </>
        )}
      </button>

      {/* Sign out */}
      <button
        onClick={() => signOut()}
        className="w-full flex items-center justify-center space-x-2 border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
