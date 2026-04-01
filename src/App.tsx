import React, { useState, useEffect, memo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  Alert, 
  FlatList,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit2, 
  Bell, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Circle, 
  X, 
  Save, 
  Download, 
  Upload, 
  Clock,
  Repeat,
} from 'lucide-react-native';
import { Item } from './types';

const APP_COLORS = [
  '#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa',
  '#d4af37', '#b8860b', '#daa520', '#ffd700', '#fff700', '#facc15',
  '#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399',
  '#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171',
  '#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa',
  '#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24',
  '#111827', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af',
  '#500724', '#701a75', '#86198f', '#a21caf', '#c026d3', '#d946ef'
];

// Notification Setup
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ItemCard = memo(({ item, all, onDelete, onEdit, onAddSub, onToggle, onNotificationPress }: { item: Item; all: Item[]; onDelete: (id: string) => void; onEdit: (item: Item) => void; onAddSub: (id: string) => void; onToggle: (item: Item) => void; onNotificationPress?: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const children = all.filter((i: Item) => i.parentId === item.id);

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: item.name,
        body: item.description || 'Reminder!',
      },
      trigger: null, // Immediate
    });
  };

  return (
    <View style={styles.cardContainer}>
      <View style={[styles.card, item.completed && { opacity: 0.6 }]}>
        {item.type === 'static' && <View style={[styles.colorBar, { backgroundColor: item.color || APP_COLORS[0] }]} />}
        
        <View style={styles.cardRow}>
          <TouchableOpacity onPress={() => onToggle(item)}>
<CheckCircle2 style={{ color: "#22c55e" }} size={24} /> : <Circle style={{ color: "#1e3a8a" }} size={24} />}
          </TouchableOpacity>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, item.completed && styles.lineThrough]}>{item.name}</Text>
            {item.description && <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>}
            
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionIcon} onPress={() => onEdit(item)}>
<Edit2 style={{ color: "#94a3b8" }} size={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={() => onNotificationPress?.(item.id)}>
<Bell style={{ color: "#94a3b8" }} size={16} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={() => onDelete(item.id)}>
<Trash2 style={{ color: "#ef4444" }} size={16} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionIcon, { marginLeft: 'auto' }]} onPress={() => onAddSub(item.id)}>
                <Plus color="#22c55e" size={16} />
              </TouchableOpacity>
            </View>
          </View>

          {children.length > 0 && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown color="#cbd5e1" size={24} /> : <ChevronRight color="#cbd5e1" size={24} />}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {expanded && children.length > 0 && (
        <View style={styles.subItems}>
          {children.map((child: Item) => (
            <ItemCard 
              key={child.id} 
              item={child} 
              all={all} 
              onDelete={onDelete} 
              onEdit={onEdit} 
              onAddSub={onAddSub} 
              onToggle={onToggle}
            />
          ))}
        </View>
      )}
    </View>
  );
});

