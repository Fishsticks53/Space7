import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from './Text';

export function Logo({ size = 44 }: { size?: number }) {
  return <Text style={[styles.logo, { fontSize: size }]}>space7</Text>;
}

const styles = StyleSheet.create({
  logo: { fontFamily: 'Outfit-Bold', letterSpacing: -1 },
});
