import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebugScreenLabel({ screenName }) {
  if (__DEV__) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>{screenName}</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 45,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 9999,
  },
  text: {
    color: '#00FFB0',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
