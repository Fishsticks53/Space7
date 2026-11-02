import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { border, colors, hardShadow } from '../theme';
import { Text } from './Text';

interface Props {
  title: string;
  onPress: () => void;
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  color = colors.yellow,
  loading,
  disabled,
  style,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: inactive ? 0.6 : 1 },
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <Text variant="title">{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    ...border,
    ...hardShadow,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
  },
});
