import { withSpring, withTiming } from 'react-native-reanimated';

// Configurations réutilisables
export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

export const timingConfig = {
  duration: 200,
};

// Animations pour boutons
export const buttonPressIn = (scale) => {
  'worklet';
  scale.value = withSpring(0.95, springConfig);
};

export const buttonPressOut = (scale) => {
  'worklet';
  scale.value = withSpring(1, springConfig);
};

// Animations pour FAB
export const fabPressIn = (scale, rotation) => {
  'worklet';
  scale.value = withSpring(0.9, springConfig);
  rotation.value = withTiming(45, timingConfig);
};

export const fabPressOut = (scale, rotation) => {
  'worklet';
  scale.value = withSpring(1, springConfig);
  rotation.value = withTiming(0, timingConfig);
};

// Animation fade in pour cards
export const fadeIn = (opacity) => {
  'worklet';
  opacity.value = withTiming(1, { duration: 300 });
};

// Animation slide in pour liste
export const slideInLeft = (translateX, delay = 0) => {
  'worklet';
  translateX.value = withTiming(0, {
    duration: 400,
    delay,
  });
};

// Animation pour cards hover
export const cardPressIn = (scale, elevation) => {
  'worklet';
  scale.value = withSpring(0.98, springConfig);
  elevation.value = withTiming(8, timingConfig);
};

export const cardPressOut = (scale, elevation) => {
  'worklet';
  scale.value = withSpring(1, springConfig);
  elevation.value = withTiming(4, timingConfig);
};
