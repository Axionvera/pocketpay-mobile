import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Eye, EyeOff, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, RADIUS, SIZES } from '../constants/theme';
import { Button } from './Button';

interface SecretKeyRevealProps {
  secretKey: string;
  warningTitle?: string;
  warningMessage?: string;
  autoHideMs?: number;
}

export const SecretKeyReveal: React.FC<SecretKeyRevealProps> = ({
  secretKey,
  warningTitle = 'Security Warning',
  warningMessage = 'Anyone with this key can steal your funds. Are you sure you want to reveal it?',
  autoHideMs = 30000,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isRevealed) {
      timeoutId = setTimeout(() => {
        setIsRevealed(false);
      }, autoHideMs);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRevealed, autoHideMs]);

  const handleReveal = () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    Alert.alert(
      warningTitle,
      warningMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reveal', 
          style: 'destructive',
          onPress: () => setIsRevealed(true)
        }
      ]
    );
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(secretKey);
    Alert.alert('Copied', 'Secret key copied to clipboard. Keep it safe!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.keyWrapper}>
          {isRevealed ? (
            <Text style={styles.secretValue} selectable accessible={true} accessibilityLabel="Revealed secret key">
              {secretKey}
            </Text>
          ) : (
            <Text style={styles.maskedValue} accessible={true} accessibilityLabel="Masked secret key">
              ********************************************************
            </Text>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleReveal}
            accessible={true}
            accessibilityLabel={isRevealed ? "Hide secret key" : "Reveal secret key"}
          >
            {isRevealed ? <EyeOff color={COLORS.textPrimary} size={20} /> : <Eye color={COLORS.textPrimary} size={20} />}
            <Text style={styles.actionText}>{isRevealed ? 'Hide' : 'Reveal'}</Text>
          </TouchableOpacity>
          
          {isRevealed && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleCopy}
              accessible={true}
              accessibilityLabel="Copy secret key"
            >
              <Copy color={COLORS.textPrimary} size={20} />
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.sm,
  },
  box: {
    backgroundColor: 'rgba(255, 61, 0, 0.05)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 61, 0, 0.3)',
    overflow: 'hidden',
  },
  keyWrapper: {
    padding: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 61, 0, 0.1)',
  },
  secretValue: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: 'bold',
  },
  maskedValue: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  actions: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 61, 0, 0.02)',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.sm,
    height: 44, // Minimum touch target
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SIZES.xs,
  },
});
