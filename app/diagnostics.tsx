import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Button } from '../src/components/Button';
import { SIZES, RADIUS, ThemeColors } from '../src/constants/theme';
import { useTheme } from '../src/hooks/useTheme';
import { getDiagnostics } from '../src/utils/diagnostics';

export default function DiagnosticsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const diagnosticsData = getDiagnostics();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(diagnosticsData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Diagnostics', headerBackTitle: 'Settings' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.codeText}>{diagnosticsData}</Text>
        </View>
        <Button
          title={copied ? "Copied!" : "Copy to Clipboard"}
          onPress={handleCopy}
          style={styles.button}
        />
      </ScrollView>
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: SIZES.lg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: SIZES.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: SIZES.lg,
  },
  codeText: {
    color: colors.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  button: {
    marginTop: SIZES.sm,
  },
});
