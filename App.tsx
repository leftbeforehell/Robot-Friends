import { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts, SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/HomeScreen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
