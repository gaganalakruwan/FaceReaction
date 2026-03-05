import React, { useRef, useEffect } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function EmojiButton({ item, index, selected, onPress, disabled = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isSelected = selected === index;
  const hasSelection = selected !== null;
  const isDimmed = hasSelection && !isSelected;

  // Tap handler
  const handlePress = () => {
    if (disabled) return;

    if (selected === index) {
      // Deselect: float back to baseline
      Animated.parallel([
        Animated.spring(jumpAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
        Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
      ]).start();
    } else {
      // 3-phase JUMP: squeeze → explode up + spin → bouncy elevated landing
      Animated.sequence([
        // Phase 1 — pre-jump squeeze
        Animated.spring(scaleAnim, {
          toValue: 0.72, useNativeDriver: true, speed: 90, bounciness: 0,
        }),
        // Phase 2 — shoot up
        Animated.parallel([
          Animated.spring(jumpAnim, { toValue: -72, useNativeDriver: true, speed: 38, bounciness: 0 }),
          Animated.spring(scaleAnim, { toValue: 1.6, useNativeDriver: true, speed: 38, bounciness: 0 }),
          Animated.timing(rotateAnim, { toValue: 1, duration: 170, useNativeDriver: true }),
        ]),
        // Phase 3 — bouncy landing, stays elevated
        Animated.parallel([
          Animated.spring(jumpAnim, { toValue: -46, useNativeDriver: true, speed: 16, bounciness: 20 }),
          Animated.spring(scaleAnim, { toValue: 1.28, useNativeDriver: true, speed: 16, bounciness: 12 }),
          Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 12 }),
        ]),
      ]).start();
    }
    onPress(index);
  };

  // Sync with external selection changes
  useEffect(() => {
    if (!isSelected) {
      Animated.parallel([
        Animated.spring(jumpAnim, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 6 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 6 }),
        Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 6 }),
      ]).start();
    }
    Animated.timing(opacityAnim, {
      toValue: isDimmed ? 0.28 : 1,
      duration: 210,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '18deg'] });

  return (
    <Animated.View style={{
      alignItems: 'center',
      opacity: opacityAnim,
      transform: [{ translateY: jumpAnim }, { scale: scaleAnim }, { rotate: spin }],
    }}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.btn,
          isSelected && {
            backgroundColor: item.bg,
            borderColor: item.color,
            borderWidth: 2.5,
            shadowColor: item.color,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.45,
            shadowRadius: 16,
            elevation: 12,
          },
        ]}
      >
        <Text style={styles.emoji}>{item.emoji}</Text>
      </TouchableOpacity>
      <Text style={[styles.label, isSelected && { color: item.color, fontWeight: '700' }]}>
        {item.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 86,
    height: 86,
    borderRadius: 60,
    backgroundColor: '#f3f0f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 56
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ABABAB',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});