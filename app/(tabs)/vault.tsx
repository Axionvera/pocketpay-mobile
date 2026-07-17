import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { VaultConfirmModal, VaultAction } from '../../src/components/VaultConfirmModal';
import { COLORS, SIZES, RADIUS } from '../../src/constants/theme';
import { useWalletStore } from '../../src/store/walletStore';
import {
  mockFetchVaultBalance,
  mockDepositToVault,
  mockWithdrawFromVault,
  mockLockVault,
} from '../../src/services/stellar';
import { PiggyBank, ShieldCheck } from 'lucide-react-native';

const LOCK_PERIOD_SECONDS = 30 * 24 * 60 * 60; // 30 days

export default function VaultScreen() {
  const { publicKey, getSecretKey } = useWalletStore();
  const [vaultBalance, setVaultBalance] = useState('0.0000000');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Confirmation modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<VaultAction>('deposit');
  const [pendingUnlockTime, setPendingUnlockTime] = useState('');

  useEffect(() => {
    if (publicKey) {
      loadVaultBalance();
    }
  }, [publicKey]);

  const loadVaultBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await mockFetchVaultBalance(publicKey);
      setVaultBalance(balance);
    } catch (e) {
      console.error(e);
    }
  };

  const showConfirmation = (action: VaultAction) => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }
    if (action === 'lock') {
      const unlockTimestamp = Math.floor(Date.now() / 1000) + LOCK_PERIOD_SECONDS;
      const unlockDate = new Date(unlockTimestamp * 1000);
      setPendingUnlockTime(unlockDate.toLocaleString());
    }
    setPendingAction(action);
    setConfirmVisible(true);
  };

  const executeAction = useCallback(async () => {
    try {
      setIsLoading(true);
      setConfirmVisible(false);

      const secret = await getSecretKey();
      if (!secret) throw new Error('Secret key not found');

      switch (pendingAction) {
        case 'deposit': {
          await mockDepositToVault(secret, amount);
          Alert.alert('Success', 'Funds deposited into Soroban Vault (Mock)');
          break;
        }
        case 'withdraw': {
          await mockWithdrawFromVault(secret, amount);
          Alert.alert('Success', 'Funds withdrawn from Soroban Vault (Mock)');
          break;
        }
        case 'lock': {
          const unlockTimestamp = Math.floor(Date.now() / 1000) + LOCK_PERIOD_SECONDS;
          const result = await mockLockVault(secret, amount, unlockTimestamp);
          Alert.alert(
            'Success',
            `Funds locked in Soroban Vault until ${result.unlockTime} (Mock)`
          );
          break;
        }
      }

      setAmount('');
      loadVaultBalance();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [pendingAction, amount, getSecretKey]);

  const cancelAction = () => {
    setConfirmVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <PiggyBank color={COLORS.primary} size={40} />
        </View>
        <Text style={styles.cardTitle}>Soroban Savings Vault</Text>
        <Text style={styles.balanceValue}>{vaultBalance} XLM</Text>
        <Text style={styles.cardSubtitle}>Earning ~5% APY (Mock)</Text>
      </View>

      <View style={styles.infoBox}>
        <ShieldCheck color={COLORS.success} size={24} style={{ marginRight: SIZES.sm }} />
        <Text style={styles.infoText}>
          This is a placeholder for a Soroban Smart Contract integration. Real funds are not moved.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Amount (XLM)"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <View style={styles.actions}>
          <Button
            title="Deposit"
            onPress={() => showConfirmation('deposit')}
            isLoading={isLoading}
            style={styles.actionButton}
          />
          <Button
            title="Withdraw"
            variant="secondary"
            onPress={() => showConfirmation('withdraw')}
            disabled={isLoading}
            style={styles.actionButton}
          />
        </View>
        <Button
          title="Lock Funds (30 days)"
          variant="outline"
          onPress={() => showConfirmation('lock')}
          disabled={isLoading}
          style={styles.lockButton}
        />
      </View>

      <VaultConfirmModal
        visible={confirmVisible}
        actionType={pendingAction}
        amount={amount}
        unlockTime={pendingAction === 'lock' ? pendingUnlockTime : undefined}
        isLoading={isLoading}
        onConfirm={executeAction}
        onCancel={cancelAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SIZES.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  cardTitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: SIZES.sm,
  },
  balanceValue: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  cardSubtitle: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    padding: SIZES.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  infoText: {
    color: COLORS.success,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  form: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SIZES.xs,
  },
  lockButton: {
    marginTop: SIZES.md,
  },
});
