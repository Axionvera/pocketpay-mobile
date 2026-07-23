import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Stack } from 'expo-router';
import { getDiagnostics } from '../src/utils/diagnostics'; // Adjust import path if needed

export default function DiagnosticsScreen() {
  const [diagnosticsJson, setDiagnosticsJson] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);

  const loadDiagnostics = () => {
    const raw = getDiagnostics();
    setDiagnosticsJson(raw);
    try {
      setParsedData(JSON.parse(raw));
    } catch {
      setParsedData(null);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleShare = async () => {
    if (!diagnosticsJson) return;
    try {
      await Share.share({
        message: diagnosticsJson,
        title: 'App Diagnostics Log',
      });
    } catch (error) {
      console.error('Error sharing diagnostics:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Diagnostics' }} />

      <Text style={styles.title}>System Diagnostics</Text>
      <Text style={styles.description}>
        Safe, redacted app status for troubleshooting and support. No private keys, seed phrases, or sensitive wallet balances are exposed.
      </Text>

      {parsedData && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Environment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Platform</Text>
            <Text style={styles.value}>{parsedData.environment.platform} ({parsedData.environment.osVersion})</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>App Version</Text>
            <Text style={styles.value}>{parsedData.environment.appVersion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mode</Text>
            <Text style={styles.value}>{parsedData.environment.isDevelopment ? 'Development' : 'Production'}</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Wallet Status</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Wallet Configured</Text>
            <Text style={styles.value}>{parsedData.walletState.hasPublicKey ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Balance Loaded</Text>
            <Text style={styles.value}>{parsedData.walletState.isBalanceLoaded ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Recent Error</Text>
            <Text style={styles.value}>{parsedData.walletState.lastError || 'None'}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleShare}>
        <Text style={styles.buttonText}>Export Diagnostics Log</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f9fa' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  description: { fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e9ecef' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#212529', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' },
  label: { fontSize: 14, color: '#495057' },
  value: { fontSize: 14, fontWeight: '500', color: '#212529' },
  button: { backgroundColor: '#0066cc', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 32 },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
});