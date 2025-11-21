import React, { useRef, useEffect } from 'react';
import { Animated, Easing, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';

const FABRecordButton = ({ onPress }) => {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loopAnimation.start();
    return () => loopAnimation.stop();
  }, [pulseAnim]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View 
        style={[
          styles.fabButton, 
          { 
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            borderColor: theme.colors.primaryLight,
            transform: [{ scale: pulseAnim }] 
          }
        ]}
      >
        <MaterialIcons name="mic" size={40} color={theme.colors.background} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 2,
  },
});

export default FABRecordButton;
