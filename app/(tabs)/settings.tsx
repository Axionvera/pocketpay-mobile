import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { ThemeMode } from '../../src/store/appStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react-native';
import { SecretKeyReveal } from '../../src/components/SecretKeyReveal';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'System', Icon: Monitor },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { clearWallet, getSecretKey } = useWalletStore();
  const { colors, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showSecret, setShowSecret] = useState(false);
  const [secretKey, setSecretKey] = useState<string | null>(null);

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
    Alert.alert(
      'Sign Out',
      'Are you sure you want to clear your wallet from this device? Make sure you have your secret key saved, otherwise your funds will be lost forever.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out & Clear',
          style: 'destructive',
          onPress: async () => {
            const cleared = await clearWallet();
            if (!cleared) {
              Alert.alert('Wallet Not Cleared', 'Failed to clear wallet securely. Please try again.');
            }
            // Router will handle redirect to auth due to _layout logic
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map(({ mode, label, Icon }) => {
              const isSelected = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.themeOption, isSelected && styles.themeOptionSelected]}
                  onPress={() => setThemeMode(mode)}
                  accessibilityRole="button"
                  accessibilityLabel={`${label} theme`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Icon color={isSelected ? colors.background : colors.textPrimary} size={20} />
                  <Text style={[styles.themeOptionText, isSelected && styles.themeOptionTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.card}>
          <Button
            title="Address Book / Contacts"
            variant="outline"
            onPress={() => router.push('/contacts')}
            style={styles.menuButton}
          />
          <Button
            title={showSecret ? "Hide Export Menu" : "Export Secret Key"}
            variant="outline"
            onPress={handleExportKey}
            style={styles.menuButton}
          />
          {showSecret && secretKey && (
            <View style={{ padding: SIZES.lg, paddingTop: 0, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSecondary, marginBottom: SIZES.sm, fontSize: 14 }}>
                Your secret key is highly sensitive. Proceed with caution.
              </Text>
              <SecretKeyReveal secretKey={secretKey} />
            </View>
          )}
        </View>
      </View>

      <View style={[styles.section, { marginTop: SIZES.xl }]}>
        <Button
          title="Sign Out & Clear Wallet"
          variant="danger"
          onPress={handleSignOut}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Stellar PocketPay v1.0.0</Text>
        <Text style={styles.footerText}>Network: Testnet</Text>
      </View>
    </ScrollView>
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
  themeRow: {
    flexDirection: 'row',
    padding: SIZES.sm,
    gap: SIZES.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: RADIUS.md,
    gap: 4,
  },
  themeOptionSelected: {
    backgroundColor: colors.primary,
  },
  themeOptionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  themeOptionTextSelected: {
    color: colors.background,
    fontWeight: '600',
  },
  menuButton: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 0,
    justifyContent: 'flex-start',
    paddingHorizontal: SIZES.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: SIZES.xl,
    paddingBottom: SIZES.xxl * 2,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  }
});
