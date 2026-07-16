import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { COLORS, SIZES, RADIUS } from '../src/constants/theme';
import { useAppStore, Contact } from '../src/store/appStore';
import { validateDestinationAddress } from '../src/utils/stellarAddress';
import { Trash2, User } from 'lucide-react-native';

export default function ContactsScreen() {
  const { contacts, addContact, removeContact } = useAppStore();
  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !publicKey.trim()) {
      Alert.alert('Error', 'Name and Public Key are required.');
      return;
    }

    const validation = validateDestinationAddress(publicKey);
    if (validation.error) {
      Alert.alert('Error', validation.error);
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: name.trim(),
      publicKey: publicKey.trim(),
    };

    await addContact(newContact);
    setName('');
    setPublicKey('');
    setIsAdding(false);
  };

  const handleRemove = (id: string) => {
    Alert.alert('Delete Contact', 'Are you sure you want to remove this contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeContact(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      {isAdding ? (
        <View style={styles.addForm}>
          <Text style={styles.title}>Add New Contact</Text>
          <Input label="Name" placeholder="Alice" value={name} onChangeText={setName} />
          <Input 
            label="Public Key" 
            placeholder="G..." 
            value={publicKey} 
            onChangeText={setPublicKey} 
            autoCapitalize="none"
          />
          <View style={styles.actions}>
            <Button title="Save Contact" onPress={handleAdd} style={styles.actionBtn} />
            <Button title="Cancel" variant="outline" onPress={() => setIsAdding(false)} style={styles.actionBtn} />
          </View>
        </View>
      ) : (
        <>
          <Button title="+ Add Contact" onPress={() => setIsAdding(true)} style={styles.addButton} />
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <User color={COLORS.textMuted} size={48} style={{ marginBottom: SIZES.md }} />
                <Text style={styles.emptyText}>No contacts yet</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactKey} numberOfLines={1} ellipsizeMode="middle">
                    {item.publicKey}
                  </Text>
                </View>
                <Trash2 color={COLORS.error} size={20} onPress={() => handleRemove(item.id)} />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
  },
  addButton: {
    marginBottom: SIZES.lg,
  },
  listContent: {
    paddingBottom: SIZES.xxl,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: RADIUS.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  contactInfo: {
    flex: 1,
    marginRight: SIZES.md,
  },
  contactName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactKey: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: SIZES.xxl * 2,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  addForm: {
    backgroundColor: COLORS.surface,
    padding: SIZES.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SIZES.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: SIZES.xs,
  }
});