function InnerApp() {
  const {
    items, loading, refresh, add, update, del, toggle, 
    scheduleItemNotification, importBackup, exportData
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // Form State
  const [formType, setFormType] = useState<'checklist' | 'static'>('checklist');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState(APP_COLORS[0]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications to use the reminder feature.');
    }
  };

  const handleAddItem = async () => {
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      parentId: parentId,
      type: formType,
      name: formName,
      description: formType === 'static' ? formDesc : undefined,
      color: formType === 'static' ? formColor : undefined,
      completed: false,
      createdAt: Date.now(),
      notifications: []
    };
    await add(newItem);
    resetForm();
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    const updatedItem: Item = {
      ...editingItem,
      name: formName,
      description: formDesc,
      color: formColor,
      type: formType
    };
    await update(updatedItem);
    resetForm();
  };



  const handleDeleteItem = async (id: string) => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item and its sub-items?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => del(id)
        }
      ]
    );
  };

  const handleNotificationPress = (id: string) => {
    setSelectedItemId(id);
    setIsNotifModalOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormColor(APP_COLORS[0]);
    setFormType('checklist');
    setIsAddModalOpen(false);
    setEditingItem(null);
    setParentId(null);
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.type === 'success') {
        await importBackup(result.uri);
      }
    } catch (e) {
      console.error('Import failed', e);
    }
  };

  const exportDataFunc = async () => {
    try {
      const data = await exportData();
      const jsonValue = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + 'hk_backup.json';
      await FileSystem.writeAsStringAsync(fileUri, jsonValue);
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const renderItem = ({ item }: { item: Item }) => {
    if (item.parentId) return null;
    return (
      <ItemCard 
        item={item} 
        all={items} 
        onDelete={handleDeleteItem}
        onEdit={(i) => {
          setEditingItem(i);
          setFormName(i.name);
          setFormDesc(i.description || '');
          setFormColor(i.color || APP_COLORS[0]);
          setFormType(i.type);
          setIsAddModalOpen(true);
        }}
        onAddSub={(id) => { setParentId(id); setIsAddModalOpen(true); }}
        onToggle={(item) => toggle(item.id, !item.completed)}
        onNotificationPress={handleNotificationPress}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png' }} 
                style={styles.logo} 
              />
              <View>
                <Text style={styles.headerTitle}>HK organizer</Text>
                <Text style={styles.headerSubtitle}>Your premium assistant</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => setActiveTab(activeTab === 'home' ? 'settings' : 'home')}
              style={styles.settingsButton}
            >
              {activeTab === 'home' ? <Settings color="white" size={24} /> : <X color="white" size={24} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {activeTab === 'home' ? (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Plus color="#cbd5e1" size={48} />
                  <Text style={styles.emptyText}>No items yet. Start organizing!</Text>
                </View>
              }
            />
          ) : (
            <ScrollView style={styles.settingsView}>
              <View style={styles.settingsCard}>
                <Text style={styles.cardTitle}>Data Management</Text>
<TouchableOpacity style={styles.actionButton} onPress={exportDataFunc}>
                  <Download color="#1e3a8a" size={20} />
                  <Text style={styles.actionButtonText}>Backup Data (Export)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#fef9c3', marginTop: 12 }]} onPress={importData}>
                  <Upload color="#a16207" size={20} />
                  <Text style={[styles.actionButtonText, { color: '#a16207' }]}>Restore Data (Import)</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>

        {/* FAB */}
        {activeTab === 'home' && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Plus color="#1e3a8a" size={32} />
          </TouchableOpacity>
        )}

        {/* Add/Edit Modal */}
        <Modal visible={isAddModalOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingItem ? "Edit Item" : "Add New Item"}</Text>
                <TouchableOpacity onPress={resetForm}>
                  <X color="#94a3b8" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {!editingItem && (
                  <View style={styles.typeToggle}>
                    <TouchableOpacity 
                      style={[styles.toggleBtn, formType === 'checklist' && styles.toggleBtnActive]}
                      onPress={() => setFormType('checklist')}
                    >
                      <Text style={[styles.toggleText, formType === 'checklist' && styles.toggleTextActive]}>Checklist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.toggleBtn, formType === 'static' && styles.toggleBtnActive]}
                      onPress={() => setFormType('static')}
                    >
                      <Text style={[styles.toggleText, formType === 'static' && styles.toggleTextActive]}>Static Item</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.label}>NAME</Text>
                <TextInput 
                  style={styles.input}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="What needs to be done?"
                />

                {formType === 'static' && (
                  <>
                    <Text style={styles.label}>DESCRIPTION</Text>
                    <TextInput 
                      style={[styles.input, styles.textArea]}
                      value={formDesc}
                      onChangeText={setFormDesc}
                      placeholder="Add more details..."
                      multiline
                      numberOfLines={4}
                    />
                    
                    <Text style={styles.label}>COLOR PALETTE</Text>
                    <View style={styles.colorGrid}>
                      {APP_COLORS.map(c => (
                        <TouchableOpacity 
                          key={c}
                          style={[styles.colorCircle, { backgroundColor: c }, formColor === c && styles.colorCircleActive]}
                          onPress={() => setFormColor(c)}
                        />
                      ))}
                    </View>
                  </>
                )}

              <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={editingItem ? handleUpdateItem : handleAddItem}
                >
                  <Save color="#ffd700" size={20} />
                  <Text style={styles.saveButtonText}>{editingItem ? "Update Item" : "Save Item"}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1e3a8a', padding: 20, paddingTop: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, backgroundColor: 'white', borderRadius: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffd700' },
  headerSubtitle: { fontSize: 14, color: '#bfdbfe' },
  settingsButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  main: { flex: 1 },
  listContent: { padding: 20 },
  emptyState: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyText: { marginTop: 12, color: '#64748b' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, backgroundColor: '#ffd700', borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#ffd700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  cardContainer: { marginBottom: 12 },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: '#f1f5f9', overflow: 'hidden' },
  colorBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  cardDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cardActions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionIcon: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 12 },
  subItems: { marginLeft: 24, marginTop: 8, borderLeftWidth: 2, borderLeftColor: '#f1f5f9', paddingLeft: 12 },
  lineThrough: { textDecorationLine: 'line-through' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(30,58,138,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  typeToggle: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 20, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  toggleBtnActive: { backgroundColor: 'white' },
  toggleText: { fontWeight: 'bold', color: '#94a3b8' },
  toggleTextActive: { color: '#1e3a8a' },
  label: { fontSize: 10, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 20, padding: 16, marginBottom: 20, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  colorCircle: { width: 35, height: 35, borderRadius: 10 },
  colorCircleActive: { borderWidth: 3, borderColor: '#94a3b8' },
  saveButton: { backgroundColor: '#1e3a8a', padding: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveButtonText: { color: '#ffd700', fontWeight: 'bold', fontSize: 16 },
  settingsView: { padding: 20 },
  settingsCard: { backgroundColor: 'white', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#f1f5f9' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  actionButton: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionButtonText: { color: '#1e3a8a', fontWeight: 'bold' }
});
