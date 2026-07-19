import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { COLORS, SIZES, RADIUS } from '../../src/constants/theme';
import { Rocket, Info } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Rocket color={COLORS.primary} size={80} />
        </View>
        <Text style={styles.title}>Stellar PocketPay</Text>
        <Text style={styles.subtitle}>
          Fast, secure payments on the Stellar network.
        </Text>

        <View style={styles.testnetBadge}>
          <Info color={COLORS.primary} size={16} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  testnetBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
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
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.border,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
