import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Alert,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllDreams } from '../services/storageService';
import { useTheme } from '../config/ThemeContext';
import DreamCard from '../components/DreamCard';
import DebugScreenLabel from '../components/DebugScreenLabel';

const { width } = Dimensions.get('window');

export default function AnalysisScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [dreams, setDreams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useFocusEffect(
    React.useCallback(() => {
      loadAnalyzedDreams();
    }, [])
  );
  
  async function loadAnalyzedDreams() {
    try {
      const allDreams = await getAllDreams();
      const nonArchived = allDreams.filter(dream => !dream.archived);
      const sorted = nonArchived.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDreams(sorted);
    } catch (error) {
      console.error('❌ Erreur chargement rêves:', error);
    }
  }

  function groupDreamsByDate() {
    const filtered = dreams.filter(dream => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        dream.title?.toLowerCase().includes(query) ||
        dream.transcription?.toLowerCase().includes(query) ||
        dream.analysis?.toLowerCase().includes(query)
      );
    });

    const groups = {};
    
    filtered.forEach(dream => {
      const date = new Date(dream.date);
      const dateKey = date.toLocaleDateString('fr-FR', { 
        day: 'numeric',
        month: 'short' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(dream);
    });

    return Object.keys(groups).map(dateKey => ({
      date: dateKey,
      data: groups[dateKey]
    }));
  }

  function renderDreamCard({ item: dream, index }) {
    return (
      <DreamCard 
        dream={dream}
        index={index}
        onPress={() => {
          navigation.navigate('Conversation', {
            dreamId: dream.id,
            dreamAnalysis: dream.analysis,
            dreamTranscription: dream.transcription,
            dreamTitle: dream.title,
            dreamDate: dream.date,
            modelUsed: dream.modelUsed
          });
        }}
      />
    );
  }

  function renderDateSection({ item: section }) {
    return (
      <View>
        <Text style={[styles.dateHeader, { color: theme.colors.textSecondary }]}>
          {section.date}
        </Text>
        {section.data.map((dream, index) => (
          <View key={dream.id}>
            {renderDreamCard({ item: dream, index })}
          </View>
        ))}
      </View>
    );
  }

  const groupedDreams = groupDreamsByDate();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <DebugScreenLabel screenName="🧠 Analyses" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
          ]}
          onPress={() => navigation.navigate('Settings')}
        >
          <MaterialCommunityIcons name="dna" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.askButton, { backgroundColor: theme.colors.primary }, theme.shadow.neon]}
          onPress={async () => {
            const allDreams = await getAllDreams();
            const analyzedDreams = allDreams.filter(d => d.analysis && !d.archived);
            
            navigation.navigate('MetaAnalysis', {
              dreams: analyzedDreams,
              totalCount: analyzedDreams.length
            });
          }}
        >
          <MaterialCommunityIcons 
            name="chat" 
            size={20} 
            color={theme.colors.background} 
            style={{ marginRight: 8 }} 
          />
          <Text style={[styles.askButtonText, { color: theme.colors.background }]}>Mes rêves</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
        ]}>
          <MaterialIcons name="search" size={22} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.textPrimary }]}
            placeholder="Search Dreams"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
          ]}
          onPress={() => Alert.alert('Calendrier', 'Fonctionnalité à venir')}
        >
          <MaterialIcons name="calendar-today" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.iconButton,
            { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.cardBorder }
          ]}
          onPress={() => navigation.navigate('Archives')}
        >
          <MaterialIcons name="archive" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {groupedDreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="brain" 
            size={80} 
            color={theme.colors.textSecondary} 
            style={{ marginBottom: 20 }}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
            Aucune analyse
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Enregistrez un rêve et analysez-le pour qu'il apparaisse ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedDreams}
          renderItem={renderDateSection}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  askButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  askButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
