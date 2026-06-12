import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Platform, StatusBar,
} from 'react-native';

const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

function getTimeComponents(d) {
  const h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = (h % 12 === 0 ? 12 : h % 12).toString().padStart(2, '0');
  return { hour: h12, minute: m.toString().padStart(2, '0'), second: s.toString().padStart(2, '0'), period };
}

export default function App() {
  const [now, setNow] = useState(new Date());
  const [alertsOn, setAlertsOn] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggle = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    setAlertsOn(v => !v);
  }, [pulse]);

  const { hour, minute, second, period } = getTimeComponents(now);
  const date = `${DAYS[now.getDay()]} · ${MONTHS[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={s.header}>
        <Text style={s.wordmark}>TYME</Text>
        {alertsOn && <View style={s.dot} />}
      </View>

      <View style={s.body}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Text style={s.time}>{hour}:{minute}</Text>
        </Animated.View>
        <View style={s.subRow}>
          <Text style={s.period}>{period}</Text>
          <Text style={s.seconds}>{second}</Text>
        </View>
        <Text style={s.date}>{date}</Text>
      </View>

      <View style={s.footer}>
        <View style={s.divider} />
        <TouchableOpacity style={s.row} onPress={toggle} activeOpacity={0.7}>
          <Text style={s.label}>HOURLY ALERTS</Text>
          <View style={[s.chip, alertsOn && s.chipOn]}>
            <Text style={[s.chipTxt, alertsOn && s.chipTxtOn]}>
              {alertsOn ? 'ON' : 'OFF'}
            </Text>
          </View>
        </TouchableOpacity>
        {alertsOn && (
          <Text style={s.note}>ALERTS ENABLED · NATIVE BUILD REQUIRED FOR DELIVERY</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#000', paddingHorizontal: 24 },
  header:     { flexDirection: 'row', alignItems: 'center', paddingTop: 20, paddingBottom: 16, gap: 10 },
  wordmark:   { fontFamily: MONO, fontSize: 11, letterSpacing: 8, color: '#666' },
  dot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FF2D00' },
  body:       { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingBottom: 60 },
  time:       { fontFamily: MONO, fontSize: 92, color: '#fff', letterSpacing: -4, lineHeight: 96, fontWeight: '700' },
  subRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 16, marginTop: 8, marginBottom: 40 },
  period:     { fontFamily: MONO, fontSize: 22, color: '#fff', letterSpacing: 4 },
  seconds:    { fontFamily: MONO, fontSize: 14, color: '#2a2a2a', letterSpacing: 2 },
  date:       { fontFamily: MONO, fontSize: 11, color: '#555', letterSpacing: 5 },
  footer:     { paddingBottom: 40 },
  divider:    { height: 1, backgroundColor: '#1a1a1a', marginBottom: 24 },
  row:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  label:      { fontFamily: MONO, fontSize: 11, color: '#555', letterSpacing: 6 },
  chip:       { borderWidth: 1, borderColor: '#1a1a1a', paddingHorizontal: 14, paddingVertical: 6, minWidth: 52, alignItems: 'center' },
  chipOn:     { backgroundColor: '#fff', borderColor: '#fff' },
  chipTxt:    { fontFamily: MONO, fontSize: 11, color: '#2a2a2a', letterSpacing: 3 },
  chipTxtOn:  { color: '#000' },
  note:       { fontFamily: MONO, fontSize: 8, color: '#2a2a2a', letterSpacing: 3, marginTop: 10 },
});
