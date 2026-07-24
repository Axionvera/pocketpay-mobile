import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Button } from '../../src/components/Button';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useWalletStore } from '../../src/store/walletStore';
import { useAppLockStore } from '../../src/store/appLockStore';
import { ThemeMode } from '../../src/store/appStore';
import { Moon, Sun, Monitor, Shield, Info, Globe } from 'lucide-react-native';import { WalletResetConfirmModal } from '../../src/components/WalletResetConfirmModal';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'System', Icon: Monitor },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { clearWallet, getSecretKey } = useWalletStore();
  const { colors, themeMode, setThemeMode } = useTheme();
  const { isLockEnabled, enableLock, disableLock, authenticate } = useAppLockStore();
  const [showSecret, setShowSecret] = useState(false);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const styles = createStyles(colors);

  // Read version from Expo manifest, with graceful fallback
  const appVersion = Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';
  const appName = Constants.expoConfig?.name ?? 'Stellar PocketPay';

  // Read network from environment variable, with a fallback
  const activeNetwork = process.env.EXPO_PUBLIC_STELLAR_NETWORK ?? 'TESTNET';

  const handleExportKey = async () => {
    if (!showSecret) {
      const secret = await getSecretKey();
      if (secret) {
        setSecretKey(secret);
        setShowSecret(true);
      }
    } else {
      setShowSecret(false);
      setSecretKey(null);
    }
  };

  const handleSignOut = () => {
    setShowResetModal(true);
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    const cleared = await clearWallet();
    setIsResetting(false);
    setShowResetModal(false);
    if (!cleared) {
      Alert.alert('Wallet Not Cleared', 'Failed to clear wallet securely. Please try again.');
    }
  };

  const handleToggleLock = async (enable: boolean) => {
    if (enable) {
      await enableLock();
      await authenticate();
    } else {
      Alert.alert(
        'Disable App Lock',
        'Anyone with your device can access your wallet without app lock. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await disableLock();
            },
          },
        ]
      );
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Shield color={colors.primary} size={24} />
                <View style={styles.rowTextGroup}>
                  <Text style={styles.rowText}>App Lock</Text>
                  <Text style={styles.rowHelper}>
                    Require biometrics or passcode to open
                  </Text>
                </View>
                <Switch
                  value={isLockEnabled}
                  onValueChange={handleToggleLock}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.themeRow}>
              {THEME_OPTIONS.map(({ mode, label, Icon }) => {
                const selected = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.themeOption, selected && styles.themeOptionSelected]}
                    onPress={() => setThemeMode(mode)}
                  >
                    <Icon color={selected ? colors.primary : colors.textMuted} size={20} />
                    <Text style={[styles.themeOptionLabel, selected && styles.themeOptionLabelSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Wallet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.card}>
            <Button
              title="Address Book / Contacts"
              variant="outline"
              onPress={() => router.push('/contacts')}
              style={styles.menuButtonLast}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Info color={colors.textSecondary} size={20} />
              <View style={styles.aboutTextGroup}>
                <Text style={styles.aboutLabel}>App Name</Text>
                <Text style={styles.aboutValue}>{appName}</Text>
              </View>
            </View>
            <View style={styles.aboutDivider} />
            <View style={styles.aboutRow}>
              <Info color={colors.textSecondary} size={20} />
              <View style={styles.aboutTextGroup}>
                <Text style={styles.aboutLabel}>Version</Text>
                <Text style={styles.aboutValue}>{appVersion}</Text>
              </View>
            </View>
            <View style={styles.aboutDivider} />
            <View style={styles.aboutRow}>
              <Info color={colors.textSecondary} size={20} />
              <View style={styles.aboutTextGroup}>
                <Text style={styles.aboutLabel}>Network</Text>
                {/* Dynamically display active network with fallback */}
                <Text style={styles.aboutValue}>{activeNetwork}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { marginTop: SIZES.xl }]}>
          <Button
            title="Sign Out & Clear Wallet"
            variant="danger"
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>

      <WalletResetConfirmModal
        visible={showResetModal}
        isLoading={isResetting}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetModal(false)}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.lg,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowTextGroup: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  rowText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  rowHelper: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: SIZES.lg,
  },
  themeRow: {
    flexDirection: 'row',
    padding: SIZES.sm,
    gap: SIZES.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderRadius: RADIUS.md,
  },
  themeOptionSelected: {
    backgroundColor: colors.surfaceLight,
  },
  themeOptionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  themeOptionLabelSelected: {
    color: colors.primary,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  aboutTextGroup: {
    marginLeft: SIZES.md,
  },
  aboutLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  aboutValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  aboutDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: SIZES.lg,
  },
  menuButtonLast: {
    borderWidth: 0,
    borderRadius: 0,
    justifyContent: 'flex-start',
    paddingHorizontal: SIZES.lg,
  },
});