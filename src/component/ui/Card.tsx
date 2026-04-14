import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radius?: number;
}

export default function Card({ children, style, padding = 16, radius = 18 }: CardProps) {
  return (
    <View
      className="bg-white mb-3"
      style={[
        {
          padding,
          borderRadius: radius,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}