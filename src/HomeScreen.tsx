import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
  Platform,
  SafeAreaView,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from './theme';
import {
  requestPermissions,
  scheduleHourlyNotifications,
  cancelAllNotifications,
  getScheduledCount,
} from './notifications';

function getTimeComponents(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = (h % 12 === 0 ? 12 : h % 12).toString().padStart(2, '0');
  return { hour: hour12, minute: m, second: s, period };
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function getDateLine(date: Date) {
  return `${DAYS[date.getDay()]} · ${MONTHS[date.getMonth()]} ${date.getDate()} · ${date.getFullYear()}`;
}

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [permDenied, setPermDenied] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const appState = useRef(AppState.currentState);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getScheduledCount().then((n) => {
      if (n > 0) {
        setAlertsEnabled(true);
        setScheduledCount(n);
      }
    });
  }, []);

  const rescheduleIfNeeded = useCallback(async () => {
    if (!alertsEnabled) return;
    const count = await getScheduledCount();
    if (count < 12) {
      await scheduleHourlyNotifications();
      setScheduledCount(await getScheduledCount());
    }
  }, [alertsEnabled]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        rescheduleIfNeeded();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [rescheduleIfNeeded]);

  const pulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim]);

  const toggleAlerts = useCallback(async () => {
    if (alertsEnabled) {
      await cancelAllNotifications();
      setAlertsEnabled(false);
      setScheduledCount(0);
      setPermDenied(false);
      pulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      const granted = await requestPermissions();
      if (!granted) {
        setPermDenied(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      await scheduleHourlyNotifications();
      const count = await getScheduledCount();
      setScheduledCount(count);
      setAlertsEnabled(true);
      setPermDenied(false);
      pulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [alertsEnabled, pulse]);

  const { hour, minute, second, period } = getTimeComponents(now);
  const dateLine = getDateLine(now);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>TYME</Text>
        {alertsEnabled && (
          <View style={styles.activeDot} />
        )}
      </View>

      <View style={styles.clockSection}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Text style={styles.clockMain}>
            {hour}:{minute}
          </Text>
        </Animated.View>

        <View style={styles.clockSub}>
          <Text style={styles.period}>{period}</Text>
          <Text style={styles.seconds}>{second}</Text>
        </View>

        <Text style={styles.dateLine}>{dateLine}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.toggleRow}
          onPress={toggleAlerts}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleLabel}>HOURLY ALERTS</Text>
          <View style={[styles.toggleChip, alertsEnabled && styles.toggleChipActive]}>
            <Text style={[styles.toggleChipText, alertsEnabled && styles.toggleChipTextActive]}>
              {alertsEnabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </TouchableOpacity>

        {permDenied && (
          <Text style={styles.permNote}>
            ALLOW NOTIFICATIONS IN SETTINGS
          </Text>
        )}

        {alertsEnabled && scheduledCount > 0 && (
          <Text style={styles.scheduleNote}>
            {scheduledCount} ALERTS QUEUED
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.spacing.md,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: 10,
  },
  wordmark: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    letterSpacing: 8,
    color: theme.colors.textMid,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.accent,
  },

  clockSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingBottom: theme.spacing.xl,
  },
  clockMain: {
    fontFamily: theme.fonts.monoBold,
    fontSize: Platform.select({ ios: 96, default: 88 }),
    color: theme.colors.text,
    letterSpacing: -4,
    lineHeight: Platform.select({ ios: 100, default: 92 }),
    includeFontPadding: false,
  },
  clockSub: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
    marginTop: 8,
    marginBottom: theme.spacing.lg,
  },
  period: {
    fontFamily: theme.fonts.mono,
    fontSize: 22,
    color: theme.colors.text,
    letterSpacing: 4,
  },
  seconds: {
    fontFamily: theme.fonts.mono,
    fontSize: 14,
    color: theme.colors.textDim,
    letterSpacing: 2,
  },
  dateLine: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textMid,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },

  footer: {
    paddingBottom: theme.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  toggleLabel: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textMid,
    letterSpacing: 6,
  },
  toggleChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 52,
    alignItems: 'center',
  },
  toggleChipActive: {
    backgroundColor: theme.colors.toggleActive,
    borderColor: theme.colors.toggleActive,
  },
  toggleChipText: {
    fontFamily: theme.fonts.mono,
    fontSize: 11,
    color: theme.colors.textDim,
    letterSpacing: 3,
  },
  toggleChipTextActive: {
    color: theme.colors.bg,
  },
  permNote: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    color: theme.colors.accent,
    letterSpacing: 4,
    marginTop: theme.spacing.sm,
  },
  scheduleNote: {
    fontFamily: theme.fonts.mono,
    fontSize: 9,
    color: theme.colors.textDim,
    letterSpacing: 4,
    marginTop: theme.spacing.xs,
  },
});
