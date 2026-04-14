import React from 'react';
import {
  TouchableOpacity, Text,
  ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}

const VARIANT_CLASSES = {
  primary: { btn: 'bg-[#4CAF50] border-[#4CAF50]', text: 'text-white' },
  secondary: { btn: 'bg-[#007AFF] border-[#007AFF]', text: 'text-white' },
  outline: { btn: 'bg-transparent border-[#4CAF50]', text: 'text-[#4CAF50]' },
  danger: { btn: 'bg-[#FF3B30] border-[#FF3B30]', text: 'text-white' },
  ghost: { btn: 'bg-[#F2F2F7] border-transparent', text: 'text-[#1A1A2E]' },
};

const SIZE_CLASSES = {
  sm: { btn: 'py-2 px-3.5', text: 'text-[13px]', icon: 'text-[15px]' },
  md: { btn: 'py-3.5 px-5', text: 'text-[15px]', icon: 'text-[17px]' },
  lg: { btn: 'py-4 px-7', text: 'text-[17px]', icon: 'text-[19px]' },
};

export default function Button({
  label, onPress, variant = 'primary', color,
  loading = false, disabled = false,
  style, textStyle, size = 'md', icon,
}: ButtonProps) {
  const v = VARIANT_CLASSES[variant];
  const s = SIZE_CLASSES[size];

  const colorOverride = color
    ? {
      backgroundColor: variant === 'outline' ? 'transparent' : color,
      borderColor: color,
    }
    : undefined;

  const textColorOverride = color
    ? { color: variant === 'outline' ? color : '#fff' }
    : undefined;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center justify-center
        rounded-[14px] border-[1.5px] gap-1.5
        ${v.btn} ${s.btn}
        ${disabled ? 'opacity-50' : ''}
      `}
      style={[colorOverride, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading ? (
        <ActivityIndicator
          color={textColorOverride?.color ?? (variant === 'outline' ? '#4CAF50' : '#fff')}
          size="small"
        />
      ) : (
        <>
          {icon && (
            <Text className={`${s.icon}`} style={textColorOverride}>
              {icon}
            </Text>
          )}
          <Text
            className={`font-extrabold tracking-[0.2px] ${v.text} ${s.text}`}
            style={[textColorOverride, textStyle]}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}