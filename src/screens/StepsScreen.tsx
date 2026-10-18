import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl, Alert, ViewStyle } from 'react-native';
import { Footprints, Plus, Trash2, Flame, MapPin } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { supabase, type StepLog, type DailyGoals } from '../lib/supabaseClient';
import { Colors } from '../theme/colors';

function ProgressRing({ progress, strokeDash, circumference }: { progress: number; strokeDash: number; circumference: number }) {
  return (
    <Svg style={styles.circleSvg} viewBox="0 0 160 160">
      <Defs>
        <LinearGradient id="stepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={Colors.primary} />
          <Stop offset="100%" stopColor={Colors.cyan} />
        </LinearGradient>
      </Defs>
      <Circle cx="80" cy="80" r="70" fill="none" stroke={Colors.gray200} strokeWidth={12} />
      <Circle
        cx="80"
        cy="80"
        r="70"
        fill="none"
        stroke="url(#stepGrad)"
        strokeWidth={12}
        strokeLinecap="round"
        strokeDasharray={`${strokeDash} ${circumference}`}
        rotation="-90"
        origin="80,80"
      />
    </Svg>
  );
}

export default function StepsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayLog, setTodayLog] = useState<StepLog | null>(null);
  const [history, setHistory] = useState<StepLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stepInput, setStepInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
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
      // silently handle on refresh
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

  const handleAdd = async () => {
    const steps = parseInt(stepInput, 10);
    if (isNaN(steps) || steps < 0) {
      Alert.alert('Invalid input', 'Please enter a valid number of steps.');
      return;
    }

    setSubmitting(true);
    try {
      const distanceMeters = Math.round(steps * 0.762);
      const calories = Math.round(steps * 0.04);

      if (todayLog) {
        const { error: updateError } = await supabase
          .from('step_logs')
          .update({
            steps: todayLog.steps + steps,
            distance_meters: todayLog.distance_meters + distanceMeters,
            calories: todayLog.calories + calories,
          })
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
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save steps');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete log', 'Remove this step log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error: delError } = await supabase.from('step_logs').delete().eq('id', id);
            if (delError) throw delError;
            await loadData();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  const stepGoal = goals?.step_goal ?? 10000;
  const currentSteps = todayLog?.steps ?? 0;
  const progress = Math.min((currentSteps / stepGoal) * 100, 100);
  const circumference = 2 * Math.PI * 70;
  const strokeDash = (progress / 100) * circumference;

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
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Steps</Text>
          <Text style={styles.subtitle}>Track your daily movement</Text>
        </View>
        <TouchableOpacity style={styles.logButton} onPress={() => setShowAddForm(true)}>
          <Plus size={18} color={Colors.white} />
          <Text style={styles.logButtonText}>Log</Text>
        </TouchableOpacity>
      </View>

      {/* Circular progress */}
      <View style={styles.circleCard}>
        <View style={styles.circleWrapper}>
          <ProgressRing progress={progress} strokeDash={strokeDash} circumference={circumference} />
          <View style={styles.circleInner}>
            <Footprints size={28} color={Colors.primary} />
            <Text style={styles.circleValue}>{currentSteps.toLocaleString()}</Text>
            <Text style={styles.circleGoal}>of {stepGoal.toLocaleString()}</Text>
          </View>
        </View>
        <Text style={styles.circleStatus}>
          {progress >= 100 ? 'Goal reached!' : `${Math.round(progress)}% of goal`}
        </Text>
      </View>

      {/* Quick stats */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.amberLight }]}>
            <Flame size={18} color={Colors.amber} />
          </View>
          <View>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{todayLog?.calories ?? 0}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.greenLight }]}>
            <MapPin size={18} color={Colors.green} />
          </View>
          <View>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              {todayLog ? `${(todayLog.distance_meters / 1000).toFixed(2)}km` : '0km'}
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly history */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last 7 Days</Text>
        <View style={styles.historyContainer}>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>No step data yet</Text>
          ) : (
            history.map((log) => {
              const logProgress = Math.min((log.steps / stepGoal) * 100, 100);
              const isToday = log.log_date === new Date().toISOString().split('T')[0];
              const dayName = new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <View key={log.id} style={styles.historyItem}>
                  <View style={styles.historyDay}>
                    <Text style={styles.historyDayName}>{dayName}</Text>
                    <Text style={styles.historyDate}>{new Date(log.log_date + 'T00:00:00').getDate()}</Text>
                  </View>
                  <View style={styles.historyBarArea}>
                    <View style={styles.historyBarRow}>
                      <Text style={styles.historySteps}>{log.steps.toLocaleString()}</Text>
                      <Text style={styles.historyPercent}>{Math.round(logProgress)}%</Text>
                    </View>
                    <View style={styles.historyBarBg}>
                      <View
                        style={[styles.historyBarFill, { width: `${logProgress}%`, backgroundColor: isToday ? Colors.primary : '#93c5fd' }]}
                      />
                    </View>
                  </View>
                  {!isToday && (
                    <TouchableOpacity onPress={() => handleDelete(log.id)} style={styles.deleteButton}>
                      <Trash2 size={14} color={Colors.gray300} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Add Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Steps</Text>

            <Text style={styles.inputLabel}>Number of Steps</Text>
            <TextInput
              style={styles.modalInput}
              value={stepInput}
              onChangeText={setStepInput}
              placeholder="e.g. 5000"
              placeholderTextColor={Colors.gray400}
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>Distance and calories are calculated automatically.</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => { setShowAddForm(false); setStepInput(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveButton, submitting && styles.modalSaveButtonDisabled]}
                onPress={handleAdd}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.modalSaveText}>Add Steps</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 4,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  circleCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.gray100,
    alignItems: 'center',
    marginBottom: 16,
  },
  circleWrapper: {
    width: 176,
    height: 176,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleSvg: {
    position: 'absolute',
    width: 176,
    height: 176,
  },
  circleInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginTop: 4,
  },
  circleGoal: {
    fontSize: 12,
    color: Colors.gray400,
  },
  circleStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray500,
    marginTop: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray400,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.gray900,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 14,
  },
  historyContainer: {
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray400,
    textAlign: 'center',
    paddingVertical: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyDay: {
    width: 44,
    alignItems: 'center',
  },
  historyDayName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray500,
  },
  historyDate: {
    fontSize: 10,
    color: Colors.gray300,
  },
  historyBarArea: {
    flex: 1,
  },
  historyBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historySteps: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray700,
  },
  historyPercent: {
    fontSize: 11,
    color: Colors.gray400,
  },
  historyBarBg: {
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  historyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  deleteButton: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray900,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray700,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.gray900,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: Colors.gray400,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.gray700,
    fontSize: 15,
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSaveButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  modalSaveText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
