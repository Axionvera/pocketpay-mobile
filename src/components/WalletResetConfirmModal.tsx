import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES, RADIUS } from '../constants/theme';
import { X, ShieldAlert, Trash2 } from 'lucide-react-native';
import { Input } from './Input';

interface WalletResetConfirmModalProps {
  visible: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const CONFIRMATION_TEXT = 'RESET';

export const WalletResetConfirmModal: React.FC<WalletResetConfirmModalProps> = ({
  visible,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [typedText, setTypedText] = useState('');

  const isConfirmed = typedText === CONFIRMATION_TEXT;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Trash2 color={COLORS.error} size={36} />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCancel}
              disabled={isLoading}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X color={COLORS.textMuted} size={22} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Reset Wallet</Text>
          <Text style={styles.description}>
            This will remove your wallet data from this device.
            Make sure you have backed up your secret key, otherwise your funds cannot be recovered.
          </Text>

          {/* Typed Confirmation */}
          <Input
            label={`Type "${CONFIRMATION_TEXT}" to confirm`}
            value={typedText}
            onChangeText={setTypedText}
            placeholder={CONFIRMATION_TEXT}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect={false}
            editable={!isLoading}
          />

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <ShieldAlert color={COLORS.textMuted} size={14} style={{ marginRight: 6 }} />
            <Text style={styles.disclaimerText}>
              This action is irreversible. Ensure you have your secret key saved.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                !isConfirmed || isLoading ? styles.confirmButtonDisabled : null,
              ]}
              onPress={onConfirm}
              disabled={!isConfirmed || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.background} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Reset Wallet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(244, 67, 54, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(160, 170, 191, 0.08)',
    borderRadius: RADIUS.sm,
    padding: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  disclaimerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surfaceLight,
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  confirmButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '600',
  },
});
