import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import { COLORS, RADIUS, SIZES } from '../../src/constants/theme';

interface TransactionDetailData {
  id?: string;
  hash?: string;
  amount?: string;
  asset?: string;
  from?: string;
  to?: string;
  createdAt?: string;
  memo?: string;
  type?: string;
}

const normalizeTransaction = (transaction?: TransactionDetailData | null): TransactionDetailData => ({
  id: transaction?.id,
  hash: transaction?.hash || (transaction as any)?.transaction_hash || undefined,
  amount: transaction?.amount,
  asset: transaction?.asset || (transaction as any)?.asset_type || 'XLM',
  from: transaction?.from || (transaction as any)?.source_account || undefined,
  to: transaction?.to || (transaction as any)?.destination_account || undefined,
  createdAt: transaction?.createdAt || (transaction as any)?.created_at || (transaction as any)?.timestamp,
  memo: transaction?.memo || (transaction as any)?.memo_text || undefined,
  type: transaction?.type || (transaction as any)?.type,
});

const getExplorerUrl = (hash?: string) =>
  hash
    ? `https://stellar.expert/explorer/testnet/tx/${hash}`
    : 'https://stellar.expert/explorer/testnet';

export default function TransactionDetailScreen() {
  const params = useLocalSearchParams<{ id?: string; transaction?: string }>();
  const transaction = React.useMemo<TransactionDetailData | null>(() => {
    if (!params.transaction) return null;
    try {
      return JSON.parse(params.transaction) as TransactionDetailData;
    } catch {
      return null;
    }
  }, [params.transaction]);

  const detail = normalizeTransaction(transaction);
  const formattedDate = detail.createdAt
    ? new Date(detail.createdAt).toLocaleString()
    : 'Unavailable';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Transaction Details</Text>
        <Text style={styles.subtitle}>A concise view of the selected payment.</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Hash</Text>
          <Text style={styles.value} numberOfLines={4}>
            {detail.hash || 'Unavailable'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>
            {detail.amount || '—'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Asset</Text>
          <Text style={styles.value}>{detail.asset || 'Unknown'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Source</Text>
          <Text style={styles.value} numberOfLines={3}>
            {detail.from || 'Unavailable'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Destination</Text>
          <Text style={styles.value} numberOfLines={3}>
            {detail.to || 'Unavailable'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formattedDate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Memo</Text>
          <Text style={styles.value}>{detail.memo || '—'}</Text>
        </View>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openURL(getExplorerUrl(detail.hash))}
        >
          <Text style={styles.linkText}>View on explorer</Text>
          <ExternalLink size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: SIZES.xs,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SIZES.lg,
  },
  row: {
    marginBottom: SIZES.md,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: SIZES.xs,
  },
  value: {
    color: COLORS.textPrimary,
    fontSize: 15,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    marginTop: SIZES.md,
    paddingVertical: SIZES.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
