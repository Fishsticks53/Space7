import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { border, colors } from '../theme';
import { Text } from './Text';

export function Avatar({
  uri,
  name,
  size = 40,
}: {
  uri?: string | null;
  name: string;
  size?: number;
}) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri)
    return (
      <Image
        source={{ uri }}
        style={[styles.base, shape]}
        accessibilityIgnoresInvertColors
      />
    );
  return (
    <View style={[styles.base, styles.fallback, shape]}>
      <Text variant="label" style={{ fontSize: size * 0.45 }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { ...border, borderWidth: 2 },
  fallback: {
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
