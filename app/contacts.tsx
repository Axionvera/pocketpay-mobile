import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { COLORS, SIZES, RADIUS } from '../src/constants/theme';
import { useAppStore, Contact } from '../src/store/appStore';
import { validateAddress } from '../src/utils/validation';
import { findDuplicate, duplicateMessage, normalizeAddress } from '../src/utils/address';
import { Trash2, User, AlertTriangle, Pencil } from 'lucide-react-native';

export default function ContactsScreen() {
  const { contacts, addContact, removeContact, updateContact } = useAppStore();
  const [name, setName] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [keyError, setKeyError] = useState<string | undefined>();
  const [duplicateError, setDuplicateError] = useState<string | undefined>();
  const [foundDuplicate, setFoundDuplicate] = useState<Contact | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError && value.trim()) setNameError(undefined);
  };

  const handleKeyChange = (value: string) => {
    setPublicKey(value);
    setKeyError(value.trim() ? validateAddress(value) ?? undefined : undefined);
    if (duplicateError) setDuplicateError(undefined);
    if (foundDuplicate) setFoundDuplicate(null);
  };

  const handleAdd = async () => {
    const currentNameError = name.trim() ? undefined : 'Please enter a name.';
    const currentKeyError = validateAddress(publicKey) ?? undefined;
    setNameError(currentNameError);
    setKeyError(currentKeyError);
    setDuplicateError(undefined);
    setFoundDuplicate(null);

    if (currentNameError || currentKeyError) {
      return;
    }

    // Duplicate detection via utility (consistent normalization)
    const existing = findDuplicate(publicKey, contacts);
    if (existing) {
      setFoundDuplicate(existing);
      setDuplicateError(duplicateMessage(existing.name));
      return;
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: name.trim(),
      publicKey: normalizeAddress(publicKey),
    };

    // Store-level duplicate check (defense in depth)
    const result = await addContact(newContact);
    if (!result.success) {
      setDuplicateError(duplicateMessage(result.duplicateName ?? ''));
      return;
    }

    resetForm();
    setIsAdding(false);
  };

  const handleUpdateExisting = async () => {
    if (!foundDuplicate) return;
    const newName = name.trim() || foundDuplicate.name;
    try {
      await updateContact(foundDuplicate.id, newName);
      Alert.alert(
        'Updated',
        `Contact "${foundDuplicate.name}" has been updated to "${newName}".`,
      );
      resetForm();
      setIsAdding(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update contact.');
    }
  };

  const resetForm = () => {
    setName('');
    setPublicKey('');
    setNameError(undefined);
    setKeyError(undefined);
    setDuplicateError(undefined);
    setFoundDuplicate(null);
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
          <Input label="Name" placeholder="Alice" value={name} onChangeText={handleNameChange} error={nameError} />
          <Input
            label="Public Key"
            placeholder="G..."
            value={publicKey}
            onChangeText={handleKeyChange}
            error={keyError}
            autoCapitalize="none"
          />
          {foundDuplicate && (
            <View style={styles.duplicateBanner}>
              <View style={styles.duplicateBannerHeader}>
                <AlertTriangle color={COLORS.warning} size={18} />
                <Text style={styles.duplicateBannerTitle}>Duplicate Address</Text>
              </View>
              <Text style={styles.duplicateBannerText}>
                This address is already saved as "{foundDuplicate.name}".
              </Text>
              <Text style={styles.duplicateBannerHint}>
                You can update the existing entry's name below, or cancel to keep it unchanged.
              </Text>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdateExisting}>
                <Pencil color={COLORS.primary} size={16} />
                <Text style={styles.updateButtonText}>
                  Update "{foundDuplicate.name}" to "{name.trim() || foundDuplicate.name}"
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {duplicateError && !foundDuplicate && (
            <Text style={styles.duplicateWarning}>{duplicateError}</Text>
          )}
          <View style={styles.actions}>
            <Button title="Save Contact" onPress={handleAdd} style={styles.actionBtn} />
            <Button title="Cancel" variant="outline" onPress={() => { resetForm(); setIsAdding(false); }} style={styles.actionBtn} />
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
  },
  duplicateWarning: {
    color: COLORS.warning,
    fontSize: 12,
    marginTop: SIZES.xs,
    marginLeft: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  duplicateBanner: {
    backgroundColor: 'rgba(255, 196, 0, 0.08)',
    borderRadius: RADIUS.md,
    padding: SIZES.md,
    marginTop: SIZES.sm,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 196, 0, 0.25)',
  },
  duplicateBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },
  duplicateBannerTitle: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '700',
  },
  duplicateBannerText: {
    color: COLORS.warning,
    fontSize: 13,
    marginBottom: SIZES.xs,
    lineHeight: 18,
  },
  duplicateBannerHint: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: SIZES.md,
    lineHeight: 17,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: RADIUS.sm,
    padding: SIZES.sm + 2,
    gap: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  updateButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
