import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { COLORS, SIZES, RADIUS } from '../../src/constants/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { mockFetchVaultBalance, mockDepositToVault, mockWithdrawFromVault } from '../../src/services/stellar';
import { validateAmount } from '../../src/utils/validation';
import { PiggyBank, ShieldCheck } from 'lucide-react-native';
import { VaultConfirmationModal } from '../../src/components/VaultConfirmationModal';
import { LockDurationSelector, DurationOption } from '../../src/components/LockDurationSelector';

export default function VaultScreen() {
  const { publicKey, getSecretKey, balance } = useWalletStore();
  const [vaultBalance, setVaultBalance] = useState('0.0000000');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | undefined>();
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [durationError, setDurationError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    amount: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

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

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setAmountError(value.trim() ? validateAmount(value, balance) ?? undefined : undefined);
  };

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      const secret = await getSecretKey();
      if (!secret) throw new Error('Secret key not found');
      
      // MOCK CALL TO SOROBAN CONTRACT
      await mockDepositToVault(secret, amount);
      
      Alert.alert('Success', 'Funds deposited into Soroban Vault (Mock)');
      setAmount('');
      setAmountError(undefined);
      setSelectedDuration(null);
      setDurationError(undefined);
      setModalVisible(false);
      loadVaultBalance();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading(true);
      const secret = await getSecretKey();
      if (!secret) throw new Error('Secret key not found');
      
      // MOCK CALL TO SOROBAN CONTRACT
      await mockWithdrawFromVault(secret, amount);
      
      Alert.alert('Success', 'Funds withdrawn from Soroban Vault (Mock)');
      setAmount('');
      setAmountError(undefined);
      setModalVisible(false);
      loadVaultBalance();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateDeposit = () => {
    const amountErr = validateAmount(amount, balance) ?? undefined;
    setAmountError(amountErr);

    let durErr = undefined;
    if (!selectedDuration) {
      durErr = 'Please select a lock duration';
      setDurationError(durErr);
    } else {
      setDurationError(undefined);
    }

    if (amountErr || durErr) return;

    setModalConfig({
      title: 'Confirm Deposit',
      amount: `${amount} XLM`,
      description: `You are depositing XLM into the Soroban Savings Vault. These funds will be locked for ${selectedDuration?.label} (${selectedDuration?.apy}) and cannot be withdrawn until the duration expires.`,
      confirmText: 'Deposit',
      onConfirm: handleDeposit,
    });
    setModalVisible(true);
  };

  const initiateWithdraw = () => {
    const error = validateAmount(amount, vaultBalance) ?? undefined;
    setAmountError(error);
    if (error) return;

    setModalConfig({
      title: 'Confirm Withdrawal',
      amount: `${amount} XLM`,
      description: 'You are withdrawing XLM from the Soroban Savings Vault. These funds will be transferred back to your main wallet balance.',
      confirmText: 'Withdraw',
      onConfirm: handleWithdraw,
    });
    setModalVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
          label="Amount to Deposit/Withdraw (XLM)"
          placeholder="0.00"
          value={amount}
          onChangeText={handleAmountChange}
          error={amountError}
          keyboardType="decimal-pad"
        />

        <LockDurationSelector
          selectedId={selectedDuration?.id ?? null}
          onSelect={(option) => {
            setSelectedDuration(option);
            setDurationError(undefined);
          }}
          error={durationError}
        />

        <View style={styles.actions}>
          <Button 
            title="Deposit" 
            onPress={initiateDeposit} 
            disabled={isLoading}
            style={styles.actionButton}
          />
          <Button 
            title="Withdraw" 
            variant="secondary"
            onPress={initiateWithdraw} 
            disabled={isLoading}
            style={styles.actionButton}
          />
        </View>
      </View>

      {modalConfig && (
        <VaultConfirmationModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={modalConfig.onConfirm}
          title={modalConfig.title}
          amount={modalConfig.amount}
          description={modalConfig.description}
          confirmText={modalConfig.confirmText}
          isLoading={isLoading}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
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
  }
});
