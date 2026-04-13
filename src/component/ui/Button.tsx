import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet,
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

const COLORS = {
  primary:   { bg: '#4CAF50', text: '#fff',     border: '#4CAF50' },
  secondary: { bg: '#007AFF', text: '#fff',     border: '#007AFF' },
  outline:   { bg: 'transparent', text: '#4CAF50', border: '#4CAF50' },
  danger:    { bg: '#FF3B30', text: '#fff',     border: '#FF3B30' },
  ghost:     { bg: '#F2F2F7', text: '#1A1A2E',  border: 'transparent' },
};

const SIZES = {
  sm: { py: 8,  px: 14, fontSize: 13 },
  md: { py: 13, px: 20, fontSize: 15 },
  lg: { py: 16, px: 28, fontSize: 17 },
};

export default function Button({
  label, onPress, variant = 'primary', color,
  loading = false, disabled = false,
  style, textStyle, size = 'md', icon,
}: ButtonProps) {
  const c    = COLORS[variant];
  const s    = SIZES[size];
  const bg   = color ?? c.bg;
  const txt  = variant === 'outline' ? (color ?? c.text) : c.text;
  const bdr  = color ?? c.border;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: bdr, paddingVertical: s.py, paddingHorizontal: s.px },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={txt} size="small" />
        : <>
            {icon ? <Text style={[styles.icon, { fontSize: s.fontSize + 2 }]}>{icon}</Text> : null}
            <Text style={[styles.label, { color: txt, fontSize: s.fontSize }, textStyle]}>
              {label}
            </Text>
          </>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  label:    { fontWeight: '800', letterSpacing: 0.2 },
  icon:     {},
  disabled: { opacity: 0.5 },
});