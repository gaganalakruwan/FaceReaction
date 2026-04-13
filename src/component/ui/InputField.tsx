import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, TextInputProps, ViewStyle,
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  rightLabel?: string;
  onRightPress?: () => void;
  containerStyle?: ViewStyle;
  icon?: string;
}

export default function InputField({
  label, error, hint, rightLabel, onRightPress,
  containerStyle, icon, ...props
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? '#FF3B30' : focused ? '#4CAF50' : '#E5E5EA';

  return (
    <View style={[styles.wrap, containerStyle]}>
      {(label || rightLabel) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {rightLabel && (
            <TouchableOpacity onPress={onRightPress}>
              <Text style={styles.rightLabel}>{rightLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={[styles.inputWrap, { borderColor }]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={styles.input}
          placeholderTextColor="#BCBCBC"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A2E'
  },
  rightLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF'
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 14,
  },
  icon: {
    fontSize: 16,
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    paddingVertical: 12,
  },
  error: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    fontWeight: '600'
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4
  },
});