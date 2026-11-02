import React from 'react';
import { StyleSheet } from 'react-native';
import { TextField } from './TextField';

export const OTP_LENGTH = 6;

export function OtpField({
  value,
  onChange,
}: {
  value: string;
  onChange: (otp: string) => void;
}) {
  return (
    <TextField
      label="Verification code"
      value={value}
      onChangeText={text =>
        onChange(text.replace(/\D/g, '').slice(0, OTP_LENGTH))
      }
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      autoComplete="sms-otp"
      maxLength={OTP_LENGTH}
      placeholder="6-digit code"
      style={styles.otp}
    />
  );
}

const styles = StyleSheet.create({
  otp: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
});
