import React, { useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as api from '../api';
import { Button } from '../components/Button';
import { FormScroll } from '../components/FormScroll';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import type { AppStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinSpace'>;

// Accepts either a bare space id or a pasted space7://join/<spaceId>/<code> link.
export function parseInvite(input: string): { spaceId: string; code?: string } {
  const match = input
    .trim()
    .match(/join\/([0-9a-f-]{36})(?:\/([A-Za-z0-9]+))?/i);
  if (match) return { spaceId: match[1], code: match[2] };
  return { spaceId: input.trim() };
}

export function JoinSpaceScreen({ navigation, route }: Props) {
  const [spaceInput, setSpaceInput] = useState(route.params?.spaceId ?? '');
  const [code, setCode] = useState(route.params?.code ?? '');
  const [busy, setBusy] = useState(false);

  const onSpaceChange = (text: string) => {
    const parsed = parseInvite(text);
    setSpaceInput(parsed.code ? parsed.spaceId : text);
    if (parsed.code) setCode(parsed.code);
  };

  const join = async () => {
    const { spaceId } = parseInvite(spaceInput);
    if (!spaceId || !code.trim()) {
      Alert.alert(
        'Join a space',
        'Paste the invite link, or enter the space ID and invite code.',
      );
      return;
    }
    setBusy(true);
    try {
      await api.joinSpace(spaceId, code.trim().toUpperCase());
      navigation.replace('Chat', { spaceId });
    } catch (e) {
      Alert.alert('Could not join', (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Join with invite" color={colors.pink} />
      <FormScroll>
        <Text>
          Private spaces need a single-use invite code from the space's creator.
        </Text>
        <TextField
          label="Invite link or space ID"
          value={spaceInput}
          onChangeText={onSpaceChange}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="space7://join/..."
        />
        <TextField
          label="Invite code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="8 characters"
        />
        <Button title="Join space" onPress={join} loading={busy} />
      </FormScroll>
    </Screen>
  );
}
