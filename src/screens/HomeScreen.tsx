import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Heart, Footprints, Droplet, Flame, MapPin, TrendingUp } from 'lucide-react-native';
import { supabase, type HeartRateLog, type StepLog, type WaterLog, type DailyGoals } from '../lib/supabaseClient';
import { Colors } from '../theme/colors';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [latestHeart, setLatestHeart] = useState<HeartRateLog | null>(null);
  const [todaySteps, setTodaySteps] = useState<StepLog | null>(null);
  const [todayWater, setTodayWater] = useState<WaterLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);

  const loadData = useCallback(async () => {
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
      // silently fail on refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

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

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Today's Health</Text>
        <Text style={styles.date}>{formatDate()}</Text>
      </View>

      {/* Heart Rate Card */}
      <View style={styles.heartCard}>
        <View style={styles.heartCardTop}>
          <View style={styles.heartCardLabel}>
            <Heart size={18} color={Colors.white} fill={Colors.white} />
            <Text style={styles.heartCardLabelText}>Heart Rate</Text>
          </View>
          <View style={styles.heartBadge}>
            <Text style={styles.heartBadgeText}>{heartStatus}</Text>
          </View>
        </View>
        <View style={styles.heartBpmRow}>
          <Text style={styles.heartBpm}>{latestHeart?.bpm ?? '—'}</Text>
          <Text style={styles.heartBpmUnit}>BPM</Text>
        </View>
        {latestHeart && (
          <Text style={styles.heartContext}>
            {latestHeart.context} · {new Date(latestHeart.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {/* Steps + Water side by side */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight }]}>
              <Footprints size={16} color={Colors.primary} />
            </View>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <Text style={styles.statValue}>{todaySteps?.steps.toLocaleString() ?? '0'}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${stepProgress}%`, backgroundColor: Colors.primary }]} />
          </View>
          <Text style={styles.statGoal}>Goal: {stepGoal.toLocaleString()}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statCardHeader}>
            <View style={[styles.statIcon, { backgroundColor: Colors.cyanLight }]}>
              <Droplet size={16} color={Colors.cyan} />
            </View>
            <Text style={styles.statLabel}>Water</Text>
          </View>
          <Text style={styles.statValue}>
            {totalWaterMl >= 1000 ? `${(totalWaterMl / 1000).toFixed(1)}L` : `${totalWaterMl}ml`}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${waterProgress}%`, backgroundColor: Colors.cyan }]} />
          </View>
          <Text style={styles.statGoal}>
            Goal: {waterGoal >= 1000 ? `${(waterGoal / 1000).toFixed(1)}L` : `${waterGoal}ml`}
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <TrendingUp size={16} color={Colors.gray400} />
          <Text style={styles.summaryTitle}>Today's Summary</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.greenLight }]}>
              <MapPin size={16} color={Colors.green} />
            </View>
            <Text style={styles.summaryLabel}>Distance</Text>
            <Text style={styles.summaryValue}>
              {todaySteps ? `${(todaySteps.distance_meters / 1000).toFixed(2)}km` : '0km'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.amberLight }]}>
              <Flame size={16} color={Colors.amber} />
            </View>
            <Text style={styles.summaryLabel}>Calories</Text>
            <Text style={styles.summaryValue}>{todaySteps?.calories ?? 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: Colors.cyanLight }]}>
              <Droplet size={16} color={Colors.cyan} />
            </View>
            <Text style={styles.summaryLabel}>Glasses</Text>
            <Text style={styles.summaryValue}>{Math.round(totalWaterMl / 250)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  date: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 4,
  },
  heartCard: {
    backgroundColor: Colors.red,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  heartCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heartCardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heartCardLabelText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  heartBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  heartBpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  heartBpm: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
  },
  heartBpmUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  heartContext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.gray700,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statGoal: {
    fontSize: 11,
    color: Colors.gray400,
    marginTop: 6,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.gray400,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginTop: 2,
  },
});
