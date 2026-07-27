import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Wallet,
  Shield,
  Rocket,
  ArrowRightCircle,
  KeyRound,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react-native';
import { SIZES, RADIUS, ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { AsyncActionButton } from './AsyncActionButton';

export type WalletEmptyStateVariant = 'empty' | 'missing' | 'loading';

export interface WalletEmptyStateProps {
  /**
   * - 'empty':   New user, no wallet yet. Show education copy + Create/Import CTAs.
   * - 'missing': Defensive. Wallet cleared during app lifetime or auth guard race.
   *              Short actionable copy, primary CTA is Create/Import again.
   * - 'loading': Boot-time (walletChecked=false, SecureStore async read in progress).
   *              Spinner + "Reading your wallet" — no CTAs.
   */
  variant?: WalletEmptyStateVariant;
  onCreate?: () => void;
  onImport?: () => void;
  isCreating?: boolean;
  isImporting?: boolean;
  /** When true, shows the strong "Stellar Testnet / No real funds" honesty banner. */
  showTestnetNotice?: boolean;
  /** Optional secondary message (1 line) under the title. */
  subtitle?: string;
}

export const WalletEmptyState: React.FC<WalletEmptyStateProps> = ({
  variant = 'empty',
  onCreate,
  onImport,
  isCreating = false,
  isImporting = false,
  showTestnetNotice = true,
  subtitle,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (variant === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <View style={[styles.iconRing, styles.ringLoading]}>
          <Loader2 color={colors.primary} size={36} />
        </View>
        <Text style={styles.loadingTitle}>Checking for wallet…</Text>
        <Text style={styles.loadingBody}>
          This should only take a moment. If this screen persists for more than a few seconds,
          close and reopen the app.
        </Text>
      </View>
    );
  }

  const isMissing = variant === 'missing';

  const title = isMissing
    ? 'No wallet available'
    : 'Welcome to PocketPay';

  const message = subtitle ?? (
    isMissing
      ? 'Your wallet was cleared or is unavailable. Create a new wallet or import an existing one to continue.'
      : 'A non-custodial Stellar wallet: you hold the keys. Create one now or import an existing secret key to get started.'
  );

  const badgeIcon = isMissing ? <Info color={colors.warning} size={14} /> : <Sparkles color={colors.primary} size={14} />;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapperOuter}>
        <View style={[styles.iconRing, isMissing ? styles.ringMissing : styles.ringEmpty]}>
          {isMissing ? (
            <KeyRound color={colors.warning} size={40} />
          ) : (
            <Wallet color={colors.primary} size={40} />
          )}
        </View>
        <View style={[styles.badge, isMissing ? styles.badgeMissing : styles.badgeEmpty]}>
          {badgeIcon}
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {showTestnetNotice && variant === 'empty' ? (
        <View style={styles.banner}>
          <Info color={colors.primary} size={18} />
          <Text style={styles.bannerText}>
            This app runs on Stellar <Text style={styles.bannerBold}>Testnet</Text> — a
            sandbox for learning. No real funds are used. Balances can reset at any time.
          </Text>
        </View>
      ) : null}

      {variant === 'empty' ? (
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
              <Shield color={colors.primary} size={18} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>You hold the keys</Text>
              <Text style={styles.featureBody}>
                Your secret key is stored in encrypted device storage. PocketPay never sees it.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(123, 97, 255, 0.12)' }]}>
              <Rocket color={colors.secondary} size={18} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Fast, global payments</Text>
              <Text style={styles.featureBody}>
                Send XLM to anyone on the Stellar network with near-instant settlement and tiny fees.
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
              <ArrowRightCircle color={colors.success} size={18} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Save with time-locks</Text>
              <Text style={styles.featureBody}>
                Move funds into the savings vault and lock them until a future date.
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <AsyncActionButton
          title={isMissing ? 'Create New Wallet' : 'Create New Wallet'}
          onPress={onCreate}
          isLoading={isCreating}
          loadingText="Preparing wallet…"
          style={styles.primaryButton}
        />
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>
        <AsyncActionButton
          title="Import Existing Wallet"
          variant="outline"
          onPress={onImport}
          isLoading={isImporting}
          loadingText="Preparing import…"
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: SIZES.xl,
      paddingTop: SIZES.xxl * 1.4,
      paddingBottom: SIZES.xxl,
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      paddingHorizontal: SIZES.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapperOuter: {
      position: 'relative',
      marginBottom: SIZES.lg,
    },
    iconRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    ringEmpty: {
      backgroundColor: 'rgba(0, 229, 255, 0.10)',
      borderColor: 'rgba(0, 229, 255, 0.22)',
    },
    ringMissing: {
      backgroundColor: 'rgba(255, 196, 0, 0.10)',
      borderColor: 'rgba(255, 196, 0, 0.28)',
    },
    ringLoading: {
      backgroundColor: 'rgba(0, 229, 255, 0.06)',
      borderColor: 'rgba(0, 229, 255, 0.18)',
    },
    badge: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    badgeEmpty: {
      backgroundColor: 'rgba(0, 230, 118, 0.15)',
    },
    badgeMissing: {
      backgroundColor: 'rgba(255, 196, 0, 0.18)',
    },
    title: {
      color: colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: SIZES.sm,
    },
    message: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: SIZES.lg,
      paddingHorizontal: SIZES.xs,
    },
    banner: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: 'rgba(0, 229, 255, 0.08)',
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: 'rgba(0, 229, 255, 0.22)',
      gap: SIZES.sm,
      marginBottom: SIZES.lg,
    },
    bannerText: {
      flex: 1,
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    bannerBold: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    features: {
      width: '100%',
      marginBottom: SIZES.lg,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: SIZES.sm,
    },
    featureIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SIZES.md,
      marginTop: 2,
    },
    featureText: { flex: 1 },
    featureTitle: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 2,
    },
    featureBody: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    actions: {
      width: '100%',
      marginTop: 'auto',
    },
    primaryButton: {
      width: '100%',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: SIZES.md,
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
    secondaryButton: {
      width: '100%',
    },
    loadingTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: SIZES.lg,
      marginBottom: SIZES.sm,
    },
    loadingBody: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: SIZES.xs,
    },
  });
