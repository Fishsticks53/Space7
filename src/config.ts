import { Platform } from 'react-native';

// Debug builds talk to a local backend (10.0.2.2 is the host machine from the
// Android emulator); release builds talk to the deployed API.
const DEV_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const PROD_HOST = 'https://space7backend.onrender.com';

export const SERVER_URL = __DEV__ ? DEV_HOST : PROD_HOST;
export const API_URL = `${SERVER_URL}/api`;
