import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

test('shows the sign in screen when there is no saved session', async () => {
  await render(<App />);
  expect(await screen.findByText('Sign in')).toBeTruthy();
});
