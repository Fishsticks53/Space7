import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as api from '../api';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/Button';
import { FormScroll } from '../components/FormScroll';
import { Logo } from '../components/Logo';
import { OTP_LENGTH, OtpField } from '../components/OtpField';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import type { AuthStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

// Mirrors the backend's signup validation so most mistakes are caught locally.
export function validateSignup(
  username: string,
  email: string,
  password: string,
  confirm: string,
) {
  if (username.trim().length < 3 || username.trim().length > 50)
    return 'Username must be 3 to 50 characters.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim()))
    return 'Enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

export function RegisterScreen({ navigation }: Props) {
  const { verifySignup } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [busy, setBusy] = useState(false);

  const sendCode = async () => {
    const problem = validateSignup(username, email, password, confirm);
    if (problem) {
      Alert.alert('Check your details', problem);
      return;
    }
    setBusy(true);
    try {
      await api.signup(username.trim(), email.trim(), password);
      setStep('verify');
    } catch (e) {
      Alert.alert('Sign up failed', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert(
        'Verification',
        `Enter the ${OTP_LENGTH}-digit code from your email.`,
      );
      return;
    }
    setBusy(true);
    try {
      await verifySignup(email.trim(), otp);
    } catch (e) {
      Alert.alert('Verification failed', (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: colors.green }}>
      <FormScroll>
        <View style={styles.hero}>
          <Logo />
          <Text variant="label">
            {step === 'details' ? 'Create your account' : 'Check your email'}
          </Text>
        </View>
        {step === 'details' ? (
          <>
            <TextField
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <TextField
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            <Button
              title="Send verification code"
              onPress={sendCode}
              loading={busy}
            />
          </>
        ) : (
          <>
            <Text>
              We sent a {OTP_LENGTH}-digit code to {email.trim()}.
            </Text>
            <OtpField value={otp} onChange={setOtp} />
            <Button
              title="Verify and continue"
              onPress={verify}
              loading={busy}
            />
            <Button
              title="Resend code"
              color={colors.surface}
              onPress={sendCode}
              disabled={busy}
            />
            <Button
              title="Change details"
              color={colors.surface}
              onPress={() => setStep('details')}
              disabled={busy}
            />
          </>
        )}
        <Button
          title="Back to sign in"
          color={colors.blue}
          onPress={() => navigation.goBack()}
        />
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginVertical: 24, gap: 4 },
});
