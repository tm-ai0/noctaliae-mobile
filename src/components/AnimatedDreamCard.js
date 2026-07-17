import React, { useEffect, useRef } from 'react';
import i18next from 'i18next';
import { TouchableOpacity, View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';
import { MarkdownText } from './MarkdownText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.5; // 50% au lieu de 70% pour plus de facilité
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimatedDreamCard({ 
  dream, 
  index,
  onPress, 
  onAnalyze,
  onShare,
  onArchive,
  analyzingId,
  getShortResume,
  getDuration
}) {
  const { theme } = useTheme();
  const swipeableRef = useRef(null);
  
  // Animations
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const translateX = useSharedValue(0);
  const pressScale = useSharedValue(1);

  // Mount animation avec stagger
  useEffect(() => {
    const delay = index * 100;
    
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1, {
      damping: 15,
      stiffness: 150,
    }));
    translateY.value = withDelay(delay, withSpring(0, {
      damping: 15,
      stiffness: 150,
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value * pressScale.value },
      { translateY: translateY.value },
      { translateX: translateX.value }
    ],
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  // Actions avec swipe complet = déclenchement automatique
  const handleSwipeableOpen = (direction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (direction === 'left') {
      // Swipe gauche = Share puis retour
      onShare();
      setTimeout(() => {
        swipeableRef.current?.close();
      }, 300);
    } else if (direction === 'right') {
      // Swipe droite = Archive avec animation
      translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      
      setTimeout(() => {
        onArchive();
      }, 350);
    }
  };

  const date = new Date(dream.date);
  const time = date.toLocaleTimeString(i18next.language, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const badgeColors = !dream.analysis
    ? { bg: '#1A1F3A', text: '#8B9DC3', icon: '📝', label: 'Non analysé' }
    : dream.modelUsed === 'claude' 
      ? { bg: '#6B46C1', text: '#FFFFFF', icon: '⭐', label: 'DeepDream' }
      : { bg: '#10B981', text: '#FFFFFF', icon: '⚡', label: 'QuickDream' };

  const renderLeftActions = () => (
    <View style={[styles.shareAction, { backgroundColor: '#FF9966' }]}>
      <MaterialIcons name="share" size={28} color="#FFFFFF" />
    </View>
  );

  const renderRightActions = () => (
    <View style={[styles.archiveAction, { backgroundColor: theme.colors.warmGold }]}>
      <MaterialIcons name="archive" size={28} color="#FFFFFF" />
    </View>
  );

  return (
    <Animated.View style={animatedStyle}>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        overshootLeft={false}
        overshootRight={false}
        friction={1.5}
        leftThreshold={SWIPE_THRESHOLD}
        rightThreshold={SWIPE_THRESHOLD}
        enableTrackpadTwoFingerGesture
        onSwipeableOpen={handleSwipeableOpen}
      >
        <AnimatedTouchable
          style={[
            styles.dreamCard,
            { backgroundColor: theme.colors.warmGoldSubtle },
            theme.shadow.md
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={onPress}
          activeOpacity={1}
        >
          <View style={styles.cardHeader}>
            <View style={[
              styles.typeBadge,
              { backgroundColor: badgeColors.bg }
            ]}>
              <Text style={[styles.typeBadgeText, { color: badgeColors.text }]}>
                {badgeColors.icon} {badgeColors.label}
              </Text>
            </View>
            <Text style={[styles.cardTime, { color: theme.colors.textTertiary }]}>
              {time} · {getDuration(dream)}
            </Text>
          </View>

          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
            {dream.title}
          </Text>

          <MarkdownText style={[styles.cardResume, { color: theme.colors.textSecondary }]}>
            {getShortResume(dream)}
          </MarkdownText>

          {!dream.analysis && (
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                { backgroundColor: '#FFD700' },
                theme.shadow.neon
              ]}
              onPress={onAnalyze}
              disabled={analyzingId === dream.id}
              activeOpacity={0.8}
            >
              {analyzingId === dream.id ? (
                <>
                  <ActivityIndicator color={theme.colors.background} size="small" />
                  <Text style={[styles.analyzeButtonText, { color: theme.colors.background }]}>
                    Analyse en cours...
                  </Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="brain" size={18} color={theme.colors.background} />
                  <Text style={[styles.analyzeButtonText, { color: theme.colors.background }]}>
                    Analyser ce rêve
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </AnimatedTouchable>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dreamCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: 'AtkinsonHyperlegibleNext-SemiBold',
  },
  cardTime: {
    fontSize: 11,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: 'CormorantUpright-Bold',
    marginBottom: 8,
  },
  cardResume: {
    fontSize: 14,
    lineHeight: 22,
  },
  shareAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    marginBottom: 12,
  },
  archiveAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 12,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
  },
});
