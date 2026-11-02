import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import * as api from '../api';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { FormScroll } from '../components/FormScroll';
import { Header } from '../components/Header';
import { Screen } from '../components/Screen';
import { ErrorState, Loading } from '../components/StateViews';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import { useAsync } from '../hooks/useAsync';
import type { AppStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { updateUser, signOut } = useAuth();
  const profile = useAsync(api.getMyProfile, []);
  const [username, setUsername] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  if (profile.loading) {
    return (
      <Screen>
        <Header title="Edit profile" color={colors.yellow} />
        <Loading />
      </Screen>
    );
  }
  if (profile.error || !profile.data) {
    return (
      <Screen>
        <Header title="Edit profile" color={colors.yellow} />
        <ErrorState
          error={profile.error ?? new Error('Could not load profile')}
          onRetry={profile.refresh}
        />
      </Screen>
    );
  }

  const p = profile.data;
  const nameValue = username ?? p.username;
  const bioValue = bio ?? p.bio ?? '';

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    try {
      await action();
    } catch (e) {
      Alert.alert('Could not save', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = () =>
    run('profile', async () => {
      const name = nameValue.trim();
      if (name.length < 3 || name.length > 50)
        throw new Error('Username must be 3 to 50 characters.');
      if (name !== p.username) {
        await api.updateUsername(name);
        updateUser({ username: name });
      }
      if (bioValue.trim() !== (p.bio ?? ''))
        await api.updateBio(bioValue.trim());
      navigation.goBack();
    });

  const changeAvatar = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    });
    const asset = res.assets?.[0];
    if (!asset?.uri) return;
    run('avatar', async () => {
      const form = new FormData();
      form.append('avatar', {
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.type ?? 'image/jpeg',
      } as unknown as Blob);
      const { profile_picture } = await api.updateAvatar(form);
      profile.setData({ ...p, profile_picture });
    });
  };

  const savePassword = () =>
    run('password', async () => {
      if (!currentPassword || newPassword.length < 6) {
        throw new Error(
          'Enter your current password and a new one of at least 6 characters.',
        );
      }
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      Alert.alert('Password changed', 'Your new password is set.');
    });

  const confirmDelete = () =>
    Alert.alert(
      'Delete account',
      'This permanently deletes your account. It cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            run('delete', async () => {
              await api.deleteAccount();
              await signOut();
            }),
        },
      ],
    );

  return (
    <Screen>
      <Header title="Edit profile" color={colors.yellow} />
      <FormScroll>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
          onPress={changeAvatar}
          style={styles.avatar}
        >
          <Avatar uri={p.profile_picture} name={p.username} size={96} />
          <Text variant="label" style={styles.link}>
            {busy === 'avatar' ? 'Uploading...' : 'Change photo'}
          </Text>
        </Pressable>
        <TextField
          label="Username"
          value={nameValue}
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={50}
        />
        <TextField
          label="Bio"
          value={bioValue}
          onChangeText={setBio}
          multiline
          maxLength={300}
          placeholder="Tell people about yourself"
        />
        <Button
          title="Save profile"
          onPress={saveProfile}
          loading={busy === 'profile'}
        />

        <View style={styles.section}>
          <Text variant="title">Change password</Text>
          <TextField
            label="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextField
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            textContentType="newPassword"
          />
          <Button
            title="Update password"
            color={colors.green}
            onPress={savePassword}
            loading={busy === 'password'}
          />
        </View>

        <View style={styles.section}>
          <Text variant="title">Danger zone</Text>
          <Button
            title="Delete account"
            color={colors.danger}
            onPress={confirmDelete}
            loading={busy === 'delete'}
          />
        </View>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', gap: 6 },
  link: { textDecorationLine: 'underline' },
  section: { gap: 12, marginTop: 16 },
});
