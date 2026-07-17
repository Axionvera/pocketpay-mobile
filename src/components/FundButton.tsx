import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { COLORS, SIZES, RADIUS } from '../constants/theme';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react-native';

interface FundButtonProps {
  isFunding: boolean;
  fundError: string | null;
  onFund: () => void;
  isFunded: boolean;
}

/**
 * Testnet-only funding component.
 *
 * When the account has zero balance it shows a Friendbot funding card.
 * After a successful funding the balance is > 0 and the card auto-hides.
 */
export const FundButton: React.FC<FundButtonProps> = ({
  isFunding,
  fundError,
  onFund,
  isFunded,
}) => {
  // Do not render anything when the account is already funded
  if (isFunded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Zap color={COLORS.warning} size={24} />
          <Text style={styles.title}>Unfunded Testnet Account</Text>
        </View>

        <Text style={styles.description}>
          This account hasn&apos;t been funded yet. Tap below to receive Testnet
          XLM from the Stellar Friendbot — free, no real value.
        </Text>

        {fundError ? (
          <View style={styles.errorBox}>
            <AlertTriangle color={COLORS.error} size={18} style={{ marginRight: SIZES.xs }} />
            <Text style={styles.errorText}>{fundError}</Text>
          </View>
        ) : null}

        <Button
          title={isFunding ? 'Funding…' : 'Fund with Friendbot'}
          onPress={onFund}
          isLoading={isFunding}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  title: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SIZES.sm,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SIZES.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 61, 0, 0.1)',
    borderRadius: RADIUS.sm,
    padding: SIZES.sm,
    marginBottom: SIZES.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    flex: 1,
  },
  button: {
    marginTop: SIZES.xs,
  },
});
