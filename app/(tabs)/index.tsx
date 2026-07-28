import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useWalletStore } from '../../src/store/walletStore';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/Button';
import { TransactionListItem } from '../../src/components/TransactionListItem';
import { NetworkStateBanner } from '../../src/components/NetworkStateBanner';
import { WalletEmptyState } from '../../src/components/WalletEmptyState';
import { BalanceDisplay } from '../../src/components/BalanceDisplay';
import { FundingStatusBanner } from '../../src/components/FundingStatusBanner';
import { useNetworkState } from '../../src/hooks/useNetworkState';
import { Clock } from 'lucide-react-native';
import { BackupReminderModal } from '../../src/components/BackupReminderModal';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    publicKey,
    balance,
    transactions,
    lastRefreshed,
    isLoading,
    isFunding,
    fundError,
    error,
    balanceState,
    fundingStatus,
    refreshWalletData,
    fundWallet,
    checkFundingStatus,
    showBackupReminder,
    acknowledgeBackupReminder,
  } = useWalletStore();

  const { state: networkState, disableWriteActions, retry } = useNetworkState({ error });

  useEffect(() => {
    refreshWalletData();
    checkFundingStatus();
  }, []);

  const handleRetry = useCallback(() => {
    if (publicKey) {
      refreshWalletData();
      checkFundingStatus();
    }
  }, [publicKey, refreshWalletData, checkFundingStatus]);

  const recentTransactions = transactions.slice(0, 3); // Preview

  if (!publicKey) {
    return (
      <View style={styles.container}>
        <WalletEmptyState
          variant="missing"
          onCreate={() => router.replace('/(auth)/create')}
          onImport={() => router.replace('/(auth)/import')}
        />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRetry}
            tintColor={colors.primary}
          />
        }
      >
        <NetworkStateBanner
          state={networkState}
          onRetry={handleRetry}
          isRetrying={isLoading}
        />

        {/* Issue #329: Balance display with all states */}
        <BalanceDisplay
          state={balanceState}
          balance={balance}
          publicKey={publicKey}
          onRetry={handleRetry}
          isRetrying={isLoading}
          lastRefreshed={lastRefreshed}
        />

        {/* Issue #330: Funding status banner */}
        <FundingStatusBanner
          status={fundingStatus}
          onFund={fundWallet}
          isFunding={isFunding}
          fundError={fundError}
        />

        <View style={styles.actionsContainer}>
          <Button
            title="Send"
            onPress={() => router.push('/send')}
            disabled={disableWriteActions}
            style={styles.actionButton}
          />
          <Button
            title="Receive"
            variant="secondary"
            onPress={() => router.push('/receive')}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text
            style={styles.seeAll}
            onPress={() => router.push('/(tabs)/history')}
          >
            See All
          </Text>
        </View>

        <View style={styles.transactionsList}>
          {recentTransactions.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Clock color={colors.textMuted} size={48} style={{ marginBottom: SIZES.md }} />
              <Text style={styles.emptyText}>No recent transactions</Text>
            </View>
          )}
          {recentTransactions.map((tx, index) => (
            <TransactionListItem
              key={tx.id || index}
              transaction={tx}
              currentPublicKey={publicKey}
              variant="inline"
              onPress={() => router.push(`/transaction/${tx.id}`)}
            />
          ))}
        </View>
      </ScrollView>
      <BackupReminderModal
        visible={showBackupReminder}
        onAcknowledge={() => acknowledgeBackupReminder()}
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xxl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SIZES.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SIZES.md,
    marginBottom: SIZES.xxl,
  },
  emptyState: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
