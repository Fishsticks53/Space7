import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { FormScroll } from '../components/FormScroll';
import { Logo } from '../components/Logo';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import type { AuthStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert(
        'Missing details',
        'Enter your email or username and your password.',
      );
      return;
    }
    setSubmitting(true);
    try {
      await signIn(identifier.trim(), password);
    } catch (e) {
      Alert.alert('Sign in failed', (e as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: colors.blue }}>
      <FormScroll>
        <View style={styles.hero}>
          <Logo size={56} />
          <Text variant="label">Topic spaces, one thread each.</Text>
        </View>
        <TextField
          label="Email or username"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoComplete="username"
          textContentType="username"
          placeholder="you@example.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          placeholder="Your password"
          onSubmitEditing={submit}
        />
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            navigation.navigate('ForgotPassword', {
              email: identifier.includes('@') ? identifier : undefined,
            })
          }
        >
          <Text variant="label" style={styles.link}>
            Forgot password?
          </Text>
        </Pressable>
        <Button title="Sign in" onPress={submit} loading={submitting} />
        <Button
          title="Create account"
          color={colors.pink}
          onPress={() => navigation.navigate('Register')}
        />
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginVertical: 40, gap: 4 },
  link: { textAlign: 'right', textDecorationLine: 'underline' },
});
