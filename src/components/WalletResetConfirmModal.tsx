import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, RADIUS } from '../constants/theme';
import { ShieldAlert } from 'lucide-react-native';
import { Input } from './Input';
import { ConfirmModal } from './ConfirmModal';

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
    <ConfirmModal
      visible={visible}
      title="Reset Wallet"
      message="This will remove your wallet data from this device. Make sure you have backed up your secret key, otherwise your funds cannot be recovered."
      confirmLabel="Reset Wallet"
      cancelLabel="Cancel"
      destructive
      isLoading={isLoading}
      confirmDisabled={!isConfirmed}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
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
      <View style={styles.disclaimer}>
        <ShieldAlert color={COLORS.textMuted} size={14} style={{ marginRight: 6 }} />
        <Text style={styles.disclaimerText}>
          This action is irreversible. Ensure you have your secret key saved.
        </Text>
      </View>
    </ConfirmModal>
  );
};

const styles = StyleSheet.create({
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(160, 170, 191, 0.08)',
    borderRadius: RADIUS.sm,
    padding: SIZES.sm,
  },
  disclaimerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
