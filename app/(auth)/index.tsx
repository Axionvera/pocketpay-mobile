import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { Rocket, Info } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Rocket color={colors.primary} size={80} />
        </View>
        <Text style={styles.title}>Stellar PocketPay</Text>
        <Text style={styles.subtitle}>
          Fast, secure payments on the Stellar network.
        </Text>

        <View style={styles.testnetBadge}>
          <Info color={colors.primary} size={16} />
          <Text style={styles.testnetText}>
            This app runs on Stellar <Text style={styles.testnetBold}>Testnet</Text> — a sandbox for learning. No real funds are used.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.ctaSection}>
          <Text style={styles.ctaLabel}>New to Stellar?</Text>
          <Button
            title="Create New Wallet"
            onPress={() => router.push('/(auth)/create')}
            style={{ marginBottom: SIZES.md }}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Import Existing Wallet"
          variant="outline"
          onPress={() => router.push('/(auth)/import')}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.lg,
  },
  testnetBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    gap: SIZES.sm,
  },
  testnetText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  testnetBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    padding: SIZES.xl,
    paddingBottom: SIZES.xxl,
  },
  ctaSection: {
    marginBottom: SIZES.md,
  },
  ctaLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: SIZES.sm,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    gap: SIZES.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
