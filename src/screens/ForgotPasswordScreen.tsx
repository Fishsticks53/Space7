import React, { useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as api from '../api';
import { Button } from '../components/Button';
import { FormScroll } from '../components/FormScroll';
import { Header } from '../components/Header';
import { OTP_LENGTH, OtpField } from '../components/OtpField';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import type { AuthStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [busy, setBusy] = useState(false);

  const requestCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('Reset password', 'Enter the email address on your account.');
      return;
    }
    setBusy(true);
    try {
      await api.forgotPassword(email.trim());
      setStep('reset');
    } catch (e) {
      Alert.alert('Reset password', (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (otp.length !== OTP_LENGTH || password.length < 6) {
      Alert.alert(
        'Reset password',
        'Enter the code and a new password of at least 6 characters.',
      );
      return;
    }
    setBusy(true);
    try {
      await api.resetPassword(email.trim(), otp, password);
      Alert.alert('Password updated', 'Sign in with your new password.');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Reset password', (e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title="Reset password" color={colors.yellow} />
      <FormScroll>
        {step === 'email' ? (
          <>
            <Text>
              Enter your email and we will send you a code to reset your
              password.
            </Text>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <Button title="Send code" onPress={requestCode} loading={busy} />
          </>
        ) : (
          <>
            <Text>We sent a code to {email.trim()}.</Text>
            <OtpField value={otp} onChange={setOtp} />
            <TextField
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
            />
            <Button title="Update password" onPress={reset} loading={busy} />
            <Button
              title="Resend code"
              color={colors.surface}
              onPress={requestCode}
              disabled={busy}
            />
          </>
        )}
      </FormScroll>
    </Screen>
  );
}
