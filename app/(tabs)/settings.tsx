import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { COLORS, SIZES, RADIUS } from '../../src/constants/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { useAppStore } from '../../src/store/appStore';
import { Users, LogOut, Key, Moon, Sun } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { getDiagnostics } from '../../src/utils/diagnostics';

export default function SettingsScreen() {
  const router = useRouter();
  const { clearWallet, getSecretKey } = useWalletStore();
  const { isDarkMode, toggleDarkMode } = useAppStore();

  const handleExportKey = async () => {
    const secret = await getSecretKey();
    if (secret) {
      Alert.alert(
        'Export Secret Key',
        'WARNING: Never share your secret key with anyone. Anyone with this key can steal your funds.\n\nDo you want to copy it to clipboard?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Copy to Clipboard', 
            style: 'destructive',
            onPress: async () => {
              await Clipboard.setStringAsync(secret);
              Alert.alert('Copied', 'Secret key copied to clipboard.');
            }
          }
        ]
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to clear your wallet from this device? Make sure you have your secret key saved, otherwise your funds will be lost forever.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out & Clear', 
          style: 'destructive',
          onPress: async () => {
            await clearWallet();
            // Router will handle redirect to auth due to _layout logic
          }
        }
      ]
    );
  };

  const handleExportDiagnostics = async () => {
    try {
      const diagnostics = getDiagnostics();
      await Share.share({
        message: diagnostics,
        title: 'App Diagnostics',
      });
    } catch (error) {
      console.error('Failed to export diagnostics:', error);
      Alert.alert('Error', 'Failed to export diagnostics.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              {isDarkMode ? <Moon color={COLORS.textPrimary} size={24} /> : <Sun color={COLORS.textPrimary} size={24} />}
              <Text style={styles.rowText}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.card}>
          <Button 
            title="Address Book / Contacts" 
            variant="outline" 
            onPress={() => router.push('/contacts')}
            style={styles.menuButton}
          />
          <Button 
            title="Export Secret Key" 
            variant="outline" 
            onPress={handleExportKey}
            style={styles.menuButton}
          />
        </View>
      </View>

      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development</Text>
          <View style={styles.card}>
            <Button 
              title="Export Diagnostics" 
              variant="outline" 
              onPress={handleExportDiagnostics}
              style={[styles.menuButton, { borderBottomWidth: 0 }]}
            />
          </View>
        </View>
      )}

      <View style={[styles.section, { marginTop: SIZES.xl }]}>
        <Button 
          title="Sign Out & Clear Wallet" 
          variant="danger" 
          onPress={handleSignOut}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Stellar PocketPay v1.0.0</Text>
        <Text style={styles.footerText}>Network: Testnet</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.lg,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    marginLeft: SIZES.md,
  },
  menuButton: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderRadius: 0,
    justifyContent: 'flex-start',
    paddingHorizontal: SIZES.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: SIZES.xl,
    paddingBottom: SIZES.xxl * 2,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  }
});
