import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { COLORS, SIZES, RADIUS } from '../src/constants/theme';
import { sendXlmTransaction } from '../src/services/stellar';
import { useWalletStore } from '../src/store/walletStore';
import { useAppStore } from '../src/store/appStore';
import { validateDestinationAddress } from '../src/utils/stellarAddress';

export default function SendScreen() {
  const router = useRouter();
  const { getSecretKey, refreshWalletData, balance } = useWalletStore();
  const { contacts } = useAppStore();
  
  const [destination, setDestination] = useState('');
  const [destinationError, setDestinationError] = useState<string | undefined>();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    const validation = validateDestinationAddress(value);
    setDestinationError(validation.error);
  };

  const handleSelectContact = (publicKey: string) => {
    const validation = validateDestinationAddress(publicKey);
    if (validation.error) {
      Alert.alert('Invalid contact', validation.error);
      return;
    }

    setDestination(publicKey);
    setDestinationError(undefined);
    setShowContactPicker(false);
  };

  const handleSend = async () => {
    const validation = validateDestinationAddress(destination);
    if (!destination.trim() || !amount.trim()) {
      Alert.alert('Error', 'Destination and amount are required.');
      return;
    }

    if (validation.error) {
      setDestinationError(validation.error);
      Alert.alert('Error', validation.error);
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0.');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      Alert.alert('Error', 'Insufficient balance.');
      return;
    }

    try {
      setIsLoading(true);
      const secretKey = await getSecretKey();
      if (!secretKey) throw new Error('Secret key not found.');

      await sendXlmTransaction(secretKey, destination.trim(), amount.trim(), memo.trim());
      
      Alert.alert('Success', 'Transaction sent successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            refreshWalletData();
            router.back();
          } 
        }
      ]);
    } catch (error: any) {
      Alert.alert('Transaction Failed', error.message || 'An error occurred while sending.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Send XLM</Text>
        <Text style={styles.subtitle}>Available Balance: {balance} XLM</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Destination Address (Public Key)"
          placeholder="G..."
          value={destination}
          onChangeText={handleDestinationChange}
          autoCapitalize="none"
          autoCorrect={false}
          error={destinationError}
        />

        <View style={styles.contactPickerContainer}>
          <TouchableOpacity
            style={styles.contactPickerButton}
            onPress={() => setShowContactPicker((prev) => !prev)}
            disabled={contacts.length === 0}
          >
            <Text style={styles.contactPickerText}>
              {contacts.length > 0 ? 'Choose from saved contacts' : 'No saved contacts yet'}
            </Text>
          </TouchableOpacity>

          {showContactPicker && contacts.length > 0 && (
            <View style={styles.contactList}>
              {contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactItem}
                  onPress={() => handleSelectContact(contact.publicKey)}
                >
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactKey} numberOfLines={1} ellipsizeMode="middle">
                    {contact.publicKey}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        <Input
          label="Amount (XLM)"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Input
          label="Memo (Optional)"
          placeholder="Payment reference"
          value={memo}
          onChangeText={setMemo}
        />
      </View>

      <Button 
        title="Send Payment" 
        onPress={handleSend} 
        isLoading={isLoading}
        style={styles.sendButton}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.xl,
  },
  header: {
    marginBottom: SIZES.xl,
    marginTop: SIZES.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  form: {
    flex: 1,
  },
  contactPickerContainer: {
    marginBottom: SIZES.md,
  },
  contactPickerButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  contactPickerText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  contactList: {
    marginTop: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.sm,
  },
  contactItem: {
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  contactName: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: SIZES.xs,
  },
  contactKey: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  sendButton: {
    marginBottom: SIZES.xxl,
  }
});
