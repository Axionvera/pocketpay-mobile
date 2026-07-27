import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Input } from '@/components/Input';
import { useContactStore } from '@/features/contacts/contactStore';
import { X, User, Clock } from 'lucide-react-native';

interface ContactPickerProps {
  visible: boolean;
  onSelect: (address: string) => void;
  onCancel: () => void;
  onAddNew: () => void;
}

export const ContactPicker: React.FC<ContactPickerProps> = ({
  visible,
  onSelect,
  onCancel,
  onAddNew,
}) => {
  const [search, setSearch] = useState('');
  const { contacts, recentRecipients, getContactByAddress } = useContactStore();

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
            {recentWithNames.length > 0 && !search && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Recipients</Text>
                {recentWithNames.map((item) => (
                  <TouchableOpacity
                    key={item.address}
                    style={styles.contactItem}
                    onPress={() => onSelect(item.address)}
                  >
                    <View style={styles.icon}>
                      <Clock size={20} color="#666" />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>
                        {item.name || 'Unknown'}
                      </Text>
                      <Text style={styles.contactAddress} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Saved Contacts</Text>
              {filteredContacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {search ? 'No contacts found' : 'No contacts yet'}
                  </Text>
                </View>
              ) : (
                filteredContacts.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    style={styles.contactItem}
                    onPress={() => onSelect(contact.address)}
                  >
                    <View style={styles.icon}>
                      <User size={20} color="#666" />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactAddress} numberOfLines={1}>
                        {contact.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactAddress: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
});
