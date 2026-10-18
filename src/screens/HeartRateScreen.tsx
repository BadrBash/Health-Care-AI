import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Heart, Plus, Trash2, Activity, AlertCircle } from 'lucide-react-native';
import { supabase, type HeartRateLog, type DailyGoals } from '../lib/supabaseClient';
import { Colors } from '../theme/colors';

export default function HeartRateScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<HeartRateLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bpmInput, setBpmInput] = useState('');
  const [contextInput, setContextInput] = useState('resting');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
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
    const bpm = parseInt(bpmInput, 10);
    if (isNaN(bpm) || bpm < 30 || bpm > 220) {
      Alert.alert('Invalid input', 'Please enter a heart rate between 30 and 220 BPM.');
      return;
    }

    setSubmitting(true);
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
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save reading');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete reading', 'Remove this heart rate log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error: delError } = await supabase.from('heart_rate_logs').delete().eq('id', id);
            if (delError) throw delError;
            await loadData();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  const minHr = goals?.min_heart_rate ?? 60;
  const maxHr = goals?.max_heart_rate ?? 100;
  const latest = logs[0];

  const zoneFor = (bpm: number): { label: string; color: string; bg: string } => {
    if (bpm < minHr) return { label: 'Below target', color: Colors.amber, bg: Colors.amberLight };
    if (bpm > maxHr + 40) return { label: 'Peak', color: Colors.red, bg: Colors.redLight };
    if (bpm > maxHr) return { label: 'Elevated', color: Colors.orange, bg: '#fff7ed' };
    return { label: 'Normal', color: Colors.green, bg: Colors.greenLight };
  };

  const chartData = logs.slice(0, 10).reverse();
  const maxBpm = Math.max(...chartData.map((l) => l.bpm), 120);
  const minBpm = Math.min(...chartData.map((l) => l.bpm), 50);

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
          <Text style={styles.title}>Heart Rate</Text>
          <Text style={styles.subtitle}>Monitor your heartbeat</Text>
        </View>
        <TouchableOpacity style={styles.logButton} onPress={() => setShowAddForm(true)}>
          <Plus size={18} color={Colors.white} />
          <Text style={styles.logButtonText}>Log</Text>
        </TouchableOpacity>
      </View>

      {/* Current BPM card */}
      <View style={styles.heartCard}>
        <View style={styles.heartCardTop}>
          <View style={styles.heartCardLabel}>
            <Heart size={18} color={Colors.white} fill={Colors.white} />
            <Text style={styles.heartCardLabelText}>Current BPM</Text>
          </View>
          {latest && (
            <View style={styles.heartBadge}>
              <Text style={styles.heartBadgeText}>{zoneFor(latest.bpm).label}</Text>
            </View>
          )}
        </View>
        <View style={styles.heartBpmRow}>
          <Text style={styles.heartBpm}>{latest?.bpm ?? '—'}</Text>
          <Text style={styles.heartBpmUnit}>beats/min</Text>
        </View>
        {latest && (
          <Text style={styles.heartContext}>
            {latest.context} · {new Date(latest.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>

      {/* Chart */}
      {chartData.length > 1 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Activity size={16} color={Colors.gray400} />
            <Text style={styles.cardTitle}>Recent Trend</Text>
          </View>
          <View style={styles.chartContainer}>
            {chartData.map((log) => {
              const heightPct = ((log.bpm - minBpm + 10) / (maxBpm - minBpm + 10)) * 100;
              const zone = zoneFor(log.bpm);
              const barColor = zone.label === 'Normal' ? Colors.green : zone.label === 'Elevated' || zone.label === 'Peak' ? Colors.red : Colors.amber;
              return (
                <View key={log.id} style={styles.chartBarWrapper}>
                  <Text style={styles.chartBarLabel}>{log.bpm}</Text>
                  <View style={[styles.chartBar, { height: `${Math.max(heightPct, 10)}%`, backgroundColor: barColor }]} />
                </View>
              );
            })}
          </View>
          <View style={styles.chartFooter}>
            <Text style={styles.chartFooterText}>Oldest</Text>
            <Text style={styles.chartFooterText}>Latest</Text>
          </View>
        </View>
      )}

      {/* History */}
      <View style={styles.card}>
        <View style={styles.historyHeader}>
          <Text style={styles.cardTitle}>History</Text>
        </View>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No readings yet. Tap "Log" to add one.</Text>
        ) : (
          logs.map((log) => {
            const zone = zoneFor(log.bpm);
            return (
              <View key={log.id} style={styles.historyItem}>
                <View style={styles.historyItemLeft}>
                  <View style={[styles.historyIcon, { backgroundColor: zone.bg }]}>
                    <Heart size={14} color={zone.color} fill={zone.color} />
                  </View>
                  <View>
                    <Text style={styles.historyBpm}>{log.bpm} BPM</Text>
                    <Text style={historyContextStyle}>
                      {log.context} · {new Date(log.logged_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(log.id)} style={styles.deleteButton}>
                  <Trash2 size={16} color={Colors.gray300} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>

      {/* Add Modal */}
      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log New Reading</Text>

            <Text style={styles.inputLabel}>Heart Rate (BPM)</Text>
            <TextInput
              style={styles.modalInput}
              value={bpmInput}
              onChangeText={setBpmInput}
              placeholder="e.g. 72"
              placeholderTextColor={Colors.gray400}
              keyboardType="number-pad"
            />

            <Text style={styles.inputLabel}>Context</Text>
            <View style={styles.contextRow}>
              {['resting', 'walking', 'exercise', 'post-workout', 'sleeping', 'stressful'].map((ctx) => (
                <TouchableOpacity
                  key={ctx}
 style={[styles.contextChip, contextInput === ctx && styles.contextChipActive]}
                  onPress={() => setContextInput(ctx)}
                >
                  <Text style={[styles.contextChipText, contextInput === ctx && styles.contextChipTextActive]}>
                    {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => { setShowAddForm(false); setBpmInput(''); }}
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
                  <Text style={styles.modalSaveText}>Save Reading</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const historyContextStyle = {
  fontSize: 12,
  color: Colors.gray400,
  textTransform: 'capitalize' as const,
};

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
    backgroundColor: Colors.red,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  heartCard: {
    backgroundColor: Colors.red,
    borderRadius: 20,
    padding: 24,
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
    fontSize: 42,
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    gap: 4,
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  chartBarLabel: {
    fontSize: 9,
    color: Colors.gray400,
    marginBottom: 3,
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  chartFooterText: {
    fontSize: 10,
    color: Colors.gray400,
  },
  historyHeader: {
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBpm: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray900,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray400,
    textAlign: 'center',
    paddingVertical: 24,
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
    marginBottom: 16,
  },
  contextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  contextChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
  },
  contextChipActive: {
    borderColor: Colors.red,
    backgroundColor: Colors.redLight,
  },
  contextChipText: {
    fontSize: 13,
    color: Colors.gray600,
  },
  contextChipTextActive: {
    color: Colors.red,
    fontWeight: '600',
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
    backgroundColor: Colors.red,
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
