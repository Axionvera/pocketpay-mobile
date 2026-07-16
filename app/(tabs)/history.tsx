import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useWalletStore, TransactionRecord } from '../../src/store/walletStore';
import { COLORS, SIZES } from '../../src/constants/theme';
import { Clock } from 'lucide-react-native';
import { TransactionListItem } from '../../src/components/TransactionListItem';

export default function HistoryScreen() {
  const { transactions, isLoading, refreshWalletData, publicKey } = useWalletStore();

  useEffect(() => {
    refreshWalletData();
  }, []);

  const renderItem = ({ item }: { item: TransactionRecord }) => (
    <TransactionListItem
      transaction={item}
      currentPublicKey={publicKey}
      variant="card"
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshWalletData} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Clock color={COLORS.textMuted} size={64} style={{ marginBottom: SIZES.md }} />
              <Text style={styles.emptyText}>No transactions found</Text>
              <Text style={styles.emptySubtext}>Your recent activity will appear here.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SIZES.lg,
  },
  emptyState: {
    padding: SIZES.xl,
    alignItems: 'center',
    marginTop: SIZES.xxl * 2,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
