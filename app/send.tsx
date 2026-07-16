import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { FormField } from '../src/components/FormField';
import { COLORS, SIZES, RADIUS } from '../src/constants/theme';
import { sendXlmTransaction } from '../src/services/stellar';
import { useWalletStore } from '../src/store/walletStore';
import { Send as SendIcon } from 'lucide-react-native';

export default function SendScreen() {
  const router = useRouter();
  const { getSecretKey, refreshWalletData, balance } = useWalletStore();
  
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!destination.trim() || !amount.trim()) {
      Alert.alert('Error', 'Destination and amount are required.');
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
        <FormField
          label="Destination Address (Public Key)"
          placeholder="G..."
          value={destination}
          onChangeText={setDestination}
          autoCapitalize="none"
          autoCorrect={false}
          helperText="Enter the recipient's Stellar public key (starts with 'G')"
        />
        
        <FormField
          label="Amount (XLM)"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          helperText={`Available balance: ${balance} XLM`}
        />

        <FormField
          label="Memo (Optional)"
          placeholder="Payment reference"
          value={memo}
          onChangeText={setMemo}
          helperText="Add a note for the recipient"
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
  sendButton: {
    marginBottom: SIZES.xxl,
  }
});
