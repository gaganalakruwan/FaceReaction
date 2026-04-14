import React, { useRef, useEffect } from 'react';
import { Animated, Text, TouchableOpacity, View, Platform } from 'react-native';

interface EmojiButtonProps {
  item: {
    id: number;
    type: string;
    emoji: string;
    sinhala: string;
    tamil: string;
    color: string;
    bg: string;
  };
  index: number;
  selected: number | null;
  onPress: (index: number) => void;
  disabled?: boolean;
}

export default function EmojiButton({ item, index, selected, onPress, disabled = false }: EmojiButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isSelected = selected === index;
  const hasSelection = selected !== null;
  const isDimmed = hasSelection && !isSelected;

  const springConfig = { useNativeDriver: true, speed: 20, bounciness: 8 };

  const resetAnimations = () => {
    Animated.parallel([
      Animated.spring(jumpAnim, { toValue: 0, ...springConfig }),
      Animated.spring(scaleAnim, { toValue: 1, ...springConfig }),
      Animated.spring(rotateAnim, { toValue: 0, ...springConfig }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;

    if (!isSelected) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 0.8, useNativeDriver: true, speed: 50, bounciness: 0 }),
        Animated.parallel([
          Animated.spring(jumpAnim, { toValue: -60, useNativeDriver: true, speed: 30, bounciness: 10 }),
          Animated.spring(scaleAnim, { toValue: 1.4, useNativeDriver: true, speed: 30, bounciness: 10 }),
          Animated.timing(rotateAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(jumpAnim, { toValue: -15, useNativeDriver: true, speed: 15, bounciness: 15 }),
          Animated.spring(scaleAnim, { toValue: 1.2, useNativeDriver: true, speed: 15, bounciness: 15 }),
        ]),
      ]).start();
    }
    onPress(index);
  };

  useEffect(() => {
    if (!isSelected) resetAnimations();

    Animated.timing(opacityAnim, {
      toValue: isDimmed ? 0.35 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [selected, isSelected, isDimmed]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  return (
    <Animated.View
      className="items-center mx-2"
      style={{
        width: 100,
        opacity: opacityAnim,
        transform: [{ translateY: jumpAnim }, { scale: scaleAnim }, { rotate: spin }],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        disabled={disabled}
        className="items-center justify-center bg-white border border-[#E5E5EA] rounded-full"
        style={[
          {
            width: 80,
            height: 80,
            borderRadius: 40,
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
              android: { elevation: 4 },
            }),
          },
          isSelected && {
            backgroundColor: item.bg,
            borderColor: item.color,
            borderWidth: 3,
            ...Platform.select({
              ios: { shadowColor: item.color, shadowOpacity: 0.5, shadowRadius: 15 },
              android: { elevation: 15 },
            }),
          },
        ]}
      >
        <Text style={{ fontSize: 44, lineHeight: Platform.OS === 'android' ? 54 : undefined }}>
          {item.emoji}
        </Text>
      </TouchableOpacity>

      <View className="items-center mt-3" style={{ gap: 2 }}>
        <Text
          className="text-[13px] font-bold text-center"
          style={{ color: isSelected ? item.color : '#2C2C2E' }}
        >
          {item.sinhala}
        </Text>
        <Text
          className="text-xs font-semibold text-center"
          style={{ color: isSelected ? item.color : '#48484A' }}
        >
          {item.tamil}
        </Text>
        <Text
          className="text-[11px] text-center uppercase"
          style={{
            color: isSelected ? item.color : '#8E8E93',
            fontWeight: isSelected ? '800' : '500',
          }}
        >
          {item.type}
        </Text>
      </View>
    </Animated.View>
  );
}