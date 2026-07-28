import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Input } from '@/components/Input';
import { useContactStore, Contact } from '@/features/contacts/contactStore';
import { X, User, Clock, Trash2, Edit2 } from 'lucide-react-native';

interface ContactPickerProps {
  visible: boolean;
  onSelect: (address: string) => void;
  onCancel: () => void;
  onAddNew: () => void;
  onEdit: (contact: Contact) => void; // Added for management
}

export const ContactPicker: React.FC<ContactPickerProps> = ({
  visible,
  onSelect,
  onCancel,
  onAddNew,
  onEdit
}) => {
  const [search, setSearch] = useState('');
  const { contacts, recentRecipients, getContactByAddress, deleteContact } = useContactStore();

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const query = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query)
    );
  }, [contacts, search]);

  const recentWithNames = useMemo(() => {
    return recentRecipients
      .map((addr) => {
        const contact = getContactByAddress(addr);
        return { address: addr, name: contact?.name };
      })
      .slice(0, 5);
  }, [recentRecipients, getContactByAddress]);

  const handleDelete = (contact: Contact) => {
    Alert.alert(
      "Delete Contact",
      `Are you sure you want to remove ${contact.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteContact(contact.id) }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Contact</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Input
              placeholder="Search contacts..."
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView style={styles.list}>
            {/* Recent Recipients Section */}
            {recentWithNames.length > 0 && !search && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Recipients</Text>
                {recentWithNames.map((item) => (
                  <TouchableOpacity
                    key={item.address}
                    style={styles.contactItem}
                    onPress={() => onSelect(item.address)}
                  >
                    <View style={styles.icon}><Clock size={20} color="#666" /></View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name || 'Unknown'}</Text>
                      <Text style={styles.contactAddress} numberOfLines={1}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Saved Contacts Section with Edit/Delete */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved Contacts</Text>
              {filteredContacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>{search ? 'No contacts found' : 'No contacts yet'}</Text>
                </View>
              ) : (
                filteredContacts.map((contact) => (
                  <View key={contact.id} style={styles.contactRow}>
                    <TouchableOpacity
                      style={[styles.contactItem, { flex: 1 }]}
                      onPress={() => onSelect(contact.address)}
                    >
                      <View style={styles.icon}><User size={20} color="#666" /></View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{contact.name}</Text>
                        <Text style={styles.contactAddress} numberOfLines={1}>{contact.address}</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.actionButtons}>
                       <TouchableOpacity onPress={() => onEdit(contact)} style={styles.actionBtn}>
                         <Edit2 size={18} color="#0066cc" />
                       </TouchableOpacity>
                       <TouchableOpacity onPress={() => handleDelete(contact)} style={styles.actionBtn}>
                         <Trash2 size={18} color="#ff4444" />
                       </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.addButton} onPress={onAddNew}>
            <Text style={styles.addButtonText}>+ Add New Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... Keep existing styles ...
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingRight: 10,
  },
  actionBtn: {
    padding: 10,
    marginLeft: 5,
  },
  // Update contactItem to remove margin/bg as it's now in contactRow
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  // ... rest of your styles ...
});
