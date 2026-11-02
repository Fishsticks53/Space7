import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { colors, fonts } from '../theme';

type Variant = 'body' | 'label' | 'title' | 'heading' | 'caption';

export function Text({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  return <RNText {...rest} style={[styles.base, styles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.ink, fontFamily: fonts.regular },
  body: { fontSize: 16 },
  caption: { fontSize: 13, color: colors.muted },
  label: { fontSize: 16, fontFamily: fonts.semibold },
  title: { fontSize: 22, fontFamily: fonts.bold },
  heading: { fontSize: 30, fontFamily: fonts.bold },
});
