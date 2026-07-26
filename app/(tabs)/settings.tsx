import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {
  Shield,
  Sun,
  Moon,
  Monitor,
  Users,
  KeyRound,
  Globe,
  Server,
  PiggyBank,
  Info,
  AlertTriangle,
  ShieldAlert,
  Activity,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react-native';
import { Button } from '../../src/components/Button';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useWalletStore } from '../../src/store/walletStore';
import {
  WALLET_CLEAR_FAILURE_MESSAGE,
  WALLET_SECRET_ACCESS_MESSAGE,
} from '../../src/utils/walletStorageErrors';
import { useAppLockStore } from '../../src/store/appLockStore';
import { ThemeMode } from '../../src/store/appStore';
import { WalletResetConfirmModal } from '../../src/components/WalletResetConfirmModal';
import { SecretKeyReveal } from '../../src/components/SecretKeyReveal';
import { useNetworkEnvironment, EnvironmentWarning } from '../../src/features/settings';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'System', Icon: Monitor },
];

const WARNING_ICON = {
  info: Info,
  warning: AlertTriangle,
  error: ShieldAlert,
} as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { publicKey, clearWallet, getSecretKey } = useWalletStore();
  const { colors, themeMode, setThemeMode } = useTheme();
  const { isLockEnabled, enableLock, disableLock, authenticate } = useAppLockStore();
  const env = useNetworkEnvironment();

  const [showSecret, setShowSecret] = useState(false);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const appVersion = Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';
  const appName = Constants.expoConfig?.name ?? 'Stellar PocketPay';

  const handleExportKey = async () => {
    if (!showSecret) {
      const secret = await getSecretKey();
      if (secret) {
        setSecretKey(secret);
        setShowSecret(true);
      } else {
        Alert.alert('Unable to Access Secret Key', WALLET_SECRET_ACCESS_MESSAGE);
      }
    } else {
      setShowSecret(false);
      setSecretKey(null);
    }
  };

  const handleSignOut = () => setShowResetModal(true);

  const handleResetConfirm = async () => {
    setIsResetting(true);
    const cleared = await clearWallet();
    setIsResetting(false);
    setShowResetModal(false);
    if (!cleared) {
      Alert.alert('Wallet Not Cleared', WALLET_CLEAR_FAILURE_MESSAGE);
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

  if (!publicKey) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* ── Preferences ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Shield color={colors.primary} size={20} />
                <View style={styles.rowTextGroup}>
                  <Text style={styles.rowText}>App Lock</Text>
                  <Text style={styles.rowHelper}>
                    Require biometrics or passcode to open
                  </Text>
                </View>
              </View>
              <Switch
                value={isLockEnabled}
                onValueChange={handleToggleLock}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
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
                    activeOpacity={0.7}
                  >
                    <Icon color={selected ? colors.primary : colors.textMuted} size={18} />
                    <Text
                      style={[
                        styles.themeOptionLabel,
                        selected && styles.themeOptionLabelSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Wallet ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>

          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.row, styles.rowInteractive]}
              onPress={() => router.push('/contacts')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Users color={colors.primary} size={20} />
                <View style={styles.rowTextGroup}>
                  <Text style={styles.rowText}>Address Book</Text>
                  <Text style={styles.rowHelper}>Saved contacts and addresses</Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={18} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.row, styles.rowInteractive]}
              onPress={handleExportKey}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <KeyRound color={colors.primary} size={20} />
                <View style={styles.rowTextGroup}>
                  <Text style={styles.rowText}>
                    {showSecret ? 'Hide Secret Key' : 'Export Secret Key'}
                  </Text>
                  <Text style={styles.rowHelper}>
                    {showSecret ? 'Collapse the revealed key' : 'View and back up your secret key'}
                  </Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={18} />
            </TouchableOpacity>

            {showSecret && secretKey ? (
              <>
                <View style={styles.divider} />
                <View style={styles.revealContainer}>
                  <SecretKeyReveal secretKey={secretKey} />
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* ── Network & Environment (NEW) ────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network &amp; Environment</Text>

          {/* Warnings */}
          {env.warnings.length > 0 && (
            <View style={styles.warningsStack}>
              {env.warnings.map((w, idx) => (
                <WarningBanner key={idx} warning={w} styles={styles} colors={colors} />
              ))}
            </View>
          )}

          <View style={styles.card}>
            <EnvRow
              styles={styles}
              colors={colors}
              Icon={Globe}
              label="Network"
              value={env.networkLabel}
              valueEmphasis
              badge={
                env.networkTier === 'mainnet'
                  ? { text: 'Live', tone: 'error' }
                  : env.networkTier === 'testnet'
                    ? { text: 'Test', tone: 'info' }
                    : { text: 'Custom', tone: 'warning' }
              }
            />
            <View style={styles.divider} />
            <EnvRow
              styles={styles}
              colors={colors}
              Icon={Server}
              label="Horizon Server"
              value={env.horizonHost}
            />
            <View style={styles.divider} />
            <EnvRow
              styles={styles}
              colors={colors}
              Icon={Server}
              label="Soroban RPC"
              value={env.sorobanHost}
            />
            <View style={styles.divider} />
            <EnvRow
              styles={styles}
              colors={colors}
              Icon={PiggyBank}
              label="Vault Mode"
              value={env.vaultMode === 'configured' ? 'Smart Contract' : 'Local Mock'}
              badge={
                env.vaultMode === 'configured'
                  ? { text: 'Real', tone: 'success' }
                  : { text: 'Mock', tone: 'warning' }
              }
            />
            {env.vaultMode === 'configured' ? (
              <>
                <View style={styles.divider} />
                <EnvRow
                  styles={styles}
                  colors={colors}
                  Icon={CheckCircle2}
                  label="Contract"
                  value={env.vaultContractLabel}
                />
              </>
            ) : null}
          </View>
        </View>

        {/* ── About ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.card}>
            <EnvRow
              styles={styles}
              colors={colors}
              Icon={Info}
              label="App Name"
              value={appName}
            />
            <View style={styles.divider} />
            <EnvRow
              styles={styles}
              colors={colors}
              Icon={Info}
              label="Version"
              value={appVersion}
            />
            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.row, styles.rowInteractive]}
              onPress={() => router.push('/diagnostics')}
              activeOpacity={0.7}
            >
              <View style={styles.rowLeft}>
                <Activity color={colors.primary} size={20} />
                <View style={styles.rowTextGroup}>
                  <Text style={styles.rowText}>Diagnostics</Text>
                  <Text style={styles.rowHelper}>Advanced status and logs</Text>
                </View>
              </View>
              <ChevronRight color={colors.textMuted} size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sign Out ───────────────────────────────────────────── */}
        <View style={[styles.section, styles.dangerSection]}>
          <Button
            title="Sign Out &amp; Clear Wallet"
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

// ─── Sub-components ──────────────────────────────────────────────────────

type BadgeTone = 'info' | 'success' | 'warning' | 'error';

interface EnvRowBadge {
  text: string;
  tone: BadgeTone;
}

interface EnvRowProps {
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  valueEmphasis?: boolean;
  badge?: EnvRowBadge;
}

function EnvRow({
  styles,
  colors,
  Icon,
  label,
  value,
  valueEmphasis,
  badge,
}: EnvRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Icon size={20} color={colors.primary} />
        <View style={styles.rowTextGroup}>
          <Text style={styles.rowLabel}>{label}</Text>
          <View style={styles.rowValueGroup}>
            <Text
              style={[
                styles.rowValue,
                valueEmphasis && styles.rowValueEmphasis,
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {value}
            </Text>
            {badge ? <Badge styles={styles} colors={colors} badge={badge} /> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function Badge({
  styles,
  colors,
  badge,
}: {
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
  badge: EnvRowBadge;
}) {
  const bg = {
    info: 'rgba(0, 229, 255, 0.12)',
    success: 'rgba(0, 230, 118, 0.12)',
    warning: 'rgba(255, 196, 0, 0.12)',
    error: 'rgba(255, 61, 0, 0.12)',
  }[badge.tone];

  const fg = {
    info: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  }[badge.tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{badge.text}</Text>
    </View>
  );
}

function WarningBanner({
  warning,
  styles,
  colors,
}: {
  warning: EnvironmentWarning;
  styles: ReturnType<typeof createStyles>;
  colors: ThemeColors;
}) {
  const Icon = WARNING_ICON[warning.severity];
  const borderColor =
    warning.severity === 'error'
      ? colors.error
      : warning.severity === 'warning'
        ? colors.warning
        : colors.primary;

  const bgColor =
    warning.severity === 'error'
      ? 'rgba(255, 61, 0, 0.08)'
      : warning.severity === 'warning'
        ? 'rgba(255, 196, 0, 0.08)'
        : 'rgba(0, 229, 255, 0.08)';

  const fg = borderColor;

  return (
    <View style={[styles.warningBanner, { backgroundColor: bgColor, borderColor }]}>
      <Icon color={fg} size={18} style={styles.warningIcon} />
      <View style={styles.warningBody}>
        <Text style={[styles.warningTitle, { color: fg }]}>{warning.title}</Text>
        <Text style={[styles.warningMessage, { color: colors.textSecondary }]}>
          {warning.message}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: SIZES.lg,
      paddingBottom: SIZES.xxl * 2,
    },
    section: {
      marginBottom: SIZES.xl,
    },
    dangerSection: {
      marginTop: SIZES.md,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginBottom: SIZES.sm,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
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
    rowInteractive: {
      // Subtle press feedback is handled by TouchableOpacity activeOpacity
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
      fontWeight: '500',
    },
    rowHelper: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
      lineHeight: 16,
    },
    rowLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    rowValueGroup: {
      marginTop: 3,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: SIZES.xs,
    },
    rowValue: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '500',
      maxWidth: 220,
    },
    rowValueEmphasis: {
      fontSize: 15,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: SIZES.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.round,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    divider: {
      height: StyleSheet.hairlineWidth,
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
      paddingVertical: SIZES.md,
      borderRadius: RADIUS.md,
    },
    themeOptionSelected: {
      backgroundColor: colors.surfaceLight,
    },
    themeOptionLabel: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 4,
      fontWeight: '500',
    },
    themeOptionLabelSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    revealContainer: {
      paddingHorizontal: SIZES.lg,
      paddingBottom: SIZES.lg,
    },
    warningsStack: {
      gap: SIZES.sm,
      marginBottom: SIZES.md,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: RADIUS.md,
      borderWidth: 1,
      padding: SIZES.md,
      gap: SIZES.sm,
    },
    warningIcon: {
      marginTop: 1,
    },
    warningBody: {
      flex: 1,
    },
    warningTitle: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 2,
    },
    warningMessage: {
      fontSize: 12,
      lineHeight: 17,
    },
  });
