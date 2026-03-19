import React, { useRef, useEffect } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, View } from 'react-native';

export default function EmojiButton({ item, index, selected, onPress, disabled = false }) {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const jumpAnim    = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim  = useRef(new Animated.Value(0)).current;

  const isSelected   = selected === index;
  const hasSelection = selected !== null;
  const isDimmed     = hasSelection && !isSelected;

  // Tap handler
  const handlePress = () => {
    if (disabled) return;

    if (selected === index) {
      Animated.parallel([
        Animated.spring(jumpAnim,   { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 8 }),
        Animated.spring(scaleAnim,  { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
        Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
      ]).start();
    } else {
      Animated.sequence([
        // Phase 1 — squeeze
        Animated.spring(scaleAnim, { toValue: 0.72, useNativeDriver: true, speed: 90, bounciness: 0 }),
        // Phase 2 — shoot up
        Animated.parallel([
          Animated.spring(jumpAnim,   { toValue: -72, useNativeDriver: true, speed: 38, bounciness: 0 }),
          Animated.spring(scaleAnim,  { toValue: 1.6, useNativeDriver: true, speed: 38, bounciness: 0 }),
          Animated.timing(rotateAnim, { toValue: 1,   duration: 170,         useNativeDriver: true }),
        ]),
        // Phase 3 — bouncy landing
        Animated.parallel([
          Animated.spring(jumpAnim,   { toValue: -46, useNativeDriver: true, speed: 16, bounciness: 20 }),
          Animated.spring(scaleAnim,  { toValue: 1.28, useNativeDriver: true, speed: 16, bounciness: 12 }),
          Animated.spring(rotateAnim, { toValue: 0,   useNativeDriver: true, speed: 16, bounciness: 12 }),
        ]),
      ]).start();
    }
    onPress(index);
  };

  // Sync with external selection
  useEffect(() => {
    if (!isSelected) {
      Animated.parallel([
        Animated.spring(jumpAnim,   { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 6 }),
        Animated.spring(scaleAnim,  { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 6 }),
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
    <Animated.View style={[
      styles.wrapper,
      {
        opacity: opacityAnim,
        transform: [{ translateY: jumpAnim }, { scale: scaleAnim }, { rotate: spin }],
      },
    ]}>

      {/* Face circle */}
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

      {/* 3 labels */}
      <View style={styles.labelBlock}>

        {/* Sinhala — bold, dark */}
        {!!item.sinhalaLabel && (
          <Text style={[styles.labelSi, isSelected && { color: item.color }]}>
            {item.sinhalaLabel}
          </Text>
        )}

        {/* Tamil — medium weight, lighter */}
        {!!item.tamilLabel && (
          <Text style={[styles.labelTa, isSelected && { color: item.color }]}>
            {item.tamilLabel}
          </Text>
        )}

        {/* English — lightest */}
        <Text style={[styles.labelEn, isSelected && { color: item.color, fontWeight: '800' }]}>
          {item.label}
        </Text>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 68,
  },
  btn: {
    width: 86,
    height: 86,
    borderRadius: 60,
    backgroundColor: '#F3F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 46,
  },
  labelBlock: {
    alignItems: 'center',
    marginTop: 8,
    gap: 3,
  },
  labelSi: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C2C2E',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  labelTa: {
    fontSize: 11,
    fontWeight: '400',
    color: '#4a4a4bff',
    textAlign: 'center',
  },
  labelEn: {
    fontSize: 11,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
  },
});