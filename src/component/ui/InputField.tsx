import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  TextInputProps, ViewStyle,
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  rightLabel?: React.ReactNode;
  onRightPress?: () => void;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export default function InputField({
  label, error, hint, rightLabel, onRightPress,
  containerStyle, icon, ...props
}: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? '#FF3B30' : focused ? '#4CAF50' : '#E5E5EA';

  return (
    <View className="mb-4" style={containerStyle}>

      {(label || rightLabel) && (
        <View className="flex-row justify-between mb-1.5">
          {label && (
            <Text className="text-[13px] font-bold text-[#1A1A2E]">{label}</Text>
          )}
          {rightLabel && (
            <TouchableOpacity onPress={onRightPress}>
              <Text className="text-[13px] font-bold text-[#007AFF]">{rightLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        className="flex-row items-center rounded-xl bg-[#FAFAFA] px-3.5"
        style={{ borderWidth: 1.5, borderColor }}
      >
        {icon && (
          <View className="mr-2">{icon}</View>
        )}
        <TextInput
          className="flex-1 text-[15px] text-[#1A1A2E] py-3"
          placeholderTextColor="#BCBCBC"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>

      {error && (
        <Text className="text-[12px] text-[#FF3B30] font-semibold mt-1">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-[12px] text-[#8E8E93] mt-1">{hint}</Text>
      )}

    </View>
  );
}