import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { border, colors, fonts } from '../theme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
}

export function TextField({ label, style, ...rest }: Props) {
  return (
    <View style={styles.group}>
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...rest}
        style={[styles.input, rest.multiline && styles.multiline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  input: {
    ...border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.ink,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
});
