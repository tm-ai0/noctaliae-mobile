import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../config/ThemeContext';

export default function CustomTabBar({ state, navigation }) {
  const { theme } = useTheme();
  
  // 🎯 Mapping des icônes par nom de route
  const iconMap = {
    'Analyses': 'brain',
    'Trends': 'trending-up',
    'Insights': 'chart-line',
    'Settings': 'cog-outline',
  };

  // Position du placeholder FAB (au milieu)
  const fabPosition = Math.floor(state.routes.length / 2);

  return (
    <View style={[
      styles.tabBar,
      { 
        backgroundColor: theme.colors.backgroundElevated,
        borderTopColor: theme.colors.cardBorder 
      }
    ]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const icon = iconMap[route.name];

        // Ajouter le placeholder FAB au milieu
        if (index === fabPosition) {
          return (
            <React.Fragment key={`fab-${index}`}>
              <View style={styles.placeholder} />
              <TouchableOpacity
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={icon}
                  size={38}
                  color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={icon}
              size={38}
              color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 150,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 70,
    paddingTop: 35,
    paddingHorizontal: 20,
    opacity: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
  },
});
