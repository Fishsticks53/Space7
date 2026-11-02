import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { border, colors } from '../theme';
import { Text } from './Text';

interface Props {
  title: string;
  color?: string;
  right?: React.ReactNode;
  back?: boolean;
}

export function Header({
  title,
  color = colors.blue,
  right,
  back = true,
}: Props) {
  const navigation = useNavigation();
  return (
    <View style={[styles.header, { backgroundColor: color }]}>
      {back && navigation.canGoBack() ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color={colors.ink} />
        </Pressable>
      ) : null}
      <Text variant="title" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: border.borderWidth,
    borderColor: border.borderColor,
  },
  title: { flex: 1 },
});
