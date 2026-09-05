import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { VaultUnavailableState } from '../../src/components/VaultUnavailableState';
import { MaturedLockWithdrawalModal } from '../../src/components/MaturedLockWithdrawalModal';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useVaultAvailability } from '../../src/hooks/useVaultAvailability';
import { useVaultStore } from '../../src/store/vaultStore';
import { useMaturedLockWithdrawal } from '../../src/features/vault';
import { Lock, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function VaultLockDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isAvailable, reasons } = useVaultAvailability();

  // Pull the lock from the store, falling back to an inert placeholder when
  // the id does not match (e.g. deep link to a removed lock).
  const locks = useVaultStore((state) => state.locks);
  const contractId = useVaultStore((state) => state.contractId);
  const lock = locks.find((candidate) => candidate.id === id) ?? {
    id: id as string,
    amount: '0',
    unlockDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'locked' as const,
    createdAt: new Date().toISOString(),
  };

  const {
    step,
    eligibility,
    isPreview,
    result,
    error,
    start,
    confirm,
    cancel,
    retry,
    close,
  } = useMaturedLockWithdrawal(lock);

  const isEligibleForWithdrawal = eligibility.isEligible;

  if (!isAvailable) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: 'Vault Lock Details', headerBackTitle: 'Vault' }} />
        <VaultUnavailableState
          reasons={reasons}
          onNavigateToSettings={() => router.push('/(tabs)/settings')}
        />
      </ScrollView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Vault Lock Details', headerBackTitle: 'Vault' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Lock color={colors.primary} size={32} />
          </View>
          <Text style={styles.amountText}>{lock.amount} XLM</Text>
          <View style={[styles.statusBadge, isEligibleForWithdrawal ? styles.statusUnlocked : styles.statusLocked]}>
            <Text style={[styles.statusText, isEligibleForWithdrawal && styles.statusTextUnlocked]}>
              {isEligibleForWithdrawal ? 'UNLOCKED' : 'LOCKED'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Lock Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar color={colors.textMuted} size={20} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Created Date</Text>
              <Text style={styles.detailValue}>{new Date(lock.createdAt).toLocaleString()}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock color={colors.textMuted} size={20} />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Unlock Date</Text>
              <Text style={styles.detailValue}>{new Date(lock.unlockDate).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Withdrawal Eligibility</Text>
          <View style={styles.eligibilityContainer}>
            {isEligibleForWithdrawal ? (
              <>
                <CheckCircle color={colors.success} size={24} style={styles.eligibilityIcon} />
                <Text style={styles.eligibilityText}>
                  {eligibility.message}
                </Text>
              </>
            ) : (
              <>
                <AlertCircle color={colors.warning} size={24} style={styles.eligibilityIcon} />
                <Text style={styles.eligibilityText}>
                  {eligibility.message}
                </Text>
              </>
            )}
          </View>
        </View>

        <Button
          title={isEligibleForWithdrawal ? 'Withdraw Funds' : 'Early Withdrawal Unavailable'}
          onPress={start}
          disabled={!isEligibleForWithdrawal}
          style={styles.withdrawButton}
        />
      </ScrollView>

      <MaturedLockWithdrawalModal
        step={step}
        amount={lock.amount}
        availableFrom={eligibility.availableFrom}
        isPreview={isPreview}
        result={result}
        error={error}
        contractId={contractId}
        onConfirm={confirm}
        onCancel={cancel}
        onRetry={retry}
        onClose={close}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    paddingTop: SIZES.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: SIZES.sm,
  },
  statusBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  statusLocked: {
    backgroundColor: 'rgba(255, 196, 0, 0.1)',
  },
  statusUnlocked: {
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
  },
  statusText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextUnlocked: {
    color: colors.success,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SIZES.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: SIZES.md,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: SIZES.md,
  },
  eligibilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: SIZES.md,
    borderRadius: RADIUS.md,
  },
  eligibilityIcon: {
    marginRight: SIZES.md,
  },
  eligibilityText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  withdrawButton: {
    marginTop: SIZES.sm,
    marginBottom: SIZES.xl,
  }
});
