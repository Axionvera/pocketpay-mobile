import '../shim'; // MUST BE FIRST (See docs/polyfills.md for details)
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useWalletStore } from '../src/store/walletStore';
import { useAppStore } from '../src/store/appStore';
import { LockScreen } from '../src/components/LockScreen';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

export default function RootLayout() {
  const { loadWalletFromStorage, publicKey } = useWalletStore();
  const { initializeApp, isInitialized } = useAppStore();
  const { colors, isDark } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initializeApp();
    loadWalletFromStorage();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (publicKey && inAuthGroup) {
      // User is signed in and trying to access auth screens, redirect to main
      router.replace('/(tabs)');
    } else if (!publicKey && !inAuthGroup && segments[0] !== '(tabs)' && segments[0] !== 'send' && segments[0] !== 'receive') {
      // User is NOT signed in and trying to access main screens, redirect to auth
      router.replace('/(auth)');
    }
  }, [publicKey, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <LockScreen>
        <Slot />
      </LockScreen>
    </ErrorBoundary>
  );
}
