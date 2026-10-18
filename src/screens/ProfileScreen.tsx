import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { Bell, Target, Save, LogOut, User, CheckCircle } from 'lucide-react-native';
import { supabase, type DailyGoals } from '../lib/supabaseClient';
import { useAuth } from '../lib/auth';
import { Colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const loadGoals = async () => {
    setLoading(true);
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
      // silently handle
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = (name: keyof typeof goals, value: string) => {
    setGoals({ ...goals, [name]: parseInt(value, 10) || 0 });
  };

  const handleSave = async () => {
    setSaving(true);
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
      Alert.alert('Saved', 'Your settings have been saved.');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const formatDate = () => {
    return new Date(user?.created_at ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your goals and preferences</Text>
      </View>

      {/* User card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <User size={28} color={Colors.white} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
          <Text style={styles.userSince}>Member since {formatDate()}</Text>
        </View>
      </View>

      {/* Daily Goals */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Target size={18} color={Colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Daily Goals</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Daily Step Goal</Text>
          <TextInput
            style={styles.input}
            value={String(goals.step_goal)}
            onChangeText={(v) => handleGoalChange('step_goal', v)}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Daily Water Goal (ml)</Text>
          <TextInput
            style={styles.input}
            value={String(goals.water_goal_ml)}
            onChangeText={(v) => handleGoalChange('water_goal_ml', v)}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Min Heart Rate</Text>
            <TextInput
              style={styles.input}
              value={String(goals.min_heart_rate)}
              onChangeText={(v) => handleGoalChange('min_heart_rate', v)}
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Max Heart Rate</Text>
            <TextInput
              style={styles.input}
              value={String(goals.max_heart_rate)}
              onChangeText={(v) => handleGoalChange('max_heart_rate', v)}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardHeaderIcon, { backgroundColor: Colors.amberLight }]}>
            <Bell size={18} color={Colors.amber} />
          </View>
          <Text style={styles.cardTitle}>Notifications</Text>
        </View>

        {(Object.keys(notifications) as (keyof typeof notifications)[]).map((key) => (
          <View key={key} style={styles.notificationItem}>
            <View>
              <Text style={styles.notificationTitle}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim()}
              </Text>
              <Text style={styles.notificationDesc}>
                {key === 'waterReminders' && 'Remind me to drink water'}
                {key === 'stepGoals' && 'Alert me about step progress'}
                {key === 'heartAlerts' && 'Warn about unusual heart rate'}
                {key === 'weeklyReport' && 'Weekly health summary'}
              </Text>
            </View>
            <Switch
              value={notifications[key]}
              onValueChange={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
              trackColor={{ false: Colors.gray300, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        ))}
      </View>

      {/* Save button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            <Save size={18} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={18} color={Colors.gray600} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  subtitle: {
    fontSize: 14,
    color: Colors.gray500,
    marginTop: 4,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray900,
  },
  userSince: {
    fontSize: 13,
    color: Colors.gray400,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray100,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray900,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray700,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.gray900,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray900,
  },
  notificationDesc: {
    fontSize: 12,
    color: Colors.gray400,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutText: {
    color: Colors.gray600,
    fontSize: 16,
    fontWeight: '500',
  },
});
