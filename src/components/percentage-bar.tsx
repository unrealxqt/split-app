// src/components/PercentageBar.tsx
import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { theme } from '@/constants/theme'

interface PercentageBarProps {
  percentage: number;
  animated?: boolean;
}

export function PercentageBar({ percentage, animated = false }: PercentageBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: percentage,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(percentage);
    }
  }, [percentage, animated]);

  const barWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, { width: barWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.black,
    borderRadius: 4,
  },
});
