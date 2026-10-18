import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Droplet, Plus, Trash2, CheckCircle } from 'lucide-react-native';
import { supabase, type WaterLog, type DailyGoals } from '../lib/supabaseClient';
import { Colors } from '../theme/colors';

const GLASS_ML = 250;

export default function WaterScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customMl, setCustomMl] = useState('');

  const loadData = useCallback(async () => {
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

  const addWater = async (amount: number) => {
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from('water_logs').insert({ amount_ml: amount });
      if (insertError) throw insertError;
      await loadData();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to log water');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustom = async () => {
    const ml = parseInt(customMl, 10);
    if (isNaN(ml) || ml <= 0) {
      Alert.alert('Invalid input', 'Please enter a valid amount.');
      return;
    }
    await addWater(ml);
    setCustomMl('');
    setShowCustom(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete entry', 'Remove this water log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error: delError } = await supabase.from('water_logs').delete().eq('id', id);
            if (delError) throw delError;
            await loadData();
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  const waterGoal = goals?.water_goal_ml ?? 2000;
  const totalMl = logs.reduce((sum, w) => sum + w.amount_ml, 0);
  const glasses = Math.floor(totalMl / GLASS_ML);
  const goalGlasses = Math.ceil(waterGoal / GLASS_ML);
  const progress = Math.min((totalMl / waterGoal) * 100, 100);
  const remaining = Math.max(waterGoal - totalMl, 0);

  const formatMl = (ml: number) => (ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`);

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
          <Text style={styles.title}>Water</Text>
          <Text style={styles.subtitle}>Stay hydrated throughout the day</Text>
        </View>
        <TouchableOpacity style={styles.logButton} onPress={() => setShowCustom(!showCustom)}>
          <Plus size={18} color={Colors.white} />
          <Text style={styles.logButtonText}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Progress card */}
      <View style={styles.waterCard}>
        <View style={styles.waterCardTop}>
          <View style={styles.waterCardLabel}>
            <Droplet size={18} color={Colors.white} fill={Colors.white} />
            <Text style={styles.waterCardLabelText}>Today's Intake</Text>
          </View>
          {progress >= 100 && (
            <View style={styles.waterBadge}>
              <CheckCircle size={12} color={Colors.white} />
              <Text style={styles.waterBadgeText}>Goal reached!</Text>
            </View>
          )}
        </View>
        <View style={styles.waterAmountRow}>
          <Text style={styles.waterAmount}>{formatMl(totalMl)}</Text>
          <Text style={styles.waterAmountGoal}>/ {formatMl(waterGoal)}</Text>
        </View>
        <View style={styles.waterProgressBar}>
          <View style={[styles.waterProgressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.waterRemaining}>
          {remaining > 0 ? `${formatMl(remaining)} to go — keep drinking!` : "You've hit your daily goal. Great job!"}
        </Text>
      </View>

      {/* Quick add buttons */}
      <View style={styles.quickAddRow}>
        {[250, 500, 750, 1000].map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.quickAddButton}
            onPress={() => addWater(amt)}
            disabled={submitting}
          >
            <View style={styles.quickAddIcon}>
              <Droplet size={18} color={Colors.cyan} fill={Colors.cyan} />
            </View>
            <Text style={styles.quickAddText}>{amt >= 1000 ? `${amt / 1000}L` : `${amt}ml`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom amount form */}
      {showCustom && (
        <View style={styles.customCard}>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              value={customMl}
              onChangeText={setCustomMl}
              placeholder="Amount in ml"
              placeholderTextColor={Colors.gray400}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={[styles.customButton, submitting && styles.customButtonDisabled]}
              onPress={handleCustom}
              disabled={submitting}
            >
              <Text style={styles.customButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Glass tracker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Glass Tracker ({glasses}/{goalGlasses})</Text>
        <View style={styles.glassRow}>
          {Array.from({ length: goalGlasses }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.glass,
                i < glasses ? styles.glassFilled : styles.glassEmpty,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Today's log */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Log</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>No water logged yet. Tap a quick-add button above.</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logItemLeft}>
                <View style={styles.logIcon}>
                  <Droplet size={14} color={Colors.cyan} fill={Colors.cyan} />
                </View>
                <View>
                  <Text style={styles.logAmount}>{formatMl(log.amount_ml)}</Text>
                  <Text style={styles.logTime}>
                    {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(log.id)} style={styles.deleteButton}>
                <Trash2 size={16} color={Colors.gray300} />
              </TouchableOpacity>
            </View>
          ))
        )}
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
    backgroundColor: Colors.cyan,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  waterCard: {
    backgroundColor: Colors.cyan,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  waterCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterCardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waterCardLabelText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  waterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  waterBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  waterAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  waterAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
  },
  waterAmountGoal: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  waterProgressBar: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 14,
  },
  waterProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 5,
  },
  waterRemaining: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 8,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray100,
    alignItems: 'center',
  },
  quickAddIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.cyanLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickAddText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
  },
  customCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 16,
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.gray900,
  },
  customButton: {
    backgroundColor: Colors.cyan,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  customButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 12,
  },
  glassRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  glass: {
    width: 28,
    height: 36,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 2,
  },
  glassFilled: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  glassEmpty: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray400,
    textAlign: 'center',
    paddingVertical: 20,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray50,
  },
  logItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.cyanLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray900,
  },
  logTime: {
    fontSize: 12,
    color: Colors.gray400,
  },
  deleteButton: {
    padding: 8,
  },
});
