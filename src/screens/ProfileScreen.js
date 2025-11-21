import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../config/ThemeContext';
import DebugScreenLabel from '../components/DebugScreenLabel';

const MEMORIES_KEY = '@noctaliae_user_memories';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    try {
      const stored = await AsyncStorage.getItem(MEMORIES_KEY);
      if (stored) {
        setMemories(JSON.parse(stored));
      }
    } catch (error) {
      console.error('❌ Erreur chargement mémories:', error);
    }
  }

  async function saveMemories(updatedMemories) {
    try {
      await AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updatedMemories));
      setMemories(updatedMemories);
    } catch (error) {
      console.error('❌ Erreur sauvegarde mémories:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
    }
  }

  function handleAddMemory() {
    const trimmed = newMemory.trim();
    
    if (!trimmed) {
      Alert.alert('Champ vide', 'Écris quelque chose sur toi', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
      return;
    }

    if (trimmed.length < 5) {
      Alert.alert('Trop court', 'Minimum 5 caractères', [{text: 'OK'}], {userInterfaceStyle: 'dark'});
      return;
    }

    const newMemoryObj = {
      id: Date.now().toString(),
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updated = [newMemoryObj, ...memories];
    saveMemories(updated);
    setNewMemory('');
    setIsAdding(false);
  }

  function handleDeleteMemory(id) {
    Alert.alert(
      'Supprimer',
      'Cette mémoire sera effacée définitivement',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updated = memories.filter(m => m.id !== id);
            saveMemories(updated);
          }
        }
      ],
      {userInterfaceStyle: 'dark'}
    );
  }

  function renderMemoryCard(memory) {
    const date = new Date(memory.createdAt);
    const formattedDate = date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <View 
        key={memory.id}
        style={[
          styles.memoryCard,
          { 
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.cardBorder
          }
        ]}
      >
        <View style={styles.memoryContent}>
          <MaterialCommunityIcons 
            name="brain" 
            size={20} 
            color={theme.colors.primary} 
            style={styles.memoryIcon}
          />
          <Text style={[styles.memoryText, { color: theme.colors.text }]}>
            {memory.text}
          </Text>
        </View>
        
        <View style={styles.memoryFooter}>
          <Text style={[styles.memoryDate, { color: theme.colors.textSecondary }]}>
            {formattedDate}
          </Text>
          <TouchableOpacity 
            onPress={() => handleDeleteMemory(memory.id)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <DebugScreenLabel screenName="👤 Profil" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) + 15 }]}>
        <View style={styles.headerContent}>
          <MaterialCommunityIcons 
            name="account-circle" 
            size={32} 
            color={theme.colors.primary} 
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Mon Profil
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={[styles.infoCard, { backgroundColor: theme.colors.primaryGlow }]}>
          <MaterialCommunityIcons name="information" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Ces mémories aident Noctaliæ à personnaliser ses analyses et conversations
          </Text>
        </View>
      </View>

      {/* Memories List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Aucune mémoire
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Ajoute des infos sur toi pour des analyses plus personnalisées
            </Text>
          </View>
        ) : (
          memories.map(memory => renderMemoryCard(memory))
        )}
      </ScrollView>

      {/* Add Memory Section */}
      {isAdding ? (
        <View style={[
          styles.addMemoryContainer,
          { 
            backgroundColor: theme.colors.cardBackground,
            borderTopColor: theme.colors.cardBorder,
            paddingBottom: Math.max(insets.bottom, 15)
          }
        ]}>
          <TextInput
            style={[
              styles.memoryInput,
              { 
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.primary,
                color: theme.colors.text
              }
            ]}
            placeholder="Ex: Je suis architecte, j'aime la randonnée..."
            placeholderTextColor={theme.colors.textSecondary}
            value={newMemory}
            onChangeText={setNewMemory}
            multiline
            maxLength={200}
            autoFocus
          />
          <View style={styles.addMemoryActions}>
            <TouchableOpacity 
              onPress={() => {
                setIsAdding(false);
                setNewMemory('');
              }}
              style={[styles.cancelButton, { backgroundColor: theme.colors.cardBackground }]}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleAddMemory}
              style={[
                styles.saveButton, 
                { backgroundColor: theme.colors.primary }
              ]}
              disabled={!newMemory.trim()}
            >
              <MaterialIcons name="check" size={20} color={theme.colors.background} />
              <Text style={[styles.saveButtonText, { color: theme.colors.background }]}>
                Ajouter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.addButton,
            { 
              backgroundColor: theme.colors.primary,
              bottom: Math.max(insets.bottom, 15) + 90
            }
          ]}
          onPress={() => setIsAdding(true)}
        >
          <MaterialIcons name="add" size={28} color={theme.colors.background} />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 200,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  memoryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  memoryContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memoryIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  memoryText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  memoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memoryDate: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FFB0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addMemoryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  memoryInput: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  addMemoryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
