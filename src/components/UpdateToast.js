/**
 * 🔄 UPDATE TOAST - Notification discrète de mise à jour
 * 
 * Snackbar en bas de l'écran qui auto-disparaît après 8s.
 * Tap sur "Mettre à jour" → ouvre le store/lien.
 * Swipe down ou tap "✕" pour dismiss.
 * 
 * Usage:
 *   <UpdateToast
 *     visible={showUpdateToast}
 *     latestVersion="1.0.3"
 *     downloadUrl="https://..."
 *     onDismiss={(version) => {...}}
 *   />
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AUTO_DISMISS_MS = 8000; // 8 secondes

export function UpdateToast({ visible, latestVersion, downloadUrl, onDismiss }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(100)).current; // Commence hors écran (bas)
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss après 8s
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, AUTO_DISMISS_MS);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [visible]);

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss(latestVersion);
    });
  };

  const handleUpdate = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (downloadUrl) {
      Linking.openURL(downloadUrl).catch(err => {
        console.error('❌ Erreur ouverture URL:', err);
      });
    }
    handleDismiss();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: Math.max(insets.bottom, 16) + 60, // Au-dessus de la tab bar
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.toast}>
        {/* Icône + Texte */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="system-update" size={20} color="#00FFB0" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Noctaliæ v{latestVersion} disponible
            </Text>
            <Text style={styles.subtitle}>
              De nouvelles fonctionnalités t'attendent
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleUpdate}
            style={styles.updateButton}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Mettre à jour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={18} color="#A0B4D4" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#1a1f3a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#00FFB020',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'column',
    gap: 10,
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00FFB015',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'AtkinsonHyperlegibleNext-Regular',
    color: '#A0B4D4',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  updateButton: {
    backgroundColor: '#00FFB0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  updateButtonText: {
    fontSize: 13,
    fontFamily: 'AtkinsonHyperlegibleNext-Bold',
    color: '#0c0e27',
  },
  dismissButton: {
    padding: 4,
  },
});
