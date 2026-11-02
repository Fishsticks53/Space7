import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../theme';

export function Screen({
  children,
  style,
  // Tab screens pass ['top']; the tab bar already pads the bottom.
  edges = ['top', 'bottom'],
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
}) {
  return (
    <SafeAreaView edges={edges} style={styles.safe}>
      <View style={[styles.body, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
});
